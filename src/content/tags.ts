import tagsFile from '../../content/tags.json';
import type { LessonMeta, StudyLanguage } from './schema';

/**
 * Display labels for lesson tags. `lesson.json` carries tags as English slugs
 * ("word-order"); `content/tags.json` maps each slug to a label per interface language, and
 * `scripts/validate-content.ts` fails on a tag that has no entry there.
 */
const LABELS: Record<string, Partial<Record<StudyLanguage, string>>> = tagsFile.tags;

export function hasTagLabel(tag: string): boolean {
  return tag in LABELS;
}

export function tagLabel(tag: string, lang: StudyLanguage): string {
  return LABELS[tag]?.[lang] ?? LABELS[tag]?.en ?? tag.replace(/-/g, ' ');
}

/** Tags that only repeat the lesson's kind, which the kind badge already shows. */
const KIND_ECHOES = new Set(['grammar', 'vocab', 'vocabulary', 'phrases']);

/** The tags worth showing next to the kind badge, in authored order. */
export function displayTags(meta: Pick<LessonMeta, 'tags'>, limit = Infinity): string[] {
  return meta.tags.filter((tag) => !KIND_ECHOES.has(tag)).slice(0, limit);
}
