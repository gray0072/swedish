/**
 * The woodcut wobble (CITY_VISUALS_SCENE.md §4): every long straight edge in the scene — the
 * shoreline, quay edges, path borders — gets a small stable jitter so it reads as hand-carved
 * rather than machine-straight. The jitter comes from a seeded PRNG, generated once at module
 * load, so the same edge wobbles the same way on every render (no layout thrash) and the same
 * way for every visitor (no visual flicker between server/client or across reloads).
 */

/** A small deterministic PRNG (mulberry32) — good enough for cosmetic jitter, not security. */
export function makeSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Wobbles a straight segment list into an SVG path `d` string: every ~18 world units along
 * each segment gets a point nudged by up to ±0.6 units perpendicular to the segment, using the
 * given PRNG so repeated calls with the same seed produce the same path.
 */
export function wobblePath(points: Point[], rng: () => number, amplitude = 0.6, step = 18): string {
  if (points.length < 2) return '';
  const out: Point[] = [points[0]];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.round(length / step));
    const nx = -dy / (length || 1);
    const ny = dx / (length || 1);
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      const jitter = (rng() * 2 - 1) * amplitude;
      out.push({
        x: a.x + dx * t + nx * jitter,
        y: a.y + dy * t + ny * jitter,
      });
    }
  }
  return pointsToPath(out);
}

export function pointsToPath(points: Point[], close = false): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const d = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`, ...rest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)];
  if (close) d.push('Z');
  return d.join(' ');
}

/**
 * A closed Catmull-Rom spline through `points`, emitted as cubic béziers. Used for the island
 * silhouette: the walkable set's convex hull is a hard-edged decagon, and a coastline is not —
 * running the hull through here turns it into a rounded, organic outline while keeping the
 * shape (and therefore the shore-to-cell relationship) exactly where it was.
 */
export function closedSplinePath(points: Point[]): string {
  if (points.length < 3) return pointsToPath(points, true);
  const at = (i: number) => points[((i % points.length) + points.length) % points.length];
  const d = [`M ${at(0).x.toFixed(2)} ${at(0).y.toFixed(2)}`];
  for (let i = 0; i < points.length; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    // Standard Catmull-Rom -> Bézier control points (tension 1/6).
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d.push(
      `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    );
  }
  return `${d.join(' ')} Z`;
}
