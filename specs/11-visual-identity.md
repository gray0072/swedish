# 11. Visual identity — Swedish national style

> Part of the product spec — the table of contents is [SPEC.md](../SPEC.md).
> A Russian version lives in [11-visual-identity_ru.md](11-visual-identity_ru.md) and must be kept in sync.

## 11.1 Three layers, never mixed at random

| Layer | Where it lives | Character |
|---|---|---|
| **Nordic functionalism (funkis)** | The whole learning surface: lessons, quizzes, stats, settings | Light, calm, generous whitespace, honest materials, no ornament that doesn't earn its place. ~90% of the interface |
| **Swedish folk (Dalarna)** | Warmth and celebration: dividers, empty states, achievements, rewards | Falu red, kurbits florals, the Dala horse |
| **Viking age / rune stone** | The city, eras, badges | Younger Futhark, serpent bands, carved granite |

**The rule:** the learning surface is funkis. The city surface may be folk and Viking.
**Never decorate a quiz** — the learner is thinking, and ornament there is noise.

## 11.2 Palette

Defined as Tailwind tokens in `tailwind.config.ts`.

| Token | Hex | Use |
|---|---|---|
| `blue-flag` | `#006AA7` | Flag blue. Brand mark, links, national-day event. Never a large surface |
| `yellow-flag` | `#FECC00` | Flag yellow. Accent strokes only; never text on white (fails contrast) |
| `falu` | `#7C3228` | Falu rödfärg — the red of every Swedish cottage. Primary warm accent |
| `birch` | `#F6F2EA` | Light theme background — birch and paper, not pure white |
| `midnight` | `#0E2438` | Dark theme base — *polarnatt*, never pure black |
| `midnight-surface` | `#16324B` | Dark theme cards |
| `granite` | `#4A5259` | Secondary text, stone, borders |
| `pine` | `#2F4A3C` | Forest green — success states |
| `gold` | `#C8A24A` | Coins and rewards. Warmer and calmer than flag yellow |
| `lingon` | `#C0392B` | Errors — kept clearly distinct in hue and lightness from `falu` |
| `aurora` / `aurora-violet` | `#3FBF9F` / `#7B6CD9` | Northern-lights gradient. **Celebration only**, never chrome |

Contrast ≥ 4.5:1 in both themes. The flag colours are a garnish, not the base — a UI painted
in full blue and yellow reads as a sports kit, not as Swedish design.

## 11.3 Typography

- **Body / UI: Inter** (variable). Covers Latin, Cyrillic and `å ä ö`.
- **Display / era headings: Cormorant Garamond** — has Cyrillic, carries the historical register.
  One display face maximum.
- **Hard rule:** a font is disqualified unless it renders **both** `å ä ö` **and** Cyrillic.
  Test string: `Skärgård fjäll Öland — Шведский язык`.
- **Do not use Sweden Sans** — it is Sweden's official national typeface with a restricted
  licence, not free for third-party products.
- **Do not use "viking" or blackletter novelty fonts.** No Cyrillic, unreadable at UI sizes,
  and historically wrong — Norse writing was carved runes, not gothic script.
- Swedish words inside running text are set one weight heavier (semibold) so the target
  language always leads the eye.

## 11.4 Ornament and iconography

- **Dala horse (dalahäst)** — the app mascot and loading spinner. Flat silhouette, falu red,
  kurbits saddle. Originates from 17th-century woodcarving in Dalarna.
- **Kurbits** — Dalarna folk floral painting. Section dividers, achievement frames, empty states.
- **Eight-petal Nordic star** — bullet glyph, streak icon, divider.
- **Younger Futhark** (16 runes — the alphabet actually used in Viking-Age Sweden) — era 2
  ornament and achievement seals. **Never Elder Futhark, never Tolkien runes.**
- **Serpent band (ormslinga)** — the inscription band from Uppland rune stones, used as a
  frame around era headers.
- Icons: `lucide-react` as the base, plus hand-made SVGs for the Swedish specifics —
  dalahäst, kanelbulle, midsommarstång, the `T` of tunnelbanan.
