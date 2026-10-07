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
 * Layer 12 (`hit`) — the only focusable layer (CITY_VISUALS_TECH.md §6). It is last in
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
  selectedId = null,
}: {
  selectedId?: string | null;
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
        const isSelected = selectedId === target.id;
        // Wide enough for the label it carries: ~5.6 units per character at font-size 10.
        const labelW = Math.max(80, target.label.length * 5.6 + 14);

        return (
          <g
            key={target.id}
            role="button"
            tabIndex={0}
            aria-label={target.label}
            aria-pressed={isSelected}
            className={`hit-target${isSelected ? ' is-selected' : ''}`}
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
            {/* The hit area reaches up over the drawing too, not only its footprint: people tap
                the building they see, and a tall one stands well above its plot. */}
            <path d={outline} fill="transparent" stroke="none" />
            <rect
              x={center.x - halfW * 0.6}
              y={center.y - halfH - 70 * target.footprint.h}
              width={halfW * 1.2}
              height={70 * target.footprint.h + halfH}
              fill="transparent"
            />
            {isSelected && (
              <path
                className="selected-ring"
                d={outline}
                fill="var(--trim)"
                fillOpacity="0.14"
                stroke="var(--trim)"
                strokeWidth="2.5"
                strokeDasharray="8 5"
              />
            )}
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
              <rect x={center.x - labelW / 2} y={center.y + halfH + 6} width={labelW} height="18" rx="9" fill="var(--wall)" fillOpacity="0.94" />
              <text
                x={center.x}
                y={center.y + halfH + 19}
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
