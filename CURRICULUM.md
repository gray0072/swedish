# Curriculum — lessons by level

This is a programme document (not abstract design, but a concrete list of lessons) that
lives next to [SPEC.md](SPEC.md)/[SPEC_ru.md](SPEC_ru.md). It exists so that **a new
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
| SFI kurs A | 44 | 50 |
| SFI kurs B | 25 | 50 |
| SFI kurs C | 5 | 50 |
| SFI kurs D | 3 | 50 |
| SVA grund delkurs 1 | 45 | 50 |
| SVA grund delkurs 2 | 45 | 50 |
| SVA grund delkurs 3 | 45 | 50 |
| SVA grund delkurs 4 | 50 | 50 |

Lessons done in total: **262** (`npx tsx scripts/validate-content.ts` confirms the
number) out of **400** planned — 50 per level across the eight levels. The **138** still to
write are SFI kurs A's 6 newly added topics, SFI kurs B's 25 (23 grammar lessons and 2 new
topics), the 45 lessons kurs C is missing and the 47 kurs D is missing, and the five
closing grammar lessons of each of SVA grund delkurs 1-3.

**SVA grund is written end to end against its original 20-point grammar plan** — all four
delkurser (1-4), 185 lessons: 100 thematic and 85 grammar, every one of them with
bilingual (RU/EN) theory (`theory.md` + `theory_ru.md`, picked by the study-language
toggle). Delkurs 4 was the capstone level: it gives the course's final grade and
behörighet for the upper-secondary `Svenska som andraspråk 1`, so its grammar lessons
mostly systematise delkurs 1-3 into summary reference lessons (the full verb system, every
subordinate-clause type, every conditional type) rather than introducing new sentence
grammar, and its topics cover what comes after this course (university application, the
final project). Every level was later extended from 20 to 25 grammar points; delkurs 1-3
each still carry those five extra ones — now items 46-50 of their lesson lists — without a
lesson, while delkurs 4 has closed its own.

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
and six inside a thematic lesson. What it now lacks is six freshly added topics — the
level was extended to the same 50 lessons every other level plans for, and so was kurs B,
whose original 25 thematic lessons are all written. The next content frontier is kurs B's
grammar half, SFI kurs C and D (5 and 3 lessons written so far), the closing grammar
lessons of SVA grund delkurs 1-3, the eight new SFI topics, and the still-undesigned real
text-lesson format, tracked in `TODO.md`.

---

## SFI kurs A

*Who it is for:* studieväg 1, starting from zero. A lot of work on literacy itself —
letter, sound, handwriting, reading individual words. Speaking runs ahead of writing.

### Lessons (50 lessons, 44 done)

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
26. [ ] Everyday politeness: `tack`, `tack så mycket`, `varsågod`, `förlåt`, `ursäkta`
27. [ ] Spelling out loud (`bokstavera`): `Hur stavas ditt namn?` — your name and your street letter by letter
28. [ ] Upper and lower case: the handwritten alphabet and writing your own name
29. [ ] A capital letter and a full stop: writing one simple sentence by hand
30. [ ] Telling the teacher you are ill or will be late: `Jag är sjuk`, `Jag kommer sent`
31. [ ] Your own school day at SFI: `lektion`, `rast`, `läxa`, `schema`, `lärare`
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

### Lessons (50 lessons, 25 done)

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
26. [ ] Places in town: `affär`, `apotek`, `bibliotek`, `torg`, `park`
27. [ ] Nature and the outdoors: `skog`, `sjö`, `strand`, `berg` — a trip out of town
28. [ ] The infinitive and `att`: `Jag vill äta`, `Det är kul att läsa`
29. [ ] The modals `vill`, `kan`, `måste`, `får` + infinitive
30. [ ] V2 word order: the verb is always second
31. [ ] Inversion after a fronted adverbial: `På måndag jobbar jag`
32. [ ] Sentence adverbs: `inte, alltid, aldrig, ofta, kanske`
33. [ ] `en`/`ett`: the indefinite and definite singular — as a system
34. [ ] The plural: five declensions (`-or, -ar, -er, -n`, and no ending)
35. [ ] The definite plural: `bilarna`, `husen`, `äpplena`
36. [ ] The conjunctions `och`, `men`, `eller`, `för`, `så`
37. [ ] The predicative adjective: `stor / stort / stora`
38. [ ] The adjective before an indefinite noun
39. [ ] Possessives: `min, din, hans, hennes, vår, er, deras`
40. [ ] Demonstratives: `den här`, `den där`, `de här`
41. [ ] Object pronouns: `mig, dig, honom, henne, oss, er, dem`
42. [ ] Prepositions of place: `i, på, under, bakom, framför, mellan`
43. [ ] Numbers 0–1000, prices and `kronor`
44. [ ] Ordinal numbers and writing a date
45. [ ] Prepositions of time: `klockan`, `på`, `i`, `om`
46. [ ] The preterite of frequent verbs: `var, hade, gick, kom, sa, fick`
47. [ ] `det finns` and `det är` in simple sentences
48. [ ] Quantity: `mycket / många`, `lite / några`, `alla / ingen`
49. [ ] The question words `vilken / vilket / vilka`, `vems`, `hur mycket`
50. [ ] Saying what you like: `tycker om`, `gillar`, `älskar` + noun or infinitive

