import type { ReactNode } from 'react';

/**
 * Shared drawing primitives for building art (CITY_VISUALS_BUILDINGS.md §2/§6). Every era's
 * buildings are assembled from these instead of repeating geometry per file, which is what
 * keeps the per-era chunk budget (CITY_VISUALS_TECH.md §3) realistic across ~40 buildings.
 *
 * All shapes are drawn in the building's own LOCAL space: origin at the footprint's
 * front-bottom corner, x rightward, **y pointing up**. The scene applies the isometric
 * placement transform on top of this — nothing here does coordinate maths for the grid.
 *
 * "Isometric-lite" (SPEC §11.5) is a front elevation with one small offset side plane, not a
 * true 3D projection, so `isoBox`/`isoRoof` just draw a front rectangle plus a skewed sliver
 * to its right — the same trick `icons.tsx` uses at 24×24, scaled up and split into planes.
 */

// -- Seeded wobble ------------------------------------------------------------

// mulberry32 — small, fast, deterministic. Good enough for a hand-carved jitter table; this
// is not cryptography, and a tiny inline PRNG keeps this module free of a dependency.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WOBBLE_TABLE_SIZE = 97; // prime, so short repeating access patterns don't alias
// Built once at module load, per CITY_VISUALS_TECH.md's "pure at import time" rule — this is
// the one piece of work that rule explicitly allows.
const WOBBLE_TABLE: number[] = (() => {
  const rand = mulberry32(0x5745_4445); // 'WEDE' — arbitrary, stable seed
  const table: number[] = [];
  for (let i = 0; i < WOBBLE_TABLE_SIZE; i += 1) table.push(rand() * 2 - 1); // range [-1, 1]
  return table;
})();

/** A deterministic pseudo-random offset in `[-amplitude, amplitude]` for jitter index `seed`. */
export function wobbleAt(seed: number, amplitude: number): number {
  const index = ((seed % WOBBLE_TABLE_SIZE) + WOBBLE_TABLE_SIZE) % WOBBLE_TABLE_SIZE;
  return WOBBLE_TABLE[index] * amplitude;
}

/**
 * A hand-carved straight-ish stroke from `(x1,y1)` to `(x2,y2)`: a single quadratic bezier
 * through a midpoint nudged perpendicular to the line. Cheap (one command), stable across
 * renders (the jitter comes from the table, not `Math.random()`), and reads as a woodcut line
 * rather than a ruled one. `seed` selects the jitter table entry — pass a different small
 * integer per stroke in a building so neighbouring lines don't wobble in lockstep.
 */
export function wobbleLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  amplitude = 0.6,
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const j = wobbleAt(seed, amplitude);
  const cx = mx + nx * j;
  const cy = my + ny * j;
  return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
}

/** Chains `wobbleLine` through a polyline, for longer detail strokes (eaves, jetty edges). */
export function wobblePolyline(points: Array<[number, number]>, seed: number, amplitude = 0.6): string {
  if (points.length < 2) return '';
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    const segment = wobbleLine(x1, y1, x2, y2, seed + i, amplitude);
    // Reuse wobbleLine's Q segment but drop its leading M so segments chain into one path.
    d += ` ${segment.slice(segment.indexOf('Q'))}`;
  }
  return d;
}

// -- Boxes and roofs ------------------------------------------------------------

export interface IsoBoxOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  /** How far the pseudo-3D side sliver reaches, in local units. */
  depth?: number;
  wall: string;
  wallSide: string;
}

/** The front + side planes of a wall (anatomy §2 items 2–3): a flat rect plus a skewed sliver. */
export function isoBox({ x, y, w, h, depth = 8, wall, wallSide }: IsoBoxOptions): ReactNode {
  const sideDx = depth * 0.6;
  const sideDy = depth * 0.35;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} fill={wall} />
      <polygon
        points={`${x + w},${y} ${x + w + sideDx},${y + sideDy} ${x + w + sideDx},${y + h + sideDy} ${x + w},${y + h}`}
        fill={wallSide}
      />
    </>
  );
}

export interface IsoRoofOptions {
  x: number;
  y: number;
  w: number;
  /** Ridge height above `y`. */
  rise: number;
  depth?: number;
  roof: string;
  roofSide: string;
}

