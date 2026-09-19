import type { AmbientEmitter } from '../types';
import { makeSeededRandom } from '../wobble';

/**
 * Layer 10 (`weather`) — the optional, era-gated particle emitters (CITY_VISUALS_LIFE.md §7's
 * `snow`/`pollen`/`rain`). These are the most expensive ambient emitters (20 nodes each) and
 * "off by default" per the doc, so `Scene.tsx` only ever passes one through here when the
 * ambient budget (`ambient.ts`) actually selected it for this era.
 */

const PARTICLE_COUNT = 20;
const weatherRng = makeSeededRandom(0x3ea7);
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, () => ({
  x: weatherRng() * 1200,
  delay: weatherRng() * 6,
  duration: 5 + weatherRng() * 4,
  drift: weatherRng() * 20 - 10,
}));

const KIND_STYLE: Record<'snow' | 'pollen' | 'rain', { fill: string; r: number; opacity: number }> = {
  snow: { fill: 'var(--water-foam)', r: 2, opacity: 0.8 },
  pollen: { fill: 'var(--ground-top)', r: 1.6, opacity: 0.6 },
  rain: { fill: 'var(--water-wave)', r: 1, opacity: 0.5 },
};

export default function Weather({ kind, active }: { kind: Extract<AmbientEmitter, 'snow' | 'pollen' | 'rain'> | undefined; active: boolean }) {
  if (!kind || !active) return null;
  const style = KIND_STYLE[kind];

  return (
    <g aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <circle
          key={i}
          className={`weather-particle weather-particle--${kind}`}
          cx={p.x}
          cy={-10}
          r={style.r}
          fill={style.fill}
          fillOpacity={style.opacity}
          style={{
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // @ts-expect-error -- custom property read back by the keyframe in city-scene.css
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </g>
  );
}