## SFI kurs C

*Who it is for:* the course exists on all three studievägar, and for studieväg 3 it is the
entry point. Speech becomes connected, accounts of the past and reasons for "why" appear,
and longer texts are read.

### Lessons (50 lessons, 5 done)

1. [x] Public transport — `sfi-c/transport`
2. [x] Money and prices (numbers 20–100) — `sfi-c/money`
3. [x] Health and a visit to the doctor — `sfi-c/health`
4. [x] Booking an appointment (`boka tid`) — `sfi-c/booking`
5. [x] Professions — `sfi-c/professions`
6. [ ] A working day: schedule, break, colleagues
7. [ ] Safety at the workplace
8. [ ] Looking for work: job ads and first steps
9. [ ] At the pharmacy: over-the-counter medicine
10. [ ] Emergencies and calling an ambulance
11. [ ] Reporting to the police: a theft, lost documents, a polisanmälan
12. [ ] At the dentist (tandvård): booking, the treatment, the bill
13. [ ] The post office: letters and parcels
14. [ ] The bank: basic operations, opening an account
15. [ ] Phone and internet: getting connected, a subscription
16. [ ] Paying bills: rent, electricity, internet
17. [ ] Shopping: comparing prices, discounts, returning goods and complaining
18. [ ] Talking about the past: what happened yesterday and last week
19. [ ] Plans for the future and invitations
20. [ ] Opinion and justification: `jag tycker att … eftersom …`
21. [ ] Waste sorting (återvinning)
22. [ ] Free time: cinema, theatre, sports clubs
23. [ ] Parents' meetings and contact with the school
24. [ ] Traffic rules and driving school — the basics
25. [ ] Repairs and a tradesperson at home (plumber, electrician)
26. [ ] The preterite: all four groups, including strong verbs
27. [ ] The supine and strong verb forms: `skriva – skrev – skrivit`
28. [ ] The perfect `har + supinum` and how it differs from the preterite
29. [ ] The future: `ska`, `kommer att`, `tänker` — shades of meaning
30. [ ] Modal verbs in the preterite: `kunde, ville, skulle, fick`
31. [ ] Subordinate clauses with `att` and the BIFF rule (`inte` before the verb)
32. [ ] Subordinate clauses with `om`, `när`, `eftersom`, `så att`
33. [ ] The relative `som` and when it can be omitted
34. [ ] Comparison of adjectives, including irregular forms
35. [ ] The definite form of the adjective: `den stora staden`
36. [ ] Double definiteness as a rule
37. [ ] Reflexive verbs and `sig`: `tvätta sig`, `känna sig`
38. [ ] `sin/sitt/sina` versus `hans/hennes/deras`
39. [ ] The indefinite subject `man`
40. [ ] `det finns` and `det är` — the difference
41. [ ] Frequent particle verbs and stress on the particle
42. [ ] Prepositions of place and direction: `i / till`, `på / till`, `hos`
43. [ ] Adverbs: `hem/hemma`, `ut/ute`, `in/inne`, `dit/där`
44. [ ] The sentence schema: fundament — verb — subject — adverb
45. [ ] Compounds and basic suffixes: `-are`, `-het`, `-ning`
46. [ ] The `-s` passive on signs and in instructions — a first acquaintance
47. [ ] Numbers in dates, years and percentages: `procent`, `hälften`, `dubbelt`
48. [ ] Adverbs of degree and frequency: `ganska`, `väldigt`, `alltför`, `sällan`, `ibland`
49. [ ] The indirect question: `Vet du var …?`, `Kan du säga om …?`
50. [ ] Time expressions: `för … sedan`, `sedan`, `redan`, `ännu`, `i … tid`

