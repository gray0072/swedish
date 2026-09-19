import type { Footprint, GridCell } from './types';

/**
 * The isometric grid maths (CITY_VISUALS_SCENE.md §2). Every layer that places something on
 * the island goes through `toScreen`/`depthOf` so the projection lives in exactly one place.
 */

export const TILE_W = 96;
export const TILE_H = 48;
export const ORIGIN = { x: 600, y: 300 };

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Grid cell centre -> viewBox coordinates. */
export function toScreen(cell: GridCell): ScreenPoint {
  return {
    x: ORIGIN.x + ((cell.q - cell.r) * TILE_W) / 2,
    y: ORIGIN.y + ((cell.q + cell.r) * TILE_H) / 2,
  };
}

/** Inverse of `toScreen`, rounded to the nearest cell — used only for the placement fallback. */
export function screenToCell(point: ScreenPoint): GridCell {
  const a = (point.x - ORIGIN.x) / (TILE_W / 2);
  const b = (point.y - ORIGIN.y) / (TILE_H / 2);
  const q = (a + b) / 2;
  const r = (b - a) / 2;
  return { q: Math.round(q), r: Math.round(r) };
}

/** Painter's-algorithm sort key: back rows (small q+r) draw first. */
export function depthOf(cell: GridCell): number {
  return cell.q + cell.r;
}

/** Stable back-to-front, then left-to-right sort for anything keyed by a grid cell. */
export function compareDepth(a: GridCell, b: GridCell): number {
  const depthDiff = depthOf(a) - depthOf(b);
  if (depthDiff !== 0) return depthDiff;
  return a.q - b.q;
}

/** Every cell a footprint anchored at `origin` (its front-bottom corner) occupies. */
export function footprintCells(origin: GridCell, footprint: Footprint): GridCell[] {
  const cells: GridCell[] = [];
  for (let dq = 0; dq < footprint.w; dq += 1) {
    for (let dr = 0; dr < footprint.h; dr += 1) {
      cells.push({ q: origin.q + dq, r: origin.r + dr });
    }
  }
  return cells;
}

/** True when two footprints, each anchored at its own origin, share any cell. */
export function footprintsOverlap(
  aOrigin: GridCell,
  aFootprint: Footprint,
  bOrigin: GridCell,
  bFootprint: Footprint,
): boolean {
  const aq0 = aOrigin.q;
  const aq1 = aOrigin.q + aFootprint.w - 1;
  const ar0 = aOrigin.r;
  const ar1 = aOrigin.r + aFootprint.h - 1;
  const bq0 = bOrigin.q;
  const bq1 = bOrigin.q + bFootprint.w - 1;
  const br0 = bOrigin.r;
  const br1 = bOrigin.r + bFootprint.h - 1;
  const qOverlap = aq0 <= bq1 && bq0 <= aq1;
  const rOverlap = ar0 <= br1 && br0 <= ar1;
  return qOverlap && rOverlap;
}

export function cellKey(cell: GridCell): string {
  return `${cell.q},${cell.r}`;
}

/** Screen-space centre of a whole footprint — the average of its cells' centres. */
export function footprintCenter(origin: GridCell, footprint: Footprint): ScreenPoint {
  const cells = footprintCells(origin, footprint);
  const sum = cells.reduce(
    (acc, cell) => {
      const p = toScreen(cell);
      return { x: acc.x + p.x, y: acc.y + p.y };
    },
    { x: 0, y: 0 },
  );
  return { x: sum.x / cells.length, y: sum.y / cells.length };
}
