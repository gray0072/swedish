# 9. Routing (HashRouter)

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [09-routing_ru.md](09-routing_ru.md) and must be kept in sync.

| Path | Page |
|---|---|
| `/` | Home: due reviews, streak, continue-learning card, city snapshot |
| `/tracks` | Both tracks (SFI / SVA grundläggande) |
| `/tracks/:trackId/:levelId` | Lesson list for a level, with progress rings |
| `/lesson/:levelId/:slug` | Theory + vocabulary + "Take the test" |
| `/lesson/:levelId/:slug/quiz` | Quiz runner |
| `/lesson/:levelId/:slug/result` | Result + rewards + next step |
| `/review` | Global SRS session |
| `/city` | Stockholm map, shop, era timeline |
| `/reference/summaries` and `/reference/summaries/:slug` | Language summaries |
| `/reference/words` | Word bank — every vocabulary item, in all its forms |
| `/reference/dialogues` and `/reference/dialogues/:slug` | Everyday dialogues |
| `/stats` | Charts: words learned, accuracy, activity heatmap |
| `/settings` | Language, theme, TTS, export/import, reset |
