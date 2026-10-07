import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow } from '../shared/primitives';

/**
 * The spaceport — one more harbour, the fourth this city has had, counting from Birka (SPEC
 * §12.8). A launch pad with a gantry tower, deliberately playing the same "harbour" role as
 * every era before it (Birka's trading square, the shipyard, the electric ferry, the sea
 * gate) rather than reaching for spectacle — a plausible extrapolation, not science fiction.
 * `maxLevel` is 2. This is stellar's harbour-class building.
 */

const W = 90; // 2x1 footprint

/** A rocket standing on the pad: body, nose cone, fins and a porthole. */
function rocket(cx: number, h: number, m: MaterialTokens) {
  const w = h * 0.22;
  return (
    <g>
      <polygon points={`${cx - w / 2},4 ${cx - w / 2 - 5},2 ${cx - w / 2},${h * 0.3}`} fill={m.trim} />
      <polygon points={`${cx + w / 2},4 ${cx + w / 2 + 5},2 ${cx + w / 2},${h * 0.3}`} fill={m.trim} />
      <rect x={cx - w / 2} y={4} width={w} height={h * 0.72} rx={2} fill={m.glass} />
      <rect x={cx + w * 0.1} y={4} width={w * 0.4} height={h * 0.72} rx={2} fill={m.wallSide} opacity={0.35} />
      <polygon points={`${cx - w / 2},${4 + h * 0.72} ${cx},${h + 4} ${cx + w / 2},${4 + h * 0.72}`} fill={m.trim} />
      <circle cx={cx} cy={4 + h * 0.5} r={w * 0.22} fill={m.glassLit} />
      <rect x={cx - w / 2} y={4 + h * 0.22} width={w} height={1.4} fill={m.trim} />
    </g>
  );
}

/** A lattice gantry tower, its umbilical arm reaching across to the craft. */
function gantry(x: number, h: number, armTo: number, m: MaterialTokens) {
  return (
    <g stroke={m.wall} strokeWidth={1.4} fill="none">
      <path d={`M${x} 0 V${h} M${x + 10} 0 V${h}`} strokeWidth={2.4} />
      {Array.from({ length: Math.floor(h / 10) }, (_, i) => (
        <path key={i} d={`M${x} ${i * 10} L${x + 10} ${i * 10 + 10} M${x + 10} ${i * 10} L${x} ${i * 10 + 10}`} />
      ))}
      <path d={`M${x} ${h * 0.7} L${armTo} ${h * 0.7}`} strokeWidth={2.4} />
      <circle cx={x + 5} cy={h + 2} r={2} fill={m.trim} stroke="none" />
    </g>
  );
}

function pad(cx: number, rx: number, m: MaterialTokens) {
  return (
    <>
      <ellipse cx={cx} cy={2} rx={rx} ry={rx * 0.32} fill={m.wallSide} />
      <ellipse cx={cx} cy={2} rx={rx * 0.6} ry={rx * 0.2} fill="none" stroke={m.trim} strokeWidth={1} strokeDasharray="3 3" />
    </>
  );
}

function built(m: MaterialTokens) {
  return (
    <>
      {shadow(W, 16)}
      {pad(W * 0.4, 22, m)}
      {gantry(W * 0.62, 44, W * 0.46, m)}
      {rocket(W * 0.4, 40, m)}
    </>
  );
}

function landmark(m: MaterialTokens) {
  const landerX = W * 0.04;
  return (
    <>
      {shadow(W + 10, 16)}
      {/* Landmark: a heavier rocket, a second pad with a lander back from orbit, and a lit
          control tower — a working port. */}
      {isoBox({ x: W * 0.86, y: 0, w: 14, h: 30, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      <rect x={W * 0.86 - 3} y={30} width={20} height={9} fill={m.glass} />
      <rect x={W * 0.86 - 1} y={32} width={16} height={4} fill={m.glassLit} />
      {pad(W * 0.36, 24, m)}
      {pad(landerX, 12, m)}
      {gantry(W * 0.56, 58, W * 0.42, m)}
      {rocket(W * 0.36, 56, m)}
      {/* The lander: a squat capsule on splayed legs. */}
      <path d={`M${landerX - 9} 0 L${landerX - 5} 8 M${landerX + 9} 0 L${landerX + 5} 8`} stroke={m.wall} strokeWidth={1.6} />
      <path d={`M${landerX - 8} 7 L${landerX + 8} 7 L${landerX + 4} 18 L${landerX - 4} 18 Z`} fill={m.glass} />
      <circle cx={landerX} cy={12} r={1.8} fill={m.glassLit} />
    </>
  );
}

export const spacePort: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 46, render: built },
    { height: 64, render: landmark },
  ],
  workSpot: { dx: W * 0.55, dy: 6 },
};
