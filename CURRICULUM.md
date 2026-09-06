# Curriculum — topics and grammar by level

This is a programme document (not abstract design, but a concrete list of lessons) that
lives next to [SPEC.md](SPEC.md)/[SPEC_ru.md](SPEC_ru.md). It exists so that **a new
session can start straight from it**: open the file, see which topics are already done and
which are queued, and start writing content without rebuilding the context from scratch.

It is updated as lessons are added: when you write a new lesson, mark it `[x]` here and
fill in the slug. If you add a topic that was not on the list, append it at the end of the
level's section — there is no need to maintain strict numbering.

Every level has two parts: a **list of topics** (vocabulary and communicative situations)
and **20 grammar points** — what is introduced or drilled at that level. Grammar is
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

| Level | Done | Topics planned | Grammar points |
|---|---|---|---|
| SFI kurs A | 9 | 25 | 20 |
| SFI kurs B | 9 | 25 | 20 |
| SFI kurs C | 5 | 25 | 20 |
| SFI kurs D | 3 | 25 | 20 |
| SVA grund delkurs 1 | 45 | 25 | 20 |
| SVA grund delkurs 2 | 45 | 25 | 20 |
| SVA grund delkurs 3 | 0 | 25 | 20 |
| SVA grund delkurs 4 | 0 | 25 | 20 |

Lessons done in total: **116** (`npx tsx scripts/validate-content.ts` confirms the number).
Grammar points planned in total: **160**, of which **40** now have a dedicated lesson
(all of SVA grund delkurs 1 and 2).

All 26 SFI lessons are vocabulary and phrase lessons. SVA grund delkurs 1 and delkurs 2
are both now complete: 20 grammar lessons plus all 25 thematic topics at each level,
every one with bilingual (RU/EN) theory (`theory.md` + `theory_en.md`, picked by the
study-language toggle). The thematic topics use the same vocab/phrases lesson pipeline
as SFI rather than an actual reading-passage format — a few of them (reading a short
story and retelling it, retelling what you heard, a referat with a cited source) were
originally imagined as needing dedicated text-based mechanics the project doesn't have;
for now they teach the vocabulary/phrases the skill needs instead. Delkurs 3–4 are still
fully empty: a topic lesson there is work with a text (referat, argumentation,
källkritik), and the project has no such lesson format yet.

---

## SFI kurs A

*Who it is for:* studieväg 1, starting from zero. A lot of work on literacy itself —
letter, sound, handwriting, reading individual words. Speaking runs ahead of writing.

### Topics

1. [x] The alphabet (special attention to å/ä/ö) — `sfi-a/alphabet`
2. [x] Greetings — `sfi-a/greetings`
3. [x] Numbers 0–20 — `sfi-a/numbers-0-20`
4. [x] Personal details / a form — `sfi-a/personal-info`
5. [x] Days of the week — `sfi-a/days-of-week`
6. [x] Colours — `sfi-a/colors`
7. [x] Times of day — `sfi-a/time-of-day`
8. [x] Telling the time (halv/kvart/över/i) — `sfi-a/clock`
9. [x] The human body — `sfi-a/body`
10. [ ] Classroom instructions (open the book, listen, repeat, write)
11. [ ] Simple questions and answers (yes/no practice)
12. [ ] Reading simple signs (öppet/stängt, ingång/utgång, WC)
13. [ ] Emergency phrases (help, 112, "I don't understand")
14. [ ] Numbers on the phone: a phone number and personnummer digit by digit
15. [ ] Months and seasons
16. [ ] The Swedish calendar: how to write a date
17. [ ] Shapes and sizes (circle, square, big/small)
18. [ ] Simple shopping phrases (how much is it, can I pay by card)
19. [ ] Simple directions (go straight ahead, turn left/right)
20. [ ] Simple verbs of movement (walk, run, sit, stand)
21. [ ] School and stationery items
22. [ ] Countries and nationalities
23. [ ] How you feel: "I feel bad", "I have a headache"
24. [ ] Like / dislike — simple phrases
25. [ ] A simple daily routine (got up, ate, went to bed)

### Grammar (20 points)

Here grammar is **not explained with terminology** — it is drilled as ready-made patterns.

