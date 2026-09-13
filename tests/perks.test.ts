import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildingsFileSchema, type Perk, type PerkType } from '@/content/schema';
import { BUILDING_PRICES } from '@/city/economy';
import { NO_PERKS, type PerkTotals } from '@/city/perks';
import { buildHint, hasHint } from '@/quiz/hints';

const CITY = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'city');
const buildings = buildingsFileSchema.parse(
  JSON.parse(readFileSync(join(CITY, 'buildings.json'), 'utf-8')),
).buildings;

/**
 * Applies one perk in isolation, without going through the content registry (which would
 * eagerly glob every lesson in the repo). Mirrors getActivePerks' switch.
 */
function totalsFor(perk: Perk, level = 1): PerkTotals {
  const t: PerkTotals = { ...NO_PERKS };
  switch (perk.type) {
    case 'xpMultiplier': t.xpMultiplier += perk.valuePerLevel * level; break;
    case 'coinMultiplier': t.coinMultiplier += perk.valuePerLevel * level; break;
    case 'dailyIncome': t.dailyIncome += perk.valuePerLevel * level; break;
    case 'extraReviewSlots': t.extraReviewSlots += perk.valuePerLevel * level; break;
    case 'reviewBonus': t.reviewBonus += perk.valuePerLevel * level; break;
    case 'streakFreeze': t.streakFreeze += perk.valuePerLevel * level; break;
    case 'hintToken': t.hintTokens += perk.valuePerLevel * level; break;
    case 'retryToken': t.retryTokens += perk.valuePerLevel * level; break;
    case 'cosmetic': break;
  }
  return t;
}

/** Perk totals for a city with every building at its maximum level. */
function fullyBuiltTotals(): PerkTotals {
  const total: PerkTotals = { ...NO_PERKS };
  for (const b of buildings) {
    const levels = BUILDING_PRICES[b.id]?.maxLevel ?? 1;
    const one = totalsFor(b.perk, levels);
    total.xpMultiplier += one.xpMultiplier - 1;
    total.coinMultiplier += one.coinMultiplier - 1;
    total.dailyIncome += one.dailyIncome;
    total.extraReviewSlots += one.extraReviewSlots;
    total.reviewBonus += one.reviewBonus;
    total.streakFreeze += one.streakFreeze;
    total.hintTokens += one.hintTokens;
    total.retryTokens += one.retryTokens;
  }
  return total;
}

describe('perks', () => {
  it('gives every perk a visible effect — no perk is computed and then ignored', () => {
    // The failure this guards against: a building advertises a bonus, getActivePerks dutifully
    // totals it, and nothing in the app ever reads that total. `cosmetic` is the one perk
    // allowed to change nothing, because "decoration" is the whole promise.
    const used = new Set<PerkType>(buildings.map((b) => b.perk.type));
    for (const type of used) {
      if (type === 'cosmetic') continue;
      const sample = buildings.find((b) => b.perk.type === type)!.perk;
      expect(totalsFor(sample), `perk ${type} moved nothing`).not.toEqual(NO_PERKS);
    }
  });

  it('never lets a building promise a bonus worth nothing', () => {
    for (const b of buildings) {
      if (b.perk.type === 'cosmetic') continue;
      expect(b.perk.valuePerLevel, `building ${b.id}`).toBeGreaterThan(0);
    }
  });

  it('keeps a fully-built city strong but not absurd', () => {
    const t = fullyBuiltTotals();
    // Upper bounds, not targets: past these the game stops being a language app.
    expect(t.xpMultiplier).toBeGreaterThan(1.5);
    expect(t.xpMultiplier).toBeLessThanOrEqual(2.5);
    expect(t.coinMultiplier).toBeLessThanOrEqual(2.5);
    expect(t.dailyIncome).toBeLessThanOrEqual(300);
    expect(t.reviewBonus).toBeLessThanOrEqual(100);
    // A 10-question run must never be mostly hints, and retries must not make failing
    // impossible — both would break the scoring in §6.3 rather than support it.
    expect(t.hintTokens).toBeLessThanOrEqual(5);
    expect(t.retryTokens).toBeLessThanOrEqual(5);
    expect(t.streakFreeze).toBeLessThanOrEqual(5);
  });

  it('spreads the perks around instead of piling them on one era', () => {
    const byType = new Map<PerkType, number>();
    for (const b of buildings) byType.set(b.perk.type, (byType.get(b.perk.type) ?? 0) + 1);
    // Every perk type the schema offers should be earned somewhere in the city.
    for (const type of [
      'xpMultiplier', 'coinMultiplier', 'dailyIncome', 'extraReviewSlots',
      'reviewBonus', 'streakFreeze', 'hintToken', 'retryToken', 'cosmetic',
    ] as PerkType[]) {
      expect(byType.get(type) ?? 0, `no building grants ${type}`).toBeGreaterThan(0);
    }
  });
});

describe('quiz hints', () => {
  const mc = {
    id: 'q1', type: 'mc' as const, difficulty: 1 as const, tags: [], generated: false,
    prompt: { en: 'p' }, choices: ['a', 'b', 'c', 'd'], answer: 2,
  };

  it('crosses out wrong choices but never leaves only the answer', () => {
    const hint = buildHint(mc)!;
    expect(hint.eliminated).not.toContain(mc.answer);
    expect(hint.eliminated.length).toBeGreaterThan(0);
    expect(hint.eliminated.length).toBeLessThan(mc.choices.length - 1);
  });

  it('leaves a two-choice question with one distractor standing', () => {
    const hint = buildHint({ ...mc, choices: ['a', 'b'], answer: 0 })!;
    expect(hint.eliminated).toEqual([]);
  });

  it('reveals only the start of a typed answer', () => {
    const hint = buildHint({
      id: 'q2', type: 'type-answer', difficulty: 1, tags: [], generated: false,
      prompt: { en: 'p' }, answer: ['förlåt'],
    })!;
    expect(hint.messageKey).toBe('quiz.hint.startsWith');
    expect('förlåt'.startsWith(hint.messageValue)).toBe(true);
    expect(hint.messageValue.length).toBeLessThan('förlåt'.length);
  });

  it('offers no hint for true/false, where a hint would be the answer', () => {
    const tf = {
      id: 'q3', type: 'true-false' as const, difficulty: 1 as const, tags: [],
      generated: false, prompt: { en: 'p' }, answer: true,
    };
    expect(hasHint(tf)).toBe(false);
    expect(buildHint(tf)).toBeNull();
  });
});
