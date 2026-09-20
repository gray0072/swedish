import { WATER_LINE } from '../iso';
import { ISLAND_DEPTH, ISLAND_POLYGON_PATH, insetPolygonPath } from '../island';
import { makeSeededRandom } from '../wobble';

/**
 * Layer 3 (`water`) — Mälaren. One body of water filling everything from the horizon
 * (`WATER_LINE`) down to the bottom edge, so the island drawn on top of it sits *in* the lake
 * instead of hovering above a strip of it: a flat base, a distance haze at the far edge, a
 * depth gradient toward the viewer, three scrolling wave bands, the shallows and foam ring
 * around the shore, and the sparkle diamonds (CITY_VISUALS_SCENE.md §5).
 *
 * The wave paths are drawn two full screens wide so the `translateX` loop in city-scene.css —
 * exactly one wave period — has no visible seam.
 */

const WORLD_W = 1200;
const WORLD_H = 900;

/** One wave period; the scroll keyframe shifts by exactly this, so the loop can't jump. */
export const WAVE_PERIOD = 600;
const WAVE_START_X = -WAVE_PERIOD;
const WAVE_WIDTH = WORLD_W + WAVE_PERIOD * 2;

// Rows read as distance: fine, faint and close together near the horizon, taller and stronger
// in the foreground. The middle rows land behind the island and are simply occluded by it,
// which is what makes the shore read as being surrounded rather than pasted on.
const WAVE_ROWS = [
  { y: WATER_LINE + 54, amplitude: 3, width: 2.5, opacity: 0.22 },
  { y: WATER_LINE + 150, amplitude: 4, width: 3, opacity: 0.2 },
  { y: WORLD_H - 90, amplitude: 7, width: 4, opacity: 0.28 },
];

function waveBandPath(y: number, amplitude: number): string {
  // Two periods wider than the frame on each side, a gentle repeating sine so the scroll loops.
  const wavelength = WAVE_PERIOD / 2;
  const segments = Math.ceil(WAVE_WIDTH / wavelength);
  let d = `M ${WAVE_START_X} ${y}`;
  for (let i = 0; i < segments; i += 1) {
    const x0 = WAVE_START_X + i * wavelength;
    const cx1 = x0 + wavelength / 4;
    const cx2 = x0 + wavelength / 2;
    const x1 = x0 + wavelength;
    const dir = i % 2 === 0 ? -amplitude : amplitude;
    d += ` Q ${cx1} ${y + dir} ${cx2} ${y} T ${x1} ${y}`;
  }
  return d;
}

// Fixed water sparkle positions, generated once from a seeded PRNG so they never shift
// between renders (CITY_VISUALS_SCENE.md §5) — 16 sits comfortably inside the 12-20 budget.
const SPARKLE_COUNT = 16;
const sparkleRng = makeSeededRandom(0x5ea1);
const SPARKLES: { x: number; y: number; delay: number; duration: number }[] = Array.from(
  { length: SPARKLE_COUNT },
  () => ({
    x: 40 + sparkleRng() * (WORLD_W - 80),
    // Biased toward the viewer (squared t): the far water is mostly hidden behind the island,
    // and the foreground is the big empty stretch that needs the life.
    y: WATER_LINE + 20 + sparkleRng() ** 2 * (WORLD_H - WATER_LINE - 60),
    delay: sparkleRng() * 5,
    duration: 3 + sparkleRng() * 2,
  }),
);

/**
 * `active` is the ambient-motion tier (CITY_VISUALS_MOTION.md §4): when it is off, every wave
 * band, the foam dash and the sparkle diamonds render their composed rest frame — flat water,
 * a still shoreline, sparkle held at its mid-fade opacity — rather than a paused animation.
 */
export default function Water({ active }: { active: boolean }) {
  return (
    <g aria-hidden="true">
      <defs>
        {/* Atmospheric perspective: the far water washes out toward the sky's horizon stop… */}
        <linearGradient id="water-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-1)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--sky-1)" stopOpacity="0" />
        </linearGradient>
        {/* …and deepens toward the viewer, which is what gives the flat fill a sense of body. */}
        <linearGradient id="water-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--water-deep)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--water-deep)" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <rect x="0" y={WATER_LINE} width={WORLD_W} height={WORLD_H - WATER_LINE} fill="var(--water-base)" />
      <rect x="0" y={WATER_LINE} width={WORLD_W} height={WORLD_H - WATER_LINE} fill="url(#water-depth)" />
      <rect x="0" y={WATER_LINE} width={WORLD_W} height="110" fill="url(#water-haze)" />

      {WAVE_ROWS.map((row, i) => (
        <g key={row.y} className={active ? `wave-band wave-band--${i + 1}` : undefined}>
          <path
            d={waveBandPath(row.y, row.amplitude)}
            fill="none"
            stroke="var(--water-wave)"
            strokeOpacity={row.opacity}
            strokeWidth={row.width}
          />
        </g>
      ))}

      {/* Shallows: two outset copies of the silhouette at half the island's depth, so the pale
          band of shallow water shows all the way round — above the far shore as well as below
          the near one — instead of only spilling out at the bottom. */}
      <g transform={`translate(0, ${ISLAND_DEPTH / 2})`}>
        <path d={insetPolygonPath(-26, 3)} fill="var(--water-foam)" fillOpacity="0.09" />
        <path d={insetPolygonPath(-11, 4)} fill="var(--water-foam)" fillOpacity="0.13" />
      </g>

      {/* Foam hugs the *lower* silhouette — the outline of the rock slab where it actually
          meets the water, not of the grass on top of it. Terrain draws that slab straight
          after and covers the inner half, leaving a ring of surf around the shore. */}
      <g transform={`translate(0, ${ISLAND_DEPTH})`}>
        <path
          d={ISLAND_POLYGON_PATH}
          className={active ? 'shoreline-foam' : undefined}
          fill="none"
          stroke="var(--water-foam)"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
      </g>

      {SPARKLES.map((s, i) => (
        <rect
          key={i}
          className={active ? 'water-sparkle' : undefined}
          x={s.x - 2}
          y={s.y - 2}
          width="4"
          height="4"
          transform={`rotate(45 ${s.x} ${s.y})`}
          fill="var(--water-foam)"
          opacity={active ? undefined : 0.3}
          style={active ? { animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` } : undefined}
        />
      ))}
    </g>
  );
}
