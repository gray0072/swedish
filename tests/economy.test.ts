import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildingsFileSchema, erasFileSchema } from '@/content/schema';
import {
  BUILDING_PRICES,
  CURRICULUM_PLAN,
  ERA_UNLOCK_XP,
  buildingCostAt,
  buildingTotalCost,
} from '@/city/economy';

// Read the two city files straight off disk rather than through the registry: the registry
// eagerly globs every lesson in the repo, and a second suite doing that in parallel with
// content.test.ts pushes Vite's transform past its timeout.
const CITY = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'city');
const readCity = (file: string) => JSON.parse(readFileSync(join(CITY, file), 'utf-8'));

const eras = erasFileSchema
  .parse(readCity('eras.json'))
  .eras.sort((a, b) => a.order - b.order)
  .map((era) => ({ ...era, unlockXp: ERA_UNLOCK_XP[era.id] }));
const buildings = buildingsFileSchema.parse(readCity('buildings.json')).buildings;

/**
 * These guard the shape of the curve documented at the top of src/city/economy.ts, so a
 * retune that accidentally makes an era unreachable — or the whole city affordable in a
 * week — fails here rather than in someone's save file.
 */
describe('city economy', () => {
  it('prices and unlocks every era and building the content defines', () => {
    for (const era of eras) {
      expect(ERA_UNLOCK_XP[era.id], `era ${era.id}`).toBeTypeOf('number');
    }
    for (const building of buildings) {
      expect(BUILDING_PRICES[building.id], `building ${building.id}`).toBeDefined();
    }
  });

  it('opens the ten eras in strictly ascending XP order', () => {
    expect(eras).toHaveLength(10);
    expect(eras[0].unlockXp).toBe(0);
    for (let i = 1; i < eras.length; i += 1) {
      expect(eras[i].unlockXp, `${eras[i].id} after ${eras[i - 1].id}`).toBeGreaterThan(
        eras[i - 1].unlockXp,
      );
    }
  });

  it('marks the four future eras as speculative and the six historical ones as not', () => {
    const speculative = eras.filter((e) => e.speculative);
    expect(speculative.map((e) => e.id)).toEqual(['green', 'connected', 'floating', 'stellar']);
    // They are the last four, so history is never interleaved with guesswork.
    expect(speculative.every((e) => e.order > 6)).toBe(true);
  });

  it('spreads the eras across the planned 400-lesson curriculum', () => {
    // ~150 XP for a first pass of an average lesson (see the economy module's header).
    const xpPerLesson = 150;
    const last = eras.at(-1)!;
    const modern = eras.find((e) => e.id === 'modern')!;

    // The last historical era should land around the middle of the curriculum, not in the
    // first weeks — the old 14 000 XP threshold was reached after roughly 100 lessons.
    const lessonsToModern = modern.unlockXp / xpPerLesson;
    expect(lessonsToModern).toBeGreaterThan(CURRICULUM_PLAN.lessons * 0.3);
    expect(lessonsToModern).toBeLessThan(CURRICULUM_PLAN.lessons * 0.5);

    // The last era sits just past a single full pass: reachable, but not by the syllabus alone.
    expect(last.unlockXp / xpPerLesson).toBeGreaterThan(CURRICULUM_PLAN.lessons);
    expect(last.unlockXp / xpPerLesson).toBeLessThan(CURRICULUM_PLAN.lessons * 1.5);
  });

  it('keeps the fully-upgraded city just out of reach of the last era', () => {
    const totalCost = buildings
      .map((b) => buildingTotalCost(BUILDING_PRICES[b.id]))
      .reduce((a, b) => a + b, 0);
    // Coins accumulate at roughly 0.6 x XP once coin perks and the review bonus are counted.
    const coinsByLastEra = eras.at(-1)!.unlockXp * 0.6;

    expect(totalCost).toBeGreaterThan(coinsByLastEra);
    expect(totalCost).toBeLessThan(coinsByLastEra * 1.6);
  });

  it('makes every era more expensive than the one before it', () => {
    const costByEra = new Map<string, number>();
    for (const b of buildings) {
      costByEra.set(b.era, (costByEra.get(b.era) ?? 0) + buildingTotalCost(BUILDING_PRICES[b.id]));
    }
    const ordered = eras.map((e) => costByEra.get(e.id) ?? 0);
    for (let i = 1; i < ordered.length; i += 1) {
      expect(ordered[i], `era ${eras[i].id}`).toBeGreaterThan(ordered[i - 1]);
    }
  });

  it('charges the base price for the first level and grows from there', () => {
    const price = { coins: 100, maxLevel: 3, costGrowth: 2 };
    expect(buildingCostAt(price, 0)).toBe(100);
    expect(buildingCostAt(price, 1)).toBe(200);
    expect(buildingCostAt(price, 2)).toBe(400);
    expect(buildingTotalCost(price)).toBe(700);
    expect(buildingTotalCost({ coins: 300, maxLevel: 1, costGrowth: 1 })).toBe(300);
  });
});
