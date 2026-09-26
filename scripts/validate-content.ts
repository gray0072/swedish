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
  dialogueIndexFileSchema,
  dialogueSchema,
  erasFileSchema,
  historyCardSchema,
  lessonMetaSchema,
  questionsFileSchema,
  referenceIndexFileSchema,
  tracksFileSchema,
  vocabFileSchema,
} from '../src/content/schema';
import { expandGenerators } from '../src/content/generators';
import { exampleBlockProblems } from '../src/content/exampleLine';
import { PLACEHOLDER, acceptedSpellings, withoutNotes } from '../src/content/swedishText';
import { grade } from '../src/quiz/grading';
import { BUILDING_PRICES, ERA_UNLOCK_XP } from '../src/city/economy';
import type { AmbientEmitter, EraArt } from '../src/components/city/scene/types';
import { ISLAND_CELLS } from '../src/components/city/scene/island';
import { footprintCells, footprintsOverlap } from '../src/components/city/scene/iso';
import { LIGHT_THEMES, DARK_THEMES } from '../src/components/city/scene/themes';
import tribeArt from '../src/components/city/art/tribe';
import vikingArt from '../src/components/city/art/viking';
import medievalArt from '../src/components/city/art/medieval';
import empireArt from '../src/components/city/art/empire';
import industrialArt from '../src/components/city/art/industrial';
import modernArt from '../src/components/city/art/modern';
import greenArt from '../src/components/city/art/green';
import connectedArt from '../src/components/city/art/connected';
import floatingArt from '../src/components/city/art/floating';
import stellarArt from '../src/components/city/art/stellar';

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
const prerequisites: Array<[string, string[]]> = [];

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
      if (meta.id !== `${level}/${slug}`) {
        errors.push(`${level}/${slug}: lesson id is "${meta.id}", expected "${level}/${slug}"`);
      }
      prerequisites.push([meta.id, meta.prerequisites]);

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
      const hasTheory = existsSync(theoryPath);
      if (hasTheory) {
        const theory = readFileSync(theoryPath, 'utf-8');
        const words = countWords(theory);
        if (words > 450) errors.push(`${meta.id}: theory.md is ${words} words (5-minute rule wants ~400)`);
        for (const problem of exampleBlockProblems(theory)) errors.push(`${meta.id}/theory.md ${problem}`);
      } else if (vocab.length === 0) {
        warnings.push(`${meta.id}: no theory.md and no vocab.json — lesson has no content body`);
      }

      const theoryRuPath = join(dir, 'theory_ru.md');
      if (existsSync(theoryRuPath)) {
        if (!hasTheory) errors.push(`${meta.id}: theory_ru.md exists without a theory.md`);
        const theoryRu = readFileSync(theoryRuPath, 'utf-8');
        const words = countWords(theoryRu);
        if (words > 450) errors.push(`${meta.id}: theory_ru.md is ${words} words (5-minute rule wants ~400)`);
        for (const problem of exampleBlockProblems(theoryRu)) errors.push(`${meta.id}/theory_ru.md ${problem}`);
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
        // Two options that look — or, for listening, sound — the same make a question
        // unanswerable. Homographs in one vocab list are the usual cause.
        if (q.type === 'mc' || q.type === 'listen') {
          const labels = q.choices.map((c) =>
            typeof c === 'string' ? (q.type === 'listen' ? withoutNotes(c).toLowerCase() : c) : JSON.stringify(c),
          );
          if (new Set(labels).size !== labels.length) {
            errors.push(`${meta.id}/${q.id}: two choices look or sound the same: ${labels.join(' | ')}`);
          }
        }
        // A typed answer must accept the way the lesson itself writes it.
        if (q.type === 'type-answer') {
          for (const spelling of q.answer.flatMap(acceptedSpellings)) {
            const typed = spelling.split(PLACEHOLDER).join('Anna');
            if (!grade(q, { kind: 'type-answer', text: typed }).correct) {
              errors.push(`${meta.id}/${q.id}: typing "${typed}" is graded wrong`);
            }
          }
        }
      }
    }
  }
}

