# Dialogues — everyday Swedish, in scenes

A programme document, like [CURRICULUM.md](CURRICULUM.md), for the third surface of the
reference section described in [REFERENCE.md](REFERENCE.md) §2. It lists the scenes to write,
the format they are written in, and the rules that keep them worth reading. A Russian
translation lives in [DIALOGUES_ru.md](DIALOGUES_ru.md) and must be kept in sync
([AGENTS.md](AGENTS.md)).

## 1. Why a dialogue is not a lesson

A lesson teaches one point in five minutes and then tests it. That works, and it produces a
learner who knows `tvättstuga` and has never heard anybody say *"Jag har bokat tiden sju till
nio, men maskinen står och går fortfarande."*

A dialogue is the other half: **language as it is actually used between two people**, with the
hesitations, the ellipsis, the politeness formulas and the small talk that no vocabulary list
contains. It is where a learner finds out that Swedes say `Hur går det?` rather than `Hur mår
du?` to a colleague, that `Det är lugnt` means "no problem", and that half of spoken Swedish
is `ju`, `väl`, `nog` and `faktiskt`.

So dialogues are **not** graded, not gated and not part of any level's requirement. They are
read, listened to, and optionally acted out.

## 2. Content type — `content/dialogues/<slug>.json`

A new lightweight type, modelled on history cards (SPEC §12.4): no quiz, no pass score, no XP
gate.

```jsonc
{
  "id": "laundry-room",
  "title": { "sv": "I tvättstugan", "en": "In the laundry room", "ru": "В прачечной" },
  "setting": {
    "en": "Eva's booked time has started but the machine is still running.",
    "ru": "Время Евы началось, но машина всё ещё работает."
  },
  "level": "sfi-c",                     // the level whose vocabulary it roughly matches — a
                                        // hint for the list, never a gate
  "tags": ["housing", "conflict", "smaprat"],
  "roles": [
    { "id": "A", "name": "Eva" },
    { "id": "B", "name": "Marek" }
  ],
  "lines": [
    {
      "role": "A",
      "sv": "Hej! Förlåt, men jag tror att min tid börjar nu, klockan sju.",
      "en": "Hi! Sorry, but I think my time starts now, at seven.",
      "ru": "Привет! Извини, но кажется, моё время начинается сейчас, в семь.",
      "note": { "en": "\"Förlåt, men…\" is how a Swede opens a complaint: apologise first." }
    },
    { "role": "B", "sv": "Oj, förlåt! Jag missade tiden helt. Jag tar ut den direkt." }
  ],
  "keyPhrases": ["boka en tid", "tvättstugan", "det är upptaget", "jag tar ut den direkt"],
  "culture": {
    "en": "The laundry room is the most regulated room in Swedish housing…",
    "ru": "Прачечная — самое зарегулированное помещение в шведском доме…"
  }
}
```

`ru` and `en` are required on every line and on `setting`; `note` and `culture` are optional.
Validation checks that every `role` used by a line is declared, and that `keyPhrases` are
strings that actually occur in the dialogue.

## 3. How it behaves in the app

| Mode | What it does |
|---|---|
| **Read** | Swedish on the left, the chosen translation beside it, roles coloured. The default. |
| **Hide translations** | One toggle blanks the translation column. The same page, re-read as a test of yourself. |
| **Listen** | TTS plays the whole scene, alternating voice or rate per role, so it is a conversation and not a list. Falls back gracefully with no `sv-SE` voice, exactly as `listen` questions do. |
| **Role-play** | Pick a role; your lines are blanked and revealed one at a time. No scoring, no input — the point is to say it out loud. |

`keyPhrases` **enter the SRS deck**, the same bridge history cards already use (SPEC §12.4):
the dialogue read for fun quietly becomes review material. Reading a dialogue for the first
time pays a small one-time coin reward, again like a history card. That is the whole of its
connection to the game — no XP, no pass, no streak.

## 4. Writing rules

1. **8–16 lines.** Long enough to have a turn and a resolution, short enough to read on a bus.
2. **Spoken Swedish, not textbook Swedish.** `Vi ses!`, `Det är lugnt`, `Hur går det?`,
   `Kan du ta…?` — and the reductions people actually say (`dom` for *de* and *dem*, `nånting`
   for *någonting*, `sen` for *sedan*). Write what is said; the summaries in
   [REFERENCE.md](REFERENCE.md) explain why it is said that way.
3. **One situation, one problem, one resolution.** A dialogue with no small friction in it —
   a delay, a misunderstanding, a favour asked — is a vocabulary list with quotation marks.
4. **Politeness is the content.** How to complain, refuse, ask a favour and end a conversation
   in Swedish is harder than any grammar point and is taught nowhere else in the app.
5. **One cultural note at most**, in `culture`, and only where the scene needs it:
   `tvättstugan`, `fika`, `vab`, `utvecklingssamtal`, `allemansrätten`. Say the thing, do not
   lecture.
6. **Names are ordinary and mixed** — Eva, Marek, Fatima, Johan, Nguyen — because that is what
   a Swedish stairwell sounds like. No jokes at anyone's expense.
7. **`level` is a hint, not a gate.** A scene tagged `sfi-c` may be read by anyone at any time.

## 5. The catalogue — 30 scenes

`[x]` — written. `[ ]` — not started. **★** marks the first wave: the scenes that define the
section's voice and are written before the rest.

### 5.1 Home and neighbours

- [x] ★ 1. `stairwell-hello` — meeting a neighbour on the stairs: introducing yourself, which
  floor, weather småprat, ending a conversation without rudeness.
