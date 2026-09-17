/**
 * City economy — the single source of truth for every price, level cap, XP threshold and
 * reward multiplier in the game (SPEC §8). Content JSON describes *what* a building or era
 * is (name, perk, position, flavour); this file decides *what it costs and when it opens*,
 * so the whole curve can be retuned in one place without touching content.
 *
 * ## The budget it is tuned against
 *
 * The curriculum plan is 8 courses × 50 lessons = 400 lessons (CURRICULUM.md). With an
 * average `lesson.xp.base` of ~125 and the §6.3 formula, one first pass of a lesson is worth
 * roughly 150 XP once a typical score, a streak and a few city perks are folded in — so a
 * full first pass of the whole curriculum is on the order of 60 000 XP, and a learner who
 * also replays lessons ends up north of 75 000.
 *
 * Coins follow XP at half the rate, plus the coin perks and the daily review bonus, so
 * cumulative coin income lands around 0.6 × cumulative XP.
 *
 * Two consequences drive the numbers below:
 *
 * 1. **Era thresholds span all 400 lessons**, not the first quarter. The six historical eras
 *    cover roughly the first 150 lessons; the four speculative future eras cover the rest,
 *    and `stellar` deliberately sits just past a single full pass — the future is the part of
 *    the city you reach by coming back, not by finishing the syllabus once.
 * 2. **The fully-upgraded city costs ~62 000 coins**, a little more than a learner has earned
 *    by the time the last era opens. There is always something left to save for, and no era
 *    can be maxed out the moment it unlocks.
 */

// ---------------------------------------------------------------------------
// The curriculum this curve is balanced against
// ---------------------------------------------------------------------------

export const CURRICULUM_PLAN = {
  courses: 8,
  lessonsPerCourse: 50,
  lessons: 400,
  /** Average `lesson.xp.base` across authored lessons — the anchor for every threshold. */
  averageLessonBaseXp: 125,
} as const;

// ---------------------------------------------------------------------------
// Eras — XP thresholds (SPEC §8.2)
// ---------------------------------------------------------------------------

/**
 * XP at which each era opens. The comment on each line is the rough number of first passes
 * needed to get there at ~150 XP per lesson — that is what keeps ten eras spread across a
 * 400-lesson curriculum instead of bunching up into the first months.
 */
export const ERA_UNLOCK_XP: Record<string, number> = {
  tribe: 0, //           0 lessons
  viking: 1_200, //     ~8 lessons
  medieval: 3_800, //   ~25 lessons
  empire: 8_000, //     ~53 lessons
  industrial: 14_000, // ~93 lessons
  modern: 22_000, //    ~147 lessons
  green: 32_000, //     ~213 lessons
  connected: 44_000, // ~293 lessons
  floating: 58_000, //  ~387 lessons — roughly the whole curriculum, once
  stellar: 75_000, //   beyond a single pass: replays and reviews carry you here
};

// ---------------------------------------------------------------------------
// Buildings — prices and level caps (SPEC §8.3)
// ---------------------------------------------------------------------------

export interface BuildingPrice {
  /** Coin cost of the first level. */
  coins: number;
  /** How many times the building can be built or upgraded. */
  maxLevel: number;
  /** Cost of level n = round(coins * costGrowth^(n-1)). 1 for single-level buildings. */
  costGrowth: number;
}

/**
 * Price per building id, grouped by era. The number on each era heading is what it costs to
 * take every building in that era to its maximum level — that era's slice of the ~62 000
 * coin total described at the top of this file.
 */
