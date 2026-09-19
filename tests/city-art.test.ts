import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildingsFileSchema } from '@/content/schema';
import { BUILDING_PRICES } from '@/city/economy';
import type { AmbientEmitter, EraArt } from '@/components/city/scene/types';
import { ISLAND_CELLS } from '@/components/city/scene/island';
import { footprintCells, footprintsOverlap } from '@/components/city/scene/iso';
import tribeArt from '@/components/city/art/tribe';
import vikingArt from '@/components/city/art/viking';
import medievalArt from '@/components/city/art/medieval';
import empireArt from '@/components/city/art/empire';
import industrialArt from '@/components/city/art/industrial';
import modernArt from '@/components/city/art/modern';
import greenArt from '@/components/city/art/green';
import connectedArt from '@/components/city/art/connected';
import floatingArt from '@/components/city/art/floating';
import stellarArt from '@/components/city/art/stellar';

/**
 * Validates all ten eras' art against the content it must cover (CITY_VISUALS_TECH.md §5),
 * without pulling in the full content registry — the same trick `tests/perks.test.ts` uses,
 * since that registry eagerly globs every lesson file.
 */

const CITY = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'city');
const buildings = buildingsFileSchema.parse(
  JSON.parse(readFileSync(join(CITY, 'buildings.json'), 'utf-8')),
).buildings;

// Mirrors CITY_VISUALS_SCENE.md §2's grid constant — kept as a local literal (rather than an
// import from scene/**, which this agent does not own) so a footprint's world-space bounds
// can be checked without coupling to a module that may still be in flux.
const TILE_W = 96;

const VALID_EMITTERS: AmbientEmitter[] = [
  'smoke', 'birds', 'flag', 'rotor', 'beacon', 'aurora', 'snow', 'pollen', 'rain',
];

const ERAS: Array<{ id: string; art: EraArt }> = [
  { id: 'tribe', art: tribeArt },
  { id: 'viking', art: vikingArt },
  { id: 'medieval', art: medievalArt },
  { id: 'empire', art: empireArt },
  { id: 'industrial', art: industrialArt },
  { id: 'modern', art: modernArt },
  { id: 'green', art: greenArt },
  { id: 'connected', art: connectedArt },
  { id: 'floating', art: floatingArt },
  { id: 'stellar', art: stellarArt },
];

const islandKeys = new Set(ISLAND_CELLS.map((c) => `${c.q},${c.r}`));

const ERA_MODULE_IMPORT: Record<string, () => Promise<{ figures?: unknown }>> = {
  tribe: () => import('@/components/city/art/tribe'),
  viking: () => import('@/components/city/art/viking'),
  medieval: () => import('@/components/city/art/medieval'),
  empire: () => import('@/components/city/art/empire'),
  industrial: () => import('@/components/city/art/industrial'),
  modern: () => import('@/components/city/art/modern'),
  green: () => import('@/components/city/art/green'),
  connected: () => import('@/components/city/art/connected'),
  floating: () => import('@/components/city/art/floating'),
  stellar: () => import('@/components/city/art/stellar'),
};

