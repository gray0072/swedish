import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { AmbientEmitter, BuildingArt, BuildingArtLevel, Footprint, GridCell, MaterialTokens } from '../types';
import { footprintCenter, TILE_H } from '../iso';
import { BuildingIcon, type IconKey } from '../../icons';
import type { DecorItem } from '../decor';
import { FLAT_DECOR, renderDecor } from '../decorArt';

export interface BuildingInstance {
  id: string;
  cell: GridCell;
  footprint: Footprint;
  level: number; // 1-based; Plots.tsx handles level 0
  maxLevel: number;
  icon: IconKey;
  art?: BuildingArt;
  isHovered: boolean;
  /** Just built or upgraded — plays `building-rise` once (Scene.tsx decides). */
  rising?: boolean;
  /** This building's share of the era's ambient budget (`ambient.ts`), already truncated. */
  ambient?: AmbientEmitter[];
  /** Selected on the map and not at max level: draw the *next* level, as a preview. */
  preview?: boolean;
}

/** An unbuilt plot whose requirements are met: its first level, drawn as a blueprint. */
export interface GhostInstance {
  id: string;
  cell: GridCell;
  footprint: Footprint;
  art?: BuildingArt;
  affordable: boolean;
  /** Selected on the map: the blueprint fills in to the real colours, as a preview. */
  preview?: boolean;
}

/**
 * How much bigger building art is drawn than the units it was authored in. The art was sized
 * against an empty island; at 1:1 a hut is a speck on a 96-unit tile and the island reads as
 * empty however much is built on it.
 */
export const ART_SCALE = 1.25;

/**
 * A blueprint: every material token is the era's trim colour, so a plot shows its building
 * as one flat silhouette — a promise of what goes there, not the thing itself. CSS variables
 * work here because art only ever writes these strings into `fill`/`stroke` attributes.
 */
const GHOST_MATERIAL: MaterialTokens = {
  wall: 'var(--trim)',
  wallSide: 'var(--trim)',
  roof: 'var(--trim)',
  roofSide: 'var(--trim)',
  timber: 'var(--trim)',
  trim: 'var(--trim)',
  glass: 'var(--trim)',
  glassLit: 'var(--trim)',
};

// -- Measuring art ------------------------------------------------------------------------

export interface ArtBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Art is authored from x = 0 rightwards (types.ts), but where its drawing actually ends is
 * known only to the drawing — so each level is measured once, the first time it is mounted,
 * and centred on its footprint from then on. Keyed by the level object, so the cache can
 * never serve one building's box to another and needs no invalidation.
 */
const boxes = new WeakMap<BuildingArtLevel, ArtBox>();

export function measuredBox(level: BuildingArtLevel | undefined): ArtBox | undefined {
  return level ? boxes.get(level) : undefined;
}

/**
 * Screen-space top centre of a level's drawing — where its star, badge or smoke goes. Falls
 * back to the declared height before the first measurement (and in jsdom, which has no
 * `getBBox`), which is close enough for the one frame it is used.
 */
export function artTop(level: BuildingArtLevel | undefined, center: { x: number; y: number }): { x: number; y: number } {
  const box = measuredBox(level);
  const top = box ? box.y + box.height : level?.height ?? 44;
  return { x: center.x, y: center.y - top * ART_SCALE };
}

function PlacedArt({
  level,
  material,
  center,
  onMeasured,
}: {
  level: BuildingArtLevel;
  material: MaterialTokens;
  center: { x: number; y: number };
  onMeasured?: () => void;
}) {
  const ref = useRef<SVGGElement>(null);
  const [box, setBox] = useState(() => boxes.get(level));
  useLayoutEffect(() => {
    if (boxes.has(level)) {
      setBox(boxes.get(level));
      return;
    }
    const el = ref.current;
    if (!el || typeof el.getBBox !== 'function') return;
    try {
      const b = el.getBBox();
      const measured = { x: b.x, y: b.y, width: b.width, height: b.height };
      boxes.set(level, measured);
      setBox(measured);
      onMeasured?.();
    } catch {
      // Not rendered (display: none, detached) — stays uncentred, which is the old placement.
    }
  }, [level, onMeasured]);
  const dx = box ? -(box.x + box.width / 2) : 0;
  return (
    // The scene applies the isometric placement; art draws in its own local space with
    // **y pointing up** (types.ts, BuildingArtLevel), so the flip belongs here.
    <g transform={`translate(${center.x}, ${center.y}) scale(${ART_SCALE}, ${-ART_SCALE})`}>
      <g ref={ref} transform={`translate(${dx}, 0)`}>
        {level.render(material)}
      </g>
    </g>
  );
}

