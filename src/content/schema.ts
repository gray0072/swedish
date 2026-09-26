import { z } from 'zod';
import type { BuildingPrice } from '@/city/economy';

/** { ru?, en?, sv? } — sv is content (Swedish words/flavour), never an interface locale. */
export const localizedStringSchema = z.object({
  ru: z.string().optional(),
  en: z.string().optional(),
  sv: z.string().optional(),
});
export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const studyLanguageSchema = z.enum(['en', 'ru']);
export type StudyLanguage = z.infer<typeof studyLanguageSchema>;

/** Native-name labels for the study language dropdown. Add new languages here only. */
export const LANGUAGE_OPTIONS: { code: StudyLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

/** Resolve a localized string for the current study language, with sane fallback order. */
export function resolveLocalized(
  value: LocalizedString | undefined,
  lang: StudyLanguage,
): string {
  if (!value) return '';
  const other: StudyLanguage = lang === 'en' ? 'ru' : 'en';
  return value[lang] ?? value[other] ?? value.sv ?? Object.values(value).find(Boolean) ?? '';
}

/** A raw Swedish string renders as-is; a LocalizedString resolves against the study language. */
export function resolveChoice(choice: unknown, lang: StudyLanguage): string {
  if (typeof choice === 'string') return choice;
  return resolveLocalized(choice as LocalizedString, lang);
}

// ---------------------------------------------------------------------------
// Tracks & levels
// ---------------------------------------------------------------------------

export const levelSchema = z.object({
  id: z.string(),
  title: localizedStringSchema,
  order: z.number(),
});
export type Level = z.infer<typeof levelSchema>;

export const trackSchema = z.object({
  id: z.string(),
  title: localizedStringSchema,
  note: localizedStringSchema.optional(),
  levels: z.array(levelSchema),
});
export type Track = z.infer<typeof trackSchema>;

export const tracksFileSchema = z.object({
  tracks: z.array(trackSchema),
});

// ---------------------------------------------------------------------------
// Lesson metadata
// ---------------------------------------------------------------------------

export const lessonKindSchema = z.enum(['vocab', 'grammar', 'phrases', 'mixed']);

export const lessonPartSchema = z.object({
  series: z.string(),
  index: z.number().int().positive(),
  of: z.number().int().positive(),
});

export const lessonMetaSchema = z.object({
  id: z.string(), // "sfi-a/greetings"
  slug: z.string(),
  title: localizedStringSchema,
  summary: localizedStringSchema.optional(),
  kind: lessonKindSchema,
  levels: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  estimatedMinutes: z.number().max(5, 'Lessons must fit the 5-minute rule (see SPEC §5.3)'),
  part: lessonPartSchema.nullable().default(null),
  order: z.number().default(0),
  prerequisites: z.array(z.string()).default([]),
  xp: z.object({ base: z.number().positive() }),
  quiz: z.object({
    questionsPerRun: z.number().int().positive().default(10),
    passScore: z.number().int().positive().default(7),
  }),
  cityUnlock: z.string().nullable().default(null),
});
export type LessonMeta = z.infer<typeof lessonMetaSchema>;

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export const partOfSpeechSchema = z.enum([
  'noun',
  'verb',
  'adj',
  'adv',
  'pron',
  'prep',
  'phrase',
  'interjection',
  'numeral',
  'conjunction',
]);

export const nounGenderSchema = z.enum(['en', 'ett']).nullable().default(null);

export const nounFormsSchema = z.object({
  indefSg: z.string(),
  defSg: z.string(),
  indefPl: z.string(),
  defPl: z.string(),
});

export const verbFormsSchema = z.object({
  infinitive: z.string(),
  present: z.string(),
  past: z.string(),
  supine: z.string(),
  imperative: z.string().optional(),
});

// Positive form split by gender/number, then the two degrees of comparison — the word-bank
// view in REFERENCE.md §5.2 needs all five to render an adjective's row.
export const adjFormsSchema = z.object({
  positive: z.string(),
  neuter: z.string(),
  plural: z.string(),
  comparative: z.string(),
  superlative: z.string(),
});

export const vocabItemSchema = z.object({
  id: z.string(),
  sv: z.string(),
  translations: z
    .object({ ru: z.string(), en: z.string() })
    .refine((t) => t.ru.length > 0 && t.en.length > 0, 'Both ru and en translations required'),
  pos: partOfSpeechSchema,
  gender: nounGenderSchema.optional(),
  verbGroup: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  forms: z
    .union([nounFormsSchema, verbFormsSchema, adjFormsSchema])
    .nullable()
    .optional()
    .default(null),
  example: z
    .object({ sv: z.string(), ru: z.string().optional(), en: z.string().optional() })
    .optional(),
  note: localizedStringSchema.optional(),
});
export type VocabItem = z.infer<typeof vocabItemSchema>;

export const vocabFileSchema = z.object({
  items: z.array(vocabItemSchema).max(25, 'The 5-minute rule caps a lesson at 25 vocabulary items'),
});

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

const baseQuestion = {
  id: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  tags: z.array(z.string()).default([]),
  explanation: localizedStringSchema.optional(),
  generated: z.boolean().default(false),
};

// A choice is either a plain string (Swedish content — the same in every study language)
// or a LocalizedString (a translation — must react to the RU/EN header toggle).
export const choiceSchema = z.union([z.string(), localizedStringSchema]);
export type Choice = z.infer<typeof choiceSchema>;

export const mcQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('mc'),
  prompt: localizedStringSchema,
  choices: z.array(choiceSchema).min(2),
  answer: z.number().int().nonnegative(),
});

