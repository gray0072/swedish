import { useEffect, useRef, useState } from 'react';
import { playFireworkBurst } from '@/lib/sound';
import { useAppStore } from '@/store/appStore';

/**
 * A full-screen fireworks show for a new building (BuildingCard). Anything can start one with
 * `celebrate()`; the `<Fireworks />` host mounted on the page draws it on a canvas that sits
 * above everything and ignores the pointer, so the learner can keep building while it plays.
 *
 * Each shell's burst sound is played by the canvas at the moment it opens, so what you hear
 * matches what you see. With `prefers-reduced-motion`, or the city motion setting at `off`,
 * the show is skipped — only the build chime (played by the card) remains.
 */

const EVENT = 'swedish:celebrate';
/** How long new shells keep launching; the last ones then burn out for about a second. */
const SHOW_MS = 9000;
const COLORS = ['#C8A24A', '#C0392B', '#3FBF9F', '#7B6CD9', '#E8743B', '#E8C872'];

export function celebrate(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function Fireworks() {
  // A counter, not a boolean: a second build during a show restarts it from the top.
  const [run, setRun] = useState(0);

  useEffect(() => {
    const start = () => {
      if (prefersReducedMotion() || useAppStore.getState().settings.cityMotion === 'off') return;
      setRun((n) => n + 1);
    };
    window.addEventListener(EVENT, start);
    return () => window.removeEventListener(EVENT, start);
  }, []);

  if (run === 0) return null;
  return <Show key={run} onDone={() => setRun(0)} />;
}

function Show({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      onDone();
      return;
    }

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const began = performance.now();
    let nextLaunch = began;
    let last = began;
    let frame = 0;

    const launch = () => {
      const x = width * (0.12 + Math.random() * 0.76);
      rockets.push({
        x,
        y: height,
        vy: -(height * 0.9 + Math.random() * height * 0.4),
        targetY: height * (0.12 + Math.random() * 0.35),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const burst = (r: Rocket) => {
      const count = 70 + Math.floor(Math.random() * 40);
      const speed = Math.min(width, height) * (0.25 + Math.random() * 0.15);
      // Some shells carry a second colour, so the sky is not one flat tint.
      const second = Math.random() < 0.4 ? COLORS[Math.floor(Math.random() * COLORS.length)] : r.color;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.1;
        const v = speed * (0.6 + Math.random() * 0.4);
        const maxLife = 1.1 + Math.random() * 0.7;
        sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: maxLife,
          maxLife,
          color: i % 2 ? second : r.color,
        });
      }
      playFireworkBurst((r.x / width) * 2 - 1);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - began;

      if (elapsed < SHOW_MS && now >= nextLaunch) {
        launch();
        if (Math.random() < 0.3) launch();
        nextLaunch = now + 350 + Math.random() * 450;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * dt;
        ctx.fillStyle = r.color;
        ctx.fillRect(r.x - 1.5, r.y, 3, 10);
        if (r.y <= r.targetY) {
          burst(r);
          rockets.splice(i, 1);
        }
      }

      const gravity = height * 0.35;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + gravity * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // Each spark is a short streak along its path, so a burst reads as trails, not dots.
        ctx.globalAlpha = Math.min(1, s.life / (s.maxLife * 0.6));
        ctx.strokeStyle = s.color;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (elapsed >= SHOW_MS && rockets.length === 0 && sparks.length === 0) {
        onDone();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
