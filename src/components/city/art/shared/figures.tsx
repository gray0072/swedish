import type { ReactNode } from 'react';
import type { BoatOptions, FigureOptions, WalkPhase } from '../../scene/types';
import { capsule, wobbleLine } from './primitives';

/**
 * Citizen, worker and boat shapes for the ambient life layer (CITY_VISUALS_LIFE.md §2, §5,
 * §6), tribe and viking eras only — the other eras' figures are a later phase's work.
 *
 * These are plain presentational shapes: given a position and a costume, they return a
 * `<g>`. They own no movement, no `requestAnimationFrame` loop and no placement decision —
 * `phase` (which of the two walk frames to draw) and `(x, y)` are supplied by whatever later
 * drives the agents (CITY_VISUALS_TECH.md's `useSceneClock`). This file only knows how to
 * draw one frame of one figure.
 */

// Shapes are authored here; their option types live in `scene/types.ts`, because the scene
// has to construct them to drive the figures and the two halves never import each other.
export type { WalkPhase, FigureColours, FigureOptions, BoatOptions } from '../../scene/types';

const FIGURE_HEIGHT = 16; // world units — CITY_VISUALS_LIFE.md §1.3's 14-18 range, mid-point
const BODY_HEIGHT = 11;
const HEAD_R = 5;

/** The 1.5-unit step bob (§2) — phase 1 lands slightly lower, as a foot strikes the ground. */
function bob(phase: WalkPhase): number {
  return phase === 1 ? -1.5 : 0;
}

/** Base humanoid: wobbled capsule body + circle head, no face, no hands (§1.4). */
function base(x: number, y: number, phase: WalkPhase, body: string, head: string): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {capsule({ cx: x, y: y + dy, w: 7, h: BODY_HEIGHT, fill: body, seed: Math.round(x) })}
      <circle cx={x} cy={y + dy + BODY_HEIGHT + HEAD_R} r={HEAD_R} fill={head} />
    </g>
  );
}

