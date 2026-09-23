# 17. Acceptance criteria for v1

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [17-acceptance-criteria_ru.md](17-acceptance-criteria_ru.md) and must be kept in sync.

- [ ] `npm run dev` works on a clean clone with no configuration.
- [ ] The site is live on GitHub Pages and every route works after a hard refresh.
- [ ] At least 15 lessons exist, each with a pool of ≥ 100 effective questions.
- [ ] A quiz run of 10 questions never repeats an item within the run.
- [ ] Two consecutive runs of the same lesson share no questions (when the pool allows).
- [ ] XP, coins, streak and SRS state survive a page reload and a browser restart.
- [ ] Export produces a JSON file that Import fully restores on another browser.
- [ ] At least 12 buildings across the first three eras are purchasable, with working perks.
- [ ] Perks measurably change reward numbers on the result screen.
- [ ] Full keyboard operation of a quiz, verified manually.
- [ ] The header `RU / EN` toggle switches the interface and all translations instantly,
      survives a reload, and no screen shows an untranslated string in either language.
- [ ] No lesson exceeds 5 minutes; every multi-part series is grouped correctly in the list.
- [ ] Content validation catches a deliberately broken lesson in CI (including an
      over-length lesson and a missing `en` translation).
- [ ] Unit tests cover selection weighting, grading of every question type, scoring maths,
      and the SRS scheduler.
- [ ] The §11 palette and fonts are the only ones in use — no stray default Tailwind colours,
      and every font renders `å ä ö` and Cyrillic.
- [ ] The quiz screen carries no ornament; the city screen does.
- [ ] At least 10 history cards exist, each with a date and a `sources` entry.
- [ ] Key vocabulary from a read history card appears in a later review session.
- [ ] No horned helmets, no Elder Futhark, and the word "founded" does not appear next to 1252.