- [x] ★ 2. `laundry-room` — the booked time has started and the machine is still running.
  `boka tid`, the booking board, a complaint opened with an apology.
- [x] ★ 3. `cleaning-day` — the housing association's **städdag**: raking leaves, the skip,
  who takes the garden side, and the `korv med bröd` and fika that close it. The single most
  Swedish scene in the list.
- [x] 4. `noise-at-night` — knocking on the door about a party, at 23:30, politely.
- [x] 5. `parcel-for-the-neighbour` — taking in a delivery, leaving a note, handing it over.
- [x] 6. `notice-board` — reading the board in the entrance: water shut-off on Tuesday,
  annual meeting, a lost cat. Mostly one voice reading aloud to another.

### 5.2 Family and the household

- [x] ★ 7. `morning-rush` — waking the children, breakfast, the shoe that is missing, out of
  the door. Imperatives and time expressions at speed.
- [x] ★ 8. `who-does-what` — dividing the chores: `diska`, `dammsuga`, `slänga soporna`,
  `vika tvätt`. Negotiating, not ordering.
- [x] 9. `big-clean` — the weekend **storstädning**, and sorting the rubbish properly:
  `sopsortering`, `återvinning`, `pant`.
- [x] 10. `what-shall-we-eat` — dinner plans, what is in the fridge, the shopping list.
- [x] 11. `homework-and-screens` — a child, the `läxa`, and the negotiated end of screen time.
- [x] 12. `calling-in-vab` — a child is ill: calling the preschool, then the employer. `vab`
  explained in `culture`.

### 5.3 School and children

- [x] ★ 13. `parent-teacher-meeting` — the **utvecklingssamtal**: how it is run, what a
  teacher actually says, how a parent asks whether there is a problem. Careful, hedged,
  extremely Swedish language.
- [x] ★ 14. `playground` — at the **lekplats**: `Får jag låna din spade?`, one parent to
  another on the bench, the swing that has to be shared, going home in five minutes.
- [x] 15. `preschool-drop-off` — the handover at `förskolan`: slept badly, no nap, pick-up at
  four.
- [x] 16. `reporting-absence` — reporting a child sick to the school, by app and by phone.
- [x] 17. `birthday-invitation` — an invitation between parents: allergies, presents, when to
  be collected.
- [x] 18. `after-school-club` — `fritids`: who is collecting the child today, and when.

### 5.4 Work

- [x] ★ 19. `salary-talk` — the **lönesamtal**: asking for a raise, naming a figure, hearing
  "we will come back to it", and the follow-up question that makes that answer concrete.
- [x] ★ 20. `developers-deadline` — two programmers before a release: the estimate that no
  longer holds, `vi hinner inte till fredag`, cutting scope, `kan vi skjuta på det?`, the
  deploy that went wrong. Swedish that is half English loanwords, which is exactly the point.
- [x] 21. `calling-in-sick` — `sjukanmälan` to a manager: short, factual, no apology storm.
- [x] 22. `office-fika` — the coffee break: the actual topics (weather, holidays, football,
  house prices) and how to join and leave a group of colleagues.
- [x] 23. `job-interview` — the `anställningsintervju`: strengths, notice period, why you
  applied.
- [x] 24. `booking-a-meeting` — finding a room and a slot, agenda, "I will send a calendar
  invite".

### 5.5 Out and about

- [x] ★ 25. `at-the-bus-stop` — `Går den här bussen till Centralen?`, the bus that is late,
  the app that says something different, `nästa tur går om tjugo minuter`.
- [x] ★ 26. `on-the-bus` — the ride itself: `Ursäkta, är den här platsen ledig?`, the ticket
  check, pressing the stop button, the announcements (`Nästa station…`, `Dörrarna stängs`).
- [x] 27. `train-cancelled` — `inställt`, the replacement bus, asking a member of staff what to
  do next.
- [x] 28. `at-the-supermarket` — finding an aisle, the checkout, `pant`, `Vill du ha kvitto?`
- [x] 29. `booking-a-doctor` — `vårdcentralen`: describing symptoms on the phone, being given
  a time, `1177`.
- [x] 30. `ordering-fika` — a café: ordering, paying by card, `Ska det vara här eller ta med?`

## 6. Where it lives in the interface

The dialogue list is the third tab of the reference hub — [REFERENCE.md](REFERENCE.md) §6.2 —
at `/reference/dialogues`, grouped by the five headings above, with only the first group
expanded. No new navigation entry, no card on the home screen.

A dialogue page is a transcript and nothing else: the title, one line of `setting`, the roles,
the lines, the mode toggles of §3 above, then `keyPhrases`, `culture` if any, and the links
out to the summaries whose grammar the scene leans on.

## 7. Order of work

1. The content type: schema, loader, validation, the `/reference/dialogues` routes.
2. The ten **★** scenes — enough to judge whether the format works before writing twenty more.
3. Read, hide-translations and listen modes.
4. The SRS bridge for `keyPhrases` and the one-time coin reward, reusing the history-card path.
5. The remaining twenty scenes.
6. Role-play mode, last: it is the most fun and the least load-bearing.

## 8. Done means

- [x] 30 dialogues exist, each 8–16 lines, each with `ru` and `en` on every line.
- [ ] Every `keyPhrase` occurs verbatim in its dialogue, and validation says so.
- [ ] Key phrases from a dialogue that has been read turn up in a later review session.
- [ ] The listen mode plays a whole scene, alternating between roles, in one tap.
- [ ] Nothing in the section awards XP, gates anything, or shows a score.
- [ ] Read on a phone, a dialogue needs no horizontal scrolling and no zoom.