1. [ ] The alphabet: 29 letters, with `å`, `ä`, `ö` separate
2. [ ] Letter-to-sound correspondence; `sj-`, `tj-`, `k-` before a front vowel
3. [ ] Long and short vowels: `vit` / `vitt`, `mat` / `matt`
4. [ ] Personal pronouns: `jag, du, han, hon, vi, ni, de`
5. [ ] The present tense as a ready-made form: `heter, bor, kommer, talar`
6. [ ] `är` and `har` in simple phrases about yourself
7. [ ] Word order in a simple statement: `Jag bor i Malmö`
8. [ ] Wh-questions: `Vad heter du?`, `Var bor du?`, `Hur gammal är du?`
9. [ ] Yes/no questions through inversion: `Är du gift?`, `Har du barn?`
10. [ ] The negation `inte`: `Jag förstår inte`
11. [ ] `en` / `ett` — a first acquaintance on frequent words
12. [ ] The definite form: `en bok → boken`
13. [ ] Recognising the plural: `en bok – två böcker`
14. [ ] `min` / `mitt`: `min mamma`, `mitt barn`
15. [ ] Numbers 0–20 and digits in personal details
16. [ ] Colour adjectives in the base form
17. [ ] The prepositions `i` and `på`: `bor i Sverige`, `på Storgatan 5`
18. [ ] `på` with days of the week: `på måndag`
19. [ ] The imperative in classroom instructions: `Lyssna!`, `Läs!`, `Skriv!`, `Öppna boken!`
20. [ ] A polite request with `kan`: `Kan du upprepa?`, `Kan du skriva det?`

## SFI kurs B

*Who it is for:* the continuation of studieväg 1 and the entry point for studieväg 2.
Simple connected speech on familiar topics appears, along with simple writing and reading
short adapted texts.

### Topics

1. [x] Family — `sfi-b/family`
2. [x] Family and relationships — the deeper version — `sfi-b/family-relations`
3. [x] Home and rooms — `sfi-b/home`
4. [x] Animals — `sfi-b/animals`
5. [x] Clothing — `sfi-b/clothing`
6. [x] Weather — `sfi-b/weather`
7. [x] Food and drinks — `sfi-b/food-drinks`
8. [x] Cooking: verbs and kitchen utensils — `sfi-b/cooking`
9. [x] Verbs in the present tense — `sfi-b/present-tense`
10. [ ] At the grocery store: departments, the till, weighing and paying
11. [ ] At the clothing store: sizes, trying on, exchanges
12. [ ] Daily routine — as a connected account
13. [ ] Adjective antonyms and describing objects
14. [ ] Describing a person's appearance
15. [ ] Hobbies and free time
16. [ ] Home: cleaning and household chores
17. [ ] Neighbours and small talk in the stairwell
18. [ ] Celebrations: birthdays, jul, midsommar — basic vocabulary
19. [ ] Money: coins and notes, "how much does it cost"
20. [ ] Directions in town: how to ask the way
21. [ ] The library: borrowing a book, the rules
22. [ ] Preschool and school for children — basic words
23. [ ] Simple feelings (tired, hungry, happy)
24. [ ] Pets and taking care of them
25. [ ] A simple phone call (asking about opening hours)

### Grammar (20 points)

1. [ ] The infinitive and `att`: `Jag vill äta`, `Det är kul att läsa`
2. [ ] The present tense across all four verb groups; how to identify the group
3. [ ] The modals `vill`, `kan`, `måste`, `får` + infinitive
4. [ ] V2 word order: the verb is always second
5. [ ] Inversion after a fronted adverbial: `På måndag jobbar jag`
6. [ ] Sentence adverbs: `inte, alltid, aldrig, ofta, kanske`
7. [ ] `en`/`ett`: the indefinite and definite singular — as a system
8. [ ] The plural: five declensions (`-or, -ar, -er, -n`, and no ending)
9. [ ] The definite plural: `bilarna`, `husen`, `äpplena`
10. [ ] The conjunctions `och`, `men`, `eller`, `för`, `så`
11. [ ] The predicative adjective: `stor / stort / stora`
12. [ ] The adjective before an indefinite noun
13. [ ] Possessives: `min, din, hans, hennes, vår, er, deras`
14. [ ] Demonstratives: `den här`, `den där`, `de här`
15. [ ] Object pronouns: `mig, dig, honom, henne, oss, er, dem`
16. [ ] Prepositions of place: `i, på, under, bakom, framför, mellan`
17. [ ] Numbers 0–1000, prices and `kronor`
18. [ ] Ordinal numbers and writing a date
19. [ ] Prepositions of time: `klockan`, `på`, `i`, `om`
20. [ ] The preterite of frequent verbs: `var, hade, gick, kom, sa, fick`

