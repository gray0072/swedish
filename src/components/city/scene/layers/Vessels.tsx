import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { EraFigures } from '../types';

export interface VesselRoute {
  /** Route centre and radii — a fixed closed ellipse standing in for the "closed spline route"
   * of CITY_VISUALS_LIFE.md §6; simple enough to compute every frame with no lookup table. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Seconds per lap, 22-40s (LIFE.md §6). */
  lapSeconds: number;
  /** Where on the ellipse this boat starts, 0..1, so several boats don't stack. */
  phase: number;
  hull: string;
  sail?: string;
}

export interface VesselsHandle {
  /** Advances every boat by `dtSeconds` and writes the result straight to the DOM (same
   * ref-mutation discipline as `Agents.sync`, CITY_VISUALS_TECH.md §4). */
  tick: (dtSeconds: number) => void;
}

const WAKE_LENGTH = 14;

function positionOn(route: VesselRoute, elapsedSeconds: number): { x: number; y: number; heading: number } {
  const t = (elapsedSeconds / route.lapSeconds + route.phase) % 1;
  const angle = t * Math.PI * 2;
  const x = route.cx + Math.cos(angle) * route.rx;
  const y = route.cy + Math.sin(angle) * route.ry;
  // Heading from the derivative of the ellipse parametrisation — used only to mirror the hull.
  const dx = -Math.sin(angle) * route.rx;
  return { x, y, heading: dx >= 0 ? 1 : -1 };
}

/**
 * Layer 4 (`vessels`) — one to three boats on fixed closed routes (CITY_VISUALS_LIFE.md §6),
 * always drawn behind the island so they never need depth sorting. `Scene.tsx` only mounts
 * this once the era's harbour-class building is built; an era with none renders nothing.
 */
const Vessels = forwardRef<VesselsHandle, { routes: VesselRoute[]; figures?: EraFigures }>(
  ({ routes, figures }, ref) => {
    const elapsedRef = useRef<number[]>(routes.map(() => 0));
    const wrapperRefs = useRef<(SVGGElement | null)[]>([]);

    useImperativeHandle(
      ref,
      () => ({
        tick(dtSeconds) {
          for (let i = 0; i < routes.length; i += 1) {
            elapsedRef.current[i] += dtSeconds;
            const { x, y, heading } = positionOn(routes[i], elapsedRef.current[i]);
            const g = wrapperRefs.current[i];
            if (g) g.setAttribute('transform', `translate(${x.toFixed(2)}, ${y.toFixed(2)}) scale(${heading}, 1)`);
          }
        },
      }),
      [routes],
    );

    if (!figures?.boat) return null;
    const draw = figures.boat;

    return (
      <g aria-hidden="true">
        {routes.map((route, i) => {
          const start = positionOn(route, 0);
          return (
            <g
              key={i}
              ref={(el) => {
                wrapperRefs.current[i] = el;
              }}
              transform={`translate(${start.x}, ${start.y})`}
            >
              {/* Wake: two short dashed arcs trailing the hull, 30% opacity (LIFE.md §6). */}
              <path
                d={`M ${-WAKE_LENGTH} 4 Q ${-WAKE_LENGTH / 2} 8 0 4`}
                fill="none"
                stroke={route.hull}
                strokeOpacity="0.3"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d={`M ${-WAKE_LENGTH} -2 Q ${-WAKE_LENGTH / 2} 2 0 -2`}
                fill="none"
                stroke={route.hull}
                strokeOpacity="0.3"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Small: these sail in the far water behind the island, so they have to read
                  as distant next to the buildings standing on the near shore. */}
              {draw({ x: 0, y: 0, w: 22, hull: route.hull, sail: route.sail })}
            </g>
          );
        })}
      </g>
    );
  },
);

Vessels.displayName = 'Vessels';
export default Vessels;
