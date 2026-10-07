import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildingsFileSchema } from '@/content/schema';
import { BUILDING_PRICES } from '@/city/economy';
import { computeDecor, ERA_DECOR, growthCount } from '@/components/city/scene/decor';
import { buildPathGraph, ISLAND_HUB } from '@/components/city/scene/island';
import { cellKey, footprintCells, screenToCell } from '@/components/city/scene/iso';
import { LIGHT_THEMES } from '@/components/city/scene/themes';

const CITY = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'city');
const buildings = buildingsFileSchema.parse(JSON.parse(readFileSync(join(CITY, 'buildings.json'), 'utf-8'))).buildings;
const eraIds = [...new Set(buildings.map((b) => b.era))];

function sitesFor(eraId: string, level: (maxLevel: number) => number) {
  return buildings
    .filter((b) => b.era === eraId)
    .map((b) => {
      const maxLevel = BUILDING_PRICES[b.id].maxLevel;
      return { id: b.id, cell: b.cell!, footprint: b.footprint, level: level(maxLevel), maxLevel };
    });
}

function decorFor(eraId: string, level: (maxLevel: number) => number) {
  const sites = sitesFor(eraId, level);
  const graph = buildPathGraph(sites.filter((s) => s.level > 0).map((s) => s.cell));
  return { sites, graph, decor: computeDecor({ eraId, sites, graph }) };
}

describe('city decor', () => {
  it('has a decor style for every era', () => {
    for (const eraId of eraIds) expect(ERA_DECOR[eraId], eraId).toBeDefined();
  });

  it('gives every era a foliage and a path colour', () => {
    for (const eraId of eraIds) {
      expect(LIGHT_THEMES[eraId].ground.foliage, eraId).toMatch(/^#[0-9a-f]{6}$/i);
      expect(LIGHT_THEMES[eraId].ground.path, eraId).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('grows the town with every level, and once more at the top', () => {
    expect(growthCount(0, 3)).toBe(0);
    expect(growthCount(1, 3)).toBe(1);
    expect(growthCount(2, 3)).toBe(2);
    expect(growthCount(3, 3)).toBe(4);
    expect(growthCount(1, 1)).toBe(2);
  });

  it('is deterministic — the same save always draws the same island', () => {
    for (const eraId of eraIds) {
      expect(decorFor(eraId, (max) => max).decor).toEqual(decorFor(eraId, (max) => max).decor);
    }
  });

  it('never puts anything on a plot, the hub or a walkway', () => {
    for (const eraId of eraIds) {
      for (const level of [() => 0, (max: number) => max]) {
        const { sites, graph, decor } = decorFor(eraId, level);
        const blocked = new Set([cellKey(ISLAND_HUB)]);
        for (const s of sites) for (const c of footprintCells(s.cell, s.footprint)) blocked.add(cellKey(c));
        for (const [a, b] of graph.edges) {
          blocked.add(cellKey(a));
          blocked.add(cellKey(b));
        }
        for (const item of decor) {
          // Items are jittered inside their cell; snapping back must land on a free one.
          expect(blocked.has(cellKey(screenToCell(item)))).toBe(false);
        }
      }
    }
  });

  it('opens each era wooded, and builds a town as it is upgraded', () => {
    for (const eraId of eraIds) {
      const empty = decorFor(eraId, () => 0).decor;
      const full = decorFor(eraId, (max) => max);
      expect(empty.some((d) => !d.ownerId), `${eraId} has wild land`).toBe(true);
      expect(empty.some((d) => d.ownerId), `${eraId} grows nothing unbuilt`).toBe(false);
      const growth = full.decor.filter((d) => d.ownerId);
      const wanted = full.sites.reduce((sum, s) => sum + growthCount(s.level, s.maxLevel), 0);
      // The island may run out of room next to a building, but most of the town must fit.
      expect(growth.length, `${eraId} growth`).toBeGreaterThan(wanted * 0.6);
      for (const item of growth) expect(ERA_DECOR[eraId].growth).toContain(item.kind);
    }
  });
});
