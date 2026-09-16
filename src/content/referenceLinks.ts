/**
 * Cross-links between the reference section's summaries and the curriculum lessons that
 * drill them (REFERENCE.md §6.4) — a lesson with `kind: "grammar"` links to the article
 * that covers it, and the article links back to every lesson that teaches it. The lists
 * below are exactly the `→` annotations from REFERENCE.md §4.3; a lesson slug can recur
 * across several levels (grammar is deliberately repeated — CURRICULUM.md), so the lookup
 * resolves a slug to every level that teaches it, not just one.
 */
export const ARTICLE_TO_LESSON_SLUGS: Record<string, string[]> = {
  'sentence-types': ['statement-word-order', 'simple-questions', 'wh-questions'],
  'word-order': ['statement-word-order', 'negation-inte'],
  'pronunciation-and-spelling': [
    'vowel-length',
    'letter-sound-correspondence',
    'word-stress-melody',
    'connected-speech-reductions',
  ],
  'verb-groups': ['present-tense-basics', 'imperative-four-groups'],
  'verb-forms': ['tense-system-overview', 's-passive-bli-passive', 'pluperfect-narrative'],
  'tense-system': ['tense-system-overview'],
  'modal-verbs': ['skulle-infinitive-politeness', 'infinitive-constructions'],
  'noun-genders': ['en-ett-basics'],
  'noun-forms': ['definite-form-basics', 'plural-recognition', 'genitive-longer-phrase'],
  'adjective-forms': ['liten-agreement'],
  pronouns: ['personal-pronouns', 'min-mitt', 'det-har-dar', 'relative-clauses', 'impersonal-det'],
  prepositions: ['prepositions-i-pa', 'pa-with-days', 'abstract-prepositions', 'verb-preposition-pairs'],
  'numbers-time-dates': ['numbers-0-20', 'clock', 'writing-dates', 'phone-numbers'],
  'conjunctions-and-connectors': ['och-men-conjunctions', 'causal-clauses', 'concessive-clauses', 'text-connectors'],
  'word-formation': ['word-formation-o-miss'],
};

const LESSON_SLUG_TO_ARTICLE: Record<string, string> = Object.fromEntries(
  Object.entries(ARTICLE_TO_LESSON_SLUGS).flatMap(([article, lessonSlugs]) =>
    lessonSlugs.map((slug) => [slug, article]),
  ),
);

/** The article slug for a grammar lesson's own folder slug, if REFERENCE.md names one. */
export function getArticleSlugForLessonSlug(lessonSlug: string): string | undefined {
  return LESSON_SLUG_TO_ARTICLE[lessonSlug];
}

/** The lesson slugs an article drills, per its `→` annotation in REFERENCE.md §4.3. */
export function getLessonSlugsForArticle(articleSlug: string): string[] {
  return ARTICLE_TO_LESSON_SLUGS[articleSlug] ?? [];
}
