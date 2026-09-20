import type { GridCell } from '../types';
import { cellKey, toScreen } from '../iso';
import { ISLAND_DEPTH, ISLAND_POLYGON_PATH, buildPathGraph, insetPolygonPath } from '../island';
import { makeSeededRandom, wobblePath } from '../wobble';

/**
 * Layer 5 (`terrain`) — the island itself: its shadow in the water, the rock slab below the
 * waterline, the grass surface on top of it, the wet rock strip where the two meet, and the
 * paths that connect built plots back to the quay (CITY_VISUALS_SCENE.md §4). The silhouette
 * is the same polygon in every era; only the era theme's fills change.
 *
 * Depth comes from drawing that one silhouette three times: once offset down as a soft shadow
 * cast on the lake, once offset down by `ISLAND_DEPTH` in the cliff tone (the rock face), and
 * once in place in the surface tone. Flat shapes, no blur — the same woodcut discipline as the
 * building art, and the reason the island reads as sitting in the water rather than above it.
 *
 * The edge list comes from `island.ts`'s `buildPathGraph`, the same graph `agents.ts` walks —
 * one source of truth for "which cells are connected" instead of two copies drifting apart.
 */

const pathRng = makeSeededRandom(0x9a7e);

export default function Terrain({ builtCells }: { builtCells: GridCell[] }) {
  const { edges } = buildPathGraph(builtCells);

  return (
    <g aria-hidden="true">
      {/* Shadow in the water, offset down-right because the light is fixed upper-left. */}
      <g transform={`translate(10, ${ISLAND_DEPTH + 12})`}>
        <path d={ISLAND_POLYGON_PATH} fill="var(--water-deep)" fillOpacity="0.45" />
      </g>

      {/* The rock face: the same outline dropped by ISLAND_DEPTH, so the sliver left showing
          below the grass is the thickness of the island. */}
      <g transform={`translate(0, ${ISLAND_DEPTH})`}>
        <path d={ISLAND_POLYGON_PATH} fill="var(--ground-cliff)" />
        <path d={insetPolygonPath(4, 5)} fill="var(--ground-wet)" fillOpacity="0.35" />
      </g>

      <defs>
        {/* Light from the upper left (SCENE.md §1): the far/left side of the surface keeps the
            era's grass tone, the near/right side sinks toward the cliff tone. */}
        <linearGradient id="ground-shade" x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="var(--ground-cliff)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--ground-cliff)" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <path d={ISLAND_POLYGON_PATH} fill="var(--ground-top)" />
      <path d={ISLAND_POLYGON_PATH} fill="url(#ground-shade)" />
      {/* Wet rock at the waterline, then a soft band of bare ground just inside it. */}
      <path d={ISLAND_POLYGON_PATH} fill="none" stroke="var(--ground-wet)" strokeWidth="4" strokeOpacity="0.7" />
      <path d={insetPolygonPath(9, 1)} fill="none" stroke="var(--ground-cliff)" strokeWidth="14" strokeOpacity="0.22" />

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
