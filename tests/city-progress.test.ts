import { describe, expect, it } from 'vitest';
import { pickInitialEra } from '@/city/progress';
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
    perk: { type: 'cosmetic' },
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
