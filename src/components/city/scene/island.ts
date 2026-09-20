import type { GridCell } from './types';
import { cellKey, toScreen } from './iso';
import { closedSplinePath, makeSeededRandom, pointsToPath, type Point } from './wobble';

/**
 * The walkable cell set and its terrain geometry. The island's shape is the one constant
 * across every era (CITY_VISUALS_SCENE.md §4) — everything here is computed once, at module
 * load, from plain grid maths and a seeded PRNG, so it never changes between renders or
 * between reloads.
 */

const Q_MIN = -4;
const Q_MAX = 5;
const R_MIN = -4;
const R_MAX = 5;
// The grid's centre cell, used as the island's ellipse centre below.
const CENTER_Q = (Q_MIN + Q_MAX) / 2;
const CENTER_R = (R_MIN + R_MAX) / 2;
// Radii of the ellipse that carves the island out of the q/r rectangle. Slightly different
// per axis so the island reads as an elongated blob rather than a perfect diamond.
const RADIUS_Q = 5.0;
const RADIUS_R = 4.6;

function inRange(cell: GridCell): boolean {
  return cell.q >= Q_MIN && cell.q <= Q_MAX && cell.r >= R_MIN && cell.r <= R_MAX;
}

function inEllipse(cell: GridCell): boolean {
  const dq = (cell.q - CENTER_Q) / RADIUS_Q;
  const dr = (cell.r - CENTER_R) / RADIUS_R;
  return dq * dq + dr * dr <= 1;
}

/** The hand-tunable rule for "is this cell part of the island". Everything else derives from it. */
function isWalkableCell(cell: GridCell): boolean {
  return inRange(cell) && inEllipse(cell);
}

/** The full walkable cell set — the island's footprint on the grid. */
export const ISLAND_CELLS: GridCell[] = (() => {
  const cells: GridCell[] = [];
  for (let q = Q_MIN; q <= Q_MAX; q += 1) {
    for (let r = R_MIN; r <= R_MAX; r += 1) {
      const cell = { q, r };
      if (isWalkableCell(cell)) cells.push(cell);
    }
  }
  return cells;
})();

const WALKABLE_KEYS = new Set(ISLAND_CELLS.map(cellKey));

export function isWalkable(cell: GridCell): boolean {
  return WALKABLE_KEYS.has(cellKey(cell));
}

/** The four grid-adjacent neighbours of a cell (no diagonals — matches the path graph edges). */
export function neighborsOf(cell: GridCell): GridCell[] {
  return [
    { q: cell.q + 1, r: cell.r },
    { q: cell.q - 1, r: cell.r },
    { q: cell.q, r: cell.r + 1 },
    { q: cell.q, r: cell.r - 1 },
  ];
}

// ---------------------------------------------------------------------------
// Path graph — a spanning tree over the walkable cells, rooted at the quay-side hub, so every
// building has one deterministic shortest route back to the landing point citizens arrive at
// (CITY_VISUALS_LIFE.md walks these edges; here it just needs to exist and be well-formed).
// ---------------------------------------------------------------------------

/** The cell paths radiate from — the island's one quay-side landing point. */
export const ISLAND_HUB: GridCell = { q: 0, r: -3 };

function buildSpanningTree(cells: GridCell[], hub: GridCell): Map<string, GridCell | null> {
  const parent = new Map<string, GridCell | null>();
  const cellSet = new Set(cells.map(cellKey));
  if (!cellSet.has(cellKey(hub))) {
    throw new Error('island.ts: ISLAND_HUB must be a walkable cell');
  }
  parent.set(cellKey(hub), null);
  const queue: GridCell[] = [hub];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of neighborsOf(current)) {
      const key = cellKey(next);
      if (!cellSet.has(key) || parent.has(key)) continue;
      parent.set(key, current);
      queue.push(next);
    }
  }
  return parent;
}

/** Parent pointer of every walkable cell toward `ISLAND_HUB`, root's parent is `null`. */
export const PATH_PARENT: Map<string, GridCell | null> = buildSpanningTree(ISLAND_CELLS, ISLAND_HUB);

/** The chain of cells from `cell` up to the hub, hub first — the route a path segment draws. */
export function pathToHub(cell: GridCell): GridCell[] {
  const chain: GridCell[] = [];
  let current: GridCell | null | undefined = cell;
  const guard = ISLAND_CELLS.length + 1; // spanning tree can't be longer than the cell count
  for (let i = 0; i < guard && current; i += 1) {
    chain.unshift(current);
    current = PATH_PARENT.get(cellKey(current));
  }
  return chain;
}

// ---------------------------------------------------------------------------
// Terrain silhouette — the island polygon, identical in every era. Derived once from the
// walkable set's outer boundary, then jittered and rounded so the shoreline reads as a
// coastline rather than as the polygon it is derived from.
// ---------------------------------------------------------------------------

function isBoundaryCell(cell: GridCell): boolean {
  return neighborsOf(cell).some((n) => !isWalkable(n));
}

/** The four screen-space diamond corners of one grid cell (top, right, bottom, left). */
function diamondCorners(cell: GridCell): Point[] {
  const { x, y } = toScreen(cell);
  const halfW = 48; // TILE_W / 2, duplicated as a literal to keep this module import-light
  const halfH = 24; // TILE_H / 2
  return [
    { x, y: y - halfH },
    { x: x + halfW, y },
    { x, y: y + halfH },
    { x: x - halfW, y },
  ];
}

