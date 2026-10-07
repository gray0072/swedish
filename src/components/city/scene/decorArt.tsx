import type { ReactNode } from 'react';
import type { DecorItem } from './decor';

/**
 * Drawings for the decor layer (`decor.ts`): wild trees and boulders, and the small houses,
 * fields and gardens a growing town gathers around its buildings. Everything is drawn in a
 * local space with the ground contact point at the origin and **y pointing down** (screen
 * space — the scene places each item with a plain translate), and coloured only through the
 * era's CSS tokens, so dark mode and every era palette come for free and nothing here
 * introduces a colour of its own.
 *
 * Each drawing stays at 2–6 nodes: the island carries a few dozen of them, inside
 * CITY_VISUALS_MOTION.md §5's node budget.
 */

const SHADE = '#000';

function groundShadow(rx: number): ReactNode {
  return <ellipse cx={rx * 0.35} cy={1} rx={rx} ry={rx * 0.38} fill={SHADE} fillOpacity={0.12} />;
}

function pine(): ReactNode {
  return (
    <>
      {groundShadow(8)}
      <path d="M0 0 L0 -6" stroke="var(--timber)" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M0 -34 L6 -22 L4 -22 L10 -10 L7 -10 L12 -4 L-12 -4 L-7 -10 L-10 -10 L-4 -22 L-6 -22 Z" fill="var(--foliage)" />
      <path d="M0 -34 L6 -22 L4 -22 L10 -10 L7 -10 L12 -4 L0 -4 Z" fill={SHADE} fillOpacity={0.16} />
    </>
  );
}

function round(): ReactNode {
  return (
    <>
      {groundShadow(10)}
      <path d="M0 0 L0 -12" stroke="var(--timber)" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={0} cy={-20} r={10} fill="var(--foliage)" />
      <path d="M6 -28 A10 10 0 0 1 -6 -12 A11 11 0 0 0 6 -28 Z" fill={SHADE} fillOpacity={0.18} />
      <circle cx={-3.5} cy={-23.5} r={3} fill="#fff" fillOpacity={0.12} />
    </>
  );
}

function bush(): ReactNode {
  return (
    <>
      {groundShadow(8)}
      <ellipse cx={-3} cy={-5} rx={7} ry={6} fill="var(--foliage)" />
      <ellipse cx={4} cy={-4} rx={6} ry={5} fill="var(--foliage)" />
      <ellipse cx={5} cy={-3} rx={4} ry={3.4} fill={SHADE} fillOpacity={0.15} />
    </>
  );
}

function rock(): ReactNode {
  return (
    <>
      <path d="M-10 0 Q-11 -7 -4 -9 Q4 -11 9 -5 Q11 -1 9 0 Z" fill="var(--ground-cliff)" />
      <path d="M-7 -5 Q-4 -8 1 -8" stroke="var(--ground-top)" strokeOpacity={0.6} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  );
}

function crystal(): ReactNode {
  return (
    <>
      {groundShadow(7)}
      <path d="M0 -30 L6 -10 L0 0 L-6 -10 Z" fill="var(--trim)" fillOpacity={0.75} />
      <path d="M0 -30 L6 -10 L0 0 Z" fill="var(--foliage)" fillOpacity={0.7} />
      <path d="M9 -14 L12 -6 L9 0 L6 -6 Z" fill="var(--trim)" fillOpacity={0.5} />
    </>
  );
}

/** A small gabled house: front wall, side sliver, roof and its side, a door. */
function gabled(w: number, h: number, rise: number, extra?: ReactNode): ReactNode {
  const d = 7;
  const sx = d * 0.6;
  const sy = d * 0.35;
  const half = w / 2;
  return (
    <>
      <polygon points={`${half},0 ${half + sx},${-sy} ${half + sx},${-h - sy} ${half},${-h}`} fill="var(--wall-side)" />
      <rect x={-half} y={-h} width={w} height={h} fill="var(--wall)" />
      <polygon points={`${-half - 2},${-h} 0,${-h - rise} ${half + 2},${-h}`} fill="var(--roof)" />
      <polygon points={`${half + 2},${-h} 0,${-h - rise} ${sx},${-h - rise - sy} ${half + 2 + sx},${-h - sy}`} fill="var(--roof-side)" />
      <rect x={-2} y={-7} width={4} height={7} fill="var(--timber)" />
      {extra}
    </>
  );
}

function block(): ReactNode {
  const w = 18;
  const h = 30;
  const sx = 5;
  const sy = 3;
  return (
    <>
      <polygon points={`${w / 2},0 ${w / 2 + sx},${-sy} ${w / 2 + sx},${-h - sy} ${w / 2},${-h}`} fill="var(--wall-side)" />
      <rect x={-w / 2} y={-h} width={w} height={h} fill="var(--wall)" />
      <polygon points={`${-w / 2},${-h} ${w / 2},${-h} ${w / 2 + sx},${-h - sy} ${-w / 2 + sx},${-h - sy}`} fill="var(--roof)" />
      <path d={`M${-w / 2 + 3} ${-h + 7} H${w / 2 - 2} M${-w / 2 + 3} ${-h + 15} H${w / 2 - 2} M${-w / 2 + 3} ${-h + 23} H${w / 2 - 2}`} stroke="var(--glass-lit)" strokeWidth={3} strokeDasharray="3 2" />
    </>
  );
}

