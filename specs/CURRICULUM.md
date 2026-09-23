# Curriculum — lessons by level

This is a programme document (not abstract design, but a concrete list of lessons) that
lives next to [SPEC.md](../SPEC.md)/[SPEC_ru.md](../SPEC_ru.md). It exists so that **a new
session can start straight from it**: open the file, see which topics are already done and
which are queued, and start writing content without rebuilding the context from scratch.

It is updated as lessons are added: when you write a new lesson, mark it `[x]` here and
fill in the slug. If you add a topic that was not on the list, append it at the end of the
level's section — there is no need to maintain strict numbering.

Every level is **one list of lessons**, and it is ordered the way the course runs: the
**thematic lessons come first** (vocabulary and communicative situations), and the level's
**grammar follows them** — one lesson per grammar point, written with `"kind": "grammar"`
in `lesson.json`. The break normally falls after item 25; SFI kurs A and B carry a few
extra topics, and their own note says where their two halves meet. Grammar used to live in a second list of 25 points
per level; those lists have been merged into the lesson lists, because a point is closed by
writing a lesson and nothing else. Where a thematic lesson already teaches a point, the
point is named on that lesson's line instead of standing as an item of its own. Grammar is
deliberately repeated between neighbouring levels: each next level takes it deeper rather
than starting over.

## Legend

- `[x]` — the lesson is done: the folder exists at `content/lessons/<level>/<slug>/`.
- `[ ]` — not done.

Every lesson belongs to **exactly one level**. A lesson's level is at once its folder, its
`id` (`sfi-b/family`) and the single element in its `levels`.

---

## Level structure

Two scales, and they run one after the other rather than in parallel.

### SFI — utbildning i svenska för invandrare

- The courses are called **kurs A, kurs B, kurs C, kurs D** (`kurs` in lower case).
- The courses are combined into three **studievägar**, depending on the schooling a
  person arrives with:
  - **studieväg 1:** kurs A → B → C → D (little or no schooling, including practising
    literacy itself);
  - **studieväg 2:** kurs B → C → D;
  - **studieväg 3:** kurs C → D (educated in their first language, fast pace).
- So **kurs C and kurs D exist on all three paths**, and the same kurs C runs at a
  different speed and with a different reliance on writing on studieväg 1 and on
  studieväg 3.
- SFI is not measured in poäng and ends at kurs D.

### SVA — svenska som andraspråk, grundläggande nivå

- A **komvux** course of 700 poäng, split into four national **delkurser**:

  | Delkurs | Poäng |
  |---|---|
  | delkurs 1 | 100 p |
  | delkurs 2 | 200 p |
  | delkurs 3 | 200 p |
  | delkurs 4 | 200 p |

- Entry into delkurs 1 requires a completed SFI kurs D or equivalent knowledge (some
  municipalities admit students after kurs C).
- Delkurs 4 gives the final grade for the whole grundläggande SVA and **behörighet** for
  the upper-secondary course `Svenska som andraspråk 1`.
- This is where the language first becomes an object of study rather than only a means:
  metalanguage is introduced (verb, subordinate clause, subject) and a text is worked with
  as a text.

### The single ladder

```
SFI kurs A → B → C → D  →  SVA grund delkurs 1 → 2 → 3 → 4  →  SVA 1 (upper secondary)
```

| Level | Officially | Roughly |
|---|---|---|
| SFI kurs A | sfi, studieväg 1 | below A1 — literacy and an oral base |
| SFI kurs B | sfi, studieväg 1–2 | A1 |
| SFI kurs C | sfi, all studievägar | A1+ |
| SFI kurs D | sfi, all studievägar, final | A2 |
| SVA grund delkurs 1 | komvux grundläggande, 100 p | A2+ |
| SVA grund delkurs 2 | komvux grundläggande, 200 p | B1 |
| SVA grund delkurs 3 | komvux grundläggande, 200 p | B1 |
| SVA grund delkurs 4 | komvux grundläggande, 200 p | B1+ |

The right-hand column is only a reference point for gauging difficulty. There is no
separate CEFR track in the project: the levels are named the way they are named in the
Swedish system.

## Summary

| Level | Lessons done | Lessons planned |
|---|---|---|
| SFI kurs A | 50 | 50 |
| SFI kurs B | 50 | 50 |
| SFI kurs C | 50 | 50 |
| SFI kurs D | 50 | 50 |
| SVA grund delkurs 1 | 50 | 50 |
| SVA grund delkurs 2 | 50 | 50 |
| SVA grund delkurs 3 | 50 | 50 |
| SVA grund delkurs 4 | 50 | 50 |

Lessons done in total: **400** (`npx tsx scripts/validate-content.ts` confirms the
number) out of **400** planned — 50 per level across the eight levels. **Every level is
now complete.**

**SVA grund is written end to end against its original 20-point grammar plan** — all four
delkurser (1-4), 185 lessons: 100 thematic and 85 grammar, every one of them with
bilingual (RU/EN) theory (`theory.md` + `theory_ru.md`, picked by the study-language
toggle). Delkurs 4 was the capstone level: it gives the course's final grade and
behörighet for the upper-secondary `Svenska som andraspråk 1`, so its grammar lessons
mostly systematise delkurs 1-3 into summary reference lessons (the full verb system, every
subordinate-clause type, every conditional type) rather than introducing new sentence
grammar, and its topics cover what comes after this course (university application, the
final project). Every level was later extended from 20 to 25 grammar points; every SVA grund
delkurs (1-4) has now closed its own five extra points.

All SFI lessons outside kurs A's 19 grammar lessons are vocabulary and phrase lessons; the
SVA grund thematic lessons use that same vocab/phrases pipeline rather than an actual
reading-passage format — several of them across all four levels (reading a short story and
retelling it, a referat with a cited source, analysing a literary text, källkritik) were
originally imagined as needing dedicated text-based mechanics the project doesn't have;
they teach the vocabulary/phrases the skill needs instead.

