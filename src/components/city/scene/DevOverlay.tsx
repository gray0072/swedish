import { useEffect, useRef, useState } from 'react';
import type { Era } from '@/content/schema';
import type { GridCell } from './types';
import type { Placement } from './placement';
import type { MotionTier } from './motion';

/**
 * Dev-only overlay behind `?scene=debug` (CITY_VISUALS_TECH.md §7): a grid/placement readout
 * plus the live node count, animated-group count and frame-time readout the §5 budget needs to
 * be checkable against (≤700 nodes, ≤60 ambient, ≤40 agents, ≤24 CSS-animated groups, ≤4ms
 * scripting/frame). The "force level" / "jump era" controls need store access the scene itself
 * doesn't have (CITY_VISUALS_TECH.md §4) and are left for whichever later phase wires them up.
 */

// Every class name an ambient/event animation is applied to (city-scene.css) — counted, not
// enumerated by hand each time, so this list is the one place §5's "≤24 animated groups" is
// checked against.
const ANIMATED_GROUP_SELECTOR = [
  '.wave-band',
  '.shoreline-foam',
  '.water-sparkle',
  '.plot-affordable',
  '.plot-shimmer',
  '.tap-ring',
  '.ambient-smoke',
  '.ambient-flag',
  '.ambient-rotor',
  '.ambient-beacon',
  '.ambient-aurora',
  '.ambient-birds__flock',
  '.reed-sway',
  '.weather-particle',
].join(', ');

export default function DevOverlay({
  era,
  placements,
  builtCells,
  agentCount,
  motionTier,
}: {
  era: Era;
  placements: Map<string, Placement>;
  builtCells: GridCell[];
  agentCount: number;
  motionTier: MotionTier;
}) {
  const enabled =
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('scene') === 'debug';

  const [nodeCount, setNodeCount] = useState(0);
  const [animatedGroups, setAnimatedGroups] = useState(0);
  const [frameMs, setFrameMs] = useState(0);
  const lastSampleRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const id = requestAnimationFrame(() => {
      setNodeCount(document.querySelectorAll('.city-scene svg *').length);
      setAnimatedGroups(document.querySelectorAll(`.city-scene svg ${ANIMATED_GROUP_SELECTOR}`).length);
    });
    return () => cancelAnimationFrame(id);
  }, [enabled, placements, builtCells]);

  // A cheap frame-time sample: one requestAnimationFrame round-trip's cost, refreshed twice a
  // second rather than every frame so the overlay itself never becomes the thing over budget.
  useEffect(() => {
    if (!enabled) return undefined;
    let raf = 0;
    let cancelled = false;
    function sample(now: number) {
      if (cancelled) return;
      if (now - lastSampleRef.current > 500) {
        const start = performance.now();
        // Touching layout once (the cost DevOverlay itself can't avoid) gives a rough proxy for
        // per-frame scripting cost without instrumenting the real clock's internals.
        void document.querySelectorAll('.city-scene svg *').length;
        setFrameMs(performance.now() - start);
        lastSampleRef.current = now;
      }
      raf = requestAnimationFrame(sample);
    }
    raf = requestAnimationFrame(sample);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-x-2 bottom-2 max-h-32 overflow-auto rounded bg-black/80 p-2 font-mono text-[10px] text-lime-300">
      <p>
        era={era.id} tier={motionTier} plots+buildings={placements.size} built={builtCells.length} agents=
        {agentCount} (budget 40) nodes={nodeCount} (budget 700) animated-groups={animatedGroups} (budget 24) frame≈
        {frameMs.toFixed(2)}ms (budget 4)
      </p>
      <p>
        {[...placements.entries()]
          .map(([id, p]) => `${id}@(${p.cell.q},${p.cell.r})`)
          .join(' ')}
      </p>
    </div>
  );
}
