#!/usr/bin/env tsx
/**
 * Scaffolds a new lesson folder from a template (SPEC.md §11).
 * Usage: npm run new:lesson -- <level> <slug> "<Swedish title>" "<Russian title>" "<English title>"
 * Example: npm run new:lesson -- sfi-a colors "Färger" "Цвета" "Colors"
 */
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [level, slug, sv, ru, en] = process.argv.slice(2);

if (!level || !slug || !sv || !ru || !en) {
  console.error(
    'Usage: npm run new:lesson -- <level> <slug> "<Swedish title>" "<Russian title>" "<English title>"',
  );
  process.exit(1);
}

const dir = join(__dirname, '..', 'content', 'lessons', level, slug);
if (existsSync(dir)) {
  console.error(`Already exists: ${dir}`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const lessonJson = {
  id: `${level}/${slug}`,
  slug,
  title: { sv, ru, en },
  summary: { ru: '', en: '' },
  kind: 'vocab',
  levels: [level],
  tags: [],
  estimatedMinutes: 5,
  part: null,
  order: 0,
  prerequisites: [],
  xp: { base: 100 },
  quiz: { questionsPerRun: 10, passScore: 7 },
  cityUnlock: null,
};

writeFileSync(join(dir, 'lesson.json'), JSON.stringify(lessonJson, null, 2) + '\n');
writeFileSync(join(dir, 'theory.md'), `Короткая теория для «${ru}» — до ~400 слов.\n`);
writeFileSync(join(dir, 'theory_en.md'), `Short theory for "${en}" — up to ~400 words.\n`);
writeFileSync(join(dir, 'vocab.json'), JSON.stringify({ items: [] }, null, 2) + '\n');
writeFileSync(
  join(dir, 'questions.json'),
  JSON.stringify(
    {
      generators: [
        { type: 'sv-to-native-mc', from: 'vocab', count: 'all' },
        { type: 'native-to-sv-mc', from: 'vocab', count: 'all' },
        { type: 'type-answer', from: 'vocab', count: 'all' },
      ],
      items: [],
    },
    null,
    2,
  ) + '\n',
);

console.log(`Created ${dir}`);
console.log('Next: fill in 15-25 vocab.json items, then add a handful of handwritten questions.');
