import type { GridCell } from '../types';
import { cellKey, toScreen } from '../iso';
import { ISLAND_POLYGON_PATH, buildPathGraph, insetPolygonPath } from '../island';
import { makeSeededRandom, wobblePath } from '../wobble';

/**
 * Layer 5 (`terrain`) — island rock/grass, the cliff band, the wet rock strip at the
 * waterline, and the paths that connect built plots back to the quay (CITY_VISUALS_SCENE.md
 * §4). The silhouette is the same polygon in every era; only the era theme's fills change.
 *
 * The edge list comes from `island.ts`'s `buildPathGraph`, the same graph `agents.ts` walks —
 * one source of truth for "which cells are connected" instead of two copies drifting apart.
 */

const pathRng = makeSeededRandom(0x9a7e);

export default function Terrain({ builtCells }: { builtCells: GridCell[] }) {
  const { edges } = buildPathGraph(builtCells);

  return (
    <g aria-hidden="true">
      <path d={ISLAND_POLYGON_PATH} fill="var(--ground-top)" />
      <path d={insetPolygonPath(10, 1)} fill="none" stroke="var(--ground-cliff)" strokeWidth="10" strokeOpacity="0.5" />
      <path d={insetPolygonPath(2, 2)} fill="none" stroke="var(--ground-wet)" strokeWidth="3" strokeOpacity="0.6" />

      {edges.map(([a, b]) => {
        const pa = toScreen(a);
        const pb = toScreen(b);
        return (
          <path
            key={`${cellKey(a)}-${cellKey(b)}`}
            d={wobblePath([pa, pb], pathRng, 0.5, 16)}
            fill="none"
            stroke="var(--ground-cliff)"
            strokeOpacity="0.5"
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}