**SVA grund delkurs 4 is complete** — every lesson of its list is written, thematic and
grammatical alike, closing the course's own capstone points 21-25 (subordination versus
coordination in a long period, ellipsis, emphatic/restrictive words, numerical precision
and hedging, defining a concept). **SFI kurs A got there first on the same day**, and its
grammar is still finished: all 25 of its patterns are taught, 19 by a lesson of their own
and six inside a thematic lesson. **SFI kurs A is now complete too**: its six newly added
topics (everyday politeness, spelling out loud, upper/lower case, a capital letter and a
full stop, telling the teacher you are ill or late, your own school day at SFI) are
written, closing all 50 of its lessons. **SFI kurs B is complete as well**: its 23 grammar
lessons and 2 new topics (places in town, nature and the outdoors) are written, closing all
50 of its lessons too — its grammar, unlike kurs A's, is explained with real terminology
(V2 word order, the five plural declensions, the genitive `-s`, possessives,
demonstratives, and more) rather than drilled as bare patterns, matching the level's step
up from studieväg 1 alone to the entry point for studieväg 2. **SFI kurs C is complete
too**: all 45 of its remaining lessons (20 thematic topics and 25 grammar points — the
preterite system, subordinate clauses and BIFF, the relative `som`, double definiteness,
`sin` vs `hans`, the indefinite `man`, word accent, and more) are written, closing all 50 of
its lessons. **SVA grund delkurs 3 has closed its own five extra grammar points too**:
apposition and parenthetical insertions, connected-speech prosody, generic reference,
negation and its scope, and phase/aspect verbs — all 50 of its lessons are now written.
**SVA grund delkurs 2 has closed its own five extra grammar points as well**: word order in
embedded questions, paired conjunctions, quantifiers and amounts in a text, the sequence of
tenses in reported speech, and prepositional phrases as adverbials — all 50 of its lessons
are now written. **SVA grund delkurs 1 has closed its own five extra grammar points too**:
when a noun goes without an article, `det` as a formal subject, the movement/location
adverb pairs, numerals with dates and clock times, and the vowel-length spelling rule — all
50 of its lessons are now written, and **SVA grund is complete end to end, all 200 of its
lessons across delkurs 1-4**. **SFI kurs D is now complete too**: all 47 remaining lessons
(22 thematic topics — digital services, registration and identity, the municipality,
reading a bill/receipt/payslip, everyday taxes, insurance, the working day, job search,
workplace habits, a short formal message, further education, geography, sport, food
culture, shopping and returns, shopping online, a sick child and VAB, contact with a
child's school, house rules and neighbours, everyday news, comparing life in Sweden, and
the final review — and 25 grammar points — the full tense system, the pluperfect in
narration, the `-s`/`bli` passives, `skulle` and conditionality, `om … så` conditionals,
infinitive constructions, temporal/concessive/causal clauses, indirect speech and
questions, relative clauses, connected-speech reductions, the genitive in a longer phrase,
`liten/litet/lilla/små`, abstract prepositions, verb-preposition government, `vara` vs
`bli`, text connectors, modal particles, the written/spoken norm, checking understanding,
impersonal `det`, the imperative of all four verb groups, `o-`/`miss-` word formation, and
punctuation/paragraphing) are written, closing all 50 of its lessons. **Every level from
SFI kurs A through SVA grund delkurs 4 is now complete — all 400 lessons are written.** The
still-undesigned real text-lesson format remains the only open item, tracked in `TODO.md`.

**The plan was rebalanced on 2026-09-13** after a coverage review of all 400 items. No
lesson was written, renamed or removed — only unwritten items changed, and every level
still holds exactly 50. What the review changed:

- **Gaps that no level covered at all** were given a slot: the genitive `-s` (kurs B,
  applied again in a longer phrase in kurs D), deponent and reciprocal `-s` verbs
  (`träffas`, `ses`, `hoppas` — kurs C), and the imperative of all four verb groups
  (kurs D). Realia that appeared nowhere entered existing lines: `id-kort` and
  `folkbokföring`, `körkort`, `växla`/`valuta`, Systembolaget, VAB.
- **Pronunciation stopped ending at kurs A.** It used to live only in kurs A's three
  lessons; there is now a pronunciation point in kurs B (sentence melody, vowel length),
  in kurs C (word accent 1 and 2), in kurs D (understanding a normal pace: `dom`, `ja`,
  `å`) and in SVA grund delkurs 3 (prosody in connected speech).
- **SFI kurs D was rebuilt as an A2 course.** Its thematic half used to repeat SVA grund
  delkurs 2–3 almost item for item and carried no everyday life at all; the heavy
  versions stayed in SVA grund and kurs D now mixes vardagsliv with the everyday side of
  samhällsliv and arbetsliv. Its grammar half gave up five points that belong to SVA
  grund (participles as modifiers, nominalisation, the full picture of double
  definiteness, `vore`, `ju … desto`).
- **Duplicates between neighbouring levels were merged** where the item was still
  unwritten: in kurs B the two adjective points and the two number points became one
  each, in kurs C the definite adjective and double definiteness became one point, the
  emergency call and the `polisanmälan` became one lesson, and `det finns`/`det är`
  — which kurs B and SVA grund delkurs 1 both teach — was dropped from kurs C. SVA
  grund delkurs 3 gave up its fourth pass at `det finns`. The freed slots went to the
  gaps above.
- **Lessons that are already written and read as duplicates were not touched** — they
  differ in content, so only their lines here were sharpened to say how (the four
  conditional lessons, the two proofreading lessons of delkurs 4, the referat chain).

---

## SFI kurs A

*Who it is for:* studieväg 1, starting from zero. A lot of work on literacy itself —
letter, sound, handwriting, reading individual words. Speaking runs ahead of writing.

### Lessons (50 lessons, 50 done)

Grammar here is **not explained with terminology** — it is drilled as ready-made patterns.
Six of those patterns are carried by a thematic lesson (the alphabet, yes/no questions,
colours, the classroom imperative and the polite `kan` request, `Vad kostar det?`) and are
named on its line; the other 19 have a lesson of their own. Items 1–31 are thematic,
items 32–50 the pattern lessons.

