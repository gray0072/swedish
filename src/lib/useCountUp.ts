import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A number that counts to `target` instead of jumping to it — the coin-count animation of
 * SPEC §10. Starts at `from` (the target itself by default, so a value shown on mount does not
 * animate) and then tweens from whatever is on screen to each new target. Under
 * `prefers-reduced-motion` it simply returns the target.
 */
export function useCountUp(target: number, { from, duration = 700 }: { from?: number; duration?: number } = {}): number {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : (from ?? target)));
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    const start = shownRef.current;
    if (start === target || prefersReducedMotion()) {
      setShown(target);
      return;
    }
    const began = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - began) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(start + (target - start) * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return shown;
}