function pod(): ReactNode {
  return (
    <>
      {groundShadow(12)}
      <rect x={-12} y={-14} width={24} height={14} rx={7} fill="var(--wall)" />
      <rect x={-8} y={-10} width={16} height={4} rx={2} fill="var(--glass-lit)" />
      <path d="M-6 -14 Q0 -20 6 -14" stroke="var(--trim)" strokeWidth={1.4} fill="none" />
    </>
  );
}

function dome(): ReactNode {
  return (
    <>
      {groundShadow(12)}
      <path d="M-12 0 A12 12 0 0 1 12 0 Z" fill="var(--wall)" />
      <path d="M4 -11.3 A12 12 0 0 1 12 0 L6 0 Z" fill={SHADE} fillOpacity={0.15} />
      <rect x={-2.5} y={-6} width={5} height={6} rx={2.5} fill="var(--glass-lit)" />
      <circle cx={0} cy={-13} r={1.6} fill="var(--trim)" />
    </>
  );
}

function tent(): ReactNode {
  return (
    <>
      {groundShadow(10)}
      <polygon points="-10,0 0,-20 10,0" fill="var(--wall)" />
      <polygon points="0,-20 10,0 3,0" fill="var(--wall-side)" />
      <path d="M-3 -25 L0 -20 L3 -25" stroke="var(--timber)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <polygon points="-3,0 0,-8 2,0" fill="var(--timber)" />
    </>
  );
}

function field(): ReactNode {
  // An iso diamond of crops with furrows running along one grid axis.
  return (
    <>
      <polygon points="0,-12 24,0 0,12 -24,0" fill="var(--foliage)" fillOpacity={0.55} />
      <path d="M-14 -5 L10 7 M-7 -8.5 L17 3.5 M-21 -1.5 L3 10.5" stroke="var(--ground-cliff)" strokeOpacity={0.45} strokeWidth={1.4} />
      <polygon points="0,-12 24,0 0,12 -24,0" fill="none" stroke="var(--timber)" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="3 3" />
    </>
  );
}

function garden(): ReactNode {
  return (
    <>
      <polygon points="0,-10 20,0 0,10 -20,0" fill="var(--ground-path)" fillOpacity={0.8} />
      <polygon points="0,-10 20,0 0,10 -20,0" fill="none" stroke="var(--timber)" strokeOpacity={0.6} strokeWidth={1.2} strokeDasharray="2 2" />
      <circle cx={-7} cy={-3} r={4.5} fill="var(--foliage)" />
      <circle cx={6} cy={-1} r={4} fill="var(--foliage)" />
      <circle cx={0} cy={4} r={3} fill="var(--trim)" fillOpacity={0.8} />
    </>
  );
}

function drawing(kind: DecorItem['kind']): ReactNode {
  switch (kind) {
    case 'pine':
      return pine();
    case 'round':
      return round();
    case 'bush':
      return bush();
    case 'rock':
      return rock();
    case 'crystal':
      return crystal();
    case 'cottage':
      return (
        <>
          {groundShadow(13)}
          {gabled(22, 12, 11)}
        </>
      );
    case 'house':
      return (
        <>
          {groundShadow(12)}
          {gabled(18, 20, 12, <rect x={-6} y={-16} width={4} height={4} fill="var(--glass-lit)" />)}
        </>
      );
    case 'block':
      return (
        <>
          {groundShadow(12)}
          {block()}
        </>
      );
    case 'pod':
      return pod();
    case 'dome':
      return dome();
    case 'tent':
      return tent();
    case 'field':
      return field();
    case 'garden':
      return garden();
    default:
      return null;
  }
}

/** Kinds that lie flat on the ground and so are drawn under everything standing on the island. */
export const FLAT_DECOR = new Set<DecorItem['kind']>(['field', 'garden']);

/** One decor item, placed. Only boulders mirror: everything else carries its shade on the
 * right, away from the upper-left light, and a mirrored copy would be lit from the wrong side.
 * `className` goes on an inner group, because a CSS transform animation on the placed group
 * would replace its `transform` attribute and send the item to the origin. */
export function renderDecor(item: DecorItem, className?: string): ReactNode {
  const mirror = item.flip && item.kind === 'rock';
  return (
    <g
      key={item.key}
      transform={`translate(${item.x.toFixed(1)} ${item.y.toFixed(1)}) scale(${mirror ? -item.scale : item.scale} ${item.scale})`}
    >
      <g className={className}>{drawing(item.kind)}</g>
    </g>
  );
}