1. [x] The alphabet: 29 letters, with `å`, `ä`, `ö` separate — `sfi-a/alphabet`
2. [x] Greetings — `sfi-a/greetings`
3. [x] Numbers 0–20 — `sfi-a/numbers-0-20`
4. [x] Personal details / a form — `sfi-a/personal-info`
5. [x] Days of the week — `sfi-a/days-of-week`
6. [x] Colours, and the colour adjective in its base form — `sfi-a/colors`
7. [x] Times of day — `sfi-a/time-of-day`
8. [x] Telling the time (halv/kvart/över/i) — `sfi-a/clock`
9. [x] The human body — `sfi-a/body`
10. [x] Classroom instructions: the imperative `Lyssna!`, `Läs!`, `Skriv!`, `Öppna boken!` and the polite request `Kan du upprepa?` — `sfi-a/classroom-instructions`
11. [x] Simple questions and answers: yes/no through inversion — `Är du gift?`, `Har du barn?` — `sfi-a/simple-questions`
12. [x] Reading simple signs (öppet/stängt, ingång/utgång, WC) — `sfi-a/simple-signs`
13. [x] Emergency phrases (help, 112, "I don't understand") — `sfi-a/emergency-phrases`
14. [x] Numbers on the phone: a phone number and personnummer digit by digit — `sfi-a/phone-numbers`
15. [x] Months and seasons — `sfi-a/months-seasons`
16. [x] The Swedish calendar: how to write a date — `sfi-a/writing-dates`
17. [x] Shapes and sizes (circle, square, big/small) — `sfi-a/shapes-sizes`
18. [x] Simple shopping phrases: `Vad kostar det?`, the answer `Det kostar … kronor`, paying by card — `sfi-a/shopping-phrases`
19. [x] Simple directions (go straight ahead, turn left/right) — `sfi-a/simple-directions`
20. [x] Simple verbs of movement (walk, run, sit, stand) — `sfi-a/movement-verbs`
21. [x] School and stationery items — `sfi-a/school-items`
22. [x] Countries and nationalities — `sfi-a/countries-nationalities`
23. [x] How you feel: "I feel bad", "I have a headache" — `sfi-a/how-you-feel`
24. [x] Like / dislike — simple phrases — `sfi-a/likes-dislikes`
25. [x] A simple daily routine (got up, ate, went to bed) — `sfi-a/daily-routine-simple`
26. [x] Everyday politeness: `tack`, `tack så mycket`, `varsågod`, `förlåt`, `ursäkta` — `sfi-a/everyday-politeness`
27. [x] Spelling out loud (`bokstavera`): `Hur stavas ditt namn?` — your name and your street letter by letter — `sfi-a/spelling-out-loud`
28. [x] Upper and lower case: the handwritten alphabet and writing your own name — `sfi-a/upper-lower-case`
29. [x] A capital letter and a full stop: writing one simple sentence by hand — `sfi-a/capital-letter-full-stop`
30. [x] Telling the teacher you are ill or will be late: `Jag är sjuk`, `Jag kommer sent` — `sfi-a/telling-teacher-ill-late`
31. [x] Your own school day at SFI: `lektion`, `rast`, `läxa`, `schema`, `lärare` — `sfi-a/school-day-sfi`
32. [x] Letter-to-sound correspondence; `sj-`, `tj-`, `k-` before a front vowel — `sfi-a/letter-sound-correspondence`
33. [x] Long and short vowels: `vit` / `vitt`, `mat` / `matt` — `sfi-a/vowel-length`
34. [x] Personal pronouns: `jag, du, han, hon, vi, ni, de` — `sfi-a/personal-pronouns`
35. [x] The present tense as a ready-made form: `heter, bor, kommer, talar` — `sfi-a/present-tense-basics`
36. [x] `är` and `har` in simple phrases about yourself — `sfi-a/ar-har-basics`
37. [x] Word order in a simple statement: `Jag bor i Malmö` — `sfi-a/statement-word-order`
38. [x] Wh-questions: `Vad heter du?`, `Var bor du?`, `Hur gammal är du?` — `sfi-a/wh-questions`
39. [x] The negation `inte`: `Jag förstår inte` — `sfi-a/negation-inte`
40. [x] `en` / `ett` — a first acquaintance on frequent words — `sfi-a/en-ett-basics`
41. [x] The definite form: `en bok → boken` — `sfi-a/definite-form-basics`
42. [x] Recognising the plural: `en bok – två böcker` — `sfi-a/plural-recognition`
43. [x] `min` / `mitt`: `min mamma`, `mitt barn` — `sfi-a/min-mitt`
44. [x] The numbers 0–20 in personal details: age and address, said whole rather than digit by digit — `sfi-a/numbers-personal-details`
45. [x] The prepositions `i` and `på`: `bor i Sverige`, `på Storgatan 5` — `sfi-a/prepositions-i-pa`
46. [x] `på` with days of the week: `på måndag` — `sfi-a/pa-with-days`
47. [x] Word stress and the melody of a Swedish word: `MÅN-dag`, `ar-BE-tar` — `sfi-a/word-stress-melody`
48. [x] `det här är` / `det där är` for pointing at and naming a thing — `sfi-a/det-har-dar`
49. [x] The first time words: `nu`, `idag`, `imorgon`, `igår` — `sfi-a/time-words-basic`
50. [x] `och` and `men` joining two short sentences — `sfi-a/och-men-conjunctions`

## SFI kurs B

*Who it is for:* the continuation of studieväg 1 and the entry point for studieväg 2.
Simple connected speech on familiar topics appears, along with simple writing and reading
short adapted texts.

### Lessons (50 lessons, 50 done)

Items 1–27 are the thematic lessons, items 28–50 the level's grammar.

1. [x] Family — `sfi-b/family`
2. [x] Family and relationships — the deeper version — `sfi-b/family-relations`
3. [x] Home and rooms — `sfi-b/home`
4. [x] Animals — `sfi-b/animals`
5. [x] Clothing — `sfi-b/clothing`
6. [x] Weather — `sfi-b/weather`
7. [x] Food and drinks — `sfi-b/food-drinks`
8. [x] Cooking: verbs and kitchen utensils — `sfi-b/cooking`
9. [x] Verbs in the present tense — all four verb groups and how to tell which group a verb is in — `sfi-b/present-tense`
10. [x] At the grocery store: departments, the till, weighing and paying — `sfi-b/grocery-store`
11. [x] At the clothing store: sizes, trying on, exchanges — `sfi-b/clothing-store`
12. [x] At a restaurant and a café: ordering, the bill, fika — `sfi-b/restaurant-cafe`
13. [x] Daily routine — as a connected account, with the reflexive verbs of the routine (`jag tvättar mig`, `jag klär på mig`) — `sfi-b/daily-routine-connected`
14. [x] Adjective antonyms and describing objects — `sfi-b/adjective-antonyms`
15. [x] Describing a person's appearance — `sfi-b/describing-appearance`
16. [x] Hobbies and free time — `sfi-b/hobbies-free-time`
17. [x] Home: cleaning and household chores — `sfi-b/household-chores`
18. [x] Neighbours and small talk in the stairwell — `sfi-b/neighbours-small-talk`
19. [x] Celebrations: birthdays, jul, midsommar — basic vocabulary — `sfi-b/celebrations-basics`
20. [x] Money: coins and notes, "how much does it cost" — `sfi-b/money-coins-notes`
21. [x] Directions in town: how to ask the way — `sfi-b/directions-in-town`
22. [x] The library: borrowing a book, the rules — `sfi-b/library-basics`
23. [x] Preschool and school for children — basic words — `sfi-b/preschool-school-basics`
24. [x] Simple feelings (tired, hungry, happy) — `sfi-b/simple-feelings`
25. [x] A simple phone call (asking about opening hours) — `sfi-b/phone-call-opening-hours`
26. [x] Places in town: `affär`, `apotek`, `bibliotek`, `torg`, `park` — `sfi-b/places-in-town`
27. [x] Nature and the outdoors: `skog`, `sjö`, `strand`, `berg` — a trip out of town — `sfi-b/nature-outdoors`
28. [x] The infinitive and `att`: `Jag vill äta`, `Det är kul att läsa` — `sfi-b/infinitive-att`
29. [x] The modals `vill`, `kan`, `måste`, `får` + infinitive — `sfi-b/modals-infinitive`
30. [x] V2 word order: the verb is always second — `sfi-b/v2-word-order`
31. [x] Inversion after a fronted adverbial: `På måndag jobbar jag` — `sfi-b/fronted-adverbial-inversion`
32. [x] Sentence adverbs: `inte, alltid, aldrig, ofta, kanske` — `sfi-b/sentence-adverbs`
33. [x] `en`/`ett`: the indefinite and definite singular — as a system — `sfi-b/en-ett-system`
34. [x] The plural: five declensions (`-or, -ar, -er, -n`, and no ending) — `sfi-b/plural-five-declensions`
35. [x] The definite plural: `bilarna`, `husen`, `äpplena` — `sfi-b/definite-plural`
36. [x] The conjunctions `och`, `men`, `eller`, `för`, `så` — `sfi-b/conjunctions-och-men-eller`
37. [x] Adjective agreement: `en stor bil`, `ett stort hus`, `bilen är stor` — `sfi-b/adjective-agreement`
38. [x] The genitive `-s`: `Annas bok`, `barnets namn`, `min mammas bil` — `sfi-b/genitive-s`
39. [x] Possessives: `min, din, hans, hennes, vår, er, deras` — `sfi-b/possessives`
40. [x] Demonstratives: `den här`, `den där`, `de här` — `sfi-b/demonstratives`
41. [x] Object pronouns: `mig, dig, honom, henne, oss, er, dem` — `sfi-b/object-pronouns`
42. [x] Prepositions of place: `i, på, under, bakom, framför, mellan` — `sfi-b/prepositions-of-place`
43. [x] Numbers 0–1000, ordinals, prices in `kronor` and writing a date — `sfi-b/numbers-ordinals-dates`
44. [x] Pronunciation: the melody of a statement and of a question, and long and short vowels in a new word — `sfi-b/pronunciation-melody-vowel-length`
45. [x] Prepositions of time: `klockan`, `på`, `i`, `om` — `sfi-b/prepositions-of-time`
46. [x] The preterite of frequent verbs: `var, hade, gick, kom, sa, fick` — `sfi-b/preterite-frequent-verbs`
47. [x] `det finns` and `det är` in simple sentences — `sfi-b/det-finns-det-ar`
48. [x] Quantity: `mycket / många`, `lite / några`, `alla / ingen` — `sfi-b/quantity-mycket-lite-alla`
49. [x] The question words `vilken / vilket / vilka`, `vems`, `hur mycket` — `sfi-b/question-words-vilken-vems`
50. [x] Saying what you like: `tycker om`, `gillar`, `älskar` + noun or infinitive — `sfi-b/tycker-om-gillar-alskar`