export const BUILDING_PRICES: Record<string, BuildingPrice> = {
  // -- 1. tribe — 750 coins fully maxed -------------------------------------
  hut: { coins: 35, maxLevel: 3, costGrowth: 1.6 },
  campfire: { coins: 55, maxLevel: 3, costGrowth: 1.7 },
  'rock-carving': { coins: 100, maxLevel: 1, costGrowth: 1 },
  'stone-ship': { coins: 160, maxLevel: 1, costGrowth: 1 },

  // -- 2. viking — 2 620 ----------------------------------------------------
  longhouse: { coins: 170, maxLevel: 3, costGrowth: 1.6 },
  smithy: { coins: 150, maxLevel: 2, costGrowth: 1.6 },
  harbour: { coins: 210, maxLevel: 2, costGrowth: 1.7 },
  'trading-square': { coins: 180, maxLevel: 2, costGrowth: 1.7 },
  'rune-stone': { coins: 300, maxLevel: 1, costGrowth: 1 },

  // -- 3. medieval — 4 230 --------------------------------------------------
  'stortorget-market': { coins: 320, maxLevel: 3, costGrowth: 1.6 },
  'city-wall': { coins: 380, maxLevel: 2, costGrowth: 1.7 },
  storkyrkan: { coins: 700, maxLevel: 1, costGrowth: 1 },
  riddarholmen: { coins: 850, maxLevel: 1, costGrowth: 1 },

  // -- 4. empire — 5 230 ----------------------------------------------------
  shipyard: { coins: 900, maxLevel: 2, costGrowth: 1.7 },
  'vasa-ship': { coins: 1_300, maxLevel: 1, costGrowth: 1 },
  'royal-palace': { coins: 1_500, maxLevel: 1, costGrowth: 1 },

  // -- 5. industrial — 6 320 ------------------------------------------------
  'central-station': { coins: 1_100, maxLevel: 2, costGrowth: 1.7 },
  skansen: { coins: 1_500, maxLevel: 1, costGrowth: 1 },
  stadshuset: { coins: 1_850, maxLevel: 1, costGrowth: 1 },

  // -- 6. modern — 7 510 ----------------------------------------------------
  'metro-art-station': { coins: 1_300, maxLevel: 2, costGrowth: 1.7 },
  'avicii-arena': { coins: 1_900, maxLevel: 1, costGrowth: 1 },
  'abba-museum': { coins: 2_100, maxLevel: 1, costGrowth: 1 },

  // -- 7. green — 8 230 -----------------------------------------------------
  'wood-city': { coins: 600, maxLevel: 3, costGrowth: 1.55 },
  'vertical-farm': { coins: 700, maxLevel: 2, costGrowth: 1.6 },
  'electric-ferry': { coins: 900, maxLevel: 2, costGrowth: 1.6 },
  'climate-lab': { coins: 1_100, maxLevel: 1, costGrowth: 1 },

  // -- 8. connected — 8 840 -------------------------------------------------
  'sky-garden': { coins: 650, maxLevel: 3, costGrowth: 1.55 },
  'auto-metro': { coins: 650, maxLevel: 2, costGrowth: 1.6 },
  'data-harbour': { coins: 1_050, maxLevel: 2, costGrowth: 1.6 },
  'language-lab': { coins: 1_200, maxLevel: 1, costGrowth: 1 },

  // -- 9. floating — 9 210 --------------------------------------------------
  'floating-district': { coins: 700, maxLevel: 3, costGrowth: 1.55 },
  'sea-gate': { coins: 550, maxLevel: 2, costGrowth: 1.6 },
  'kelp-farm': { coins: 1_100, maxLevel: 2, costGrowth: 1.6 },
  'language-archive': { coins: 1_450, maxLevel: 1, costGrowth: 1 },

  // -- 10. stellar — 10 000 -------------------------------------------------
  'aurora-beacon': { coins: 700, maxLevel: 3, costGrowth: 1.5 },
  'nobel-station': { coins: 900, maxLevel: 2, costGrowth: 1.6 },
  'space-port': { coins: 1_050, maxLevel: 2, costGrowth: 1.6 },
  'space-school': { coins: 1_600, maxLevel: 1, costGrowth: 1 },
};

/** Coins needed to go from `currentLevel` to the next level. */
export function buildingCostAt(price: BuildingPrice, currentLevel: number): number {
  return Math.round(price.coins * Math.pow(price.costGrowth, currentLevel));
}

/** Coins to take a building from nothing to its maximum level — used to audit the curve. */
export function buildingTotalCost(price: BuildingPrice): number {
  let total = 0;
  for (let level = 0; level < price.maxLevel; level += 1) {
    total += buildingCostAt(price, level);
  }
  return total;
}

// ---------------------------------------------------------------------------
// Rewards (SPEC §6.3) — the income side of the same curve
// ---------------------------------------------------------------------------

export const REWARDS = {
  /** Coins awarded per XP earned in a quiz, before the city's coin perks. */
  coinsPerXp: 0.5,
  /** XP multiplier when re-passing an already-passed lesson — anti-grinding. */
  repeatXpMultiplier: 0.3,
  /** XP multiplier for a flawless run. */
  perfectBonus: 1.25,
  /** Each streak day adds this much XP, up to `streakBonusCapDays` days. */
  streakBonusPerDay: 0.02,
  streakBonusCapDays: 10,
  /** Rewarded runs per lesson per day; further runs still train SRS, just without pay. */
  dailyRewardedRunsPerLesson: 2,
  /** Coins for finishing a due-review session. */
  reviewSessionCoins: 20,
  /** Items in one review session, before `extraReviewSlots` perks widen it. */
  baseReviewSessionSize: 20,
  /** One-time coins for reading a history card (SPEC §12.4). */
  historyCardCoins: 40,
  /** One-time coins for reading a dialogue for the first time (DIALOGUES.md §3). */
  dialogueCoins: 40,
} as const;

export const STREAK = {
  /** A freeze is granted every N consecutive days. */
  freezeEveryDays: 7,
  /** Freezes never stack past this. */
  maxFreezes: 2,
} as const;