## SFI kurs C

*Who it is for:* the course exists on all three studievägar, and for studieväg 3 it is the
entry point. Speech becomes connected, accounts of the past and reasons for "why" appear,
and longer texts are read.

### Topics

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
11. [ ] Transport: tickets, fines, delays, changes
12. [ ] The post office: letters and parcels
13. [ ] The bank: basic operations, opening an account
14. [ ] Phone and internet: getting connected, a subscription
15. [ ] Paying bills: rent, electricity, internet
16. [ ] Shopping: comparing prices, discounts, percentages
17. [ ] Complaints and returning goods
18. [ ] Talking about the past: what happened yesterday and last week
19. [ ] Plans for the future and invitations
20. [ ] Opinion and justification: `jag tycker att … eftersom …`
21. [ ] Waste sorting (återvinning)
22. [ ] Free time: cinema, theatre, sports clubs
23. [ ] Parents' meetings and contact with the school
24. [ ] Traffic rules and driving school — the basics
25. [ ] Repairs and a tradesperson at home (plumber, electrician)

### Grammar (20 points)

1. [ ] The preterite: all four groups, including strong verbs
2. [ ] The supine and strong verb forms: `skriva – skrev – skrivit`
3. [ ] The perfect `har + supinum` and how it differs from the preterite
4. [ ] The future: `ska`, `kommer att`, `tänker` — shades of meaning
5. [ ] Modal verbs in the preterite: `kunde, ville, skulle, fick`
6. [ ] Subordinate clauses with `att` and the BIFF rule (`inte` before the verb)
7. [ ] Subordinate clauses with `om`, `när`, `eftersom`, `så att`
8. [ ] The relative `som` and when it can be omitted
9. [ ] Comparison of adjectives, including irregular forms
10. [ ] The definite form of the adjective: `den stora staden`
11. [ ] Double definiteness as a rule
12. [ ] Reflexive verbs and `sig`: `tvätta sig`, `känna sig`
13. [ ] `sin/sitt/sina` versus `hans/hennes/deras`
14. [ ] The indefinite subject `man`
15. [ ] `det finns` and `det är` — the difference
16. [ ] Frequent particle verbs and stress on the particle
17. [ ] Prepositions of place and direction: `i / till`, `på / till`, `hos`
18. [ ] Adverbs: `hem/hemma`, `ut/ute`, `in/inne`, `dit/där`
19. [ ] The sentence schema: fundament — verb — subject — adverb
20. [ ] Compounds and basic suffixes: `-are`, `-het`, `-ning`

## SFI kurs D

*Who it is for:* the final SFI course on every studieväg. It requires connected speech on
unfamiliar topics, argumentation, writing a paragraph or two, and understanding speech at
a normal (not adapted) pace. Next comes SVA grund delkurs 1.

### Topics

1. [x] Housing and renting — `sfi-d/housing`
2. [x] Government agencies and forms — `sfi-d/authorities`
3. [x] Emotions — `sfi-d/emotions`
4. [ ] Digital public services: BankID, Mina sidor, 1177
5. [ ] The municipality (kommun): which service comes from where
6. [ ] Understanding a bill, a receipt and a payslip
7. [ ] Taxes: Skatteverket and the basics of a tax return
8. [ ] Insurance: home, property, health
9. [ ] The employment contract (anställningsavtal) — the key clauses
10. [ ] Unions and labour rights
11. [ ] Sick leave, holiday, parental leave (föräldraledighet)
12. [ ] A CV and a cover letter
13. [ ] The interview: introducing yourself and the typical questions
14. [ ] Business correspondence by email — the formal register
15. [ ] An application and a complaint to a public authority — a simple template
16. [ ] A rental contract: reading and understanding the key clauses
17. [ ] Credit, instalments, the household budget
18. [ ] Further education: komvux, SVA grund, CSN
19. [ ] Elections and municipal politics — basic vocabulary
20. [ ] Media: reading and retelling a simple news item
21. [ ] Consumer rights
22. [ ] Ecology and sustainable living — a discussion
23. [ ] Talking to a teacher about your child
24. [ ] Cultural adaptation: habits, etiquette, expectations
25. [ ] Final review: telling the story of your life and plans in Sweden

