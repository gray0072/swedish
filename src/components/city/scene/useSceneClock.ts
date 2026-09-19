import { useEffect, useRef, useState, type RefObject } from 'react';
import type { MotionTier } from './motion';

const FRAME_INTERVAL_MS = 1000 / 30; // 30 fps cap (CITY_VISUALS_MOTION.md §2)
const MAX_DT_MS = 100; // clamp so a long tab-switch stall doesn't jump agents across the island

/**
 * The one rAF loop for the whole scene (CITY_VISUALS_MOTION.md §2/§4). It only exists at all
 * when `tier === 'full'` — `calm` and `off` are both "ambient off" per the motion table, so
 * there is nothing for a clock to drive. While it exists, it starts and stops (never merely
 * pauses) as the map's on-screen/tab-visible state changes, and hands back `active` so the
 * scene can gate CSS ambient classes the same way: removed, not `animation-play-state: paused`.
 */
export function useSceneClock(
  containerRef: RefObject<Element | null>,
  tier: MotionTier,
  onTick: (dtSeconds: number) => void,
): boolean {
  const [active, setActive] = useState(false);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (tier !== 'full' || typeof window === 'undefined') {
      setActive(false);
      return undefined;
    }

    const node = containerRef.current;
    let intersecting = !('IntersectionObserver' in window); // no observer support -> assume visible
    let hidden = typeof document !== 'undefined' && document.hidden;
    let running = false;
    let rafId = 0;
    let lastTick = 0;

    function frame(now: number) {
      if (!running) return;
      if (lastTick === 0) lastTick = now;
      const elapsed = now - lastTick;
      if (elapsed >= FRAME_INTERVAL_MS) {
        lastTick = now;
        onTickRef.current(Math.min(MAX_DT_MS, elapsed) / 1000);
      }
      rafId = requestAnimationFrame(frame);
    }

    function evaluate() {
      const shouldRun = intersecting && !hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      setActive(shouldRun);
      if (shouldRun) {
        lastTick = 0;
        rafId = requestAnimationFrame(frame);
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    const onVisibility = () => {
      hidden = document.hidden;
      evaluate();
    };
    document.addEventListener('visibilitychange', onVisibility);

    let observer: IntersectionObserver | undefined;
    if (node && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          intersecting = entry.isIntersecting;
          evaluate();
        },
        { threshold: 0.1 },
      );
      observer.observe(node);
    }

    evaluate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      setActive(false);
    };
  }, [containerRef, tier]);

  return active;
}