describe('city building art', () => {
  for (const { id: eraId, art } of ERAS) {
    const eraBuildings = buildings.filter((b) => b.era === eraId);

    describe(eraId, () => {
      it('has art for every building in the era, and vice versa', () => {
        const contentIds = new Set(eraBuildings.map((b) => b.id));
        const artIds = new Set(Object.keys(art));
        expect(artIds).toEqual(contentIds);
      });

      it('gives every building exactly maxLevel level entries', () => {
        for (const building of eraBuildings) {
          const price = BUILDING_PRICES[building.id];
          expect(price, `no BUILDING_PRICES entry for ${building.id}`).toBeDefined();
          const entry = art[building.id];
          expect(entry, `no art for ${building.id}`).toBeDefined();
          expect(entry.levels.length, `${building.id} level count`).toBe(price.maxLevel);
        }
      });

      it('has exactly one 2x2 footprint — the era landmark', () => {
        const landmarks = Object.values(art).filter((b) => b.footprint.w === 2 && b.footprint.h === 2);
        expect(landmarks.length, `${eraId} 2x2 footprint count`).toBe(1);
      });

      it('declares only valid ambient emitters', () => {
        for (const [id, building] of Object.entries(art)) {
          for (const emitter of building.ambient ?? []) {
            expect(VALID_EMITTERS, `${id} declares unknown emitter ${emitter}`).toContain(emitter);
          }
        }
      });

      it('places every workSpot within its footprint\'s world-space bounds', () => {
        for (const [id, building] of Object.entries(art)) {
          if (!building.workSpot) continue;
          const maxHeight = Math.max(...building.levels.map((l) => l.height));
          const { dx, dy } = building.workSpot;
          // Generous bounds: a small margin either side of the footprint's plan width, and
          // between just below ground (a worker standing at the very front edge) and the
          // tallest level's height (a worker never stands above the roof).
          expect(dx, `${id} workSpot.dx`).toBeGreaterThanOrEqual(-10);
          expect(dx, `${id} workSpot.dx`).toBeLessThanOrEqual(building.footprint.w * TILE_W + 10);
          expect(dy, `${id} workSpot.dy`).toBeGreaterThanOrEqual(-10);
          expect(dy, `${id} workSpot.dy`).toBeLessThanOrEqual(maxHeight);
        }
      });

      it('every level has a positive height, drawn small enough to fit the size guide', () => {
        for (const [id, building] of Object.entries(art)) {
          for (const level of building.levels) {
            expect(level.height, `${id} level height`).toBeGreaterThan(0);
            // CITY_VISUALS_BUILDINGS.md §2's size guide ceiling: 1x1/2x1 up to 110, the one
            // 2x2 landmark up to 170.
            const ceiling = building.footprint.w === 2 && building.footprint.h === 2 ? 170 : 110;
            expect(level.height, `${id} level height vs size guide`).toBeLessThanOrEqual(ceiling);
          }
        }
      });

      it('exports figures for its citizens and workers', async () => {
        const mod = (await ERA_MODULE_IMPORT[eraId]()) as {
          figures?: { citizen: unknown; worker: unknown };
        };
        expect(mod.figures, `${eraId} exports figures`).toBeDefined();
        expect(typeof mod.figures?.citizen).toBe('function');
        expect(typeof mod.figures?.worker).toBe('function');
      });
    });
  }

  it('registers every era in the art registry', async () => {
    const { hasEraArt } = await import('@/components/city/art/registry');
    for (const { id } of ERAS) {
      expect(hasEraArt(id), `registry missing "${id}"`).toBe(true);
    }
  });

  describe('content grid placement (CITY_VISUALS_TECH.md §2/§5)', () => {
    it('gives every building a cell inside the island\'s walkable set', () => {
      for (const building of buildings) {
        expect(building.cell, `${building.id} has no cell`).toBeDefined();
        if (!building.cell) continue;
        for (const cell of footprintCells(building.cell, building.footprint)) {
          expect(islandKeys.has(`${cell.q},${cell.r}`), `${building.id} cell (${cell.q},${cell.r}) not walkable`).toBe(true);
        }
      }
    });

    it('has no two footprints overlapping within the same era', () => {
      const byEra = new Map<string, typeof buildings>();
      for (const b of buildings) {
        const list = byEra.get(b.era) ?? [];
        list.push(b);
        byEra.set(b.era, list);
      }
      for (const [eraId, list] of byEra) {
        for (let i = 0; i < list.length; i += 1) {
          for (let j = i + 1; j < list.length; j += 1) {
            const a = list[i];
            const b = list[j];
            if (!a.cell || !b.cell) continue;
            const overlap = footprintsOverlap(a.cell, a.footprint, b.cell, b.footprint);
            expect(overlap, `${eraId}: "${a.id}" overlaps "${b.id}"`).toBe(false);
          }
        }
      }
    });

    it('matches each building\'s content footprint to its art footprint', () => {
      const artByEra: Record<string, EraArt> = Object.fromEntries(ERAS.map((e) => [e.id, e.art]));
      for (const building of buildings) {
        const art = artByEra[building.era]?.[building.id];
        if (!art) continue; // parity is checked per-era above
        expect(building.footprint, `${building.id} footprint mismatch`).toEqual(art.footprint);
      }
    });
  });
});
