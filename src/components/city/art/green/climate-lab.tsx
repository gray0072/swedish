import type { BuildingArt, MaterialTokens } from '../../scene/types';
import { dome, isoBox, shadow, wobbleLine } from '../shared/primitives';
import { planter } from '../shared/props';

/**
 * The climate lab — where the city counts its emissions, and learns the words it takes to
 * talk about them (content flavour). A small timber-and-glass lab with a sensor dome on the
 * roof and a planted sill. `maxLevel` is 1, jumping straight from plot to landmark.
 */

const W = 56;

/** A small wind turbine: a tapering mast and three blades, one pointing up. */
function turbine(x: number, h: number, m: MaterialTokens) {
  const hub = { x, y: h };
  const blade = (angle: number) => {
    const a = (angle * Math.PI) / 180;
    const tip = { x: hub.x + Math.sin(a) * 16, y: hub.y + Math.cos(a) * 16 };
    const side = { x: hub.x + Math.sin(a + 0.25) * 6, y: hub.y + Math.cos(a + 0.25) * 6 };
    return `M${hub.x} ${hub.y} L${side.x.toFixed(1)} ${side.y.toFixed(1)} L${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Z`;
  };
  return (
    <g>
      <polygon points={`${x - 2},0 ${x + 2},0 ${x + 0.8},${h} ${x - 0.8},${h}`} fill={m.glass} />
      <path d={`${blade(0)} ${blade(120)} ${blade(240)}`} fill={m.glass} stroke={m.wallSide} strokeWidth={0.5} />
      <circle cx={hub.x} cy={hub.y} r={2} fill={m.trim} />
    </g>
  );
}

function landmark(m: MaterialTokens) {
  const wallH = 26;
  return (
    <>
      {shadow(W + 10, 12)}
      {turbine(W + 6, 62, m)}
      {isoBox({ x: 0, y: 0, w: W, h: wallH, depth: 9, wall: m.wall, wallSide: m.wallSide })}
      {/* A full-height glazed bay, timber fins either side. */}
      <rect x={W * 0.08} y={2} width={W * 0.4} height={wallH - 4} fill={m.glass} />
      {[0.18, 0.28, 0.38].map((t) => (
        <path key={t} d={`M${W * t} 2 V${wallH - 2}`} stroke={m.wallSide} strokeWidth={1} />
      ))}
      <rect x={W * 0.6} y={0} width={8} height={14} fill={m.timber} />
      {/* Tilted solar panels along the roof, the sensor dome and a weather mast. */}
      {[0, 1, 2].map((i) => (
        <polygon key={i} points={`${4 + i * 13},${wallH} ${15 + i * 13},${wallH} ${13 + i * 13},${wallH + 7} ${2 + i * 13},${wallH + 7}`} fill={m.timber} />
      ))}
      {dome(W * 0.82, wallH + 4, 7, m.glass, m.wallSide)}
      <path d={wobbleLine(W * 0.68, wallH, W * 0.68, wallH + 20, 241, 0.2)} stroke={m.timber} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <path d={`M${W * 0.68 - 4} ${wallH + 18} L${W * 0.68 + 4} ${wallH + 18}`} stroke={m.trim} strokeWidth={1.6} strokeLinecap="round" />
      {planter(W * 0.3, -1, 20, m.wallSide, m.roof)}
    </>
  );
}

export const climateLab: BuildingArt = {
  footprint: { w: 1, h: 1 },
  levels: [{ height: 78, render: landmark }],
  workSpot: { dx: W * 0.5, dy: 4 },
};
