# 8. Gamification — Building Stockholm

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [08-gamification_ru.md](08-gamification_ru.md) and must be kept in sync.

## 8.1 Currencies

- **XP** — never spent. Drives the learner level and unlocks eras. Pure progress metric.
- **Coins (kronor)** — spent on buildings. Earned from quizzes, reviews, streaks, achievements.
- **Streak** — consecutive active days. Grants an XP multiplier. A **streak freeze** (earned
  weekly, stored, max 2) auto-consumes on a missed day instead of resetting the streak.

## 8.2 Eras

The city advances through ten eras: **six historical, then four speculative**. An era unlocks
when the learner reaches its XP threshold **and** has built the required number of buildings in
the previous era.

| # | Era id | Name | Unlock XP | ≈ lessons | Theme |
|---|---|---|---|---|---|
| 1 | `tribe` | Bosättningen (The Settlement) | 0 | 0 | Huts, campfire, first tools |
| 2 | `viking` | Vikingatiden (~800–1050) | 1 200 | 8 | Birka, longhouse, harbour, rune stone |
| 3 | `medieval` | Medeltiden (from 1252) | 3 800 | 25 | Gamla Stan, Storkyrkan, city wall, Riddarholmen |
| 4 | `empire` | Stormaktstiden (1600s) | 8 000 | 53 | Vasa shipyard, Royal Palace, Riddarhuset |
| 5 | `industrial` | Industrialismen (1800s) | 14 000 | 93 | Central Station, Skansen, Stadshuset |
| 6 | `modern` | Moderna Stockholm | 22 000 | 147 | T-bana, Avicii Arena, Vasa Museum, ABBA Museum |
| 7 | `green` | Gröna staden (2030s) | 32 000 | 213 | Wood City, electric ferries, urban farming |
| 8 | `connected` | Uppkopplade staden (2050s) | 44 000 | 293 | Data harbour, driverless metro, roof gardens |
| 9 | `floating` | Flytande staden (2100s) | 58 000 | 387 | Floating quarters, sea gate, kelp farms |
| 10 | `stellar` | Stjärnstaden (beyond) | 75 000 | — | Spaceport, aurora beacon, the Nobel station |

**The thresholds live in `src/city/economy.ts`, not in `eras.json`** — see §8.3. The "≈ lessons"
column is how many first passes it takes to get there at ~150 XP per lesson, and is the reason
the curve runs to 75 000 rather than the 45 000 of the original six-era design: the curriculum
plan is 400 lessons across 8 courses, and the eras have to span all of them. The last era sits
just past a single full pass, so it is reached by coming back, not by finishing the syllabus once.

Each era has a distinct visual palette and material language; the shoreline underneath never
changes. Historical anchors, era cards and accuracy rules for eras 1–6 are in §12.3 — those six
are real history, not fantasy set dressing. Eras 7–10 are the opposite case and are governed by
§12.8: they are labelled speculation everywhere they appear.

## 8.3 Buildings — `content/city/buildings.json` + `src/city/economy.ts`

A building is described in two places, deliberately. **Content says what it is; code says what
it costs.** Every price, level cap and XP threshold lives in one module, `src/city/economy.ts`,
so the whole curve can be retuned without editing content — and so the balance can be reasoned
about (and tested) as a single table instead of being scattered across 38 JSON objects.

```jsonc
// content/city/buildings.json — identity, perk, prerequisites, map position
{
  "buildings": [
    {
      "id": "campfire",
      "era": "tribe",
      "name": { "sv": "Lägerelden", "ru": "Костёр", "en": "Campfire" },
      "description": { "ru": "Место, где племя собирается и учит новые слова." },
      "requires": [],
      "perk": { "type": "xpMultiplier", "valuePerLevel": 0.03 },
      "position": { "x": 42, "y": 61 },  // % coordinates on the city map
      "flavour": { "sv": "Elden brinner. Vi lär oss tillsammans." }
    },
    {
      "id": "rune-stone",
      "era": "viking",
      "name": { "sv": "Runstenen", "ru": "Рунный камень", "en": "Rune stone" },
      "requires": ["longhouse"],
      "perk": { "type": "extraReviewSlots", "valuePerLevel": 8 },
      "position": { "x": 70, "y": 45 }
    }
  ]
}
```

