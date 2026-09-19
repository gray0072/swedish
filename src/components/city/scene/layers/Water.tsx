import { ISLAND_POLYGON_PATH } from '../island';
import { makeSeededRandom } from '../wobble';

/**
 * Layer 3 (`water`) — Mälaren. A flat base, a low-contrast depth gradient near the horizon,
 * three scrolling wave bands, the shoreline foam dash and the water sparkle diamonds
 * (CITY_VISUALS_SCENE.md §5). The wave paths are drawn at 1.5x the viewBox width so the
 * `translateX` loop in city-scene.css has no visible seam.
 */

const WAVE_Y = [630, 680, 730];

function waveBandPath(y: number, amplitude: number): string {
  // One and a half screens wide, a gentle repeating sine so the scroll loop is seamless.
  const width = 1800;
  const wavelength = 300;
  const segments = Math.ceil(width / wavelength);
  let d = `M -600 ${y}`;
  for (let i = 0; i < segments; i += 1) {
    const x0 = -600 + i * wavelength;
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
    x: 60 + sparkleRng() * 1080,
    y: 600 + sparkleRng() * 260,
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
        <linearGradient id="water-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--water-deep)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--water-deep)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="600" width="1200" height="300" fill="var(--water-base)" />
      <rect x="0" y="600" width="1200" height="120" fill="url(#water-depth)" />

      {WAVE_Y.map((y, i) => (
        <g key={y} className={active ? `wave-band wave-band--${i + 1}` : undefined}>
          <path
            d={waveBandPath(y, 6 - i)}
            fill="none"
            stroke="var(--water-wave)"
            strokeOpacity={0.35 - i * 0.08}
            strokeWidth={4}
          />
        </g>
      ))}

      <path
        d={ISLAND_POLYGON_PATH}
        className={active ? 'shoreline-foam' : undefined}
        fill="none"
        stroke="var(--water-foam)"
        strokeOpacity="0.55"
        strokeWidth="2"
      />

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