## SFI kurs C

*Who it is for:* the course exists on all three studievägar, and for studieväg 3 it is the
entry point. Speech becomes connected, accounts of the past and reasons for "why" appear,
and longer texts are read.

### Lessons (50 lessons, 50 done)

Items 1–25 are the thematic lessons, items 26–50 the level's grammar.

1. [x] Public transport — `sfi-c/transport`
2. [x] Money and prices (numbers 20–100) — `sfi-c/money`
3. [x] Health and a visit to the doctor — `sfi-c/health`
4. [x] Booking an appointment (`boka tid`) — `sfi-c/booking`
5. [x] Professions — `sfi-c/professions`
6. [x] A working day: the schedule, the break, asking a colleague for help — `sfi-c/workday-schedule-break`
7. [x] Safety at the workplace — `sfi-c/workplace-safety`
8. [x] Looking for work: job ads and first steps — `sfi-c/looking-for-work`
9. [x] At the pharmacy: over-the-counter medicine — `sfi-c/pharmacy-otc-medicine`
10. [x] Emergencies: calling 112 and an ambulance, and a `polisanmälan` for a theft or lost documents — `sfi-c/emergencies-112-polisanmalan`
11. [x] A Swedish winter: the darkness, `halka`, clothes for the season — `sfi-c/swedish-winter`
12. [x] At the dentist (tandvård): booking, the treatment, the bill — `sfi-c/dentist-tandvard`
13. [x] The post office: letters and parcels — `sfi-c/post-office`
14. [x] The bank: basic operations, opening an account, changing money (`växla`, `valuta`) — `sfi-c/bank-basics`
15. [x] Phone and internet: getting connected, a subscription — `sfi-c/phone-internet-subscription`
16. [x] Paying bills: rent, electricity, internet — `sfi-c/paying-bills`
17. [x] Shopping: comparing prices, discounts, returning goods and complaining — `sfi-c/shopping-comparing-prices`
18. [x] Talking about the past: a short account of yesterday and last week — `sfi-c/past-narrative-short`
19. [x] Plans for the future and invitations — `sfi-c/future-plans-invitations`
20. [x] Opinion in one sentence: `jag tycker att … eftersom …` — `sfi-c/opinion-one-sentence`
21. [x] Waste sorting (återvinning) — `sfi-c/waste-sorting`
22. [x] Free time: cinema, theatre, sports clubs — `sfi-c/free-time-cinema-sports`
23. [x] Parents' meetings and contact with the school — `sfi-c/parents-meetings-school`
24. [x] Traffic rules and driving school: the `körkort` and what it takes — `sfi-c/traffic-rules-korkort`
25. [x] Repairs and a tradesperson at home (plumber, electrician) — `sfi-c/home-repairs-tradesperson`
26. [x] The preterite: all four groups, including strong verbs — `sfi-c/preterite-four-groups`
27. [x] The supine and strong verb forms: `skriva – skrev – skrivit` — `sfi-c/supine-strong-verbs`
28. [x] The perfect `har + supinum` and how it differs from the preterite — `sfi-c/perfect-har-supinum`
29. [x] The future: `ska`, `kommer att`, `tänker` — shades of meaning — `sfi-c/future-ska-kommer-att-tanker`
30. [x] Modal verbs in the preterite: `kunde, ville, skulle, fick` — `sfi-c/modal-verbs-preterite`
31. [x] Subordinate clauses with `att` and the BIFF rule (`inte` before the verb) — `sfi-c/subordinate-att-biff`
32. [x] Subordinate clauses with `om`, `när`, `eftersom`, `så att` — `sfi-c/subordinate-om-nar-eftersom-sa-att`
33. [x] The relative `som` and when it can be omitted — `sfi-c/relative-som`
34. [x] Comparison of adjectives, including irregular forms — `sfi-c/adjective-comparison`
35. [x] The definite adjective and double definiteness: `den stora staden` — `sfi-c/definite-adjective-double-definiteness`
36. [x] Deponent and reciprocal `-s` verbs: `träffas`, `ses`, `hoppas`, `trivs`, `minns` — `sfi-c/deponent-reciprocal-s-verbs`
37. [x] Reflexive verbs and `sig`: `tvätta sig`, `känna sig` — `sfi-c/reflexive-verbs-sig`
38. [x] `sin/sitt/sina` versus `hans/hennes/deras` — `sfi-c/sin-sitt-sina-vs-hans-hennes-deras`
39. [x] The indefinite subject `man` — `sfi-c/indefinite-subject-man`
40. [x] Pronunciation: word accent 1 and 2 (`anden` – `anden`) and the melody of a long sentence — `sfi-c/pronunciation-word-accent`
41. [x] Frequent particle verbs and stress on the particle — `sfi-c/particle-verbs-stress`
42. [x] Prepositions of place and direction: `i / till`, `på / till`, `hos` — `sfi-c/prepositions-place-direction`
43. [x] Adverbs: `hem/hemma`, `ut/ute`, `in/inne`, `dit/där` — `sfi-c/adverbs-hem-ut-in-dit`
44. [x] The sentence schema: fundament — verb — subject — adverb — `sfi-c/sentence-schema-fundament`
45. [x] Compounds and basic suffixes: `-are`, `-het`, `-ning` — `sfi-c/compounds-suffixes`
46. [x] The `-s` passive on signs and in instructions — a first acquaintance — `sfi-c/s-passive-intro`
47. [x] Numbers in dates, years and percentages: `procent`, `hälften`, `dubbelt` — `sfi-c/numbers-dates-years-percent`
48. [x] Adverbs of degree and frequency: `ganska`, `väldigt`, `alltför`, `sällan`, `ibland` — `sfi-c/adverbs-degree-frequency`
49. [x] The indirect question: `Vet du var …?`, `Kan du säga om …?` — `sfi-c/indirect-question`
50. [x] Time expressions: `för … sedan`, `sedan`, `redan`, `ännu`, `i … tid` — `sfi-c/time-expressions-sedan-redan-annu`

