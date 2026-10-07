import type { Footprint, GridCell } from './types';
import { cellKey, footprintCells, TILE_H, toScreen } from './iso';
import { ISLAND_CELLS, ISLAND_HUB, neighborsOf, type PathGraph } from './island';

/**
 * The decor layer's placement (CITY_VISUALS_SCENE.md §5): what grows on the island besides
 * the buildings. Two kinds, both pure functions of the era and the city's levels so the same
 * save always draws the same island:
 *
 * - **Wild** — trees and boulders on land nobody has claimed. They are the "before": an era
 *   opens as a wooded island with empty plots.
 * - **Growth** — the small houses, fields and gardens that spring up *around* a building as it
 *   gains levels. A level is then visible twice: in the building's own art, and in the town
 *   that gathers around it. This is what makes an upgrade change the island, not just a sprite.
 *
 * Neither ever sits on a footprint (built or not — a plot is a promise and stays clear), on the
 * quay-side hub, or on a cell the path graph walks through.
 */

export type WildKind = 'pine' | 'round' | 'bush' | 'rock' | 'crystal';
export type GrowthKind = 'cottage' | 'house' | 'block' | 'pod' | 'dome' | 'tent' | 'field' | 'garden';

export interface DecorItem {
  key: string;
  kind: WildKind | GrowthKind;
  /** Ground contact point, world space. */
  x: number;
  y: number;
  /** Size multiplier, ~0.8–1.2, so a stand of trees is not a row of clones. */
  scale: number;
  /** Mirror the drawing — breaks up repetition for the asymmetric kinds. */
  flip: boolean;
  /** Growth items owned by a building, so the scene can fade them in when it levels up. */
  ownerId?: string;
}

/** The look of each era's land: which trees grow wild, and what the town builds around itself. */
export const ERA_DECOR: Record<string, { wild: WildKind[]; growth: GrowthKind[] }> = {
  tribe: { wild: ['pine', 'pine', 'bush', 'rock'], growth: ['tent', 'field', 'tent'] },
  viking: { wild: ['pine', 'round', 'pine', 'rock'], growth: ['cottage', 'field', 'cottage'] },
  medieval: { wild: ['round', 'pine', 'bush'], growth: ['house', 'cottage', 'field'] },
  empire: { wild: ['round', 'round', 'bush'], growth: ['house', 'garden', 'house'] },
  industrial: { wild: ['round', 'bush', 'rock'], growth: ['house', 'block', 'house'] },
  modern: { wild: ['round', 'bush'], growth: ['block', 'garden', 'block'] },
  green: { wild: ['round', 'pine', 'round', 'bush'], growth: ['cottage', 'garden', 'block'] },
  connected: { wild: ['round', 'bush'], growth: ['pod', 'garden', 'block'] },
  floating: { wild: ['round', 'bush'], growth: ['cottage', 'pod', 'garden'] },
  stellar: { wild: ['crystal', 'round', 'crystal'], growth: ['dome', 'pod', 'dome'] },
};

/** FNV-1a over a string — tiny, stable, and good enough to scatter trees. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A deterministic number in [0, 1) for a key. */
function unit(key: string): number {
  return hash(key) / 4294967296;
}

/** How many growth items a building at `level` of `maxLevel` gathers around itself. */
export function growthCount(level: number, maxLevel: number): number {
  if (level <= 0) return 0;
  return level + (level >= maxLevel ? 1 : 0);
}

const RING: Array<[number, number]> = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1],
  [2, 0], [-2, 0], [0, 2], [0, -2], [2, 1], [1, 2], [-2, -1], [-1, -2], [2, -1], [-1, 2], [-2, 1], [1, -2],
];

export interface DecorInput {
  eraId: string;
  /** Every building of the era, built or still a plot. */
  sites: Array<{ id: string; cell: GridCell; footprint: Footprint; level: number; maxLevel: number }>;
  graph: PathGraph;
}

export function computeDecor({ eraId, sites, graph }: DecorInput): DecorItem[] {
  const style = ERA_DECOR[eraId] ?? ERA_DECOR.tribe;
  const blocked = new Set<string>([cellKey(ISLAND_HUB)]);
  for (const site of sites) {
    for (const cell of footprintCells(site.cell, site.footprint)) blocked.add(cellKey(cell));
  }
  for (const [a, b] of graph.edges) {
    blocked.add(cellKey(a));
    blocked.add(cellKey(b));
  }
  const walkable = new Set(ISLAND_CELLS.map(cellKey));
  const used = new Set<string>();
  const items: DecorItem[] = [];

  // Growth first, so the town claims the land nearest each building before the woods do.
  const builtSites = sites.filter((s) => s.level > 0).sort((a, b) => a.id.localeCompare(b.id));
  for (const site of builtSites) {
    const want = growthCount(site.level, site.maxLevel);
    const own = footprintCells(site.cell, site.footprint);
    const candidates = new Map<string, GridCell>();
    for (const cell of own) {
      for (const [dq, dr] of RING) {
        const next = { q: cell.q + dq, r: cell.r + dr };
        const key = cellKey(next);
        if (!walkable.has(key) || blocked.has(key) || used.has(key)) continue;
        // Distance from the footprint decides the order, so growth hugs its building.
        const distance = Math.max(Math.abs(dq), Math.abs(dr));
        if (!candidates.has(key) || distance === 1) candidates.set(key, next);
      }
    }
    const ordered = [...candidates.values()].sort((a, b) => {
      const da = Math.min(...own.map((c) => Math.abs(c.q - a.q) + Math.abs(c.r - a.r)));
      const db = Math.min(...own.map((c) => Math.abs(c.q - b.q) + Math.abs(c.r - b.r)));
      return da - db || unit(`${site.id}:${cellKey(a)}`) - unit(`${site.id}:${cellKey(b)}`);
    });
    for (let i = 0; i < Math.min(want, ordered.length); i += 1) {
      const cell = ordered[i];
      const key = cellKey(cell);
      used.add(key);
      const p = toScreen(cell);
      const r = unit(`${site.id}:${key}:j`);
      items.push({
        key: `g-${site.id}-${i}`,
        kind: style.growth[i % style.growth.length],
        x: p.x + (r - 0.5) * 16,
        y: p.y + (unit(`${key}:y`) - 0.5) * 8,
        scale: 0.95 + r * 0.15,
        flip: r > 0.5,
        ownerId: site.id,
      });
    }
  }

  // Wild land: roughly half the free cells carry a tree or two; boulders are rarer.
  for (const cell of ISLAND_CELLS) {
    const key = cellKey(cell);
    if (blocked.has(key) || used.has(key)) continue;
    const roll = unit(`${eraId}:${key}`);
    if (roll > 0.55) continue;
    // A cell with every neighbour on the island is inland; shore cells stay a little barer.
    const inland = neighborsOf(cell).every((n) => walkable.has(cellKey(n)));
    const count = inland && roll < 0.3 ? 2 : 1;
    const p = toScreen(cell);
    for (let i = 0; i < count; i += 1) {
      const jitter = unit(`${eraId}:${key}:${i}`);
      const kind = style.wild[Math.floor(unit(`${key}:${i}:k`) * style.wild.length)];
      items.push({
        key: `w-${key}-${i}`,
        kind,
        x: p.x + (i === 0 ? -1 : 1) * (count === 2 ? 14 : 0) + (jitter - 0.5) * 22,
        y: p.y + (unit(`${key}:${i}:y`) - 0.5) * (TILE_H * 0.45),
        scale: 0.8 + jitter * 0.4,
        flip: jitter > 0.5,
      });
    }
  }

  return items;
}