/** Tribe citizen: cloak and staff (CITY_VISUALS_LIFE.md §2's costume list). */
export function citizenTribe({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path
        d={wobbleLine(x + 4, y + dy, x + 4, y + dy + FIGURE_HEIGHT, Math.round(x) + 1, 0.4)}
        stroke={accent}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Tribe worker: same silhouette, tool held low instead of a walking staff. */
export function workerTribe(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path
        d={wobbleLine(x - 4, y + dy + 4, x + 4, y + dy + 1, Math.round(x) + 2, 0.4)}
        stroke={accent}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Viking citizen: tunic and axe. No horned helmet — SPEC §11.4's hard rule. */
export function citizenViking({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      {/* Axe: a short haft with a small wedge head, carried point-down — a tool, not a threat pose. */}
      <path
        d={wobbleLine(x + 4, y + dy + 2, x + 4, y + dy + 12, Math.round(x) + 3, 0.4)}
        stroke={accent}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
      <polygon points={`${x + 4},${y + dy + 12} ${x + 7},${y + dy + 11} ${x + 4},${y + dy + 9}`} fill={accent} />
    </g>
  );
}

/** Viking worker: same tunic, hammer instead of an axe for the smithy's 2-frame swing. */
export function workerViking(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path
        d={wobbleLine(x - 4, y + dy + 5, x + 5, y + dy + 1, Math.round(x) + 4, 0.4)}
        stroke={accent}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Medieval citizen: a hooded robe (CITY_VISUALS_LIFE.md §2's costume list). */
export function citizenMedieval({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      {/* Hood: a small triangular peak over the head, the one silhouette addition. */}
      <path d={wobbleLine(x - 4, y + dy + FIGURE_HEIGHT - 2, x, y + dy + FIGURE_HEIGHT + 6, Math.round(x) + 5, 0.3)} stroke={accent} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={wobbleLine(x + 4, y + dy + FIGURE_HEIGHT - 2, x, y + dy + FIGURE_HEIGHT + 6, Math.round(x) + 6, 0.3)} stroke={accent} strokeWidth={1.4} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** Medieval worker: same robe, a hoe held low. */
export function workerMedieval(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path d={wobbleLine(x - 5, y + dy + 6, x + 4, y + dy + 1, Math.round(x) + 7, 0.4)} stroke={accent} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** Empire citizen: coat and tricorne hat (CITY_VISUALS_LIFE.md §2's costume list). */
export function citizenEmpire({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      {/* Tricorne: a short wide brim drawn as a flattened triangle above the head. */}
      <polygon points={`${x - 6},${y + dy + FIGURE_HEIGHT + 2} ${x + 6},${y + dy + FIGURE_HEIGHT + 2} ${x},${y + dy + FIGURE_HEIGHT - 2}`} fill={accent} />
    </g>
  );
}

/** Empire worker: same coat, a coil of rope/tool held low. */
export function workerEmpire(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path d={wobbleLine(x - 5, y + dy + 3, x + 5, y + dy + 5, Math.round(x) + 8, 0.4)} stroke={accent} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** A tall ship silhouette — empire's harbour-class vessel (CITY_VISUALS_LIFE.md §6): a deep
 * hull, two masts and square-rigged sails, taller and squarer than the viking longship. */
export function boatEmpire({ x, y, w, hull, sail }: BoatOptions): ReactNode {
  const seed = Math.round(x);
  const hullPath = `M${x - w / 2} ${y} L${x - w / 2 + 3} ${y - 5} L${x + w / 2 - 3} ${y - 5} L${x + w / 2} ${y} L${x + w / 2 - 5} ${y + 5} L${x - w / 2 + 5} ${y + 5} Z`;
  return (
    <g>
      <path d={hullPath} fill={hull} />
      <path d={wobbleLine(x - w * 0.2, y - 5, x - w * 0.2, y - 5 - w * 0.55, seed, 0.4)} stroke={hull} strokeWidth={1.6} strokeLinecap="round" />
      <path d={wobbleLine(x + w * 0.18, y - 5, x + w * 0.18, y - 5 - w * 0.45, seed + 1, 0.4)} stroke={hull} strokeWidth={1.4} strokeLinecap="round" />
      {sail && (
        <>
          <rect x={x - w * 0.32} y={y - 5 - w * 0.5} width={w * 0.24} height={w * 0.28} fill={sail} />
          <rect x={x + w * 0.08} y={y - 5 - w * 0.42} width={w * 0.2} height={w * 0.24} fill={sail} />
        </>
      )}
    </g>
  );
}

/** Industrial citizen: a flat cap (CITY_VISUALS_LIFE.md §2's costume list). */
export function citizenIndustrial({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path d={wobbleLine(x - 5, y + dy + FIGURE_HEIGHT + 2, x + 5, y + dy + FIGURE_HEIGHT + 2, Math.round(x) + 9, 0.2)} stroke={accent} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** Industrial worker: same cap, a wrench/tool swung low. */
export function workerIndustrial(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path d={wobbleLine(x - 5, y + dy + 2, x + 5, y + dy + 6, Math.round(x) + 10, 0.4)} stroke={accent} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** Modern citizen: a puffer jacket, sometimes with a small dog (CITY_VISUALS_LIFE.md §2's
 * costume list) — the dog appears on odd `x` positions so not every citizen has one. */
export function citizenModern({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  const hasDog = Math.round(x) % 2 === 1;
  return (
    <g>
      {capsule({ cx: x, y: y + dy, w: 8.5, h: BODY_HEIGHT, fill: body, seed: Math.round(x) })}
      <circle cx={x} cy={y + dy + BODY_HEIGHT + HEAD_R} r={HEAD_R} fill={head} />
      {hasDog && (
        <g>
          <rect x={x + 5} y={y + dy - 1} width={5} height={3} rx={1.5} fill={accent} />
          <circle cx={x + 10} cy={y + dy + 0.5} r={1.4} fill={head} />
        </g>
      )}
    </g>
  );
}

/** Modern worker: same jacket, a small handheld device instead of a dog. */
export function workerModern(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <rect x={x + 4} y={y + dy + 5} width={4} height={4} fill={accent} />
    </g>
  );
}

/** Green citizen: a cargo bike (CITY_VISUALS_LIFE.md §2's costume list) — drawn low and wide
 * instead of the standing capsule silhouette, since a bike changes the whole figure shape. */
export function citizenGreen({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      <rect x={x - 7} y={y + dy + 2} width={14} height={5} rx={2} fill={accent} />
      <circle cx={x - 5} cy={y + dy} r={3} fill="none" stroke={body} strokeWidth={1.4} />
      <circle cx={x + 6} cy={y + dy} r={3} fill="none" stroke={body} strokeWidth={1.4} />
      {capsule({ cx: x, y: y + dy + 6, w: 6, h: 8, fill: body, seed: Math.round(x) })}
      <circle cx={x} cy={y + dy + 14 + HEAD_R} r={HEAD_R} fill={head} />
    </g>
  );
}

/** Green worker: on foot, a small planting tool in hand. */
export function workerGreen(options: FigureOptions): ReactNode {
  const { x, y, phase, body, head, accent } = options;
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <path d={wobbleLine(x - 4, y + dy + 2, x + 4, y + dy + 6, Math.round(x) + 11, 0.4)} stroke={accent} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </g>
  );
}

/** An electric ferry — green's harbour-class vessel (CITY_VISUALS_LIFE.md §6): a flat, wide
 * catamaran-like hull with a low glass cabin, no sail. */
export function boatElectric({ x, y, w, hull }: BoatOptions): ReactNode {
  return (
    <g>
      <path d={`M${x - w / 2} ${y} L${x - w / 2 + 4} ${y + 5} L${x + w / 2 - 4} ${y + 5} L${x + w / 2} ${y} Z`} fill={hull} />
      <rect x={x - w * 0.28} y={y - 6} width={w * 0.56} height={6} rx={1.5} fill={hull} opacity={0.85} />
    </g>
  );
}

/** Connected citizen: a visor (CITY_VISUALS_LIFE.md §2's costume list) — a thin translucent
 * band across the head rather than a hat, this era's one silhouette addition. */
export function citizenConnected({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {base(x, y, phase, body, head)}
      <rect x={x - HEAD_R} y={y + dy + BODY_HEIGHT + HEAD_R - 1.5} width={HEAD_R * 2} height={2} fill={accent} opacity={0.85} />
    </g>
  );
}

/** Connected worker: from this era on the "worker" role is a small drone, per
 * CITY_VISUALS_LIFE.md §5 — the same 6 s appear-then-leave slot, drawn as a hovering body
 * with two rotor blurs instead of a person. */
export function workerConnected({ x, y, phase, accent }: FigureOptions): ReactNode {
  const dy = phase === 1 ? -1.5 : 0;
  return (
    <g>
      <ellipse cx={x} cy={y + dy + 10} rx={5} ry={2.6} fill={accent} />
      <path d={wobbleLine(x - 9, y + dy + 10, x - 3, y + dy + 10, Math.round(x) + 12, 0.2)} stroke={accent} strokeWidth={1} opacity={0.6} />
      <path d={wobbleLine(x + 3, y + dy + 10, x + 9, y + dy + 10, Math.round(x) + 13, 0.2)} stroke={accent} strokeWidth={1} opacity={0.6} />
    </g>
  );
}

/** Floating citizen: a drysuit (CITY_VISUALS_LIFE.md §2's costume list) — a sleeker, closer
 * capsule silhouette with a bright accent collar. */
export function citizenFloating({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {capsule({ cx: x, y: y + dy, w: 6, h: BODY_HEIGHT, fill: body, seed: Math.round(x) })}
      <rect x={x - 3.5} y={y + dy + BODY_HEIGHT - 2} width={7} height={2} fill={accent} />
      <circle cx={x} cy={y + dy + BODY_HEIGHT + HEAD_R} r={HEAD_R} fill={head} />
    </g>
  );
}

/** Floating worker: same drysuit, from the connected era on this is a drone — floating keeps
 * the drone worker too, since it is downstream of connected (CITY_VISUALS_LIFE.md §5). */
export const workerFloating = workerConnected;

/** A submersible — floating's harbour-class vessel (CITY_VISUALS_LIFE.md §6): a low rounded
 * hull riding almost flush with the water, a small conning fin instead of a mast. */
export function boatSubmersible({ x, y, w, hull }: BoatOptions): ReactNode {
  return (
    <g>
      <path d={`M${x - w / 2} ${y} Q${x} ${y - 4} ${x + w / 2} ${y} Q${x} ${y + 4} ${x - w / 2} ${y} Z`} fill={hull} />
      <rect x={x - w * 0.08} y={y - 7} width={w * 0.16} height={5} rx={1} fill={hull} />
    </g>
  );
}

/** Stellar citizen: a soft-suit (CITY_VISUALS_LIFE.md §2's costume list) — a rounder, padded
 * capsule with a glowing chest accent rather than sharp costume details. */
export function citizenStellar({ x, y, phase, body, head, accent }: FigureOptions): ReactNode {
  const dy = bob(phase);
  return (
    <g>
      {capsule({ cx: x, y: y + dy, w: 8, h: BODY_HEIGHT, fill: body, seed: Math.round(x) })}
      <circle cx={x} cy={y + dy + BODY_HEIGHT * 0.5} r={1.6} fill={accent} />
      <circle cx={x} cy={y + dy + BODY_HEIGHT + HEAD_R} r={HEAD_R} fill={head} />
    </g>
  );
}

/** Stellar worker: a drone, same as every era from connected on (CITY_VISUALS_LIFE.md §5). */
export const workerStellar = workerConnected;

/** A shuttle — stellar's harbour-class vessel (CITY_VISUALS_LIFE.md §6): a small delta-winged
 * hull skimming the water, playing the same "vessel at the harbour" role every earlier era's
 * boat has played, just in this era's shape. */
export function boatShuttle({ x, y, w, hull }: BoatOptions): ReactNode {
  return (
    <g>
      <polygon points={`${x - w / 2},${y} ${x + w / 2},${y} ${x},${y - 8}`} fill={hull} />
      <polygon points={`${x - w * 0.15},${y} ${x + w * 0.15},${y} ${x},${y + 4}`} fill={hull} opacity={0.85} />
    </g>
  );
}

// BoatOptions comes from the shared contract (re-exported above).

/**
 * A longship silhouette: shallow curved hull, single mast, square sail. This is the viking
 * era's vessel per CITY_VISUALS_LIFE.md §6 — the tribe era has no harbour-class building, so
 * it sails no boat and this file exports none for it.
 */
export function boatViking({ x, y, w, hull, sail }: BoatOptions): ReactNode {
  const seed = Math.round(x);
  const hullPath = `M${x - w / 2} ${y} Q${x} ${y - 6} ${x + w / 2} ${y} L${x + w / 2 - 4} ${y + 4} L${x - w / 2 + 4} ${y + 4} Z`;
  return (
    <g>
      <path d={hullPath} fill={hull} />
      <path d={wobbleLine(x, y - 6, x, y - 6 - w * 0.6, seed, 0.5)} stroke={hull} strokeWidth={1.6} strokeLinecap="round" />
      {sail && <rect x={x - w * 0.16} y={y - 6 - w * 0.55} width={w * 0.32} height={w * 0.32} fill={sail} />}
    </g>
  );
}
