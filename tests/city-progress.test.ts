import { describe, expect, it } from 'vitest';
import { findBuyableBuilding, findSavingGoal, pickInitialEra } from '@/city/progress';
import type { Building, Era } from '@/content/schema';

const eras: Era[] = [
  { id: 'a', order: 1, name: { en: 'A' }, speculative: false, palette: { primary: '#000', accent: '#111' }, unlockXp: 0 },
  { id: 'b', order: 2, name: { en: 'B' }, speculative: false, palette: { primary: '#000', accent: '#111' }, unlockXp: 100 },
  { id: 'c', order: 3, name: { en: 'C' }, speculative: false, palette: { primary: '#000', accent: '#111' }, unlockXp: 500 },
];

function building(id: string, era: string, maxLevel: number): Building {
  return {
    id,
    era,
    name: { en: id },
    requires: [],
    perk: { type: 'xpMultiplier', valuePerLevel: 0.01 },
    position: { x: 50, y: 50 },
    footprint: { w: 1, h: 1 },
    coins: 10,
    maxLevel,
    costGrowth: 1,
  };
}

const buildings = [building('a1', 'a', 2), building('b1', 'b', 1), building('c1', 'c', 1)];

describe('pickInitialEra', () => {
  it('opens on the first era while nothing is built', () => {
    expect(pickInitialEra(eras, buildings, {}, 0)?.id).toBe('a');
  });

  it('skips eras whose buildings are all maxed', () => {
    expect(pickInitialEra(eras, buildings, { a1: 2 }, 100)?.id).toBe('b');
  });

  it('never selects a locked era', () => {
    expect(pickInitialEra(eras, buildings, { a1: 2, b1: 1 }, 100)?.id).toBe('b');
  });

  it('falls back to the latest unlocked era when everything unlocked is maxed', () => {
    expect(pickInitialEra(eras, buildings, { a1: 2, b1: 1, c1: 1 }, 500)?.id).toBe('c');
  });

  it('comes back to an earlier era that still has an upgrade left', () => {
    expect(pickInitialEra(eras, buildings, { a1: 1, b1: 1 }, 500)?.id).toBe('a');
  });
});

describe('findBuyableBuilding', () => {
  const withReq = { ...building('a2', 'a', 1), requires: ['a1'] };
  const all = [...buildings, withReq];

  it('skips buildings of an era that is still locked', () => {
    expect(findBuyableBuilding(eras, [building('c1', 'c', 1)], {}, 100, 1000)).toBeUndefined();
  });

  it('skips a building whose requirement is not built yet', () => {
    expect(findBuyableBuilding(eras, [withReq], {}, 0, 1000)).toBeUndefined();
    expect(findBuyableBuilding(eras, [withReq], { a1: 1 }, 0, 1000)?.id).toBe('a2');
  });

  it('skips maxed and unaffordable buildings', () => {
    expect(findBuyableBuilding(eras, all, { a1: 2, a2: 1 }, 0, 1000)).toBeUndefined();
    expect(findBuyableBuilding(eras, all, {}, 0, 5)).toBeUndefined();
  });

  it('prefers the earliest era', () => {
    expect(findBuyableBuilding(eras, [...all].reverse(), { a1: 2, a2: 1 }, 500, 1000)?.id).toBe('b1');
  });
});

describe('findSavingGoal', () => {
  const priced = [
    { ...building('cheap', 'a', 2), coins: 40 },
    { ...building('dear', 'a', 1), coins: 90 },
    { ...building('locked-era', 'c', 1), coins: 20 },
    { ...building('needs-cheap', 'a', 1), coins: 30, requires: ['cheap'] },
  ];

  it('picks the cheapest open building the wallet cannot cover yet', () => {
    expect(findSavingGoal(eras, priced, {}, 0, 10)).toEqual({ building: priced[0], cost: 40 });
  });

  it('skips what is already affordable, locked behind XP, maxed or missing a requirement', () => {
    // 50 coins covers `cheap`; `needs-cheap` is still blocked; `locked-era` is in a closed era.
    expect(findSavingGoal(eras, priced, {}, 0, 50)?.building.id).toBe('dear');
    expect(findSavingGoal(eras, priced, { cheap: 2, dear: 1 }, 0, 0)?.building.id).toBe('needs-cheap');
  });

  it('prices the next level, not the first', () => {
    const growing = [{ ...building('g', 'a', 3), coins: 40, costGrowth: 2 }];
    expect(findSavingGoal(eras, growing, { g: 1 }, 0, 50)).toEqual({ building: growing[0], cost: 80 });
  });

  it('has nothing to suggest once everything open is affordable or built', () => {
    expect(findSavingGoal(eras, priced, {}, 0, 1_000)).toBeUndefined();
  });
});