/** A front-facing gable roof (front triangle) plus its side sliver — anatomy §2 item 4. */
export function isoRoof({ x, y, w, rise, depth = 8, roof, roofSide }: IsoRoofOptions): ReactNode {
  const cx = x + w / 2;
  const topY = y + rise;
  const sideDx = depth * 0.6;
  const sideDy = depth * 0.35;
  return (
    <>
      <polygon points={`${x},${y} ${cx},${topY} ${x + w},${y}`} fill={roof} />
      <polygon
        points={`${x + w},${y} ${cx},${topY} ${cx + sideDx},${topY + sideDy} ${x + w + sideDx},${y + sideDy}`}
        fill={roofSide}
      />
    </>
  );
}

/** A flat (pent) roof slab — for buildings that should not read as a gable, e.g. stalls, sheds. */
export function isoSlab({ x, y, w, h, depth = 6, wall, wallSide }: IsoBoxOptions): ReactNode {
  return isoBox({ x, y, w, h, depth, wall, wallSide });
}

// -- Ground and figures ------------------------------------------------------

/**
 * The footprint shadow (anatomy §2 item 1): a flat parallelogram at ground level, offset
 * 6 units right / 3 units down in screen space. Local space is y-up, so "down" is `-y`.
 */
export function shadow(w: number, depthUnits = 10, dx = 6, dy = -3): ReactNode {
  const skew = depthUnits * 0.5;
  return (
    <polygon
      points={`${dx},${dy} ${dx + w},${dy} ${dx + w + skew},${dy - depthUnits} ${dx + skew},${dy - depthUnits}`}
      fill="#000000"
      opacity={0.09}
    />
  );
}

// -- Windows and domes --------------------------------------------------------

export interface WindowGridOptions {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  size?: number;
  glass: string;
  /** Lit variant — pass the same value as `glass` for a building that never lights up. */
  glassLit?: string;
  /** Indices (row-major) that are lit. Omit for "none lit". */
  lit?: number[];
}

/**
 * A regular grid of small window rects across a front plane — the repeated detail behind
 * brick facades, glass towers and station fronts (CITY_VISUALS_BUILDINGS.md §2 item 5),
 * reused instead of hand-placing rects per building.
 */
export function windowGrid({ x, y, w, h, cols, rows, size = 4, glass, glassLit, lit = [] }: WindowGridOptions): ReactNode {
  const cellW = w / cols;
  const cellH = h / rows;
  const litSet = new Set(lit);
  const cells: ReactNode[] = [];
  let i = 0;
  let litSeen = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cx = x + cellW * (col + 0.5);
      const cy = y + cellH * (row + 0.5);
      const isLit = litSet.has(i) && glassLit !== undefined;
      cells.push(
        <rect
          key={`w-${row}-${col}`}
          x={cx - size / 2}
          y={cy - size / 2}
          width={size}
          height={size}
          fill={glass}
        />,
      );
      if (isLit) {
        // The lit pane is a second rect fading in over the dark one rather than a fill
        // change, because only `opacity` and `transform` may be animated (MOTION.md §2).
        // Staggering by lit-window index is what makes an era's windows switch on one by
        // one over ~2 s instead of all at once (MOTION.md §3, `window-lights`).
        cells.push(
          <rect
            key={`w-lit-${row}-${col}`}
            className="lit-window"
            style={{ animationDelay: `${litSeen * 140}ms` }}
            x={cx - size / 2}
            y={cy - size / 2}
            width={size}
            height={size}
            fill={glassLit}
          />,
        );
        litSeen += 1;
      }
      i += 1;
    }
  }
  return <>{cells}</>;
}

/** A flat-front dome/sphere — the Avicii Arena's globe, a lab's cupola, a beacon's lamp
 * housing. Drawn as a plain circle plus a darker lower crescent, since a true iso-projected
 * sphere would need real 3D maths this file never does. */
export function dome(cx: number, cy: number, r: number, fill: string, shade: string): ReactNode {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 0 ${cx + r} ${cy} A${r} ${r * 0.55} 0 0 1 ${cx - r} ${cy} Z`} fill={shade} opacity={0.35} />
    </g>
  );
}

export interface CapsuleOptions {
  /** Centre x of the capsule. */
  cx: number;
  /** Bottom y (ground contact) of the capsule. */
  y: number;
  w: number;
  h: number;
  fill: string;
  /** Jitter seed, so a row of identical capsules (props, figures) doesn't look stamped. */
  seed?: number;
}

/** A wobbled vertical capsule — the figure body shape from CITY_VISUALS_LIFE.md §2. */
export function capsule({ cx, y, w, h, fill, seed = 0 }: CapsuleOptions): ReactNode {
  const lean = wobbleAt(seed, 0.5);
  return <rect x={cx - w / 2 + lean} y={y} width={w} height={h} rx={w / 2} fill={fill} />;
}