## SFI kurs D

*Who it is for:* the final SFI course on every studieväg. It requires connected speech on
unfamiliar topics, argumentation, writing a paragraph or two, and understanding speech at
a normal (not adapted) pace. Next comes SVA grund delkurs 1.

### Lessons (50 lessons, 3 done)

1. [x] Housing and renting — `sfi-d/housing`
2. [x] Government agencies and forms — `sfi-d/authorities`
3. [x] Emotions — `sfi-d/emotions`
4. [ ] Digital public services: BankID, Mina sidor, 1177
5. [ ] The municipality (kommun): which service comes from where
6. [ ] Understanding a bill, a receipt and a payslip
7. [ ] Taxes: Skatteverket and the basics of a tax return
8. [ ] Insurance: home, property, health
9. [ ] The employment contract (anställningsavtal), the union and labour rights
10. [ ] Sick leave, holiday, parental leave (föräldraledighet)
11. [ ] A CV and a cover letter
12. [ ] The interview: introducing yourself and the typical questions
13. [ ] Business correspondence by email — the formal register
14. [ ] An application and a complaint to a public authority — a simple template
15. [ ] A rental contract: reading and understanding the key clauses
16. [ ] Credit, instalments, the household budget
17. [ ] Further education: komvux, SVA grund, CSN
18. [ ] Elections and municipal politics — basic vocabulary
19. [ ] Media: reading and retelling a simple news item
20. [ ] Consumer rights
21. [ ] Shopping online: the order, delivery, returns, ångerrätt
22. [ ] Ecology and sustainable living — a discussion
23. [ ] Talking to a teacher about your child
24. [ ] Cultural adaptation: habits, etiquette, expectations
25. [ ] Final review: telling the story of your life and plans in Sweden
26. [ ] An overview of the tense system: present, preterite, perfect, pluperfect, future
27. [ ] The pluperfect when narrating a sequence of events
28. [ ] The `-s` passive and the `bli` passive
29. [ ] `skulle` + infinitive: conditionality and politeness
30. [ ] Conditional sentences `om … så`
31. [ ] Infinitive constructions: `för att`, `utan att`, `genom att`
32. [ ] Temporal clauses: `när`, `då`, `medan`, `innan`, `efter att`
33. [ ] Concessives: `fast`, `trots att`, `även om`
34. [ ] Causals: `eftersom`, `därför att`, `på grund av`
35. [ ] Reported speech and the indirect question with `om`
36. [ ] Relative clauses: `som`, `där`, `dit`, `vars`
37. [ ] Present and past participles as modifiers
38. [ ] Double definiteness: the full picture, including the exceptions
39. [ ] Difficult agreement cases: `liten / litet / lilla / små`
40. [ ] Abstract prepositions: `av`, `för`, `till`, `om`, `inför`
41. [ ] Verbs governing prepositions: the frequent pairs
42. [ ] Nominalisation and the marks of written style
43. [ ] Text connectors: `dessutom`, `däremot`, `alltså`, `därför`, `å andra sidan`
44. [ ] Modal particles: `ju`, `nog`, `väl`, `faktiskt`
45. [ ] The written norm versus the spoken one: `dem/dom`, `ska/skall`, `sade/sa`
46. [ ] `vore` and other cautious wordings in a request or an opinion
47. [ ] Impersonal `det`: `det regnar`, `det är viktigt att …`, `det sägs att …`
48. [ ] Comparative constructions: `ju … desto`, `lika … som`, `ännu mer än`
49. [ ] Word formation with the prefixes `o-` and `miss-`: `omöjlig`, `otrevlig`, `missförstå`
50. [ ] Punctuation in a written text: the comma before a subordinate clause, paragraphing

## SVA grund delkurs 1

*Who it is for:* the first komvux course after SFI kurs D, 100 poäng. This is where
metalanguage and work with texts appear: not only "say it", but "read it, retell it,
write it".

### Lessons (50 lessons, 45 done)

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
46. [ ] The article: when a noun goes without one — professions, mass nouns, fixed phrases
47. [ ] `det` as a formal subject and a placeholder: `det finns`, `det är`, `det regnar`
48. [ ] Adverbs: formation with `-t`, and the pairs `hem/hemma`, `ut/ute`, `dit/där`
49. [ ] Numerals: cardinal, ordinal, dates and clock times, and how they are read aloud
50. [ ] Spelling and sound: long and short vowels, double consonants, the basic rules