### Grammar (20 points)

1. [ ] An overview of the tense system: present, preterite, perfect, pluperfect, future
2. [ ] The pluperfect when narrating a sequence of events
3. [ ] The `-s` passive and the `bli` passive
4. [ ] `skulle` + infinitive: conditionality and politeness
5. [ ] Conditional sentences `om … så`
6. [ ] Infinitive constructions: `för att`, `utan att`, `genom att`
7. [ ] Temporal clauses: `när`, `då`, `medan`, `innan`, `efter att`
8. [ ] Concessives: `fast`, `trots att`, `även om`
9. [ ] Causals: `eftersom`, `därför att`, `på grund av`
10. [ ] Reported speech and the indirect question with `om`
11. [ ] Relative clauses: `som`, `där`, `dit`, `vars`
12. [ ] Present and past participles as modifiers
13. [ ] Double definiteness: the full picture, including the exceptions
14. [ ] Difficult agreement cases: `liten / litet / lilla / små`
15. [ ] Abstract prepositions: `av`, `för`, `till`, `om`, `inför`
16. [ ] Verbs governing prepositions: the frequent pairs
17. [ ] Nominalisation and the marks of written style
18. [ ] Text connectors: `dessutom`, `däremot`, `alltså`, `därför`, `å andra sidan`
19. [ ] Modal particles: `ju`, `nog`, `väl`, `faktiskt`
20. [ ] The written norm versus the spoken one: `dem/dom`, `ska/skall`, `sade/sa`

## SVA grund delkurs 1

*Who it is for:* the first komvux course after SFI kurs D, 100 poäng. This is where
metalanguage and work with texts appear: not only "say it", but "read it, retell it,
write it".

### Topics

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

### Grammar (20 points)

Delkurs 1 systematises what SFI taught through patterns: the same topics, but now with
terminology and rules. Every point below now has its own dedicated bilingual (RU/EN)
lesson — see the slug next to each.

1. [x] Parts of speech and metalanguage: `verb, substantiv, adjektiv, pronomen, preposition` — `sva-grund-1/parts-of-speech`
2. [x] Sentence elements: `subjekt, predikat, objekt, adverbial` — `sva-grund-1/sentence-elements`
3. [x] The four verb groups and the strong verbs — systematised — `sva-grund-1/verb-groups`
4. [x] All the tenses: present, preterite, perfect, pluperfect — in one table — `sva-grund-1/tense-overview`
5. [x] The future: `ska` / `kommer att` / the present — how to choose — `sva-grund-1/future-tense`
6. [x] Modal verbs in every tense — `sva-grund-1/modal-verbs-tenses`
7. [x] `att` + infinitive, and the infinitive without `att` — `sva-grund-1/att-infinitive`
8. [x] Main-clause word order: the fundament and the V2 rule — `sva-grund-1/main-clause-word-order`
9. [x] Subordinate-clause word order and the BIFF rule — `sva-grund-1/subordinate-clause-word-order`
10. [x] The position of sentence adverbs in main and subordinate clauses — `sva-grund-1/sentence-adverb-position`
11. [x] The noun: gender, number, definiteness — the full system of five declensions — `sva-grund-1/noun-declensions`
12. [x] Double definiteness and its exceptions — `sva-grund-1/double-definiteness`
13. [x] The adjective: strong and weak declension — `sva-grund-1/adjective-declension`
14. [x] Comparison, including suppletive forms — `sva-grund-1/adjective-comparison`
15. [x] Pronouns: personal, object, possessive, reflexive — `sva-grund-1/pronouns-overview`
16. [x] `sin/sitt/sina` — drilled to automaticity — `sva-grund-1/sin-sitt-sina`
17. [x] Indefinite pronouns: `någon, ingen, varje, alla, all/allt` — `sva-grund-1/indefinite-pronouns`
18. [x] Particle verbs and how they differ from "verb + preposition" — `sva-grund-1/particle-verbs`
19. [x] Compounds and the linking `-s-` — `sva-grund-1/compound-words`
20. [x] Punctuation and capitalisation; splitting a text into paragraphs — `sva-grund-1/punctuation-paragraphs`

## SVA grund delkurs 2