## SFI kurs D

*Who it is for:* the final SFI course on every studieväg. It requires connected speech on
unfamiliar topics, argumentation, writing a paragraph or two, and understanding speech at
a normal (not adapted) pace. Next comes SVA grund delkurs 1.

### Lessons (50 lessons, 50 done)

Items 1–25 are the thematic lessons, items 26–50 the level's grammar. The thematic
half keeps the everyday side of adult life next to the official one, and the official
topics are taken in their **everyday** version — a bill you have to read, a declaration
you only approve, a message to a landlord. The heavy versions of the same topics — the
tax return, the clauses of a rental contract, the employment contract and the union, a CV
and a cover letter, consumer rights, elections — belong to SVA grund delkurs 2–3, which
teaches them as text work; repeating them here would only make kurs D a weaker copy of a
later level.

1. [x] Housing and renting — `sfi-d/housing`
2. [x] Government agencies and forms — `sfi-d/authorities`
3. [x] Emotions — `sfi-d/emotions`
4. [x] Digital public services: BankID, Mina sidor, 1177 — `sfi-d/digital-services`
5. [x] Registration and identity: `personnummer`, `id-kort`, `folkbokföring` — `sfi-d/registration-identity`
6. [x] The municipality (kommun): which service comes from where — `sfi-d/municipality-services`
7. [x] Understanding a bill, a receipt and a payslip in outline — `sfi-d/bill-receipt-payslip`
8. [x] Taxes in everyday life: the declaration you only have to approve — `sfi-d/taxes-everyday`
9. [x] Insurance for the home and for a trip: what it covers — `sfi-d/insurance-home-travel`
10. [x] A working day and your employer: the schedule, the breaks, calling in sick — `sfi-d/workday-employer-sick`
11. [x] Looking for work: the ad, the application, a short self-presentation — `sfi-d/job-search-application`
12. [x] Workplace habits: `du`-tilltal, fika, punctuality, asking for help — `sfi-d/workplace-habits`
13. [x] A short formal message: writing to a school, a landlord or an authority — `sfi-d/formal-message-short`
14. [x] Further education: komvux, SVA grund, CSN — `sfi-d/further-education`
15. [x] The geography of Sweden: landskap, the big cities, north and south — `sfi-d/sweden-geography`
16. [x] Sport and exercise: the gym, a `förening`, a child's training session — `sfi-d/sport-exercise`
17. [x] Food culture: husmanskost, fika, Systembolaget and opening hours — `sfi-d/food-culture`
18. [x] Shopping and returns: `öppet köp`, the receipt, complaining about a purchase — `sfi-d/shopping-returns`
19. [x] Shopping online: the order, the delivery, sending it back — `sfi-d/shopping-online`
20. [x] A sick child: VAB, calling 1177, a message to the preschool — `sfi-d/sick-child-vab`
21. [x] Your child's school: the meeting, the homework, contact with the teacher — `sfi-d/child-school-contact`
22. [x] The house and the neighbours: the rules, the `tvättstuga`, sorting the rubbish — `sfi-d/house-neighbours-rules`
23. [x] News in everyday life: understanding a short news item — `sfi-d/news-everyday`
24. [x] Life in Sweden and life where you come from: habits, etiquette, expectations — `sfi-d/life-sweden-comparison`
25. [x] Final review: telling the story of your life in Sweden and your plans — `sfi-d/final-review-story`
26. [x] An overview of the tense system: present, preterite, perfect, pluperfect, future — `sfi-d/tense-system-overview`
27. [x] The pluperfect when narrating a sequence of events — `sfi-d/pluperfect-narrative`
28. [x] The `-s` passive and the `bli` passive — `sfi-d/s-passive-bli-passive`
29. [x] `skulle` + infinitive: conditionality and politeness — `sfi-d/skulle-infinitive-politeness`
30. [x] Conditional sentences `om … så` — `sfi-d/conditional-om-sa`
31. [x] Infinitive constructions: `för att`, `utan att`, `genom att` — `sfi-d/infinitive-constructions`
32. [x] Temporal clauses: `när`, `då`, `medan`, `innan`, `efter att` — `sfi-d/temporal-clauses`
33. [x] Concessives: `fast`, `trots att`, `även om` — `sfi-d/concessive-clauses`
34. [x] Causals: `eftersom`, `därför att`, `på grund av` — `sfi-d/causal-clauses`
35. [x] Reported speech and the indirect question with `om` — `sfi-d/reported-speech-indirect-question`
36. [x] Relative clauses: `som`, `där`, `dit`, `vars` — `sfi-d/relative-clauses`
37. [x] Understanding speech at a normal pace: `dom`, `ja`, `å` and the other reductions — `sfi-d/connected-speech-reductions`
38. [x] The genitive in a longer phrase: `min kompis bror`, `Sveriges regering` — `sfi-d/genitive-longer-phrase`
39. [x] Difficult agreement cases: `liten / litet / lilla / små` — `sfi-d/liten-agreement`
40. [x] Abstract prepositions: `av`, `för`, `till`, `om`, `inför` — `sfi-d/abstract-prepositions`
41. [x] Verbs governing prepositions: the frequent pairs — `sfi-d/verb-preposition-pairs`
42. [x] `vara` and `bli`: a state and a change of state — `sfi-d/vara-vs-bli`
43. [x] Text connectors: `dessutom`, `däremot`, `alltså`, `därför`, `å andra sidan` — `sfi-d/text-connectors`
44. [x] Modal particles: `ju`, `nog`, `väl`, `faktiskt` — `sfi-d/modal-particles`
45. [x] The written norm versus the spoken one: `dem/dom`, `ska/skall`, `sade/sa` — `sfi-d/written-vs-spoken-norm`
46. [x] Checking that you have understood: `eller hur?`, `va?`, `menar du att …?` — `sfi-d/checking-understanding`
47. [x] Impersonal `det`: `det regnar`, `det är viktigt att …`, `det sägs att …` — `sfi-d/impersonal-det`
48. [x] The imperative of all four verb groups: instructions, recipes and signs — `sfi-d/imperative-four-groups`
49. [x] Word formation with the prefixes `o-` and `miss-`: `omöjlig`, `otrevlig`, `missförstå` — `sfi-d/word-formation-o-miss`
50. [x] Punctuation in a written text: the comma before a subordinate clause, paragraphing — `sfi-d/punctuation-paragraphing`

## SVA grund delkurs 1

*Who it is for:* the first komvux course after SFI kurs D, 100 poäng. This is where
metalanguage and work with texts appear: not only "say it", but "read it, retell it,
write it".

### Lessons (50 lessons, 50 done)

Delkurs 1 systematises what SFI taught through patterns: the same ground, but now with
terminology and rules.

