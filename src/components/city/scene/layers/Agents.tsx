import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { EraFigures } from '../types';
import type { WalkPhase } from '../agents';

export interface AgentVisual {
  x: number;
  y: number;
  phase: WalkPhase;
  opacity: number;
  body: string;
  head: string;
  accent: string;
  kind: 'citizen' | 'worker';
}

export interface AgentsHandle {
  /** Applies a new frame's position/opacity to the mounted `<g>` shells by mutating
   * `transform`/`opacity` directly (CITY_VISUALS_TECH.md §4) — this never goes through React
   * state, so a 30 fps tick never triggers a re-render of the layer. */
  sync: (visuals: AgentVisual[]) => void;
  /** The 2-frame walk cycle flips only every 320ms (CITY_VISUALS_LIFE.md §2) — far too coarse
   * to justify doubling every figure's node count by pre-rendering both frames (that alone
   * would blow the ≤40 agent-node slice of CITY_VISUALS_MOTION.md §5's budget at a full
   * population). A low-frequency React re-render swaps which single frame is drawn instead;
   * `Scene.tsx`'s clock calls this on its own throttle, off the same rAF loop. */
  setPhases: (phases: WalkPhase[]) => void;
}

/**
 * Layer 8 (`agents`) — citizens and workers (CITY_VISUALS_LIFE.md §3/§5). One `<g>` shell per
 * agent, mounted once per population size; the clock (`useSceneClock` in `Scene.tsx`) drives
 * position through `sync` (ref mutation, every tick) and the walk-cycle frame through
 * `setPhases` (React state, throttled) so both the smoothness rule and the node budget hold.
 */
const Agents = forwardRef<AgentsHandle, { initial: AgentVisual[]; figures?: EraFigures }>(
  ({ initial, figures }, ref) => {
    const wrapperRefs = useRef<(SVGGElement | null)[]>([]);
    const [phases, setPhasesState] = useState<WalkPhase[]>(() => initial.map((v) => v.phase));

    useImperativeHandle(
      ref,
      () => ({
        sync(visuals) {
          for (let i = 0; i < visuals.length; i += 1) {
            const v = visuals[i];
            const wrapper = wrapperRefs.current[i];
            if (!wrapper) continue;
            wrapper.setAttribute('transform', `translate(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`);
            wrapper.style.opacity = String(v.opacity);
          }
        },
        setPhases(next) {
          setPhasesState(next);
        },
      }),
      [],
    );

    if (!figures) return null;

    return (
      <g aria-hidden="true">
        {initial.map((v, i) => {
          const draw = v.kind === 'worker' ? figures.worker : figures.citizen;
          const phase = phases[i] ?? v.phase;
          return (
            <g
              key={i}
              ref={(el) => {
                wrapperRefs.current[i] = el;
              }}
              transform={`translate(${v.x}, ${v.y})`}
              style={{ opacity: v.opacity }}
            >
              {draw({ x: 0, y: 0, phase, body: v.body, head: v.head, accent: v.accent })}
            </g>
          );
        })}
      </g>
    );
  },
);

Agents.displayName = 'Agents';
export default Agents;