*Who it is for:* 200 poäng. Texts get longer and more varied in genre, writing becomes
structured (introduction — body — conclusion), and work with sources appears.

### Topics

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

### Grammar (20 points)

1. [x] The passive: `-s`, `bli`, `vara` — meaning and choosing a form — `sva-grund-2/passive-voice`
2. [x] The agent phrase with `av` and when it is left out — `sva-grund-2/agent-phrase-av`
3. [x] The pluperfect and the order of events in a narrative — `sva-grund-2/pluperfect-narrative`
4. [x] Conditional sentences: real and unreal conditions — `sva-grund-2/conditional-sentences`
5. [x] `skulle ha + supinum` — the unreal condition in the past — `sva-grund-2/unreal-past-conditional`
6. [x] Infinitive constructions: `för att`, `utan att`, `genom att`, `istället för att` — `sva-grund-2/infinitive-constructions`
7. [x] Relative clauses: `som`, `vars`, `där`, `dit`, `vilket` — `sva-grund-2/relative-clauses`
8. [x] Temporal clauses and their word order — `sva-grund-2/temporal-clauses`
9. [x] Concessive and adversative constructions: `fast`, `trots att`, `även om` — `sva-grund-2/concessive-clauses`
10. [x] Cause and effect: `eftersom`, `därför att`, `så att`, `på grund av`, `tack vare` — `sva-grund-2/cause-effect-clauses`
11. [x] The present participle (`-ande/-ende`) — `sva-grund-2/present-participle`
12. [x] The past participle as an adjective, and agreement — `sva-grund-2/past-participle-adjective`
13. [x] Nominalisation: `-ning`, `-ande`, `-het`, `-else` — `sva-grund-2/nominalisation`
14. [x] Word formation: prefixes and suffixes, the productive patterns — `sva-grund-2/word-formation`
15. [x] Abstract prepositions and verbs governing prepositions — `sva-grund-2/verb-preposition-government`
16. [x] Text connectors and paragraph structure — `sva-grund-2/text-connectors`
17. [x] The cleft construction `det är … som` — highlighting what matters — `sva-grund-2/cleft-construction`
18. [x] Reported speech and verbs of saying: `påstår`, `menar`, `hävdar att` — `sva-grund-2/reported-speech-verbs`
19. [x] Word order in long sentences; choosing the fundament — `sva-grund-2/long-sentence-word-order`
20. [x] The spoken and written norms: `dem/dom`, contractions, particles — `sva-grund-2/spoken-written-norms`

## SVA grund delkurs 3

*Who it is for:* 200 poäng. Work with different text types — descriptive, explanatory,
argumentative; critical reading of sources; a conscious choice of style.

### Topics

1. [ ] The interview and self-presentation — the extended version
2. [ ] The work environment (arbetsmiljö) and conflicts at work
3. [ ] Discrimination and equality — vocabulary and discussion
4. [ ] The Swedish model: the state, the region, the municipality
5. [ ] Elections and parties — neutral vocabulary
6. [ ] Law and the courts: the basic concepts
7. [ ] Insurance: types, the contract, making a claim
8. [ ] Consumer rights and taking a case to ARN
9. [ ] Media: the source, the author, the purpose of a text, reliability
10. [ ] Fact versus opinion: how to tell them apart in a text
11. [ ] An argumentative text with a counter-argument
12. [ ] An oral presentation supported by notes
13. [ ] Discussion: how to join in, object, agree, sum up
14. [ ] A referat of an article with the source cited
15. [ ] A literary text: the story, the character, the conflict
16. [ ] Poetry and song: image and metaphor
17. [ ] The history of Sweden through texts *(cross-references to `content/history/`)*
18. [ ] Technology and privacy: data, surveillance, AI
19. [ ] Climate and sustainable development — a discussion
20. [ ] Migration and integration — a discussion in neutral vocabulary
21. [ ] Comparing cultures: customs, etiquette, expectations
22. [ ] The economy and the labour market: trends and statistics
23. [ ] Health and prevention: an instructional text
24. [ ] Describing a process and cause-and-effect relations
25. [ ] Planning further study: upper-secondary level, SVA 1

### Grammar (20 points)