/** Andrew's monotone chain convex hull — small, dependency-free, deterministic. */
function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

const boundaryCorners = ISLAND_CELLS.filter(isBoundaryCell).flatMap(diamondCorners);
const hullPoints = convexHull(boundaryCorners);
const islandRng = makeSeededRandom(0xc17a); // "city" — stable across every load and render

const CENTROID = {
  x: hullPoints.reduce((sum, p) => sum + p.x, 0) / hullPoints.length,
  y: hullPoints.reduce((sum, p) => sum + p.y, 0) / hullPoints.length,
};

/** Pushes a point toward (positive) or away from (negative) the silhouette's centroid. */
function offsetFromCentroid(p: Point, units: number): Point {
  const dx = p.x - CENTROID.x;
  const dy = p.y - CENTROID.y;
  const length = Math.hypot(dx, dy) || 1;
  const scale = Math.max(0, (length - units) / length);
  return { x: CENTROID.x + dx * scale, y: CENTROID.y + dy * scale };
}

/**
 * The shoreline's control points: the hull's vertices plus one point per edge midpoint, each
 * nudged radially by a seeded amount. The hull on its own is a hard-edged decagon and a
 * coastline is not — the jitter breaks up its long straight runs, and `closedSplinePath`
 * rounds what is left, so the island reads as a landmass instead of a game token.
 */
const SHORE_POINTS: Point[] = (() => {
  const dense: Point[] = [];
  for (let i = 0; i < hullPoints.length; i += 1) {
    const a = hullPoints[i];
    const b = hullPoints[(i + 1) % hullPoints.length];
    dense.push(a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  return dense.map((p) => {
    const dx = p.x - CENTROID.x;
    const dy = p.y - CENTROID.y;
    const scale = 1 + (islandRng() * 2 - 1) * 0.06;
    return { x: CENTROID.x + dx * scale, y: CENTROID.y + dy * scale };
  });
})();

/** The island silhouette, world-space, derived once and reused by every era's terrain layer. */
export const ISLAND_POLYGON_PATH: string = closedSplinePath(SHORE_POINTS);

/**
 * How far the rock below the grass is extruded downward, in world units. `Terrain` draws the
 * same silhouette twice — once shifted down by this much in the cliff tone, once in place in
 * the surface tone — so the island reads as a slab of rock sitting *in* the water rather than
 * a flat sticker laid *on* it. `Water` puts its foam ring and shallows on the shifted copy,
 * because that lower outline is where rock actually meets water.
 */
export const ISLAND_DEPTH = 26;

/**
 * World-space bounding box of the silhouette. `placement.ts` maps a building's percentage
 * `position` into this box rather than into the whole 1200x900 frame, so the arrangement
 * depends on the island alone and survives any future re-framing of sky and water.
 */
export const ISLAND_BOUNDS = (() => {
  const xs = SHORE_POINTS.map((p) => p.x);
  const ys = SHORE_POINTS.map((p) => p.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
})();

/** A copy of the silhouette pushed toward its centroid — used for the cliff/wet-rock terrain
 * bands, and, with a negative `insetUnits`, for the shallows ring `Water` draws just outside
 * the shore. */
export function insetPolygonPath(insetUnits: number, seedOffset: number): string {
  const rng = makeSeededRandom(0xc17a + seedOffset);
  // Each band gets its own small jitter on top of the offset, so the cliff, the wet rock and
  // the shallows never run exactly parallel to the shore the way a machine-drawn outline would.
  const offset = SHORE_POINTS.map((p) => offsetFromCentroid(p, insetUnits + (rng() * 2 - 1) * 2));
  return closedSplinePath(offset);
}

export { pointsToPath };

// ---------------------------------------------------------------------------
// Path graph for walking — the same trunk routes Terrain.tsx draws, reshaped into an
// adjacency map so citizens (CITY_VISUALS_LIFE.md §3) can pick a next edge without either
// side duplicating the "which cells are connected" logic.
// ---------------------------------------------------------------------------

export interface PathGraph {
  edges: [GridCell, GridCell][];
  adjacency: Map<string, GridCell[]>;
}

/** Unique path-graph edges leading to every built cell, deduped so a shared trunk route only
 * appears once no matter how many buildings feed into it. */
export function buildPathGraph(builtCells: GridCell[]): PathGraph {
  const seen = new Set<string>();
  const edges: [GridCell, GridCell][] = [];
  const adjacency = new Map<string, GridCell[]>();
  const link = (a: GridCell, b: GridCell) => {
    const key = cellKey(a);
    const list = adjacency.get(key);
    if (list) list.push(b);
    else adjacency.set(key, [b]);
  };
  for (const cell of builtCells) {
    const chain = pathToHub(cell);
    for (let i = 0; i < chain.length - 1; i += 1) {
      const a = chain[i];
      const b = chain[i + 1];
      const key = [cellKey(a), cellKey(b)].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([a, b]);
      link(a, b);
      link(b, a);
    }
  }
  return { edges, adjacency };
}
