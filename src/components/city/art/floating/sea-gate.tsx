import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { isoBox, shadow, wobbleLine } from '../shared/primitives';

/**
 * The sea gate — the land under Stockholm still rises some 4 mm a year after the ice age;
 * the gate is in case that isn't enough (SPEC §12.8). A storm-surge barrier: two piers and a
 * raisable gate leaf between them, drawn shut. `maxLevel` is 2. This is floating's
 * harbour-class building, placed at the waterline, though nothing moors here.
 */

const W = 90; // 2x1 footprint

function built(m: MaterialTokens) {
  const pierH = 24;
  return (
    <>
      {shadow(W, 14)}
      {isoBox({ x: 0, y: 0, w: 14, h: pierH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {isoBox({ x: W - 14, y: 0, w: 14, h: pierH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {/* The gate leaf, shut, spanning between the piers. */}
      <rect x={14} y={4} width={W - 28} height={pierH * 0.55} fill={m.wallSide} />
      <path d={wobbleLine(14, 4, W - 14, 4, 291, 0.3)} stroke={m.trim} strokeWidth={1.4} fill="none" />
    </>
  );
}

/** A barrier hood: the curved steel shell over a pier's machinery, as on the Thames Barrier. */
function hood(x: number, w: number, y: number, m: MaterialTokens) {
  return (
    <g>
      <path d={`M${x} ${y} Q${x + w * 0.1} ${y + 22} ${x + w / 2} ${y + 24} Q${x + w * 0.9} ${y + 22} ${x + w} ${y} Z`} fill={m.glass} />
      <path d={`M${x + w * 0.5} ${y + 24} L${x + w * 0.5} ${y}`} stroke={m.trim} strokeWidth={1} />
      <path d={`M${x + w * 0.25} ${y + 18} L${x + w * 0.25} ${y} M${x + w * 0.75} ${y + 18} L${x + w * 0.75} ${y}`} stroke={m.wallSide} strokeWidth={0.8} />
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const pierH = 26;
  return (
    <>
      {shadow(W + 8, 14)}
      {/* Landmark: the piers carry shining hoods over their machinery, a walkway bridges the
          gate, and a control cabin and beacon stand watch — a barrier a city would show off. */}
      {isoBox({ x: 0, y: 0, w: 18, h: pierH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {isoBox({ x: W - 18, y: 0, w: 18, h: pierH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      <rect x={18} y={4} width={W - 36} height={pierH * 0.6} fill={m.wallSide} />
      <path d={wobbleLine(18, 4, W - 18, 4, 291, 0.3)} stroke={m.trim} strokeWidth={1.4} fill="none" />
      <path d={`M18 ${pierH + 2} Q${W / 2} ${pierH + 14} ${W - 18} ${pierH + 2}`} stroke={m.timber} strokeWidth={3} fill="none" />
      <path d={`M18 ${pierH + 6} Q${W / 2} ${pierH + 18} ${W - 18} ${pierH + 6}`} stroke={m.trim} strokeWidth={1} fill="none" />
      {hood(-2, 22, pierH, m)}
      {hood(W - 20, 22, pierH, m)}
      <rect x={3} y={pierH + 24} width={12} height={8} fill={m.wall} />
      <rect x={5} y={pierH + 27} width={8} height={3} fill={m.glassLit} />
      <path d={wobbleLine(W - 9, pierH + 24, W - 9, pierH + 32, 292, 0.2)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={W - 9} cy={pierH + 34} r={2.6} fill={m.trim} />
    </>
  );
}

export const seaGate: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 32, render: built },
    { height: 66, render: landmark },
  ],
  ambient: ['beacon'],
  workSpot: { dx: W * 0.5, dy: 4 },
};
