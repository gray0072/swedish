# 18. Additional ideas worth building (proposals beyond the original scope)

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [18-ideas_ru.md](18-ideas_ru.md) and must be kept in sync.

These extend "many ways to learn with positive reinforcement". Ordered by value/effort.

1. **Daily challenge** — 5 mixed questions from everything the learner has seen, one attempt
   per day, generous coin reward. Strongest habit-forming mechanic available offline.
2. **Flashcard mode** — a swipe/keyboard deck per lesson, no scoring, pure exposure. Some days
   people don't want to be tested.
3. **Word of the day** — one card on Home, with audio and an example. Free coins for listening.
4. **Sentence workshop** — take known vocabulary and build sentences with the `order` type;
   teaches Swedish V2 word order, which is the real beginner wall.
5. **Listening dictation** — TTS reads a sentence, the learner types it. Very high value, and
   free thanks to `speechSynthesis`.
6. **Pronunciation practice** — Web Speech API *recognition* (`sv-SE`) scores the spoken word.
   Chrome-only; degrade gracefully. High delight factor.
7. **Mistake museum** — a page listing personal recurring errors ("you confuse `en`/`ett` on
   these 12 nouns"), each with a one-tap drill. Turns failure into a feature.
8. **Themed lesson packs tied to buildings** — building the Vasa shipyard unlocks a "Vasa ship"
   lesson (real vocabulary + culture). Makes the city feel meaningful rather than decorative.
9. **Swedish culture cards** — fika, allemansrätten, midsommar, lagom, jantelagen. Unlocked as
   era rewards; short, delightful, memorable.
10. **Activity heatmap** — a GitHub-style contribution grid on `/stats`. Cheap, very motivating.
11. **Achievement showcase** — badges displayed on the city map as monuments.
12. **Shareable result card** — render a canvas PNG of a perfect run for sharing. No backend needed.
13. **Seasonal events** — Lucia (13 Dec), Midsommar, Kanelbullens dag (4 Oct): limited-time
    lessons and city decorations. Cheap content, big retention.
14. **Local leaderboard vs. your past self** — "this week vs. last week". Avoids needing a server.
15. **Optional cloud sync (v2)** — GitHub Gist or Supabase, opt-in only, keeping v1 backend-free.

## Remaining open questions

All launch questions are answered in section 0. What is still open concerns v2 only:

- Custom domain via `CNAME` instead of the `/swedish/` sub-path — would change Vite `base`.
- Whether a Swedish interface locale is worth adding once the app is feature-complete.
- Whether opt-in cloud sync (idea 15) is worth the loss of the "zero backend" property.
