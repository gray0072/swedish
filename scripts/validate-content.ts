#!/usr/bin/env tsx
/**
 * Validates every content file against its Zod schema and the rules from SPEC.md §11
 * (content authoring workflow) — run in CI via `npm run validate`. Deliberately independent
 * of Vite's import.meta.glob (used by the app's real loader) so it also works as a plain
 * Node script.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildingsFileSchema,
  erasFileSchema,
  historyCardSchema,
  lessonMetaSchema,
  questionsFileSchema,
  tracksFileSchema,
  vocabFileSchema,
} from '../src/content/schema';
import { expandGenerators } from '../src/content/generators';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'content');
const errors: string[] = [];
const warnings: string[] = [];

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function countWords(markdown: string): number {
  return markdown.trim().split(/\s+/).filter(Boolean).length;
}

// -- tracks.json ------------------------------------------------------------
const tracksPath = join(ROOT, 'tracks.json');
let levelIds = new Set<string>();
if (existsSync(tracksPath)) {
  const parsed = tracksFileSchema.safeParse(readJson(tracksPath));
  if (!parsed.success) errors.push(`tracks.json: ${parsed.error.message}`);
  else {
    for (const track of parsed.data.tracks) {
      for (const level of track.levels) levelIds.add(level.id);
    }
  }
} else {
  errors.push('content/tracks.json is missing');
}

// -- lessons ------------------------------------------------------------
const lessonsRoot = join(ROOT, 'lessons');
const lessonIds = new Set<string>();

if (existsSync(lessonsRoot)) {
  for (const level of readdirSync(lessonsRoot)) {
    const levelDir = join(lessonsRoot, level);
    for (const slug of readdirSync(levelDir)) {
      const dir = join(levelDir, slug);
      const metaPath = join(dir, 'lesson.json');
      if (!existsSync(metaPath)) {
        errors.push(`${dir}: missing lesson.json`);
        continue;
      }
      const metaParsed = lessonMetaSchema.safeParse(readJson(metaPath));
      if (!metaParsed.success) {
        errors.push(`${level}/${slug}/lesson.json: ${metaParsed.error.message}`);
        continue;
      }
      const meta = metaParsed.data;
      if (lessonIds.has(meta.id)) errors.push(`duplicate lesson id "${meta.id}"`);
      lessonIds.add(meta.id);

      for (const levelId of meta.levels) {
        if (!levelIds.has(levelId)) {
          warnings.push(`${meta.id}: references unknown level id "${levelId}" (not in tracks.json)`);
        }
      }

      const vocabPath = join(dir, 'vocab.json');
      let vocab: import('../src/content/schema').VocabItem[] = [];
      if (existsSync(vocabPath)) {
        const vocabParsed = vocabFileSchema.safeParse(readJson(vocabPath));
        if (!vocabParsed.success) errors.push(`${meta.id}/vocab.json: ${vocabParsed.error.message}`);
        else vocab = vocabParsed.data.items;
      }

      const questionsPath = join(dir, 'questions.json');
      let questionsFile = { generators: [] as never[], items: [] as never[] };
      if (existsSync(questionsPath)) {
        const qParsed = questionsFileSchema.safeParse(readJson(questionsPath));
        if (!qParsed.success) errors.push(`${meta.id}/questions.json: ${qParsed.error.message}`);
        else questionsFile = qParsed.data as never;
      }

      const theoryPath = join(dir, 'theory.md');
      if (existsSync(theoryPath)) {
        const words = countWords(readFileSync(theoryPath, 'utf-8'));
        if (words > 450) errors.push(`${meta.id}: theory.md is ${words} words (5-minute rule wants ~400)`);
      } else if (vocab.length === 0) {
        warnings.push(`${meta.id}: no theory.md and no vocab.json — lesson has no content body`);
      }

      const generated = expandGenerators(questionsFile.generators, vocab, meta.id);
      const pool = [...questionsFile.items, ...generated];
      if (pool.length < meta.quiz.questionsPerRun) {
        errors.push(
          `${meta.id}: pool has only ${pool.length} questions, needs >= ${meta.quiz.questionsPerRun}`,
        );
      }
      const seenIds = new Set<string>();
      for (const q of pool) {
        if (seenIds.has(q.id)) errors.push(`${meta.id}: duplicate question id "${q.id}"`);
        seenIds.add(q.id);
        if ((q.type === 'mc' || q.type === 'listen') && (q.answer < 0 || q.answer >= q.choices.length)) {
          errors.push(`${meta.id}/${q.id}: answer index ${q.answer} out of range`);
        }
      }
    }
  }
}

// -- curricula ------------------------------------------------------------
const curriculaRoot = join(ROOT, 'curricula');
if (existsSync(curriculaRoot)) {
  for (const file of readdirSync(curriculaRoot)) {
    const data = readJson(join(curriculaRoot, file)) as { lessons?: string[] };
    for (const id of data.lessons ?? []) {
      if (!lessonIds.has(id)) errors.push(`curriculum "${file}" references unknown lesson id "${id}"`);
    }
  }
}

// -- city -------------------------------------------------------------------
const buildingIds = new Set<string>();
const erasPath = join(ROOT, 'city', 'eras.json');
const eraIds = new Set<string>();
if (existsSync(erasPath)) {
  const parsed = erasFileSchema.safeParse(readJson(erasPath));
  if (!parsed.success) errors.push(`city/eras.json: ${parsed.error.message}`);
  else for (const era of parsed.data.eras) eraIds.add(era.id);
}

const buildingsPath = join(ROOT, 'city', 'buildings.json');
if (existsSync(buildingsPath)) {
  const parsed = buildingsFileSchema.safeParse(readJson(buildingsPath));
  if (!parsed.success) errors.push(`city/buildings.json: ${parsed.error.message}`);
  else {
    for (const b of parsed.data.buildings) {
      buildingIds.add(b.id);
      if (!eraIds.has(b.era)) errors.push(`building "${b.id}" references unknown era "${b.era}"`);
    }
    for (const b of parsed.data.buildings) {
      for (const req of b.requires) {
        if (!buildingIds.has(req)) {
          errors.push(`building "${b.id}" requires unknown building "${req}"`);
        }
      }
    }
  }
}

// -- history cards ------------------------------------------------------------
const historyRoot = join(ROOT, 'history');
if (existsSync(historyRoot)) {
  for (const file of readdirSync(historyRoot)) {
    const parsed = historyCardSchema.safeParse(readJson(join(historyRoot, file)));
    if (!parsed.success) {
      errors.push(`history/${file}: ${parsed.error.message}`);
      continue;
    }
    if (!buildingIds.has(parsed.data.unlockedBy)) {
      errors.push(`history/${file}: unlockedBy references unknown building "${parsed.data.unlockedBy}"`);
    }
  }
}

// -- grammar reference articles ------------------------------------------------
const grammarRoot = join(ROOT, 'grammar');
if (existsSync(grammarRoot)) {
  const slugs = new Set<string>();
  for (const file of readdirSync(grammarRoot)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    if (slugs.has(slug)) errors.push(`grammar: duplicate slug "${slug}"`);
    slugs.add(slug);
    const raw = readFileSync(join(grammarRoot, file), 'utf-8');
    if (!/^#\s+.+$/m.test(raw)) errors.push(`grammar/${file}: missing a "# Title" heading`);
  }
}

// -- report -------------------------------------------------------------------
if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (errors.length) {
  console.error(`\n✖ ${errors.length} content error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`\n✓ Content valid — ${lessonIds.size} lesson(s), ${buildingIds.size} building(s).`);
