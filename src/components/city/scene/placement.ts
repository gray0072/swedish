import type { Footprint, GridCell } from './types';
import { cellKey, footprintCells, footprintsOverlap, screenToCell } from './iso';
import { ISLAND_BOUNDS, ISLAND_CELLS, isWalkable } from './island';

/**
 * The placement fallback (CITY_VISUALS_TECH.md §2/§8, Phase 0). Content has no `cell` yet, so
 * every building's percentage `position` is projected onto the nearest free island cell —
 * deterministically, so the same content always produces the same layout, and the map never
 * has to wait for the content migration to look like a place.
 *
 * Once a building does carry a `cell` (content migration, later phase), it is used as-is and
 * this module only validates that it fits.
 */

// The old flat backdrop treated `position.x/y` as percentages of its own box. That reading is
// kept — buildings hold their relative arrangement — but the box is the island's own bounding
// box rather than the whole frame, so the spread covers the shore and nothing depends on where
// sky and water happen to sit.
const SPAN_X = ISLAND_BOUNDS.maxX - ISLAND_BOUNDS.minX;
const SPAN_Y = ISLAND_BOUNDS.maxY - ISLAND_BOUNDS.minY;

export interface Placeable {
  id: string;
  position: { x: number; y: number };
  /** Optional pre-authored cell — used as-is once content carries one. */
  cell?: GridCell;
  /** Optional pre-authored footprint — defaults to a single cell. */
  footprint?: Footprint;
}

export interface Placement {
  cell: GridCell;
  footprint: Footprint;
}

const DEFAULT_FOOTPRINT: Footprint = { w: 1, h: 1 };

/** Every neighbour offset out to `maxRadius`, ordered by distance then a fixed tie-break —
 * this ordering is what makes the search deterministic: two buildings that land on the same
 * starting cell always fan out in the same direction first. */
function spiralOffsets(maxRadius: number): GridCell[] {
  const offsets: GridCell[] = [];
  for (let dq = -maxRadius; dq <= maxRadius; dq += 1) {
    for (let dr = -maxRadius; dr <= maxRadius; dr += 1) {
      offsets.push({ q: dq, r: dr });
    }
  }
  offsets.sort((a, b) => {
    const da = a.q * a.q + a.r * a.r;
    const db = b.q * b.q + b.r * b.r;
    if (da !== db) return da - db;
    if (a.q !== b.q) return a.q - b.q;
    return a.r - b.r;
  });
  return offsets;
}

const SPIRAL = spiralOffsets(14); // island spans roughly 10x10, so this always covers it

function fits(origin: GridCell, footprint: Footprint, occupied: Set<string>): boolean {
  const cells = footprintCells(origin, footprint);
  return cells.every((cell) => isWalkable(cell) && !occupied.has(cellKey(cell)));
}

/** Nearest free cell to `target` that fits `footprint` without overlapping `occupied`. */
function nearestFreeCell(target: GridCell, footprint: Footprint, occupied: Set<string>): GridCell {
  for (const offset of SPIRAL) {
    const candidate = { q: target.q + offset.q, r: target.r + offset.r };
    if (fits(candidate, footprint, occupied)) return candidate;
  }
  // Exhausted the spiral (island full, or a footprint too big to ever fit) — fall back to the
  // first walkable cell in grid order that isn't occupied, so placement always terminates.
  const fallback = ISLAND_CELLS.find((cell) => fits(cell, footprint, occupied));
  if (fallback) return fallback;
  // Truly out of room: return the target as-is. Overlap validation will flag it, but the
  // scene still renders instead of throwing.
  return target;
}

/**
 * Assigns every placeable a cell + footprint, in array order, so the same `buildings` array
 * always yields the same layout regardless of when or how often it is called.
 */
export function assignCells(items: Placeable[]): Map<string, Placement> {
  const occupied = new Set<string>();
  const result = new Map<string, Placement>();

  for (const item of items) {
    const footprint = item.footprint ?? DEFAULT_FOOTPRINT;
    let cell: GridCell;
    if (item.cell && fits(item.cell, footprint, occupied)) {
      cell = item.cell;
    } else {
      const target = screenToCell({
        x: ISLAND_BOUNDS.minX + (item.position.x / 100) * SPAN_X,
        y: ISLAND_BOUNDS.minY + (item.position.y / 100) * SPAN_Y,
      });
      cell = nearestFreeCell(target, footprint, occupied);
    }
    for (const occupiedCell of footprintCells(cell, footprint)) {
      occupied.add(cellKey(occupiedCell));
    }
    result.set(item.id, { cell, footprint });
  }

  return result;
}

/** True when any two assigned footprints overlap — the invariant validation checks for. */
export function hasOverlaps(placements: Map<string, Placement>): boolean {
  const entries = [...placements.values()];
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      if (footprintsOverlap(entries[i].cell, entries[i].footprint, entries[j].cell, entries[j].footprint)) {
        return true;
      }
    }
  }
  return false;
}
