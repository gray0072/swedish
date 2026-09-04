import type { GeneratorConfig, Question, VocabItem } from './schema';

/**
 * Expands a small vocabulary list (15-25 words) into a large question pool (100+).
 * This is what makes "10 of 100 questions per topic" realistic without asking authors
 * to hand-write a hundred questions per lesson. See SPEC.md §5.5 / §5.7.
 */
export function expandGenerators(
  generators: GeneratorConfig[],
  vocab: VocabItem[],
  lessonId: string,
): Question[] {
  const out: Question[] = [];
  for (const gen of generators) {
    const pool = gen.filter?.pos ? vocab.filter((v) => v.pos === gen.filter!.pos) : vocab;
    switch (gen.type) {
      case 'sv-to-native-mc':
        out.push(...genSvToNativeMc(pool, lessonId));
        break;
      case 'native-to-sv-mc':
        out.push(...genNativeToSvMc(pool, lessonId));
        break;
      case 'type-answer':
        out.push(...genTypeAnswer(pool, lessonId));
        break;
      case 'listen-mc':
        out.push(...genListenMc(pool, lessonId));
        break;
      case 'article':
        out.push(...genArticle(pool, lessonId));
        break;
      case 'plural':
        out.push(...genPlural(pool, lessonId));
        break;
      case 'verb-form':
        out.push(...genVerbForm(pool, lessonId, gen.targets ?? ['present', 'past', 'supine']));
        break;
    }
  }
  return out;
}

/** Prefer distractors of the same part of speech and similar word length. */
function pickDistractors(vocab: VocabItem[], current: VocabItem, count: number): VocabItem[] {
  const others = vocab.filter((v) => v.id !== current.id);
  const samePos = others.filter((v) => v.pos === current.pos);
  const base = samePos.length >= count ? samePos : others;
  return [...base]
    .sort((a, b) => Math.abs(a.sv.length - current.sv.length) - Math.abs(b.sv.length - current.sv.length))
    .slice(0, count);
}

function genSvToNativeMc(vocab: VocabItem[], lessonId: string): Question[] {
  const out: Question[] = [];
  for (const item of vocab) {
    const distractors = pickDistractors(vocab, item, 3);
    if (distractors.length < 3) continue;
    out.push({
      id: `gen-${lessonId}-sv2n-${item.id}`,
      type: 'mc',
      difficulty: 1,
      tags: ['generated', 'sv-to-native'],
      generated: true,
      prompt: { ru: `Как переводится «${item.sv}»?`, en: `What does "${item.sv}" mean?` },
      choices: [
        { ru: item.translations.ru, en: item.translations.en },
        ...distractors.map((d) => ({ ru: d.translations.ru, en: d.translations.en })),
      ],
      answer: 0,
      explanation: item.example
        ? { ru: item.example.ru, en: item.example.en }
        : undefined,
    });
  }
  return out;
}

function genNativeToSvMc(vocab: VocabItem[], lessonId: string): Question[] {
  const out: Question[] = [];
  for (const item of vocab) {
    const distractors = pickDistractors(vocab, item, 3);
    if (distractors.length < 3) continue;
    out.push({
      id: `gen-${lessonId}-n2sv-${item.id}`,
      type: 'mc',
      difficulty: 2,
      tags: ['generated', 'native-to-sv'],
      generated: true,
      prompt: {
        ru: `Как будет по-шведски «${item.translations.ru}»?`,
        en: `How do you say "${item.translations.en}" in Swedish?`,
      },
      choices: [item.sv, ...distractors.map((d) => d.sv)],
      answer: 0,
    });
  }
  return out;
}

function genTypeAnswer(vocab: VocabItem[], lessonId: string): Question[] {
  return vocab.map((item) => ({
    id: `gen-${lessonId}-type-${item.id}`,
    type: 'type-answer' as const,
    difficulty: 2,
    tags: ['generated', 'type-answer'],
    generated: true,
    prompt: {
      ru: `Напиши по-шведски: «${item.translations.ru}»`,
      en: `Type in Swedish: "${item.translations.en}"`,
    },
    answer: [item.sv],
    hint: item.example ? { ru: item.example.ru, en: item.example.en } : undefined,
  }));
}

function genListenMc(vocab: VocabItem[], lessonId: string): Question[] {
  const out: Question[] = [];
  for (const item of vocab) {
    const distractors = pickDistractors(vocab, item, 3);
    if (distractors.length < 3) continue;
    out.push({
      id: `gen-${lessonId}-listen-${item.id}`,
      type: 'listen',
      difficulty: 2,
      tags: ['generated', 'listen'],
      generated: true,
      audioText: item.sv,
      prompt: { ru: 'Что ты услышал(а)?', en: 'What did you hear?' },
      choices: [item.sv, ...distractors.map((d) => d.sv)],
      answer: 0,
    });
  }
  return out;
}

function genArticle(vocab: VocabItem[], lessonId: string): Question[] {
  return vocab
    .filter((v) => v.pos === 'noun' && v.gender)
    .map((item) => ({
      id: `gen-${lessonId}-article-${item.id}`,
      type: 'mc' as const,
      difficulty: 2,
      tags: ['generated', 'article'],
      generated: true,
      prompt: {
        ru: `Какой артикль у слова «${item.sv}»?`,
        en: `Which article goes with "${item.sv}"?`,
      },
      choices: item.gender === 'en' ? ['en', 'ett'] : ['ett', 'en'],
      answer: 0,
    }));
}

function genPlural(vocab: VocabItem[], lessonId: string): Question[] {
  return vocab
    .filter((v) => v.pos === 'noun' && v.forms && 'indefPl' in v.forms)
    .map((item) => {
      const forms = item.forms as { indefPl: string };
      return {
        id: `gen-${lessonId}-plural-${item.id}`,
        type: 'type-answer' as const,
        difficulty: 3,
        tags: ['generated', 'plural'],
        generated: true,
        prompt: {
          ru: `Форма множественного числа: «${item.sv}» → ?`,
          en: `Plural form: "${item.sv}" → ?`,
        },
        answer: [forms.indefPl],
      };
    });
}

function genVerbForm(
  vocab: VocabItem[],
  lessonId: string,
  targets: Array<'present' | 'past' | 'supine'>,
): Question[] {
  const out: Question[] = [];
  const labels: Record<string, { ru: string; en: string }> = {
    present: { ru: 'настоящее время', en: 'present tense' },
    past: { ru: 'прошедшее время', en: 'past tense' },
    supine: { ru: 'супин', en: 'supine' },
  };
  for (const item of vocab) {
    if (item.pos !== 'verb' || !item.forms || !('infinitive' in item.forms)) continue;
    for (const target of targets) {
      const forms = item.forms as Record<string, string>;
      const value = forms[target];
      if (!value) continue;
      out.push({
        id: `gen-${lessonId}-verb-${target}-${item.id}`,
        type: 'type-answer',
        difficulty: 3,
        tags: ['generated', 'verb-form', target],
        generated: true,
        prompt: {
          ru: `«${item.sv}» (${item.forms && 'infinitive' in item.forms ? forms.infinitive : item.sv}) в форме «${labels[target].ru}»?`,
          en: `"${item.sv}" in the ${labels[target].en}?`,
        },
        answer: [value],
      });
    }
  }
  return out;
}