export const typeAnswerQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('type-answer'),
  prompt: localizedStringSchema,
  answer: z.array(z.string()).min(1),
  hint: localizedStringSchema.optional(),
});

export const gapQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('gap'),
  prompt: localizedStringSchema,
  answer: z.array(z.string()).min(1),
  acceptAlso: z.array(z.string()).default([]),
  hint: localizedStringSchema.optional(),
});

export const orderQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('order'),
  prompt: localizedStringSchema,
  tokens: z.array(z.string()).min(2),
  answer: z.array(z.number().int().nonnegative()),
});

export const matchQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('match'),
  prompt: localizedStringSchema,
  pairs: z.array(z.tuple([z.string(), z.string()])).min(2),
});

export const listenQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('listen'),
  audioText: z.string(),
  prompt: localizedStringSchema,
  choices: z.array(choiceSchema).min(2),
  answer: z.number().int().nonnegative(),
});

export const trueFalseQuestionSchema = z.object({
  ...baseQuestion,
  type: z.literal('true-false'),
  prompt: localizedStringSchema,
  answer: z.boolean(),
});

export const questionSchema = z.discriminatedUnion('type', [
  mcQuestionSchema,
  typeAnswerQuestionSchema,
  gapQuestionSchema,
  orderQuestionSchema,
  matchQuestionSchema,
  listenQuestionSchema,
  trueFalseQuestionSchema,
]);
export type Question = z.infer<typeof questionSchema>;
export type QuestionType = Question['type'];

export const generatorConfigSchema = z.object({
  type: z.enum([
    'sv-to-native-mc',
    'native-to-sv-mc',
    'type-answer',
    'listen-mc',
    'article',
    'plural',
    'verb-form',
  ]),
  from: z.literal('vocab'),
  count: z.union([z.literal('all'), z.number()]).default('all'),
  direction: z.enum(['native-to-sv', 'sv-to-native']).optional(),
  filter: z.object({ pos: partOfSpeechSchema.optional() }).optional(),
  targets: z.array(z.enum(['present', 'past', 'supine'])).optional(),
});
export type GeneratorConfig = z.infer<typeof generatorConfigSchema>;

export const questionsFileSchema = z.object({
  generators: z.array(generatorConfigSchema).default([]),
  items: z.array(questionSchema).default([]),
});
export type QuestionsFile = z.infer<typeof questionsFileSchema>;

// ---------------------------------------------------------------------------
// City: eras & buildings
// ---------------------------------------------------------------------------

// Prices, level caps and XP thresholds deliberately live in src/city/economy.ts, not here:
// content says what a thing *is*, the economy module says what it costs and when it opens,
// so the whole curve can be retuned in one file (SPEC §8.3). The loader merges the two, and
// the `Era`/`Building` types the app consumes are the merged shape.

export const eraSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: localizedStringSchema,
  /** True for the four future eras — informed guesses, not history (SPEC §12.8). */
  speculative: z.boolean().default(false),
  palette: z.object({ primary: z.string(), accent: z.string() }),
});
export type EraContent = z.infer<typeof eraSchema>;
export type Era = EraContent & { unlockXp: number };

export const erasFileSchema = z.object({ eras: z.array(eraSchema) });