## SVA grund delkurs 2

*Who it is for:* 200 poäng. Texts get longer and more varied in genre, writing becomes
structured (introduction — body — conclusion), and work with sources appears.

### Lessons (50 lessons, 45 done)

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
16. [x] Retelling and summarising (referat) — `sva-grund-2/referat-summary`
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
46. [ ] Word order in indirect questions and other embedded clauses
47. [ ] Paired conjunctions: `både … och`, `varken … eller`, `inte bara … utan också`
48. [ ] Quantifiers and amounts in a text: `de flesta`, `en tredjedel`, `andelen`, `allt fler`
49. [ ] The sequence of tenses in reported speech
50. [ ] Prepositional phrases as adverbials of time, cause and manner

## SVA grund delkurs 3

*Who it is for:* 200 poäng. Work with different text types — descriptive, explanatory,
argumentative; critical reading of sources; a conscious choice of style.

### Lessons (50 lessons, 45 done)

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
36. [x] Conditional and hypothetical constructions — extended — `sva-grund-3/extended-conditionals`
37. [x] Information structure: theme and rheme, and choosing the fundament — `sva-grund-3/theme-rheme`
38. [x] Nominal versus verbal style: when each is appropriate — `sva-grund-3/nominal-verbal-style`
39. [x] Idioms, metaphors and fixed expressions — `sva-grund-3/idioms-metaphors`
40. [x] Productive affixes: deverbal and denominal formations — `sva-grund-3/productive-affixes`
41. [x] Loanwords and their morphology: `en trend – trender`, `ett center – center` — `sva-grund-3/loanword-morphology`
42. [x] Punctuation: comma, colon, dash, quotation marks — `sva-grund-3/advanced-punctuation`
43. [x] Formatting a quotation and a reference to a source — `sva-grund-3/quotation-formatting`
44. [x] Registers: formal, neutral, colloquial — `sva-grund-3/registers`
45. [x] Typical interference errors and techniques for proofreading your own text — `sva-grund-3/proofreading-techniques`
46. [ ] Apposition and parenthetical insertions inside a sentence
47. [ ] Existential sentences with `det finns` and the constraint on definiteness
48. [ ] Generic reference: the indefinite, the definite and the bare plural in general statements
49. [ ] Negation and its scope: `inte`, `ingen`, `aldrig`, `knappast` — placement by clause type
50. [ ] Phase and aspect through verbs and particles: `börja`, `hålla på att`, `bruka`, `få gjort`

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
23. [x] Proofreading your own text — `sva-grund-4/self-proofreading`
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
37. [x] Conditional periods of every type, including the unreal past — `sva-grund-4/conditional-periods-full`
38. [x] Referatteknik: quotation, paraphrase, reference, plagiarism — `sva-grund-4/referat-technique`
39. [x] Topicalisation, inversion and emphasis as a stylistic choice — `sva-grund-4/topicalisation-emphasis`
40. [x] Tense and aspect in narrative: choosing a form for effect — `sva-grund-4/narrative-tense-aspect`
41. [x] Verb government and collocations — the extended list — `sva-grund-4/verb-collocations-extended`
42. [x] Word formation: complex compounds and productive patterns — `sva-grund-4/complex-compounds`
43. [x] Idioms, metaphors and phraseology in a text — `sva-grund-4/phraseology-in-text`
44. [x] Punctuation and the layout of a formal text — `sva-grund-4/formal-text-layout`
45. [x] Proofreading: the typical mistakes, a self-check list — `sva-grund-4/self-check-checklist`
46. [x] The long period: subordination versus coordination in a written text — `sva-grund-4/long-period-subordination-coordination`
47. [x] Ellipsis: leaving out what has already been said, and avoiding repetition — `sva-grund-4/ellipsis-repetition-avoidance`
48. [x] Emphatic and restrictive words: `endast`, `enbart`, `just`, `till och med` — `sva-grund-4/emphatic-restrictive-words`
49. [x] Numerical statements: precision, approximation and hedging figures in a text — `sva-grund-4/numerical-precision-hedging`
50. [x] Definitions and terminology: how a concept is introduced and defined — `sva-grund-4/definitions-terminology`
