import type { AmbientEmitter, BuildingArt, Footprint, GridCell, MaterialTokens } from '../types';
import { footprintCenter } from '../iso';
import { BuildingIcon, type IconKey } from '../../icons';

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
}

/**
 * Building-attached ambient emitters (CITY_VISUALS_LIFE.md §7): smoke, a flapping flag, a
 * turning rotor, a sweeping beacon. Drawn relative to the building's footprint centre, cheap
 * enough that their node cost matches `ambient.ts`'s `EMITTER_NODE_COST` exactly. At `active
 * === false` (ambient motion off — CITY_VISUALS_MOTION.md §4) every one of these renders its
 * hand-chosen rest phase instead of animating: smoke is simply absent, the rest freeze in place.
 */
function renderAmbientEmitter(type: AmbientEmitter, cx: number, cy: number, active: boolean, key: string) {
  switch (type) {
    case 'smoke':
      // Rest frame: no smoke at all (MOTION.md §4's "smoke absent").
      if (!active) return null;
      return (
        <g key={key} className="ambient-smoke" aria-hidden="true">
          <circle className="ambient-smoke__puff ambient-smoke__puff--1" cx={cx} cy={cy} r="3" fill="var(--ground-cliff)" fillOpacity="0.35" />
          <circle className="ambient-smoke__puff ambient-smoke__puff--2" cx={cx + 2} cy={cy} r="3.4" fill="var(--ground-cliff)" fillOpacity="0.3" />
          <circle className="ambient-smoke__puff ambient-smoke__puff--3" cx={cx - 1} cy={cy} r="2.6" fill="var(--ground-cliff)" fillOpacity="0.25" />
        </g>
      );
    case 'flag':
      return (
        <rect
          key={key}
          className={active ? 'ambient-flag' : undefined}
          x={cx - 1}
          y={cy - 14}
          width="9"
          height="6"
          fill="var(--trim)"
          style={{ transformOrigin: `${cx - 1}px ${cy - 11}px` }}
        />
      );
    case 'rotor':
      return (
        <line
          key={key}
          className={active ? 'ambient-rotor' : undefined}
          x1={cx - 8}
          y1={cy}
          x2={cx + 8}
          y2={cy}
          stroke="var(--timber)"
          strokeWidth="2"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
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
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      );
    default:
      return null; // birds/aurora/weather are sky-wide or global — drawn by Sky.tsx/Weather.tsx
  }
}

/**
 * Layer 7 (`buildings`) — depth-sorted building instances (caller sorts by `compareDepth`
 * before handing the list here) and their shadows. Art for a given building may not exist yet
 * (`art/registry.ts` fills in era by era) — when it doesn't, this falls back to the existing
 * `BuildingIcon` badge, planted on its plot instead of floating over it, so the mixed state
 * looks deliberate rather than broken (CITY_VISUALS_TECH.md §8).
 */
export default function Buildings({
  instances,
  material,
  ambientActive = false,
}: {
  instances: BuildingInstance[];
  material: MaterialTokens;
  /** Whether the ambient motion tier is on right now (CITY_VISUALS_MOTION.md §4). */
  ambientActive?: boolean;
}) {
  return (
    <g aria-hidden="true">
      {instances.map((instance) => {
        const center = footprintCenter(instance.cell, instance.footprint);
        const levelArt = instance.art?.levels[instance.level - 1];
        const atMax = instance.level >= instance.maxLevel;

        return (
          <g
            key={instance.id}
            id={`building-visual-${instance.id}`}
            className={`building-instance${instance.isHovered ? ' is-hovered' : ''}`}
          >
            {/* Shadow: flat parallelogram, offset right/down, no blur (BUILDINGS.md §2). Art
                draws its own via the `shadow()` primitive, so this is only for the fallback. */}
            {!levelArt && (
              <ellipse cx={center.x + 6} cy={center.y + 3} rx="26" ry="10" fill="#000" fillOpacity="0.09" />
            )}

            {(instance.ambient ?? []).map((type, i) =>
              renderAmbientEmitter(type, center.x, center.y - (levelArt?.height ?? 30) * 0.6, ambientActive, `${instance.id}-${i}`),
            )}

            {/* Keyed by level so an upgrade remounts the art and the rise replays. */}
            <g
              key={instance.level}
              className={instance.rising ? 'building-rise' : undefined}
              style={instance.rising ? { transformOrigin: `${center.x}px ${center.y}px` } : undefined}
            >
            {levelArt ? (
              // The scene applies the isometric placement; art draws in its own local space
              // with the footprint's front-bottom corner at the origin and **y pointing up**
              // (types.ts, BuildingArtLevel), so the flip belongs here — art never does it.
              <g transform={`translate(${center.x}, ${center.y}) scale(1, -1)`}>
                {levelArt.render(material)}
              </g>
            ) : (
              <g>
                <circle cx={center.x} cy={center.y - 22} r="22" fill="var(--wall)" stroke="var(--trim)" strokeWidth="2" />
                <svg x={center.x - 13} y={center.y - 35} width="26" height="26" viewBox="0 0 24 24" style={{ color: 'var(--trim)' }}>
                  <BuildingIcon icon={instance.icon} className="h-full w-full" />
                </svg>
              </g>
            )}
            </g>

            {atMax && (
              <path
                // Sits just above the silhouette, whose height only the art knows.
                d={starPath(center.x, center.y - (levelArt?.height ?? 44) - 12, 7)}
                fill="var(--trim)"
                fillOpacity="0.85"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/** A small eight-petal Nordic star for the max-level marker (BUILDINGS.md §5). */
function starPath(cx: number, cy: number, r: number): string {
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
