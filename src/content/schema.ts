import { z } from 'zod';

/** { ru?, en?, sv? } — sv is content (Swedish words/flavour), never an interface locale. */
export const localizedStringSchema = z.object({
  ru: z.string().optional(),
  en: z.string().optional(),
  sv: z.string().optional(),
});
export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const studyLanguageSchema = z.enum(['ru', 'en']);
export type StudyLanguage = z.infer<typeof studyLanguageSchema>;

/** Resolve a localized string for the current study language, with sane fallback order. */
export function resolveLocalized(
  value: LocalizedString | undefined,
  lang: StudyLanguage,
): string {
  if (!value) return '';
  const other: StudyLanguage = lang === 'ru' ? 'en' : 'ru';
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
  id: z.string(), // "a1/greetings"
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

export const vocabItemSchema = z.object({
  id: z.string(),
  sv: z.string(),
  translations: z
    .object({ ru: z.string(), en: z.string() })
    .refine((t) => t.ru.length > 0 && t.en.length > 0, 'Both ru and en translations required'),
  pos: partOfSpeechSchema,
  gender: nounGenderSchema.optional(),
  verbGroup: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  forms: z.union([nounFormsSchema, verbFormsSchema]).nullable().optional().default(null),
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

export const eraSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: localizedStringSchema,
  unlockXp: z.number(),
  palette: z.object({ primary: z.string(), accent: z.string() }),
});
export type Era = z.infer<typeof eraSchema>;

export const erasFileSchema = z.object({ eras: z.array(eraSchema) });

export const perkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('xpMultiplier'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('coinMultiplier'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('dailyIncome'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('extraReviewSlots'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('streakFreeze'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('unlockLessonPack'), packId: z.string() }),
  z.object({ type: z.literal('hintToken'), valuePerLevel: z.number() }),
  z.object({ type: z.literal('cosmetic') }),
]);
export type Perk = z.infer<typeof perkSchema>;

export const buildingSchema = z.object({
  id: z.string(),
  era: z.string(),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  cost: z.object({ coins: z.number().positive() }),
  requires: z.array(z.string()).default([]),
  maxLevel: z.number().int().positive().default(1),
  costGrowth: z.number().default(1.6),
  perk: perkSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  flavour: localizedStringSchema.optional(),
});
export type Building = z.infer<typeof buildingSchema>;

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
