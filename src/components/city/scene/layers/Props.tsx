import { makeSeededRandom } from '../wobble';

/**
 * Layer 10 (`props`) — foreground rocks and reeds (CITY_VISUALS_SCENE.md §3). Fixed, hand-picked
 * positions near the bottom edge so the water reads as continuing past the frame; reeds get the
 * `reed-sway` ambient loop, rocks are perfectly static set-dressing.
 */

const propRng = makeSeededRandom(0x9057);

const ROCKS = Array.from({ length: 6 }, () => ({
  x: 60 + propRng() * 1080,
  y: 790 + propRng() * 80,
  r: 10 + propRng() * 10,
}));

const REEDS = Array.from({ length: 6 }, (_, i) => ({
  x: 120 + i * 190 + propRng() * 60,
  y: 850 + propRng() * 20,
}));

export default function Props({ active }: { active: boolean }) {
  return (
    <g aria-hidden="true">
      {ROCKS.map((rock, i) => (
        <g key={i}>
          {/* A ring of disturbed water, so a foreground rock sits in the lake like the island
              does rather than floating on top of the fill. */}
          <ellipse cx={rock.x} cy={rock.y + 3} rx={rock.r * 1.5} ry={rock.r * 0.6} fill="var(--water-foam)" fillOpacity="0.14" />
          <ellipse cx={rock.x} cy={rock.y} rx={rock.r} ry={rock.r * 0.55} fill="var(--ground-cliff)" fillOpacity="0.7" />
        </g>
      ))}
      {REEDS.map((reed, i) => (
        // `reed-sway` measures its origin from the clump's own box (transform-box: fill-box), so
        // the pivot is its foot in percent — a world-pixel origin there sat ~1000 px away and
        // swung the whole clump across the water instead of bending it.
        <g key={i} className={active ? 'reed-sway' : undefined} style={{ transformOrigin: '25% 100%' }}>
          <path
            d={`M ${reed.x} ${reed.y} L ${reed.x - 2} ${reed.y - 18} M ${reed.x + 3} ${reed.y} L ${reed.x + 1} ${reed.y - 22} M ${reed.x + 6} ${reed.y} L ${reed.x + 5} ${reed.y - 15}`}
            stroke="var(--ground-cliff)"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}
