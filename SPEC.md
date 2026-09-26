# Swedish Learning App — Implementation Brief

> This is the table of contents of the product spec, the single source of truth for building
> the app. Each section lives in its own file under [specs/](specs/). A Russian version lives
> in [SPEC_ru.md](SPEC_ru.md); both the index and the sections must be kept in sync.

## Contents

- [0. Locked decisions](specs/00-locked-decisions.md)
- [1. Vision](specs/01-vision.md)
- [2. Goals and non-goals](specs/02-goals.md)
  - Goals
  - Non-goals (for v1)
- [3. Tech stack](specs/03-tech-stack.md)
- [4. Repository structure](specs/04-repository-structure.md)
  - One lesson, one level — with playlists on top
  - Reference material is not a course
- [5. Content data model](specs/05-content-model.md)
  - 5.1 Tracks and levels — `content/tracks.json`
  - 5.2 Lesson metadata — `content/lessons/<level>/<slug>/lesson.json`
  - 5.3 Theory — `theory.md`
  - 5.4 Vocabulary — `vocab.json`
  - 5.5 Questions — `questions.json`
  - 5.6 Question types (v1)
  - 5.7 Distractor generation
- [6. Quiz engine logic](specs/06-quiz-engine.md)
  - 6.1 Session creation
  - 6.2 Running a session
  - 6.3 Scoring
  - 6.4 Spaced repetition
- [7. Progress, persistence and the save file](specs/07-progress-and-sync.md)
  - 7.1 Optional cloud sync — Supabase
- [8. Gamification — Building Stockholm](specs/08-gamification.md)
  - 8.1 Currencies
  - 8.2 Eras
  - 8.3 Buildings — `content/city/buildings.json` + `src/city/economy.ts`
  - 8.4 Perk types
  - 8.5 The learning ↔ city loop
  - 8.6 Achievements
- [9. Routing (HashRouter)](specs/09-routing.md)
- [10. UI/UX requirements](specs/10-ui-ux.md)
- [11. Visual identity — Swedish national style](specs/11-visual-identity.md)
  - 11.1 Three layers, never mixed at random
  - 11.2 Palette
  - 11.3 Typography
  - 11.4 Ornament and iconography
  - 11.5 City illustration style
  - 11.6 Motion
  - 11.7 Sound
  - 11.8 Voice
- [12. Historical theme — Vikings and the story of Sweden and Stockholm](specs/12-history.md)
  - 12.1 Why history carries the game
  - 12.2 Honest framing
  - 12.3 Era anchors (verified facts, used in era cards and content)
  - 12.4 History cards — `content/history/`
  - 12.5 Themed lesson packs unlocked by buildings
  - 12.6 Historical accuracy rules
  - 12.7 Seasonal skins tied to the real calendar
  - 12.8 The four future eras are speculation, and say so
- [13. Local development](specs/13-local-development.md)
- [14. Deployment to GitHub Pages](specs/14-deployment.md)
- [15. Content authoring workflow](specs/15-content-authoring.md)
- [16. Implementation phases](specs/16-phases.md)
- [17. Acceptance criteria for v1](specs/17-acceptance-criteria.md)
- [18. Additional ideas worth building (proposals beyond the original scope)](specs/18-ideas.md)
  - Remaining open questions

## Other planning documents

- [CURRICULUM.md](specs/CURRICULUM.md) — the lesson-topic plan for every level.
- [REFERENCE.md](specs/REFERENCE.md) and [DIALOGUES.md](specs/DIALOGUES.md) — plans for the reference section and the dialogues.
- [CITY_VISUALS.md](specs/CITY_VISUALS.md) — how the city scene is built: grid, buildings, motion, life.
