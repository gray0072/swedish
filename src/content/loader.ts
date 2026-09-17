import {
  achievementsFileSchema,
  buildingsFileSchema,
  dialogueIndexFileSchema,
  dialogueSchema,
  erasFileSchema,
  historyCardSchema,
  lessonMetaSchema,
  questionsFileSchema,
  referenceIndexFileSchema,
  tracksFileSchema,
  vocabFileSchema,
  type Achievement,
  type Building,
  type Dialogue,
  type DialogueGroup,
  type Era,
  type HistoryCard,
  type LessonMeta,
  type QuestionsFile,
  type ReferenceGroup,
  type Track,
  type VocabItem,
} from './schema';
import { expandGenerators } from './generators';
import { BUILDING_PRICES, ERA_UNLOCK_XP } from '@/city/economy';

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

// English is canonical (`<slug>.md`); a `<slug>_ru.md` beside it is the translation, picked
// by the study-language toggle exactly like a lesson's theory.md / theory_ru.md pair.
const referenceFiles = import.meta.glob('../../content/reference/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const referenceIndexFile = import.meta.glob('../../content/reference/index.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const achievementsFile = import.meta.glob('../../content/achievements.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

const dialogueFiles = import.meta.glob('../../content/dialogues/*.json', {
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

export interface ReferenceArticle {
  slug: string;
  titleEn: string;
  titleRu: string | null;
  bodyEn: string;
  bodyRu: string | null;
  group: ReferenceGroup;
  order: number;
}

export interface DialogueEntry extends Dialogue {
  group: DialogueGroup;
  order: number;
}

export interface ContentRegistry {
  tracks: Track[];
  lessons: Map<string, LessonContent>;
  curricula: Map<string, string[]>;
  eras: Era[];
  buildings: Building[];
  history: HistoryCard[];
  reference: ReferenceArticle[];
  achievements: Achievement[];
  dialogues: DialogueEntry[];
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

  // Eras and buildings are content joined to the economy table in src/city/economy.ts —
  // an id missing from that table is a content error, not a silently free building.
  let eras: Era[] = [];
  for (const mod of Object.values(erasFile)) {
    const parsed = erasFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`eras.json: ${parsed.error.message}`);
      continue;
    }
    eras = parsed.data.eras
      .sort((a, b) => a.order - b.order)
      .flatMap((era) => {
        const unlockXp = ERA_UNLOCK_XP[era.id];
        if (unlockXp === undefined) {
          errors.push(`eras.json: era "${era.id}" has no ERA_UNLOCK_XP entry in city/economy.ts`);
          return [];
        }
        return [{ ...era, unlockXp }];
      });
  }

  let buildings: Building[] = [];
  for (const mod of Object.values(buildingsFile)) {
    const parsed = buildingsFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`buildings.json: ${parsed.error.message}`);
      continue;
    }
    buildings = parsed.data.buildings.flatMap((building) => {
      const price = BUILDING_PRICES[building.id];
      if (!price) {
        errors.push(
          `buildings.json: building "${building.id}" has no BUILDING_PRICES entry in city/economy.ts`,
        );
        return [];
      }
      return [{ ...building, ...price }];
    });
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

  const referenceIndex = new Map<string, { group: ReferenceGroup; order: number }>();
  for (const [path, mod] of Object.entries(referenceIndexFile)) {
    const parsed = referenceIndexFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.message}`);
      continue;
    }
    for (const entry of parsed.data.articles) referenceIndex.set(entry.slug, entry);
  }

  const referenceEnByFilename = new Map<string, string>();
  const referenceRuBySlug = new Map<string, string>();
  for (const [path, raw] of Object.entries(referenceFiles)) {
    const filename = path.split('/').pop()!.replace(/\.md$/, '');
    if (filename.endsWith('_ru')) {
      referenceRuBySlug.set(filename.replace(/_ru$/, ''), raw);
    } else {
      referenceEnByFilename.set(filename, raw);
    }
  }

  function extractTitle(raw: string, path: string): string | null {
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    if (!titleMatch) errors.push(`${path}: reference article has no "# Title" heading`);
    return titleMatch?.[1] ?? null;
  }

  const reference: ReferenceArticle[] = [...referenceEnByFilename.entries()]
    .map(([slug, bodyEn]) => {
      const indexEntry = referenceIndex.get(slug);
      if (!indexEntry) {
        errors.push(`content/reference/${slug}.md: no entry in index.json`);
      }
      const titleEn = extractTitle(bodyEn, `content/reference/${slug}.md`) ?? slug;
      const bodyRu = referenceRuBySlug.get(slug) ?? null;
      const titleRu = bodyRu ? extractTitle(bodyRu, `content/reference/${slug}_ru.md`) : null;
      return {
        slug,
        titleEn,
        titleRu,
        bodyEn,
        bodyRu,
        group: indexEntry?.group ?? 'overview',
        order: indexEntry?.order ?? 0,
      };
    })
    .sort((a, b) => a.order - b.order);

  for (const slug of referenceIndex.keys()) {
    if (!referenceEnByFilename.has(slug)) {
      errors.push(`content/reference/index.json: entry "${slug}" has no matching .md file`);
    }
  }
  for (const slug of referenceRuBySlug.keys()) {
    if (!referenceEnByFilename.has(slug)) {
      errors.push(`content/reference/${slug}_ru.md: no English counterpart "${slug}.md"`);
    }
  }

  let achievements: Achievement[] = [];
  for (const mod of Object.values(achievementsFile)) {
    const parsed = achievementsFileSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`achievements.json: ${parsed.error.message}`);
      continue;
    }
    achievements = parsed.data.achievements;
  }

  const dialogueIndex = new Map<string, { group: DialogueGroup; order: number }>();
  const dialoguesRaw = new Map<string, Dialogue>();
  for (const [path, mod] of Object.entries(dialogueFiles)) {
    const filename = path.split('/').pop()!.replace(/\.json$/, '');
    if (filename === 'index') {
      const parsed = dialogueIndexFileSchema.safeParse(mod.default);
      if (!parsed.success) {
        errors.push(`${path}: ${parsed.error.message}`);
        continue;
      }
      for (const entry of parsed.data.dialogues) dialogueIndex.set(entry.slug, entry);
      continue;
    }
    const parsed = dialogueSchema.safeParse(mod.default);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.message}`);
      continue;
    }
    const dialogue = parsed.data;
    if (dialogue.id !== filename) {
      errors.push(`${path}: dialogue id is "${dialogue.id}", expected "${filename}"`);
    }
    const roleIds = new Set(dialogue.roles.map((r) => r.id));
    for (const line of dialogue.lines) {
      if (!roleIds.has(line.role)) {
        errors.push(`${path}: line uses undeclared role "${line.role}"`);
      }
    }
    for (const phrase of dialogue.keyPhrases) {
      if (!dialogue.lines.some((l) => l.sv.includes(phrase))) {
        errors.push(`${path}: keyPhrase "${phrase}" does not occur verbatim in any line`);
      }
    }
    dialoguesRaw.set(dialogue.id, dialogue);
  }
  for (const id of dialoguesRaw.keys()) {
    if (!dialogueIndex.has(id)) errors.push(`content/dialogues/${id}.json: no entry in index.json`);
  }
  for (const slug of dialogueIndex.keys()) {
    if (!dialoguesRaw.has(slug)) {
      errors.push(`content/dialogues/index.json: entry "${slug}" has no matching .json file`);
    }
  }
  const dialogues: DialogueEntry[] = [...dialoguesRaw.entries()]
    .map(([id, dialogue]) => {
      const indexEntry = dialogueIndex.get(id);
      return { ...dialogue, group: indexEntry?.group ?? 'home', order: indexEntry?.order ?? 0 };
    })
    .sort((a, b) => a.order - b.order);

  return { tracks, lessons, curricula, eras, buildings, history, reference, achievements, dialogues, errors };
}

let cached: ContentRegistry | null = null;

export function getContentRegistry(): ContentRegistry {
  if (!cached) cached = buildRegistry();
  return cached;
}