1. [ ] Complex sentences with several subordinate clauses
2. [ ] The extended noun phrase and agreement inside it
3. [ ] The passive in informative and official style
4. [ ] Impersonal constructions: `det`, `man`, the `-s` passive — how to choose
5. [ ] Modality and degree of certainty: `måste`, `borde`, `lär`, `torde`, `kanske`
6. [ ] Remnants of the subjunctive: `vore`, `må`
7. [ ] Participial phrases in place of subordinate clauses
8. [ ] Reported speech and source markers: `enligt`, `hävdar att`, `menar att`
9. [ ] Argumentative constructions: `å ena sidan … å andra sidan`, `visserligen … men`
10. [ ] Comparative constructions: `ju … desto`, `lika … som`, `än`
11. [ ] Conditional and hypothetical constructions — extended
12. [ ] Information structure: theme and rheme, and choosing the fundament
13. [ ] Nominal versus verbal style: when each is appropriate
14. [ ] Idioms, metaphors and fixed expressions
15. [ ] Productive affixes: deverbal and denominal formations
16. [ ] Loanwords and their morphology: `en trend – trender`, `ett center – center`
17. [ ] Punctuation: comma, colon, dash, quotation marks
18. [ ] Formatting a quotation and a reference to a source
19. [ ] Registers: formal, neutral, colloquial
20. [ ] Typical interference errors and techniques for proofreading your own text

## SVA grund delkurs 4

*Who it is for:* 200 poäng, the last step of grundläggande SVA. It gives the final grade
for the course and behörighet for the upper-secondary `Svenska som andraspråk 1`. It
requires an independent, structured text, critical work with sources and a deliberate
style.

### Topics

1. [ ] Upper-secondary level and SVA 1: the requirements and what comes next
2. [ ] Applying to university: behörighet, CSN, the application
3. [ ] CV, cover letter, portfolio — the final version
4. [ ] The interview: difficult questions and how to answer them
5. [ ] The employment contract and the payslip — a detailed walkthrough
6. [ ] A formal letter and an approach to a public authority
7. [ ] The argumentative essay: the full structure
8. [ ] Utredande text (an explanatory text) with sources
9. [ ] Referat and källkritik: assessing the reliability of a source
10. [ ] An oral presentation: structure, pace, contact with the audience
11. [ ] Debating: preparing a position and answering an opponent
12. [ ] Analysing a literary text: theme, motif, language
13. [ ] Swedish literature and cinema — an overview to talk about
14. [ ] Language and society: dialects, sociolekt, language norms
15. [ ] Scandinavian language kinship: Danish and Norwegian by ear
16. [ ] The economy and the labour market: analysing statistics
17. [ ] Healthcare and the social system — in depth
18. [ ] Ecology and climate policy — a reasoned discussion
19. [ ] Society: equality, inclusion, rights — a discussion
20. [ ] Digital literacy: sources, AI, fact-checking
21. [ ] A comparative text: two points of view, two systems
22. [ ] An instructional text: explaining a process to the reader
23. [ ] Proofreading your own text
24. [ ] Giving feedback on someone else's text (kamratrespons)
25. [ ] The final project: your own text on a free topic, defended orally

### Grammar (20 points)

1. [ ] Full systematisation of the verb system, including the rare forms
2. [ ] A summary table of every subordinate-clause type and its word order
3. [ ] The passive and agent constructions across genres
4. [ ] Participial and infinitive phrases as compressed subordinate clauses
5. [ ] Nominalisation in academic and business text
6. [ ] The syntax of popular-science and official text
7. [ ] Connectors for structuring an essay
8. [ ] Cohesion and reference: `det`, `detta`, `vilket`, pronominal reference
9. [ ] Hedging and cautious wording: `kan tänkas`, `tycks`, `förefaller`
10. [ ] Evaluative vocabulary and objectivity of presentation
11. [ ] Proportional constructions: `ju … desto`, `i takt med att`
12. [ ] Conditional periods of every type, including the unreal past
13. [ ] Referatteknik: quotation, paraphrase, reference, plagiarism
14. [ ] Topicalisation, inversion and emphasis as a stylistic choice
15. [ ] Tense and aspect in narrative: choosing a form for effect
16. [ ] Verb government and collocations — the extended list
17. [ ] Word formation: complex compounds and productive patterns
18. [ ] Idioms, metaphors and phraseology in a text
19. [ ] Punctuation and the layout of a formal text
20. [ ] Proofreading: the typical mistakes, a self-check list
