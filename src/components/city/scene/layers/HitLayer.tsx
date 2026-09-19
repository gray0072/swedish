import type { Footprint, GridCell } from '../types';
import { footprintCenter, TILE_H, TILE_W } from '../iso';

export interface HitTarget {
  id: string;
  cell: GridCell;
  footprint: Footprint;
  /** Accessible label: "<name> — level n of m" (BUILDINGS.md §7). */
  label: string;
}

/**
 * Layer 11 (`hit`) — the only focusable layer (CITY_VISUALS_TECH.md §6). It is last in
 * document order so its focus ring always draws above the art, and hover/keyboard state
 * never depends on the art's actual silhouette. Callers pre-sort `targets` back-to-front,
 * left-to-right so DOM order (and therefore tab order) matches the scene's depth order.
 */
export default function HitLayer({
  targets,
  hoveredId,
  tappedKey,
  onHover,
  onActivate,
}: {
  targets: HitTarget[];
  hoveredId: string | null;
  tappedKey: { id: string; key: number } | null;
  onHover: (id: string | null) => void;
  onActivate: (id: string) => void;
}) {
  return (
    <g>
      {targets.map((target) => {
        const center = footprintCenter(target.cell, target.footprint);
        const halfW = (TILE_W / 2) * target.footprint.w;
        const halfH = (TILE_H / 2) * target.footprint.h;
        const outline = `M ${center.x} ${center.y - halfH} L ${center.x + halfW} ${center.y} L ${center.x} ${center.y + halfH} L ${center.x - halfW} ${center.y} Z`;
        const isTapped = tappedKey?.id === target.id;

        return (
          <g
            key={target.id}
            role="button"
            tabIndex={0}
            aria-label={target.label}
            className="hit-target"
            onMouseEnter={() => onHover(target.id)}
            onMouseLeave={() => onHover(hoveredId === target.id ? null : hoveredId)}
            onFocus={() => onHover(target.id)}
            onBlur={() => onHover(hoveredId === target.id ? null : hoveredId)}
            onClick={() => onActivate(target.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate(target.id);
              }
            }}
          >
            <path d={outline} fill="transparent" stroke="none" />
            <path
              className="focus-ring"
              d={outline}
              fill="none"
              stroke="var(--trim)"
              strokeWidth="3"
            />
            {isTapped && (
              <circle
                key={tappedKey!.key}
                className="tap-ring"
                cx={center.x}
                cy={center.y}
                r={Math.max(halfW, halfH)}
                fill="none"
                stroke="var(--trim)"
                strokeWidth="3"
              />
            )}
            <g className="hover-label">
              <rect x={center.x - 40} y={center.y - halfH - 26} width="80" height="18" rx="3" fill="var(--wall)" fillOpacity="0.92" />
              <text
                x={center.x}
                y={center.y - halfH - 13}
                textAnchor="middle"
                fontSize="10"
                fill="var(--trim)"
              >
                {target.label}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}
