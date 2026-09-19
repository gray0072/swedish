import type { Footprint, GridCell } from '../types';
import { footprintCenter, TILE_H, TILE_W } from '../iso';

export interface PlotInstance {
  id: string;
  cell: GridCell;
  footprint: Footprint;
  /** A required building isn't owned yet — no pulse, a muted outline, a chain glyph. */
  locked: boolean;
  /** Requirement met and the learner can afford the next level right now. */
  affordable: boolean;
}

/**
 * Layer 6 (`plots`) — unbuilt sites: a dashed footprint outline in the era trim colour, a
 * small post sign, pulsing when the learner can afford to build right now
 * (CITY_VISUALS_BUILDINGS.md §5, CITY_VISUALS_MOTION.md §3).
 */
export default function Plots({ plots, ambientActive = true }: { plots: PlotInstance[]; ambientActive?: boolean }) {
  return (
    <g aria-hidden="true">
      {plots.map((plot) => {
        const center = footprintCenter(plot.cell, plot.footprint);
        const halfW = (TILE_W / 2) * plot.footprint.w;
        const halfH = (TILE_H / 2) * plot.footprint.h;
        const outline = `M ${center.x} ${center.y - halfH} L ${center.x + halfW} ${center.y} L ${center.x} ${center.y + halfH} L ${center.x - halfW} ${center.y} Z`;
        const postX = center.x;
        const postY = center.y + halfH * 0.4;

        return (
          <g key={plot.id} className={plot.affordable && ambientActive ? 'plot-affordable' : undefined}>
            <path
              d={outline}
              fill="none"
              stroke={plot.locked ? 'var(--ground-cliff)' : 'var(--trim)'}
              strokeOpacity={plot.locked ? 0.5 : 0.4}
              strokeWidth="2"
              strokeDasharray="6 5"
            />
            <line x1={postX} y1={postY} x2={postX} y2={postY - 14} stroke="var(--timber)" strokeWidth="2" strokeOpacity="0.6" />
            {plot.locked ? (
              <>
                <circle cx={postX - 3} cy={postY - 14} r="2.4" fill="none" stroke="var(--ground-cliff)" strokeWidth="1.4" />
                <circle cx={postX + 3} cy={postY - 14} r="2.4" fill="none" stroke="var(--ground-cliff)" strokeWidth="1.4" />
              </>
            ) : (
              <circle cx={postX} cy={postY - 16} r="2.6" fill="var(--trim)" fillOpacity="0.7" />
            )}
          </g>
        );
      })}
    </g>
  );
}