```ts
// src/city/economy.ts — the entire economy, in one file
export const ERA_UNLOCK_XP: Record<string, number> = { tribe: 0, viking: 1_200, /* … */ };

export const BUILDING_PRICES: Record<string, BuildingPrice> = {
  campfire:     { coins: 55,  maxLevel: 3, costGrowth: 1.7 },  // level n = round(coins * growth^(n-1))
  'rune-stone': { coins: 300, maxLevel: 1, costGrowth: 1 },
};

export const REWARDS = { coinsPerXp: 0.5, repeatXpMultiplier: 0.3, /* … §6.3 */ };
```

The loader joins the two and the app consumes the merged shape, so `building.cost`/`maxLevel`
behave exactly as before. **An id present in one file and missing from the other is a content
error** — caught by `npm run validate` and by `tests/content.test.ts`, never silently treated
as a free building or an era nobody can unlock.

The curve `BUILDING_PRICES` is tuned against: the fully-upgraded city costs ~62 000 coins, which
is around 1.4× what a learner has earned by the time the last era opens. Each era costs more to
complete than the one before it, and no era can be maxed out the moment it unlocks.
`tests/economy.test.ts` asserts those properties so a retune cannot quietly break them.

## 8.4 Perk types

Two rules govern this list:

1. **A perk is a number, never content.** Unlocking a history card or a lesson pack is a
   *content* relationship — an `unlockedBy` field on the content itself (§12.4) — so an unlock
   can never point at content that does not exist. `unlockLessonPack` used to be a perk; it was
   removed, because nine buildings advertised a lock icon that opened nothing.
2. **Every perk changes a number the learner can see, and the table below names where.** A
   perk that is totalled and never spent is worse than no perk: the card makes a promise the
   game quietly ignores. `tests/perks.test.ts` fails if a perk stops moving its total.

| Perk | Effect | Consumed by |
|---|---|---|
| `xpMultiplier` | +N% XP from every quiz | `computeRewards()` |
| `coinMultiplier` | +N% coins from every quiz | `computeRewards()` |
| `dailyIncome` | +N kr on the first visit each day | `claimDailyIncome()`, called once by `AppShell` |
| `extraReviewSlots` | +N cards in one review session | `ReviewPage` session cap |
| `reviewBonus` | +N kr for finishing a review session | `ReviewPage` payout |
| `streakFreeze` | +N freezes can be *stored* (the weekly grant stays at 1) | `applyStreak()` |
| `hintToken` | N free hints per quiz run | `QuizRunner` + `quiz/hints.ts` |
| `retryToken` | N extra second tries per run, at half credit | `QuizRunner` retry budget |

**Hints never answer the question, they narrow it** (`src/quiz/hints.ts`): a multiple-choice
question loses half its distractors but never the last one; a typed answer reveals its first
third; word order reveals the first token; matching reveals one pair. True/false has no hint at
all — crossing out one of two options *is* the answer — so the button is hidden rather than
taking a token for nothing.

**Streak freezes raise the ceiling, not the rate.** Scaling the weekly grant with the perk
would hand a fully-built city five freezes a week and make the streak unloseable; raising only
the stored cap makes the perk a deeper safety net that still has to be earned a week at a time.

Perks are computed by a pure selector `getActivePerks(buildingLevels) → PerkTotals` in
`src/city/perks.ts`, so the quiz engine, the review page and the store all read the same totals
without reaching into the city store directly.

## 8.5 The learning ↔ city loop

The connection must be **explicit and visible**:

- The result screen shows: `+180 XP · +90 kr` and, if a purchase is now affordable,
  "You can now build the Longhouse →".
- Every building's card names the perk as a full sentence in learning terms — "+12 cards in one
  review session", not a bare "+12" — with the perk's icon beside it. One module,
  `components/city/PerkDisplay.tsx`, owns that wording, so a building card and the bonus panel
  can never disagree about what a perk does.
- **The home screen and the city map both show the same two blocks**: current resources (XP,
  kronor, streak, stored freezes, today's daily income) and the city's active bonuses, each with
  an icon and a sentence. What you have and what the city is doing for you must never depend on
  which page you happen to be on.
- Buildings gate *bonus* content only — never core curriculum. Progress in the language must
  never be blocked by the game.
- Achievements bridge both: "Ordförråd 500" (500 words seen), "Sju dagar i rad" (7-day streak),
  "Stockholms grundare" (complete the medieval era).
