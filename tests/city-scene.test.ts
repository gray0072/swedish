import { describe, expect, it } from 'vitest';
import {
  cellKey,
  compareDepth,
  depthOf,
  footprintCells,
  footprintsOverlap,
  screenToCell,
  toScreen,
} from '@/components/city/scene/iso';
import { ISLAND_CELLS, ISLAND_HUB, isWalkable, neighborsOf, pathToHub } from '@/components/city/scene/island';
import { assignCells, hasOverlaps } from '@/components/city/scene/placement';
import { LIGHT_THEMES, DARK_THEMES } from '@/components/city/scene/themes';

describe('iso: toScreen / screenToCell round-trip', () => {
  it('recovers the original cell for every walkable cell', () => {
    for (const cell of ISLAND_CELLS) {
      const screen = toScreen(cell);
      expect(screenToCell(screen)).toEqual(cell);
    }
  });

  it('places the origin cell at ORIGIN', () => {
    expect(toScreen({ q: 0, r: 0 })).toEqual({ x: 600, y: 300 });
  });
});

describe('iso: depthOf / compareDepth', () => {
  it('increases with q + r', () => {
    expect(depthOf({ q: 2, r: 3 })).toBe(5);
    expect(depthOf({ q: -1, r: -1 })).toBe(-2);
  });

  it('sorts back cells before front cells', () => {
    const cells = [{ q: 3, r: 2 }, { q: -2, r: -1 }, { q: 0, r: 0 }];
    const sorted = [...cells].sort(compareDepth);
    expect(sorted.map(depthOf)).toEqual([-3, 0, 5]);
  });

  it('breaks depth ties by q', () => {
    const cells = [{ q: 2, r: -2 }, { q: -1, r: 1 }, { q: 0, r: 0 }];
    const sorted = [...cells].sort(compareDepth);
    expect(sorted.map((c) => c.q)).toEqual([-1, 0, 2]);
  });
});

describe('iso: footprint maths', () => {
  it('lists every cell a multi-cell footprint occupies', () => {
    const cells = footprintCells({ q: 0, r: 0 }, { w: 2, h: 2 });
    expect(cells).toEqual([
      { q: 0, r: 0 },
      { q: 0, r: 1 },
      { q: 1, r: 0 },
      { q: 1, r: 1 },
    ]);
  });

  it('detects overlap between two footprints', () => {
    expect(footprintsOverlap({ q: 0, r: 0 }, { w: 2, h: 1 }, { q: 1, r: 0 }, { w: 1, h: 1 })).toBe(true);
  });

  it('does not flag adjacent, non-overlapping footprints', () => {
    expect(footprintsOverlap({ q: 0, r: 0 }, { w: 1, h: 1 }, { q: 1, r: 0 }, { w: 1, h: 1 })).toBe(false);
  });
});

describe('island: the walkable cell set', () => {
  it('is non-empty and every cell round-trips through cellKey', () => {
    expect(ISLAND_CELLS.length).toBeGreaterThan(0);
    for (const cell of ISLAND_CELLS) {
      expect(isWalkable(cell)).toBe(true);
    }
    const keys = new Set(ISLAND_CELLS.map(cellKey));
    expect(keys.size).toBe(ISLAND_CELLS.length); // no duplicate cells
  });

  it('is one connected region (a learner can always path to any plot)', () => {
    const start = ISLAND_CELLS[0];
    const seen = new Set([cellKey(start)]);
    const queue = [start];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const next of neighborsOf(current)) {
        if (!isWalkable(next) || seen.has(cellKey(next))) continue;
        seen.add(cellKey(next));
        queue.push(next);
      }
    }
    expect(seen.size).toBe(ISLAND_CELLS.length);
  });

  it('is stable across repeated reads (deterministic, not regenerated per call)', () => {
    const a = ISLAND_CELLS.map(cellKey).sort();
    const b = ISLAND_CELLS.map(cellKey).sort();
    expect(a).toEqual(b);
  });
});