// -- Ambient emitters ---------------------------------------------------------------------

/**
 * Building-attached ambient emitters (CITY_VISUALS_LIFE.md §7): smoke, a flapping flag, a
 * turning rotor, a sweeping beacon. Drawn from the top of the building's measured silhouette,
 * cheap enough that their node cost matches `ambient.ts`'s `EMITTER_NODE_COST` exactly. At
 * `active === false` (ambient motion off — CITY_VISUALS_MOTION.md §4) every one of these
 * renders its hand-chosen rest phase instead of animating: smoke is simply absent, the rest
 * freeze in place.
 */
function renderAmbientEmitter(type: AmbientEmitter, cx: number, cy: number, active: boolean, key: string) {
  switch (type) {
    case 'smoke':
      // Rest frame: no smoke at all (MOTION.md §4's "smoke absent").
      if (!active) return null;
      return (
        <g key={key} className="ambient-smoke" aria-hidden="true">
          <circle className="ambient-smoke__puff ambient-smoke__puff--1" cx={cx} cy={cy} r="3.5" fill="var(--ground-cliff)" fillOpacity="0.35" />
          <circle className="ambient-smoke__puff ambient-smoke__puff--2" cx={cx + 2} cy={cy} r="4" fill="var(--ground-cliff)" fillOpacity="0.3" />
          <circle className="ambient-smoke__puff ambient-smoke__puff--3" cx={cx - 1} cy={cy} r="3" fill="var(--ground-cliff)" fillOpacity="0.25" />
        </g>
      );
    case 'flag':
      // The pole stands on the roof line; only the cloth flaps.
      return (
        <g key={key}>
          <line x1={cx} y1={cy - 18} x2={cx} y2={cy + 1} stroke="var(--timber)" strokeWidth="1.4" strokeLinecap="round" />
          <rect
            className={active ? 'ambient-flag' : undefined}
            x={cx}
            y={cy - 18}
            width="11"
            height="7"
            fill="var(--trim)"
            style={{ transformOrigin: '0% 50%' }}
          />
        </g>
      );
    case 'rotor':
      return (
        <line
          key={key}
          className={active ? 'ambient-rotor' : undefined}
          x1={cx - 9}
          y1={cy - 4}
          x2={cx + 9}
          y2={cy - 4}
          stroke="var(--timber)"
          strokeWidth="2"
          style={{ transformOrigin: '50% 50%' }}
        />
      );
    case 'beacon':
      return (
        <path
          key={key}
          className={active ? 'ambient-beacon' : undefined}
          d={`M ${cx} ${cy} L ${cx - 3} ${cy - 30} A 30 30 0 0 1 ${cx + 3} ${cy - 30} Z`}
          fill="var(--glass-lit)"
          fillOpacity={active ? 0.12 : 0}
          style={{ transformOrigin: '50% 100%' }}
        />
      );
    default:
      return null; // birds/aurora/weather are sky-wide or global — drawn by Sky.tsx/Weather.tsx
  }
}