1. [x] About yourself: the path to Sweden, studies, work — a connected monologue — `sva-grund-1/about-yourself`
2. [x] My routine and my habits — an account in the present tense — `sva-grund-1/routine-present`
3. [x] Talking about the past: yesterday, last week, last year — `sva-grund-1/past-narrative`
4. [x] Plans for the future: studies, work, family — `sva-grund-1/future-plans`
5. [x] Opinion and justification: `jag tycker att … eftersom …` — `sva-grund-1/opinion-justification`
6. [x] Describing a person: appearance and character — `sva-grund-1/describing-person`
7. [x] Describing a place: a flat, a neighbourhood, a city — `sva-grund-1/describing-place`
8. [x] Health: describing symptoms in detail and talking to a doctor — `sva-grund-1/health-symptoms-detailed`
9. [x] Studying at komvux: schedule, assignments, feedback from the teacher — `sva-grund-1/studying-komvux`
10. [x] Reading an adapted short story and retelling it — `sva-grund-1/reading-retelling`
11. [x] A personal letter and a message: structure and polite formulas — `sva-grund-1/personal-letter`
12. [x] Filling in forms and questionnaires: understanding the wording — `sva-grund-1/forms-questionnaires`
13. [x] Instructions and recipes: understanding and following a sequence — `sva-grund-1/instructions-recipes`
14. [x] Working with a dictionary and a word definition — `sva-grund-1/dictionary-work`
15. [x] Strategies: how to ask about a word you do not know, how to paraphrase — `sva-grund-1/paraphrase-strategies`
16. [x] Work: the working day, colleagues, arrangements — `sva-grund-1/workday-colleagues`
17. [x] Talking to an employer: holiday, sick leave, the schedule — `sva-grund-1/employer-talk`
18. [x] Housing: the contract, förstahand/andrahand, the housing queue — `sva-grund-1/housing-contract`
19. [x] Household economy: budget, bills, autogiro — `sva-grund-1/household-economy`
20. [x] Digital life: BankID, Mina sidor, apps — `sva-grund-1/digital-life`
21. [x] Your child's school: the development talk (utvecklingssamtal) — `sva-grund-1/child-school-talk`
22. [x] Holidays and traditions: describing them and comparing with your own culture — `sva-grund-1/holidays-traditions`
23. [x] Free time and culture: talking about a film or a book — `sva-grund-1/free-time-culture`
24. [x] Nature and allemansrätten — `sva-grund-1/nature-allemansratten`
25. [x] Retelling what you heard: a news item, an announcement, an instruction — `sva-grund-1/retelling-news`
26. [x] Parts of speech and metalanguage — `sva-grund-1/parts-of-speech`
27. [x] Sentence elements — `sva-grund-1/sentence-elements`
28. [x] The four verb groups and the strong verbs, systematised — `sva-grund-1/verb-groups`
29. [x] All the tenses in one table — `sva-grund-1/tense-overview`
30. [x] The future: `ska` / `kommer att` / the present — `sva-grund-1/future-tense`
31. [x] Modal verbs in every tense — `sva-grund-1/modal-verbs-tenses`
32. [x] `att` + infinitive, and the infinitive without `att` — `sva-grund-1/att-infinitive`
33. [x] Main-clause word order: the fundament and the V2 rule — `sva-grund-1/main-clause-word-order`
34. [x] Subordinate-clause word order and the BIFF rule — `sva-grund-1/subordinate-clause-word-order`
35. [x] The position of sentence adverbs — `sva-grund-1/sentence-adverb-position`
36. [x] The noun: gender, number, definiteness — five declensions — `sva-grund-1/noun-declensions`
37. [x] Double definiteness and its exceptions — `sva-grund-1/double-definiteness`
38. [x] The adjective: strong and weak declension — `sva-grund-1/adjective-declension`
39. [x] Comparison, including suppletive forms — `sva-grund-1/adjective-comparison`
40. [x] Pronouns: personal, object, possessive, reflexive — `sva-grund-1/pronouns-overview`
41. [x] `sin/sitt/sina` — `sva-grund-1/sin-sitt-sina`
42. [x] Indefinite pronouns — `sva-grund-1/indefinite-pronouns`
43. [x] Particle verbs — `sva-grund-1/particle-verbs`
44. [x] Compounds and the linking `-s-` — `sva-grund-1/compound-words`
45. [x] Punctuation and capitalisation — `sva-grund-1/punctuation-paragraphs`
46. [x] The article: when a noun goes without one — professions, mass nouns, fixed phrases — `sva-grund-1/article-omission`
47. [x] `det` as a formal subject and a placeholder: `det finns`, `det är`, `det regnar` — `sva-grund-1/det-formal-subject`
48. [x] Adverbs: formation with `-t`, and the pairs `hem/hemma`, `ut/ute`, `dit/där` — `sva-grund-1/adverb-formation-pairs`
49. [x] Numerals: cardinal, ordinal, dates and clock times, and how they are read aloud — `sva-grund-1/numerals-cardinal-ordinal`
50. [x] Spelling and sound: long and short vowels, double consonants, the basic rules — `sva-grund-1/spelling-sound-basics`

## SVA grund delkurs 2

*Who it is for:* 200 poäng. Texts get longer and more varied in genre, writing becomes
structured (introduction — body — conclusion), and work with sources appears.

### Lessons (50 lessons, 50 done)