// Prerequisites are resolved only after every lesson id is known, so a lesson may
// point at one that is defined later in the walk.
for (const [id, prereqs] of prerequisites) {
  for (const prereq of prereqs) {
    if (!lessonIds.has(prereq)) {
      errors.push(`${id}: prerequisite "${prereq}" is not an existing lesson id`);
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
  else
    for (const era of parsed.data.eras) {
      eraIds.add(era.id);
      // Thresholds and prices live in src/city/economy.ts, so a content id with no entry
      // there would load as an era nobody can unlock / a building that costs nothing.
      if (ERA_UNLOCK_XP[era.id] === undefined) {
        errors.push(`era "${era.id}" has no ERA_UNLOCK_XP entry in src/city/economy.ts`);
      }
    }
}

const buildingsPath = join(ROOT, 'city', 'buildings.json');
let cityBuildings: ReturnType<typeof buildingsFileSchema.parse>['buildings'] = [];
if (existsSync(buildingsPath)) {
  const parsed = buildingsFileSchema.safeParse(readJson(buildingsPath));
  if (!parsed.success) errors.push(`city/buildings.json: ${parsed.error.message}`);
  else {
    cityBuildings = parsed.data.buildings;
    for (const b of parsed.data.buildings) {
      buildingIds.add(b.id);
      if (!eraIds.has(b.era)) errors.push(`building "${b.id}" references unknown era "${b.era}"`);
      if (!BUILDING_PRICES[b.id]) {
        errors.push(`building "${b.id}" has no BUILDING_PRICES entry in src/city/economy.ts`);
      }
    }
    for (const id of Object.keys(BUILDING_PRICES)) {
      if (!buildingIds.has(id)) {
        warnings.push(`BUILDING_PRICES has a price for "${id}", which is not in buildings.json`);
      }
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

// -- city art (CITY_VISUALS_TECH.md §5) --------------------------------------
// Art/content parity, level counts, grid placement and ambient budgets, checked without
// touching scene/** or types.ts beyond reading their exported values — this agent owns
// art/**, content and this script only.
const ERA_ART: Record<string, EraArt> = {
  tribe: tribeArt,
  viking: vikingArt,
  medieval: medievalArt,
  empire: empireArt,
  industrial: industrialArt,
  modern: modernArt,
  green: greenArt,
  connected: connectedArt,
  floating: floatingArt,
  stellar: stellarArt,
};

const VALID_EMITTERS: AmbientEmitter[] = [
  'smoke', 'birds', 'flag', 'rotor', 'beacon', 'aurora', 'snow', 'pollen', 'rain',
];
const EMITTER_NODE_COST: Record<AmbientEmitter, number> = {
  smoke: 3, birds: 4, flag: 1, rotor: 1, beacon: 1, aurora: 2, snow: 20, pollen: 20, rain: 20,
};
const AMBIENT_NODE_BUDGET = 60; // CITY_VISUALS_LIFE.md §7

if (cityBuildings.length > 0) {
  const islandKeys = new Set(ISLAND_CELLS.map((c) => `${c.q},${c.r}`));

  for (const [eraId, art] of Object.entries(ERA_ART)) {
    const eraBuildings = cityBuildings.filter((b) => b.era === eraId);
    const contentIds = new Set(eraBuildings.map((b) => b.id));
    const artIds = new Set(Object.keys(art));

    for (const id of artIds) {
      if (!contentIds.has(id)) errors.push(`art/${eraId}: "${id}" has art but no content/city/buildings.json entry`);
    }
    for (const id of contentIds) {
      if (!artIds.has(id)) errors.push(`art/${eraId}: "${id}" is in buildings.json but has no art`);
    }

    let landmarkCount = 0;
    let emitterNodes = 0;
    const placed: Array<{ id: string; cell: { q: number; r: number }; footprint: { w: number; h: number } }> = [];

    for (const building of eraBuildings) {
      const artEntry = art[building.id];
      const price = BUILDING_PRICES[building.id];
      if (!artEntry || !price) continue; // already reported above / by the buildings pass

      if (artEntry.levels.length !== price.maxLevel) {
        errors.push(
          `art/${eraId}/${building.id}: ${artEntry.levels.length} level(s) authored, maxLevel is ${price.maxLevel}`,
        );
      }
      if (artEntry.footprint.w === 2 && artEntry.footprint.h === 2) landmarkCount += 1;

      // Content footprint must match the art footprint (CITY_VISUALS_TECH.md §2/§5).
      if (building.footprint.w !== artEntry.footprint.w || building.footprint.h !== artEntry.footprint.h) {
        errors.push(
          `${eraId}/${building.id}: content footprint ${building.footprint.w}x${building.footprint.h} does not match art footprint ${artEntry.footprint.w}x${artEntry.footprint.h}`,
        );
      }

      for (const emitter of artEntry.ambient ?? []) {
        if (!VALID_EMITTERS.includes(emitter)) {
          errors.push(`art/${eraId}/${building.id}: unknown ambient emitter "${emitter}"`);
        } else {
          emitterNodes += EMITTER_NODE_COST[emitter];
        }
      }

      // Cell placement: every building now carries a `cell` (Phase 4 requirement) and every
      // cell of its footprint must be inside island.ts's walkable set.
      if (!building.cell) {
        errors.push(`${eraId}/${building.id}: missing "cell" (required from Phase 4 on)`);
        continue;
      }
      const cells = footprintCells(building.cell, building.footprint);
      for (const cell of cells) {
        if (!islandKeys.has(`${cell.q},${cell.r}`)) {
          errors.push(`${eraId}/${building.id}: cell (${cell.q},${cell.r}) is outside the island's walkable set`);
        }
      }
      placed.push({ id: building.id, cell: building.cell, footprint: building.footprint });
    }

    if (landmarkCount !== 1) {
      errors.push(`art/${eraId}: expected exactly one 2x2 landmark, found ${landmarkCount}`);
    }

    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        if (footprintsOverlap(placed[i].cell, placed[i].footprint, placed[j].cell, placed[j].footprint)) {
          errors.push(`${eraId}: footprints overlap between "${placed[i].id}" and "${placed[j].id}"`);
        }
      }
    }

    if (emitterNodes > AMBIENT_NODE_BUDGET) {
      warnings.push(`${eraId}: ambient emitters cost ${emitterNodes} nodes, over the ${AMBIENT_NODE_BUDGET}-node budget`);
    }
  }
}

// Every SceneTheme needs both variants, with every token a hex literal (CITY_VISUALS_TECH.md
// §5 rule 6) — checked here since this script is the one place both content and scene/themes
// are already in scope.
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
function flattenTokens(obj: Record<string, unknown>, prefix = ''): Array<[string, unknown]> {
  const out: Array<[string, unknown]> = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flattenTokens(v as Record<string, unknown>, key));
    else out.push([key, v]);
  }
  return out;
}
for (const eraId of Object.keys(ERA_ART)) {
  const light = LIGHT_THEMES[eraId];
  const dark = DARK_THEMES[eraId];
  if (!light || !dark) {
    errors.push(`themes: era "${eraId}" is missing a light or dark SceneTheme`);
    continue;
  }
  for (const [theme, label] of [[light, 'light'], [dark, 'dark']] as const) {
    for (const [key, value] of flattenTokens(theme as unknown as Record<string, unknown>)) {
      if (key === 'ambient.emitters' || key === 'time') continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (typeof v === 'string' && !HEX_RE.test(v)) errors.push(`themes/${eraId} (${label}): "${key}" is not a hex literal`);
        }
      } else if (typeof value === 'string' && !HEX_RE.test(value)) {
        errors.push(`themes/${eraId} (${label}): "${key}" is not a hex literal`);
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

// -- reference section: language summaries (REFERENCE.md) ---------------------
const referenceRoot = join(ROOT, 'reference');
if (existsSync(referenceRoot)) {
  const enSlugs = new Set<string>();
  const ruSlugs = new Set<string>();
  for (const file of readdirSync(referenceRoot)) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(referenceRoot, file), 'utf-8');
    if (!/^#\s+.+$/m.test(raw)) {
      errors.push(`reference/${file}: missing a "# Title" heading`);
    }
    if (file.endsWith('_ru.md')) {
      const slug = file.replace(/_ru\.md$/, '');
      if (ruSlugs.has(slug)) errors.push(`reference: duplicate slug "${slug}_ru"`);
      ruSlugs.add(slug);
    } else {
      const slug = file.replace(/\.md$/, '');
      if (enSlugs.has(slug)) errors.push(`reference: duplicate slug "${slug}"`);
      enSlugs.add(slug);
    }
  }
  for (const slug of ruSlugs) {
    if (!enSlugs.has(slug)) {
      errors.push(`reference/${slug}_ru.md: no English counterpart "${slug}.md"`);
    }
  }

  const indexPath = join(referenceRoot, 'index.json');
  if (!existsSync(indexPath)) {
    errors.push('reference/index.json: missing');
  } else {
    const parsed = referenceIndexFileSchema.safeParse(readJson(indexPath));
    if (!parsed.success) {
      errors.push(`reference/index.json: ${parsed.error.message}`);
    } else {
      const indexedSlugs = new Set<string>();
      for (const entry of parsed.data.articles) {
        if (indexedSlugs.has(entry.slug)) {
          errors.push(`reference/index.json: duplicate entry "${entry.slug}"`);
        }
        indexedSlugs.add(entry.slug);
        if (!enSlugs.has(entry.slug)) {
          errors.push(`reference/index.json: entry "${entry.slug}" has no matching .md file`);
        }
      }
      for (const slug of enSlugs) {
        if (!indexedSlugs.has(slug)) {
          errors.push(`reference/${slug}.md: no entry in index.json`);
        }
      }
    }
  }
}

// -- dialogues ------------------------------------------------------------
const dialoguesRoot = join(ROOT, 'dialogues');
let dialogueCount = 0;
if (existsSync(dialoguesRoot)) {
  const dialogueIds = new Set<string>();
  for (const file of readdirSync(dialoguesRoot)) {
    if (file === 'index.json') continue;
    const slug = file.replace(/\.json$/, '');
    const parsed = dialogueSchema.safeParse(readJson(join(dialoguesRoot, file)));
    if (!parsed.success) {
      errors.push(`dialogues/${file}: ${parsed.error.message}`);
      continue;
    }
    const dialogue = parsed.data;
    dialogueCount += 1;
    if (dialogueIds.has(dialogue.id)) errors.push(`dialogues: duplicate dialogue id "${dialogue.id}"`);
    dialogueIds.add(dialogue.id);
    if (dialogue.id !== slug) {
      errors.push(`dialogues/${file}: dialogue id is "${dialogue.id}", expected "${slug}"`);
    }
    if (dialogue.lines.length < 8 || dialogue.lines.length > 16) {
      warnings.push(
        `dialogues/${file}: ${dialogue.lines.length} lines (DIALOGUES.md §4.1 wants 8-16)`,
      );
    }
    const roleIds = new Set(dialogue.roles.map((r) => r.id));
    for (const line of dialogue.lines) {
      if (!roleIds.has(line.role)) {
        errors.push(`dialogues/${file}: line uses undeclared role "${line.role}"`);
      }
    }
    // DIALOGUES.md §2: "keyPhrases are strings that actually occur in the dialogue."
    for (const phrase of dialogue.keyPhrases) {
      if (!dialogue.lines.some((l) => l.sv.includes(phrase))) {
        errors.push(`dialogues/${file}: keyPhrase "${phrase}" does not occur verbatim in any line`);
      }
    }
  }

  const indexPath = join(dialoguesRoot, 'index.json');
  if (!existsSync(indexPath)) {
    errors.push('dialogues/index.json: missing');
  } else {
    const parsed = dialogueIndexFileSchema.safeParse(readJson(indexPath));
    if (!parsed.success) {
      errors.push(`dialogues/index.json: ${parsed.error.message}`);
    } else {
      const indexedSlugs = new Set<string>();
      for (const entry of parsed.data.dialogues) {
        if (indexedSlugs.has(entry.slug)) {
          errors.push(`dialogues/index.json: duplicate entry "${entry.slug}"`);
        }
        indexedSlugs.add(entry.slug);
        if (!dialogueIds.has(entry.slug)) {
          errors.push(`dialogues/index.json: entry "${entry.slug}" has no matching .json file`);
        }
      }
      for (const id of dialogueIds) {
        if (!indexedSlugs.has(id)) {
          errors.push(`dialogues/${id}.json: no entry in index.json`);
        }
      }
    }
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

console.log(
  `\n✓ Content valid — ${lessonIds.size} lesson(s), ${buildingIds.size} building(s), ${dialogueCount} dialogue(s).`,
);