- **No horned helmets. Ever.** They are a 19th-century opera costume invention. One of them
  in this app quietly discredits everything in section 12.

## 11.5 City illustration style

- Flat vector SVG, consistent 2 px stroke, limited palette per era, no photorealism.
- **Gradients:** the aurora celebration, plus exactly one two-stop vertical sky gradient and
  one water-depth gradient per era, both low contrast. Buildings, terrain and figures stay
  flat-filled. Nothing else in the app gets a gradient.
- A deliberate hand-carved irregularity — lines with a slight wobble, like a woodcut print.
- Isometric-lite: buildings face front with one small offset side plane. Keeps authoring cheap.
- Materials shift by era: hide and timber → wood and iron → brick and lime plaster →
  baroque stone → red brick, iron and glass → concrete, glass and light.
- **The map background is constant:** the Mälaren shoreline and the island of Stadsholmen.
  Water and rock never change; only what stands on them does. This is what makes the six eras
  read as one place across time.
- The plan for turning this backdrop into a living, animated scene — isometric grid, drawn
  buildings, inhabitants — is [CITY_VISUALS.md](CITY_VISUALS.md), which also lists the two
  narrow amendments it asks of this section and of §11.6.

## 11.6 Motion

- Calm by default: 150–200 ms, ease-out. The app should feel like it is made of paper and wood,
  not like a slot machine.
- Perfect run → an aurora sweep and gold coins, 1.2 s maximum.
- Building completed → the building "carves" itself in, stroke first, then fill.
- Streak milestone → a kurbits vine grows around the streak counter.
- **Ambient motion** is its own category: continuous low-amplitude loops that nobody
  triggered — water, smoke, citizens walking, a flag. It is what keeps the city from reading
  as a diagram. It is calm enough to ignore, capped by an explicit node budget, and it stops
  entirely when the scene is off-screen or the tab is in the background.
- Motion has a three-position setting (`full` / `calm` / `off`); `calm` keeps reactions and
  events but drops the ambient layer.
- Everything above is disabled under `prefers-reduced-motion`, which overrides that setting
  and is never overridable by it. Disabled means a composed still frame, not a paused one.

## 11.7 Sound

Short chimes, **synthesized with the Web Audio API** in `src/lib/sound.ts` — not audio files.
SPEC §2 rules out hosting audio assets, and a PWA that precaches every lesson JSON has no
business also carrying megabytes of mp3 for a handful of sounds. All of them respect the
`settings.sound` toggle and stay quiet (peak gain ≤ 0.11).

**The quiz speaks in A major, the city answers in D major.** A sound says which half of the app
it came from before the learner has read anything on screen.

| Moment | Sound |
|---|---|
| Correct answer, in a lesson quiz or a review | A rising fifth, ~250 ms |
| Lesson passed | An A major arpeggio landing on a held top note |
| Lesson passed with a perfect run | The same, plus one note above it — the audible twin of the aurora sweep |
| Lesson ended without a pass, review deck cleared | An open fifth: warm, unresolved, no verdict |
| **New building constructed** | A low strike, then a D major chord blooming upward — heavier and slower than anything in the quiz, because this is the one moment where something becomes permanent |
| **Building upgraded a level** | The same D major, three quick steps up: short and light, because upgrades get bought in runs |

A purchase that fails — the coins ran out between render and click, or the building is already
at its maximum — makes no sound at all. A sound is a receipt, not a button click.

**There is deliberately no sound for a wrong answer.** A wrong answer only means the item comes
back sooner (§6.4); scoring it with a buzzer would contradict the whole tone of the app. For the
same reason the not-passed chime never falls in pitch — a descending phrase is what a buzzer
sounds like.

## 11.8 Voice

- Feedback micro-copy is **in Swedish**: `Bra jobbat!` `Nästan!` `Perfekt!` `Heja!`
  `Lycka till!` `Vi ses!` — with a translation shown on first encounter and on hover.
- Tone is **lagom**: warm, understated, confident. No `AMAZING!!!`, no exclamation storms,
  no manipulative urgency. Swedish design does not shout, and neither does this app.