1. [x] The labour market: vacancies, industries, requirements — `sva-grund-2/labour-market`
2. [x] A job application and a CV — `sva-grund-2/job-application-cv`
3. [x] The employment contract and labour rights; unions — `sva-grund-2/employment-contract-rights`
4. [x] Sick leave, holiday, parental leave — the rules and the vocabulary — `sva-grund-2/parental-sick-leave`
5. [x] The healthcare system: 1177, vårdcentral, akuten — `sva-grund-2/healthcare-system`
6. [x] Housing: the rental contract, the rights and duties of both parties — `sva-grund-2/rental-contract-rights`
7. [x] Household economy: savings, credit, insurance — `sva-grund-2/savings-credit-insurance`
8. [x] The bank, BankID and the state's digital services — `sva-grund-2/bank-digital-services`
9. [x] Taxes and Skatteverket: understanding a tax return — `sva-grund-2/tax-return`
10. [x] School and preschool: contact with the teacher, the development talk — `sva-grund-2/school-preschool-contact`
11. [x] The Swedish education system — an overview — `sva-grund-2/education-system-overview`
12. [x] Ecology and recycling: arguments for and against — `sva-grund-2/ecology-recycling-debate`
13. [x] News: reading a short article and picking out the essentials — `sva-grund-2/news-article-essentials`
14. [x] Describing a chart and statistics in plain words — `sva-grund-2/describing-charts`
15. [x] The argumentative text: thesis, arguments, conclusion — `sva-grund-2/argumentative-text`
16. [x] Retelling and summarising (referat): the neutral third-person phrases — `sva-grund-2/referat-summary`
17. [x] A formal letter to an organisation — `sva-grund-2/formal-letter-organisation`
18. [x] A complaint and a claim in writing — `sva-grund-2/written-complaint-claim`
19. [x] Holidays and traditions: comparing cultures — `sva-grund-2/holidays-culture-comparison`
20. [x] A review of a film or a book — `sva-grund-2/film-book-review`
21. [x] A healthy lifestyle: food, sleep, movement — `sva-grund-2/healthy-lifestyle`
22. [x] Personal experience: telling the story of a significant event — `sva-grund-2/personal-experience-story`
23. [x] Transport and travel: planning a trip — `sva-grund-2/travel-planning`
24. [x] Volunteering and civic life — `sva-grund-2/volunteering-civic-life`
25. [x] A 2–3 minute talk supported by notes — `sva-grund-2/short-talk-notes`
26. [x] The passive: `-s`, `bli`, `vara` — meaning and choosing a form — `sva-grund-2/passive-voice`
27. [x] The agent phrase with `av` and when it is left out — `sva-grund-2/agent-phrase-av`
28. [x] The pluperfect and the order of events in a narrative — `sva-grund-2/pluperfect-narrative`
29. [x] Conditional sentences: real and unreal conditions — `sva-grund-2/conditional-sentences`
30. [x] `skulle ha + supinum` — the unreal condition in the past — `sva-grund-2/unreal-past-conditional`
31. [x] Infinitive constructions: `för att`, `utan att`, `genom att`, `istället för att` — `sva-grund-2/infinitive-constructions`
32. [x] Relative clauses: `som`, `vars`, `där`, `dit`, `vilket` — `sva-grund-2/relative-clauses`
33. [x] Temporal clauses and their word order — `sva-grund-2/temporal-clauses`
34. [x] Concessive and adversative constructions: `fast`, `trots att`, `även om` — `sva-grund-2/concessive-clauses`
35. [x] Cause and effect: `eftersom`, `därför att`, `så att`, `på grund av`, `tack vare` — `sva-grund-2/cause-effect-clauses`
36. [x] The present participle (`-ande/-ende`) — `sva-grund-2/present-participle`
37. [x] The past participle as an adjective, and agreement — `sva-grund-2/past-participle-adjective`
38. [x] Nominalisation: `-ning`, `-ande`, `-het`, `-else` — `sva-grund-2/nominalisation`
39. [x] Word formation: prefixes and suffixes, the productive patterns — `sva-grund-2/word-formation`
40. [x] Abstract prepositions and verbs governing prepositions — `sva-grund-2/verb-preposition-government`
41. [x] Text connectors and paragraph structure — `sva-grund-2/text-connectors`
42. [x] The cleft construction `det är … som` — highlighting what matters — `sva-grund-2/cleft-construction`
43. [x] Reported speech and verbs of saying: `påstår`, `menar`, `hävdar att` — `sva-grund-2/reported-speech-verbs`
44. [x] Word order in long sentences; choosing the fundament — `sva-grund-2/long-sentence-word-order`
45. [x] The spoken and written norms: `dem/dom`, contractions, particles — `sva-grund-2/spoken-written-norms`
46. [x] Word order in indirect questions and other embedded clauses — `sva-grund-2/indirect-question-embedded-word-order`
47. [x] Paired conjunctions: `både … och`, `varken … eller`, `inte bara … utan också` — `sva-grund-2/paired-conjunctions`
48. [x] Quantifiers and amounts in a text: `de flesta`, `en tredjedel`, `andelen`, `allt fler` — `sva-grund-2/quantifiers-amounts-text`
49. [x] The sequence of tenses in reported speech — `sva-grund-2/tense-sequence-reported-speech`
50. [x] Prepositional phrases as adverbials of time, cause and manner — `sva-grund-2/prepositional-phrases-adverbials`

## SVA grund delkurs 3

*Who it is for:* 200 poäng. Work with different text types — descriptive, explanatory,
argumentative; critical reading of sources; a conscious choice of style.

### Lessons (50 lessons, 50 done)

1. [x] The interview and self-presentation — the extended version — `sva-grund-3/interview-extended`
2. [x] The work environment (arbetsmiljö) and conflicts at work — `sva-grund-3/work-environment-conflicts`
3. [x] Discrimination and equality — vocabulary and discussion — `sva-grund-3/discrimination-equality`
4. [x] The Swedish model: the state, the region, the municipality — `sva-grund-3/swedish-model`
5. [x] Elections and parties — neutral vocabulary — `sva-grund-3/elections-parties`
6. [x] Law and the courts: the basic concepts — `sva-grund-3/law-courts-basics`
7. [x] Insurance: types, the contract, making a claim — `sva-grund-3/insurance-claims`
8. [x] Consumer rights and taking a case to ARN — `sva-grund-3/consumer-rights-arn`
9. [x] Media: the source, the author, the purpose of a text, reliability — `sva-grund-3/media-literacy`
10. [x] Fact versus opinion: how to tell them apart in a text — `sva-grund-3/fact-vs-opinion`
11. [x] An argumentative text with a counter-argument — `sva-grund-3/argumentative-counter-argument`
12. [x] An oral presentation supported by notes — `sva-grund-3/oral-presentation-advanced`
13. [x] Discussion: how to join in, object, agree, sum up — `sva-grund-3/discussion-skills`
14. [x] A referat of an article with the source cited — `sva-grund-3/referat-with-source`
15. [x] A literary text: the story, the character, the conflict — `sva-grund-3/literary-text-analysis`
16. [x] Poetry and song: image and metaphor — `sva-grund-3/poetry-song-imagery`
17. [x] The history of Sweden through texts *(cross-references to `content/history/`)* — `sva-grund-3/sweden-history-texts`
18. [x] Technology and privacy: data, surveillance, AI — `sva-grund-3/technology-privacy`
19. [x] Climate and sustainable development — a discussion — `sva-grund-3/climate-sustainability`
20. [x] Migration and integration — a discussion in neutral vocabulary — `sva-grund-3/migration-integration`
21. [x] Comparing cultures: customs, etiquette, expectations — `sva-grund-3/comparing-cultures-etiquette`
22. [x] The economy and the labour market: trends and statistics — `sva-grund-3/economy-labour-trends`
23. [x] Health and prevention: an instructional text — `sva-grund-3/health-prevention-text`
24. [x] Describing a process and cause-and-effect relations — `sva-grund-3/describing-process-causation`
25. [x] Planning further study: upper-secondary level, SVA 1 — `sva-grund-3/planning-further-study`
26. [x] Complex sentences with several subordinate clauses — `sva-grund-3/complex-sentences`
27. [x] The extended noun phrase and agreement inside it — `sva-grund-3/extended-noun-phrase`
28. [x] The passive in informative and official style — `sva-grund-3/passive-official-style`
29. [x] Impersonal constructions: `det`, `man`, the `-s` passive — how to choose — `sva-grund-3/impersonal-constructions`
30. [x] Modality and degree of certainty: `måste`, `borde`, `lär`, `torde`, `kanske` — `sva-grund-3/modality-certainty`
31. [x] Remnants of the subjunctive: `vore`, `må` — `sva-grund-3/subjunctive-remnants`
32. [x] Participial phrases in place of subordinate clauses — `sva-grund-3/participial-phrases`
33. [x] Reported speech and source markers: `enligt`, `hävdar att`, `menar att` — `sva-grund-3/source-markers`
34. [x] Argumentative constructions: `å ena sidan … å andra sidan`, `visserligen … men` — `sva-grund-3/argumentative-constructions`
35. [x] Comparative constructions: `ju … desto`, `lika … som`, `än` — `sva-grund-3/comparative-constructions`
36. [x] Conditional and hypothetical constructions — extended, including the `om`-less conditional with inversion — `sva-grund-3/extended-conditionals`
37. [x] Information structure: theme and rheme, and choosing the fundament — `sva-grund-3/theme-rheme`
38. [x] Nominal versus verbal style: when each is appropriate — `sva-grund-3/nominal-verbal-style`
39. [x] Idioms, metaphors and fixed expressions — `sva-grund-3/idioms-metaphors`
40. [x] Productive affixes: deverbal and denominal formations — `sva-grund-3/productive-affixes`
41. [x] Loanwords and their morphology: `en trend – trender`, `ett center – center` — `sva-grund-3/loanword-morphology`
42. [x] Punctuation: comma, colon, dash, quotation marks — `sva-grund-3/advanced-punctuation`
43. [x] Formatting a quotation and a reference to a source — `sva-grund-3/quotation-formatting`
44. [x] Registers: formal, neutral, colloquial — `sva-grund-3/registers`
45. [x] Typical interference errors and techniques for proofreading your own text — `sva-grund-3/proofreading-techniques`
46. [x] Apposition and parenthetical insertions inside a sentence — `sva-grund-3/apposition-parenthetical`
47. [x] Prosody at a natural pace: word accent, sentence stress and reductions in connected speech — `sva-grund-3/connected-speech-prosody`
48. [x] Generic reference: the indefinite, the definite and the bare plural in general statements — `sva-grund-3/generic-reference`
49. [x] Negation and its scope: `inte`, `ingen`, `aldrig`, `knappast` — placement by clause type — `sva-grund-3/negation-scope`
50. [x] Phase and aspect through verbs and particles: `börja`, `hålla på att`, `bruka`, `få gjort` — `sva-grund-3/phase-aspect-verbs`