// Every perk here is a NUMBER the learner can watch change (SPEC §8.4). Unlocking content —
// a history card, a themed lesson pack — is expressed by an `unlockedBy` field on the content
// itself (§12.4), never by a perk, so an unlock can never point at content that doesn't exist.
export const perkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('xpMultiplier'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('coinMultiplier'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('dailyIncome'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('extraReviewSlots'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('reviewBonus'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('streakFreeze'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('hintToken'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('retryToken'), valuePerLevel: z.number() }),
]);
export type Perk = z.infer<typeof perkSchema>;
export type PerkType = Perk['type'];

export const buildingSchema = z.object({
  id: z.string(),
  era: z.string(),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  requires: z.array(z.string()).default([]),
  perk: perkSchema,
  position: z.object({ x: z.number(), y: z.number() }), // kept as the documented placement fallback
  // Grid-cell placement (CITY_VISUALS_TECH.md §2). `cell` is optional during migration — a
  // building without one is projected from `position` onto the nearest free island cell — but
  // every building now carries one; validation is what turns a future gap into an error.
  cell: z.object({ q: z.number().int(), r: z.number().int() }).optional(),
  footprint: z.object({ w: z.number().int(), h: z.number().int() }).default({ w: 1, h: 1 }),
  flavour: localizedStringSchema.optional(),
});
export type BuildingContent = z.infer<typeof buildingSchema>;
export type Building = BuildingContent & BuildingPrice;

export const buildingsFileSchema = z.object({ buildings: z.array(buildingSchema) });

// ---------------------------------------------------------------------------
// History cards
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Achievements — computed from existing stats, never stored as separate state
// (SPEC §8.5: they bridge learning and the city).
// ---------------------------------------------------------------------------

export const achievementConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wordsLearned'), value: z.number() }),
  z.object({ type: z.literal('streak'), value: z.number() }),
  z.object({ type: z.literal('lessonsPassed'), value: z.number() }),
  z.object({ type: z.literal('allLessonsPassed') }),
  z.object({ type: z.literal('eraReached'), eraId: z.string() }),
  z.object({ type: z.literal('buildingsOwned'), value: z.number() }),
]);
export type AchievementCondition = z.infer<typeof achievementConditionSchema>;

export const achievementSchema = z.object({
  id: z.string(),
  name: localizedStringSchema,
  description: localizedStringSchema,
  icon: z.string(),
  condition: achievementConditionSchema,
});
export type Achievement = z.infer<typeof achievementSchema>;

export const achievementsFileSchema = z.object({
  achievements: z.array(achievementSchema),
});

export const historyVocabWordSchema = z.object({
  sv: z.string(),
  ru: z.string(),
  en: z.string(),
});
export type HistoryVocabWord = z.infer<typeof historyVocabWordSchema>;

export const historyCardSchema = z.object({
  id: z.string(),
  era: z.string(),
  unlockedBy: z.string(),
  title: localizedStringSchema,
  date: z.object({ from: z.number(), to: z.number().optional() }),
  body: z.object({ ru: z.string(), en: z.string() }),
  // Full translations, not bare strings — this is what lets reading a card quietly seed
  // real quiz questions into the SRS deck (SPEC §12.4).
  vocab: z.array(historyVocabWordSchema).default([]),
  sources: z.array(z.string()).min(1, 'Every history card needs a source (SPEC §12.6)'),
});
export type HistoryCard = z.infer<typeof historyCardSchema>;

// ---------------------------------------------------------------------------
// Reference section — language summaries (REFERENCE.md), not lessons
// ---------------------------------------------------------------------------

export const referenceGroupSchema = z.enum(['overview', 'verbs', 'nouns', 'words']);
export type ReferenceGroup = z.infer<typeof referenceGroupSchema>;

export const referenceIndexEntrySchema = z.object({
  slug: z.string(),
  group: referenceGroupSchema,
  order: z.number(),
});

export const referenceIndexFileSchema = z.object({
  articles: z.array(referenceIndexEntrySchema),
});

// ---------------------------------------------------------------------------
// Dialogues — everyday scenes (DIALOGUES.md), no quiz/XP/gate, read for their own sake
// ---------------------------------------------------------------------------

export const dialogueRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type DialogueRole = z.infer<typeof dialogueRoleSchema>;

// `note` is written English-only in practice (a translator's aside, not dialogue content),
// so unlike the rest of the file it isn't required to carry a `ru` counterpart.
export const dialogueNoteSchema = z.object({ en: z.string(), ru: z.string().optional() });

export const dialogueLineSchema = z.object({
  role: z.string(),
  sv: z.string(),
  en: z.string(),
  ru: z.string(),
  note: dialogueNoteSchema.optional(),
});
export type DialogueLine = z.infer<typeof dialogueLineSchema>;

export const dialogueSchema = z.object({
  id: z.string(),
  title: localizedStringSchema,
  setting: z.object({ en: z.string(), ru: z.string() }),
  // The level whose vocabulary the scene roughly matches — a hint for the list, never a gate
  // (DIALOGUES.md §4.7).
  level: z.string(),
  tags: z.array(z.string()).default([]),
  roles: z.array(dialogueRoleSchema).min(2),
  lines: z.array(dialogueLineSchema).min(1),
  // Bridges into the SRS deck exactly like a history card's vocab (DIALOGUES.md §3): each
  // phrase must occur verbatim in one of `lines[].sv`, checked by validate-content.ts.
  keyPhrases: z.array(z.string()).default([]),
  culture: z.object({ en: z.string(), ru: z.string() }).optional(),
});
export type Dialogue = z.infer<typeof dialogueSchema>;

export const dialogueGroupSchema = z.enum(['home', 'family', 'school', 'work', 'outAndAbout']);
export type DialogueGroup = z.infer<typeof dialogueGroupSchema>;

export const dialogueIndexEntrySchema = z.object({
  slug: z.string(),
  group: dialogueGroupSchema,
  order: z.number(),
});

export const dialogueIndexFileSchema = z.object({
  dialogues: z.array(dialogueIndexEntrySchema),
});
export type ReferenceIndexFile = z.infer<typeof referenceIndexFileSchema>;