describe('island: the path graph', () => {
  it('roots every walkable cell back at the hub with no cycles', () => {
    for (const cell of ISLAND_CELLS) {
      const chain = pathToHub(cell);
      expect(chain[0]).toEqual(ISLAND_HUB);
      expect(chain[chain.length - 1]).toEqual(cell);
      // Every consecutive pair in the chain must be grid-adjacent.
      for (let i = 0; i < chain.length - 1; i += 1) {
        const a = chain[i];
        const b = chain[i + 1];
        const manhattan = Math.abs(a.q - b.q) + Math.abs(a.r - b.r);
        expect(manhattan).toBe(1);
      }
    }
  });
});

describe('placement: percentage position -> nearest free cell', () => {
  const items = [
    { id: 'a', position: { x: 20, y: 70 } },
    { id: 'b', position: { x: 42, y: 61 } },
    { id: 'c', position: { x: 65, y: 75 } },
    { id: 'd', position: { x: 30, y: 40 } },
  ];

  it('stays inside the walkable island for every assigned cell', () => {
    const placements = assignCells(items);
    for (const placement of placements.values()) {
      expect(isWalkable(placement.cell)).toBe(true);
    }
  });

  it('is deterministic: the same input always yields the same layout', () => {
    const first = assignCells(items);
    const second = assignCells(items);
    for (const item of items) {
      expect(second.get(item.id)!.cell).toEqual(first.get(item.id)!.cell);
    }
  });

  it('never overlaps two buildings on the same cell', () => {
    const placements = assignCells(items);
    expect(hasOverlaps(placements)).toBe(false);
  });

  it('respects a pre-authored cell when one is given and free', () => {
    const withCell = [...items, { id: 'e', position: { x: 50, y: 50 }, cell: { q: 3, r: 3 } }];
    const placements = assignCells(withCell);
    expect(placements.get('e')!.cell).toEqual({ q: 3, r: 3 });
  });

  it('falls back to the projection when a requested cell is already taken', () => {
    const clashing = [
      { id: 'a', position: { x: 20, y: 70 }, cell: { q: 1, r: 1 } },
      { id: 'b', position: { x: 20, y: 70 }, cell: { q: 1, r: 1 } },
    ];
    const placements = assignCells(clashing);
    expect(placements.get('a')!.cell).toEqual({ q: 1, r: 1 });
    expect(placements.get('b')!.cell).not.toEqual({ q: 1, r: 1 });
    expect(hasOverlaps(placements)).toBe(false);
  });

  it('spreads every real building from content/city/buildings.json without overlap', async () => {
    // A light integration check against real content — but era by era, the way `Scene.tsx`
    // actually calls it: the map only ever shows one era, and the ten eras' footprints add
    // up to more cells than the island has, so placing them all at once could never succeed.
    const content = await import('../content/city/buildings.json');
    const buildings = (
      content as {
        default: {
          buildings: {
            id: string;
            era: string;
            position: { x: number; y: number };
            cell?: { q: number; r: number };
            footprint?: { w: number; h: number };
          }[];
        };
      }
    ).default.buildings;

    const eras = [...new Set(buildings.map((b) => b.era))];
    expect(eras.length).toBeGreaterThan(0);
    for (const era of eras) {
      const inEra = buildings.filter((b) => b.era === era);
      const placements = assignCells(inEra);
      expect(placements.size).toBe(inEra.length);
      expect(hasOverlaps(placements)).toBe(false);
    }
  });
});

describe('themes: every era has both variants with hex-literal tokens', () => {
  const hex = /^#[0-9a-fA-F]{3,8}$/;

  it.each(Object.keys(LIGHT_THEMES))('era "%s" has a well-formed light and dark theme', (eraId) => {
    const light = LIGHT_THEMES[eraId];
    const dark = DARK_THEMES[eraId];
    expect(light).toBeDefined();
    expect(dark).toBeDefined();
    expect(light.time).toBe(dark.time);

    const tokens = [
      ...light.sky,
      light.water.base,
      light.water.deep,
      light.water.wave,
      light.water.foam,
      light.ground.top,
      light.ground.cliff,
      light.ground.wet,
      light.horizon,
      light.material.wall,
      light.material.wallSide,
      light.material.roof,
      light.material.roofSide,
      light.material.timber,
      light.material.trim,
      light.material.glass,
      light.material.glassLit,
    ];
    for (const token of tokens) {
      expect(token).toMatch(hex);
    }
  });
});
