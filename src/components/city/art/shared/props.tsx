import type { ReactNode } from 'react';
import { wobbleLine, wobblePolyline } from './primitives';

/**
 * "In use" props (CITY_VISUALS_BUILDINGS.md §2 item 6) — the small clutter that separates a
 * model of a building from a place someone works. Every prop takes an explicit `fill` (and,
 * where it has a second tone, `accent`) chosen by the calling building from its era's
 * `MaterialTokens`, so this file never introduces a colour of its own — the "at most one
 * colour outside the tokens" budget in CITY_VISUALS_BUILDINGS.md §3 belongs entirely to the
 * building file, not to the shared prop.
 *
 * Every prop is anchored at `(x, y)` = its own ground contact point, in the caller's local
 * space, and returns a small `<g>` cheap enough to repeat several times per building.
 */

/** A hash of the position into a small integer, so wobble jitter is stable but not identical
 * across repeated props (no mutable module-level counter — see CITY_VISUALS_TECH.md §4's
 * "pure module" rule). */
function seedFor(x: number, y: number): number {
  return Math.round(x * 13 + y * 7);
}

export function barrel(x: number, y: number, fill: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g>
      <rect x={x - 4} y={y} width={8} height={10} rx={3} fill={fill} />
      <path d={wobbleLine(x - 4, y + 5, x + 4, y + 5, seed, 0.3)} stroke="#00000040" strokeWidth={1} fill="none" />
    </g>
  );
}

/** A fishing/cargo net, draped between two low posts. */
export function net(x: number, y: number, w: number, stroke: string): ReactNode {
  const seed = seedFor(x, y);
  const sag = 3;
  const points: Array<[number, number]> = [[x, y + 6], [x + w / 2, y + 6 - sag], [x + w, y + 6]];
  return (
    <path
      d={wobblePolyline(points, seed, 0.4)}
      stroke={stroke}
      strokeWidth={1.2}
      strokeLinecap="round"
      fill="none"
      strokeDasharray="2 2"
    />
  );
}

/** A two-wheeled handcart, used as the "goods are moving" prop outside markets and harbours. */
export function cart(x: number, y: number, wood: string, trim: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g>
      <rect x={x - 7} y={y + 3} width={14} height={6} fill={wood} />
      <circle cx={x - 5} cy={y + 3} r={3} fill="none" stroke={trim} strokeWidth={1.4} />
      <circle cx={x + 5} cy={y + 3} r={3} fill="none" stroke={trim} strokeWidth={1.4} />
      <path d={wobbleLine(x + 7, y + 6, x + 12, y + 9, seed, 0.3)} stroke={wood} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** A rack of drying fish or hides — three crossed poles with short hanging strokes. */
export function dryingRack(x: number, y: number, wood: string, stroke: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g>
      <path d={wobbleLine(x - 6, y, x + 6, y + 10, seed, 0.3)} stroke={wood} strokeWidth={1.4} strokeLinecap="round" />
      <path d={wobbleLine(x + 6, y, x - 6, y + 10, seed + 1, 0.3)} stroke={wood} strokeWidth={1.4} strokeLinecap="round" />
      <path d={wobbleLine(x - 5, y + 6, x + 5, y + 6, seed + 2, 0.3)} stroke={stroke} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

/** A scrub birch/pine — the tribe-era planted prop. Height sets how much it reads as a sapling. */
export function tree(x: number, y: number, h: number, trunk: string, canopy: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g>
      <path d={wobbleLine(x, y, x, y + h * 0.55, seed, 0.5)} stroke={trunk} strokeWidth={1.6} strokeLinecap="round" />
      <polygon
        points={`${x},${y + h} ${x - h * 0.32},${y + h * 0.45} ${x + h * 0.32},${y + h * 0.45}`}
        fill={canopy}
      />
    </g>
  );
}

/** A clump of reeds at a waterline plot — three wobbled blades. */
export function reeds(x: number, y: number, h: number, stroke: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g fill="none" stroke={stroke} strokeWidth={1.2} strokeLinecap="round">
      <path d={wobbleLine(x - 3, y, x - 4, y + h, seed, 0.4)} />
      <path d={wobbleLine(x, y, x + 1, y + h * 1.1, seed + 1, 0.4)} />
      <path d={wobbleLine(x + 3, y, x + 2, y + h * 0.9, seed + 2, 0.4)} />
    </g>
  );
}

/** A stacked pile of split firewood — reads at a glance, cheap to draw. */
export function firewood(x: number, y: number, w: number, wood: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g stroke="#00000030" strokeWidth={0.8}>
      <rect x={x - w / 2} y={y} width={w} height={5} fill={wood} />
      <rect x={x - w / 2 + 2} y={y + 5} width={w - 4} height={5} fill={wood} />
      <path d={wobbleLine(x - w / 2, y + 2, x + w / 2, y + 2, seed, 0.2)} />
    </g>
  );
}

/** A planted roof box — small mounded greenery in a low trough. The green/connected eras'
 * "planted roofs stop being empty" motif (CITY_VISUALS_SCENE.md §6), reused wherever a
 * building needs to read as green-roofed rather than repeating the shape per file. */
export function planter(x: number, y: number, w: number, trough: string, plant: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={3} fill={trough} />
      <path
        d={`M${x - w / 2 + 1} ${y + 3} Q${x} ${y + 3 + w * 0.4} ${x + w / 2 - 1} ${y + 3} Z`}
        fill={plant}
      />
      <path d={wobbleLine(x - w / 4, y + 3, x - w / 4, y + 6, seed, 0.3)} stroke={plant} strokeWidth={1} strokeLinecap="round" />
    </g>
  );
}

/** A woven basket or crate, the generic "stored goods" prop for markets and huts. */
export function basket(x: number, y: number, fill: string): ReactNode {
  const seed = seedFor(x, y);
  return (
    <g>
      <path
        d={`M${x - 4} ${y + 7} L${x - 3} ${y} L${x + 3} ${y} L${x + 4} ${y + 7} Z`}
        fill={fill}
      />
      <path d={wobbleLine(x - 3.5, y + 3, x + 3.5, y + 3, seed, 0.3)} stroke="#00000030" strokeWidth={0.8} fill="none" />
    </g>
  );
}