## SVA grund delkurs 4

*Who it is for:* 200 poäng, the last step of grundläggande SVA. It gives the final grade
for the course and behörighet for the upper-secondary `Svenska som andraspråk 1`. It
requires an independent, structured text, critical work with sources and a deliberate
style.

### Lessons (50 lessons, 50 done)

1. [x] Upper-secondary level and SVA 1: the requirements and what comes next — `sva-grund-4/sva1-requirements`
2. [x] Applying to university: behörighet, CSN, the application — `sva-grund-4/university-application`
3. [x] CV, cover letter, portfolio — the final version — `sva-grund-4/cv-portfolio-final`
4. [x] The interview: difficult questions and how to answer them — `sva-grund-4/interview-difficult-questions`
5. [x] The employment contract and the payslip — a detailed walkthrough — `sva-grund-4/payslip-walkthrough`
6. [x] A formal letter and an approach to a public authority — `sva-grund-4/formal-authority-letter`
7. [x] The argumentative essay: the full structure — `sva-grund-4/argumentative-essay-full`
8. [x] Utredande text (an explanatory text) with sources — `sva-grund-4/utredande-text`
9. [x] Referat and källkritik: assessing the reliability of a source — `sva-grund-4/kallkritik-assessment`
10. [x] An oral presentation: structure, pace, contact with the audience — `sva-grund-4/oral-presentation-mastery`
11. [x] Debating: preparing a position and answering an opponent — `sva-grund-4/debating-skills`
12. [x] Analysing a literary text: theme, motif, language — `sva-grund-4/literary-analysis-advanced`
13. [x] Swedish literature and cinema — an overview to talk about — `sva-grund-4/swedish-literature-cinema`
14. [x] Language and society: dialects, sociolekt, language norms — `sva-grund-4/language-society`
15. [x] Scandinavian language kinship: Danish and Norwegian by ear — `sva-grund-4/scandinavian-kinship`
16. [x] The economy and the labour market: analysing statistics — `sva-grund-4/economy-statistics-analysis`
17. [x] Healthcare and the social system — in depth — `sva-grund-4/healthcare-system-depth`
18. [x] Ecology and climate policy — a reasoned discussion — `sva-grund-4/climate-policy-discussion`
19. [x] Society: equality, inclusion, rights — a discussion — `sva-grund-4/society-equality-rights`
20. [x] Digital literacy: sources, AI, fact-checking — `sva-grund-4/digital-literacy`
21. [x] A comparative text: two points of view, two systems — `sva-grund-4/comparative-text`
22. [x] An instructional text: explaining a process to the reader — `sva-grund-4/instructional-text-advanced`
23. [x] Proofreading your own text — the working habits: reading aloud, one error type per pass — `sva-grund-4/self-proofreading`
24. [x] Giving feedback on someone else's text (kamratrespons) — `sva-grund-4/peer-feedback`
25. [x] The final project: your own text on a free topic, defended orally — `sva-grund-4/final-project`
26. [x] Full systematisation of the verb system, including the rare forms — `sva-grund-4/verb-system-full`
27. [x] A summary table of every subordinate-clause type and its word order — `sva-grund-4/subordinate-clause-summary`
28. [x] The passive and agent constructions across genres — `sva-grund-4/passive-across-genres`
29. [x] Participial and infinitive phrases as compressed subordinate clauses — `sva-grund-4/compressed-clauses`
30. [x] Nominalisation in academic and business text — `sva-grund-4/nominalisation-academic-business`
31. [x] The syntax of popular-science and official text — `sva-grund-4/popular-science-syntax`
32. [x] Connectors for structuring an essay — `sva-grund-4/essay-connectors`
33. [x] Cohesion and reference: `det`, `detta`, `vilket`, pronominal reference — `sva-grund-4/cohesion-reference`
34. [x] Hedging and cautious wording: `kan tänkas`, `tycks`, `förefaller` — `sva-grund-4/hedging-language`
35. [x] Evaluative vocabulary and objectivity of presentation — `sva-grund-4/evaluative-objectivity`
36. [x] Proportional constructions: `ju … desto`, `i takt med att` — `sva-grund-4/proportional-constructions`
37. [x] Conditional periods of every type in one summary table, including the unreal past — `sva-grund-4/conditional-periods-full`
38. [x] Referatteknik: quotation, paraphrase, reference, plagiarism — `sva-grund-4/referat-technique`
39. [x] Topicalisation, inversion and emphasis as a stylistic choice — `sva-grund-4/topicalisation-emphasis`
40. [x] Tense and aspect in narrative: choosing a form for effect — `sva-grund-4/narrative-tense-aspect`
41. [x] Verb government and collocations — the extended list — `sva-grund-4/verb-collocations-extended`
42. [x] Word formation: complex compounds and productive patterns — `sva-grund-4/complex-compounds`
43. [x] Idioms, metaphors and phraseology in a text — `sva-grund-4/phraseology-in-text`
44. [x] Punctuation and the layout of a formal text — `sva-grund-4/formal-text-layout`
45. [x] The final check before handing in: a checklist of V2, gender, double definiteness, `sin/hans` — `sva-grund-4/self-check-checklist`
46. [x] The long period: subordination versus coordination in a written text — `sva-grund-4/long-period-subordination-coordination`
47. [x] Ellipsis: leaving out what has already been said, and avoiding repetition — `sva-grund-4/ellipsis-repetition-avoidance`
48. [x] Emphatic and restrictive words: `endast`, `enbart`, `just`, `till och med` — `sva-grund-4/emphatic-restrictive-words`
49. [x] Numerical statements: precision, approximation and hedging figures in a text — `sva-grund-4/numerical-precision-hedging`
50. [x] Definitions and terminology: how a concept is introduced and defined — `sva-grund-4/definitions-terminology`
