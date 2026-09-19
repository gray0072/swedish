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

function landmark(m: MaterialTokens) {
  const pierH = 28;
  return (
    <>
      {shadow(W, 14)}
      {isoBox({ x: 0, y: 0, w: 16, h: pierH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      {isoBox({ x: W - 16, y: 0, w: 16, h: pierH, depth: 6, wall: m.wall, wallSide: m.wallSide })}
      <rect x={16} y={4} width={W - 32} height={pierH * 0.6} fill={m.wallSide} />
      <path d={wobbleLine(16, 4, W - 16, 4, 291, 0.3)} stroke={m.trim} strokeWidth={1.4} fill="none" />
      {/* Landmark: a control cabin on one pier, and a warning beacon on the other. */}
      <rect x={2} y={pierH} width={10} height={8} fill={m.wall} />
      <path d={wobbleLine(W - 8, pierH, W - 8, pierH + 10, 292, 0.2)} stroke={m.timber} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={W - 8} cy={pierH + 12} r={2.4} fill={m.trim} />
    </>
  );
}

export const seaGate: BuildingArt = {
  harbour: true,
  footprint: { w: 2, h: 1 },
  levels: [
    { height: 32, render: built },
    { height: 42, render: landmark },
  ],
  ambient: ['beacon'],
  workSpot: { dx: W * 0.5, dy: 4 },
};
