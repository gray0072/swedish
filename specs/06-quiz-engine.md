# 6. Quiz engine logic

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [06-quiz-engine_ru.md](06-quiz-engine_ru.md) and must be kept in sync.

## 6.1 Session creation

```
createSession(lessonId, opts) →
  pool = handwrittenItems ∪ generatedItems(vocab, generators)
  eligible = pool minus items shown in the immediately previous attempt
             (unless that would leave fewer than questionsPerRun items)
  weights:
     unseen item                     → 3.0
     answered wrong last time        → 2.5
     answered correct once           → 1.0
     answered correct 3+ times       → 0.4
     difficulty multiplier           → 0.9 / 1.0 / 1.15 for difficulty 1 / 2 / 3
  pick `questionsPerRun` items by weighted sampling without replacement
  shuffle choices inside each item using the session seed
```

- The **session seed** is `hash(lessonId + attemptNumber + Date)` and is stored with the
  session so a run can be replayed exactly (useful for bug reports and tests).
- The RNG is a deterministic `mulberry32` — no `Math.random()` in engine code, so tests are
  reproducible.
- Question type mix is balanced: never more than 40% of a run from a single generated type.

## 6.2 Running a session

State machine: `idle → question → feedback → (question | summary)`.

- Immediate feedback after each answer: correct/incorrect, correct answer, explanation, audio.
- A **"one free retry"** rule: the first wrong answer in a run may be retried once for half
  credit. This is positive reinforcement, not punishment.
- Progress bar with per-question dots; keyboard-first (`1`–`4`, `Enter`, `Esc`).
- The learner can quit anytime; partial progress is saved but no XP is awarded below the
  pass threshold.

## 6.3 Scoring

```
correctPoints    = 10 per fully correct answer
partialPoints    = 5 for a retry-correct or partially-correct answer
score            = correct + 0.5 * retryCorrect        // out of questionsPerRun
passed           = score >= passScore                   // default 7 of 10

xpAwarded  = lesson.xp.base * (score / total)
           * firstPassMultiplier        // 1.0 first pass, 0.3 for repeats
           * perfectBonus               // 1.25 if score == total
           * cityPerkXpMultiplier       // from owned buildings, e.g. 1.10
           * streakMultiplier           // 1.0 + min(streakDays, 10) * 0.02  → max 1.2

coinsAwarded = round(xpAwarded * 0.5) * cityPerkCoinMultiplier
```

Every constant in the formulas above (`0.3`, `1.25`, `0.02`, `0.5`, the daily cap) is exported
from `REWARDS` in `src/city/economy.ts` — the same module that owns building prices and era
thresholds, because they are two halves of one curve (§8.3).

**Anti-grinding:** repeats of an already-passed lesson give 30% XP, and a per-lesson daily cap
of 2 rewarded runs applies. Unrewarded runs still update SRS history — practice is always
allowed, just not farmable.

## 6.4 Spaced repetition

Every question item the learner has seen enters a global review deck, scheduled with a
Leitner-box scheduler (boxes 0–5 → intervals 0, 1, 3, 7, 16, 35 days).

- Correct → move up one box. Wrong → back to box 0.
- `/review` runs a mixed session of everything due today, across all lessons.
- Daily review completion grants a fixed coin bonus and protects the streak.
- The Home page shows "N items due today" as the primary call to action.