/** A small eight-petal Nordic star for the max-level marker (BUILDINGS.md §5). */
export function starPath(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  const spikes = 8;
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI * i) / spikes;
    const x = cx + radius * Math.sin(angle);
    const y = cy - radius * Math.cos(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(' ')} Z`;
}

/** The front corner of a footprint — the painter's-order key everything on the island shares. */
function frontY(cell: GridCell, footprint: Footprint): number {
  return footprintCenter(cell, footprint).y + ((footprint.w + footprint.h) * TILE_H) / 4;
}

/**
 * Layer 7 (`buildings`) — buildings, plot blueprints and the island's decor, painter-sorted
 * together by the front of their footprints, so a tree behind a house is hidden by it and a
 * tree in front of it is not. Art for a given building may not exist yet (`art/registry.ts`
 * fills in era by era) — then this falls back to the `BuildingIcon` badge planted on its
 * plot, so the mixed state looks deliberate rather than broken (CITY_VISUALS_TECH.md §8).
 */
export default function Buildings({
  instances,
  ghosts = [],
  decor = [],
  growingOwners,
  material,
  ambientActive = false,
  onMeasured,
}: {
  instances: BuildingInstance[];
  ghosts?: GhostInstance[];
  decor?: DecorItem[];
  /** Buildings that just gained a level: their growth items pop in with them. */
  growingOwners?: Set<string>;
  material: MaterialTokens;
  /** Whether the ambient motion tier is on right now (CITY_VISUALS_MOTION.md §4). */
  ambientActive?: boolean;
  /** A level was measured for the first time — lets the badge layer re-read its top. */
  onMeasured?: () => void;
}) {
  const entries: Array<{ y: number; node: ReactNode }> = [];
  const flat: ReactNode[] = [];

  for (const item of decor) {
    const node = renderDecor(item, item.ownerId && growingOwners?.has(item.ownerId) ? 'decor-grow' : undefined);
    if (FLAT_DECOR.has(item.kind)) flat.push(node);
    else entries.push({ y: item.y, node });
  }

  for (const ghost of ghosts) {
    const level = ghost.art?.levels[0];
    if (!level) continue;
    const center = footprintCenter(ghost.cell, ghost.footprint);
    entries.push({
      y: frontY(ghost.cell, ghost.footprint),
      node: (
        <g
          key={`ghost-${ghost.id}`}
          className={ghost.preview ? 'building-preview' : ghost.affordable ? 'building-ghost building-ghost--ready' : 'building-ghost'}
        >
          <PlacedArt level={level} material={ghost.preview ? material : GHOST_MATERIAL} center={center} onMeasured={onMeasured} />
        </g>
      ),
    });
  }

  for (const instance of instances) {
    const center = footprintCenter(instance.cell, instance.footprint);
    const shownLevel = instance.preview ? Math.min(instance.level + 1, instance.maxLevel) : instance.level;
    const levelArt = instance.art?.levels[shownLevel - 1];
    const atMax = instance.level >= instance.maxLevel;
    const top = artTop(levelArt, center);
    const box = measuredBox(levelArt);
    const halfWidth = box ? (box.width * ART_SCALE) / 2 : 20;

    entries.push({
      y: frontY(instance.cell, instance.footprint),
      node: (
        <g
          key={instance.id}
          id={`building-visual-${instance.id}`}
          className={`building-instance${instance.isHovered ? ' is-hovered' : ''}`}
        >
          {!levelArt && (
            <ellipse cx={center.x + 6} cy={center.y + 3} rx="26" ry="10" fill="#000" fillOpacity="0.09" />
          )}

          {/* Keyed by the level shown, so an upgrade (or a preview) remounts the art and the rise replays. */}
          <g
            key={`${shownLevel}${instance.preview ? 'p' : ''}`}
            className={instance.preview ? 'building-preview' : instance.rising ? 'building-rise' : undefined}
            style={instance.rising && !instance.preview ? { transformOrigin: `${center.x}px ${center.y}px` } : undefined}
          >
            {levelArt ? (
              <PlacedArt level={levelArt} material={material} center={center} onMeasured={onMeasured} />
            ) : (
              <g>
                <circle cx={center.x} cy={center.y - 22} r="22" fill="var(--wall)" stroke="var(--trim)" strokeWidth="2" />
                <svg x={center.x - 13} y={center.y - 35} width="26" height="26" viewBox="0 0 24 24" style={{ color: 'var(--trim)' }}>
                  <BuildingIcon icon={instance.icon} className="h-full w-full" />
                </svg>
              </g>
            )}
          </g>

          {!instance.preview &&
            (instance.ambient ?? []).map((type, i) =>
              renderAmbientEmitter(
                type,
                // Smoke rises from the roof's right shoulder, where a smoke hole or chimney
                // sits; everything else is planted on the ridge.
                type === 'smoke' ? top.x + halfWidth * 0.35 : top.x,
                type === 'smoke' ? top.y + 6 : top.y + 1,
                ambientActive,
                `${instance.id}-${i}`,
              ),
            )}

          {atMax && !instance.preview && (
            <path
              // Above the silhouette (and clear of a flag on the ridge), centred on it.
              d={starPath(top.x, top.y - ((instance.ambient ?? []).includes('flag') ? 30 : 13), 8)}
              fill="var(--trim)"
              stroke="#fff"
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
          )}
        </g>
      ),
    });
  }

  entries.sort((a, b) => a.y - b.y);

  return (
    <g aria-hidden="true">
      {flat}
      {entries.map((e) => e.node)}
    </g>
  );
}
