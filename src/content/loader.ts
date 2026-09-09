import {
  achievementsFileSchema,
  buildingsFileSchema,
  erasFileSchema,
  historyCardSchema,
  lessonMetaSchema,
  questionsFileSchema,
  tracksFileSchema,
  vocabFileSchema,
  type Achievement,
  type Building,
  type Era,
  type HistoryCard,
  type LessonMeta,
  type QuestionsFile,
  type Track,
  type VocabItem,
} from './schema';
import { expandGenerators } from './generators';

// -- raw eager globs -----------------------------------------------------

const lessonMetaFiles = import.meta.glob('../../content/lessons/*/*/lesson.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const vocabFiles = import.meta.glob('../../content/lessons/*/*/vocab.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const questionFiles = import.meta.glob('../../content/lessons/*/*/questions.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const theoryEnFiles = import.meta.glob('../../content/lessons/*/*/theory.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const theoryRuFiles = import.meta.glob('../../content/lessons/*/*/theory_ru.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const curriculaFiles = import.meta.glob('../../content/curricula/*.json', {
  eager: true,
}) as Record<string, { default: { lessons: string[] } }>;

const tracksFile = import.meta.glob('../../content/tracks.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const buildingsFile = import.meta.glob('../../content/city/buildings.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const erasFile = import.meta.glob('../../content/city/eras.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const historyFiles = import.meta.glob('../../content/history/*.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const grammarFiles = import.meta.glob('../../content/grammar/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const achievementsFile = import.meta.glob('../../content/achievements.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

// -- folder key -> lesson id -----------------------------------------------
// A path like ../../content/lessons/sfi-a/greetings/lesson.json maps to folderKey
// "sfi-a/greetings" so vocab/questions/theory can be joined to the same lesson.

function folderKey(path: string): string {
  const parts = path.split('/');
  const slug = parts[parts.length - 2];
  const level = parts[parts.length - 3];
  return `${level}/${slug}`;
}

export interface LessonContent {
  meta: LessonMeta;
  theoryEn: string | null;
  theoryRu: string | null;
  vocab: VocabItem[];
  questions: QuestionsFile;
  /** Handwritten pool items + everything generators expanded from vocab. */
  pool: QuestionsFile['items'];
}

export interface GrammarArticle {
  slug: string;
  title: string;
  body: string;
  order: number;
}

export interface ContentRegistry {
  tracks: Track[];
  lessons: Map<string, LessonContent>;
  curricula: Map<string, string[]>;
  eras: Era[];
  buildings: Building[];
  history: HistoryCard[];
  grammar: GrammarArticle[];
  achievements: Achievement[];
  errors: string[];
}

function buildRegistry(): ContentRegistry {
  const errors: string[] = [];
  const lessons = new Map<string, LessonContent>();

  const vocabByKey = new Map<string, VocabItem[]>();
  for (const [path, mod] of Object.entries(vocabFiles)) {
    const key = folderKey(path);
    const parsed = vocabFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.message}`);
      continue;
    }
    vocabByKey.set(key, parsed.data.items);
  }

  const questionsByKey = new Map<string, QuestionsFile>();
  for (const [path, mod] of Object.entries(questionFiles)) {
    const key = folderKey(path);
    const parsed = questionsFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.message}`);
      continue;
    }
    questionsByKey.set(key, parsed.data);
  }

  const theoryEnByKey = new Map<string, string>();
  for (const [path, raw] of Object.entries(theoryEnFiles)) {
    theoryEnByKey.set(folderKey(path), raw);
  }

  const theoryRuByKey = new Map<string, string>();
  for (const [path, raw] of Object.entries(theoryRuFiles)) {
    theoryRuByKey.set(folderKey(path), raw);
  }

  for (const [path, mod] of Object.entries(lessonMetaFiles)) {
    const key = folderKey(path);
    const parsed = lessonMetaSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.message}`);
      continue;
    }
    const meta = parsed.data;
    const vocab = vocabByKey.get(key) ?? [];
    const questions = questionsByKey.get(key) ?? { generators: [], items: [] };
    const theoryEn = theoryEnByKey.get(key) ?? null;
    const theoryRu = theoryRuByKey.get(key) ?? null;

    const generated = expandGenerators(questions.generators, vocab, meta.id);
    const pool = [...questions.items, ...generated];

    if (pool.length < meta.quiz.questionsPerRun) {
      errors.push(
        `${meta.id}: pool has only ${pool.length} questions, needs >= ${meta.quiz.questionsPerRun}`,
      );
    }

    const ids = new Set<string>();
    for (const q of pool) {
      if (ids.has(q.id)) errors.push(`${meta.id}: duplicate question id "${q.id}"`);
      ids.add(q.id);
    }

    lessons.set(meta.id, { meta, theoryEn, theoryRu, vocab, questions, pool });
  }

  const curricula = new Map<string, string[]>();
  for (const [path, mod] of Object.entries(curriculaFiles)) {
    const name = path.split('/').pop()!.replace('.json', '');
    for (const lessonId of mod.default.lessons) {
      if (!lessons.has(lessonId)) {
        errors.push(`curriculum "${name}" references unknown lesson id "${lessonId}"`);
      }
    }
    curricula.set(name, mod.default.lessons);
  }

  let tracks: Track[] = [];
  for (const mod of Object.values(tracksFile)) {
    const parsed = tracksFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`tracks.json: ${parsed.error.message}`);
      continue;
    }
    tracks = parsed.data.tracks;
  }

  let eras: Era[] = [];
  for (const mod of Object.values(erasFile)) {
    const parsed = erasFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`eras.json: ${parsed.error.message}`);
      continue;
    }
    eras = parsed.data.eras.sort((a, b) => a.order - b.order);
  }

  let buildings: Building[] = [];
  for (const mod of Object.values(buildingsFile)) {
    const parsed = buildingsFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`buildings.json: ${parsed.error.message}`);
      continue;
    }
    buildings = parsed.data.buildings;
  }

  const history: HistoryCard[] = [];
  for (const [path, mod] of Object.entries(historyFiles)) {
    const parsed = historyCardSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.message}`);
      continue;
    }
    history.push(parsed.data);
  }

  const grammar: GrammarArticle[] = Object.entries(grammarFiles)
    .map(([path, raw], i) => {
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      if (!titleMatch) errors.push(`${path}: grammar article has no "# Title" heading`);
      return { slug, title: titleMatch?.[1] ?? slug, body: raw, order: i };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  let achievements: Achievement[] = [];
  for (const mod of Object.values(achievementsFile)) {
    const parsed = achievementsFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`achievements.json: ${parsed.error.message}`);
      continue;
    }
    achievements = parsed.data.achievements;
  }

  return { tracks, lessons, curricula, eras, buildings, history, grammar, achievements, errors };
}

let cached: ContentRegistry | null = null;

export function getContentRegistry(): ContentRegistry {
  if (!cached) cached = buildRegistry();
  return cached;
}
