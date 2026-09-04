import { useEffect, useMemo, useState } from 'react';
import type { Choice, Question } from '@/content/schema';
import { resolveLocalized, resolveChoice } from '@/content/schema';
import { useLanguage } from '@/store/settings';
import { useT } from '@/i18n';
import { shuffleDisplay } from '@/lib/shuffle';
import { speakSwedish } from '@/lib/tts';
import type { Answer } from '@/quiz/grading';
import { Volume2 } from 'lucide-react';

interface Props {
  question: Question;
  disabled: boolean;
  onChange: (answer: Answer | null) => void;
  /** Bumped by the parent to force a fresh draft when the same question is retried. */
  resetKey: number;
}

const optionLetter = ['1', '2', '3', '4', '5', '6'];

function McChoices({
  choices,
  selected,
  onSelect,
  disabled,
  lang,
}: {
  choices: Choice[];
  selected: number | null;
  onSelect: (i: number) => void;
  disabled: boolean;
  lang: ReturnType<typeof useLanguage>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {choices.map((choice, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(i)}
          className={
            'flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ' +
            (selected === i
              ? 'border-falu bg-falu/10 dark:bg-falu/20'
              : 'border-granite/20 hover:border-falu/50 hover:bg-granite/5 dark:border-white/15 dark:hover:bg-white/5')
          }
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-granite/10 text-[11px] font-bold dark:bg-white/10">
            {optionLetter[i]}
          </span>
          {resolveChoice(choice, lang)}
        </button>
      ))}
    </div>
  );
}

export default function QuestionRenderer({ question, disabled, onChange, resetKey }: Props) {
  const lang = useLanguage();
  const t = useT();
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [orderSeq, setOrderSeq] = useState<number[]>([]);
  const [tf, setTf] = useState<boolean | null>(null);
  const [matchPairs, setMatchPairs] = useState<Array<[number, number]>>([]);
  const [activeLeft, setActiveLeft] = useState<number | null>(null);

  useEffect(() => {
    setMcChoice(null);
    setText('');
    setOrderSeq([]);
    setTf(null);
    setMatchPairs([]);
    setActiveLeft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, question.id]);

  const shuffledRight = useMemo(() => {
    if (question.type !== 'match') return [];
    return shuffleDisplay(question.pairs.map((_, i) => i));
  }, [question]);

  useEffect(() => {
    if (question.type === 'listen') speakSwedish(question.audioText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  if (question.type === 'mc') {
    return (
      <div>
        <p className="mb-4 text-lg font-medium">{resolveLocalized(question.prompt, lang)}</p>
        <McChoices
          choices={question.choices}
          selected={mcChoice}
          disabled={disabled}
          lang={lang}
          onSelect={(i) => {
            setMcChoice(i);
            onChange({ kind: 'mc', choiceIndex: i });
          }}
        />
      </div>
    );
  }

  if (question.type === 'listen') {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => speakSwedish(question.audioText)}
            className="btn-primary"
          >
            <Volume2 size={16} aria-hidden="true" />
            {t('lesson.play')}
          </button>
          <p className="font-medium">{resolveLocalized(question.prompt, lang)}</p>
        </div>
        <McChoices
          choices={question.choices}
          selected={mcChoice}
          disabled={disabled}
          lang={lang}
          onSelect={(i) => {
            setMcChoice(i);
            onChange({ kind: 'listen', choiceIndex: i });
          }}
        />
      </div>
    );
  }

  if (question.type === 'type-answer' || question.type === 'gap') {
    return (
      <div>
        <p className="mb-4 text-lg font-medium">{resolveLocalized(question.prompt, lang)}</p>
        <input
          type="text"
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            onChange(
              e.target.value.trim()
                ? { kind: question.type, text: e.target.value }
                : null,
            );
          }}
          placeholder={t('quiz.typeAnswer.placeholder')}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-xl border border-granite/25 bg-transparent px-4 py-3 text-lg outline-none focus:border-falu dark:border-white/20"
        />
        {'hint' in question && question.hint && (
          <p className="mt-2 text-xs text-granite dark:text-birch/60">
            {resolveLocalized(question.hint, lang)}
          </p>
        )}
      </div>
    );
  }

  if (question.type === 'true-false') {
    return (
      <div>
        <p className="mb-4 text-lg font-medium">{resolveLocalized(question.prompt, lang)}</p>
        <div className="flex gap-3">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              disabled={disabled}
              onClick={() => {
                setTf(v);
                onChange({ kind: 'true-false', value: v });
              }}
              className={
                'flex-1 rounded-xl border px-4 py-3 font-semibold transition-colors ' +
                (tf === v
                  ? 'border-falu bg-falu/10'
                  : 'border-granite/20 hover:border-falu/50 dark:border-white/15')
              }
            >
              {v ? t('quiz.trueFalse.true') : t('quiz.trueFalse.false')}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'order') {
    const remaining = question.tokens.map((_, i) => i).filter((i) => !orderSeq.includes(i));
    return (
      <div>
        <p className="mb-4 text-lg font-medium">{resolveLocalized(question.prompt, lang)}</p>
        <div className="mb-3 flex min-h-12 flex-wrap gap-2 rounded-xl border border-dashed border-granite/30 p-3 dark:border-white/20">
          {orderSeq.length === 0 && (
            <span className="text-sm text-granite/60">…</span>
          )}
          {orderSeq.map((tokenIdx, pos) => (
            <button
              key={pos}
              type="button"
              disabled={disabled}
              onClick={() => {
                const next = orderSeq.filter((_, i) => i !== pos);
                setOrderSeq(next);
                onChange(next.length === question.tokens.length ? { kind: 'order', order: next } : null);
              }}
              className="sv-word rounded-lg bg-falu/10 px-3 py-1.5 text-sm dark:bg-falu/25"
            >
              {question.tokens[tokenIdx]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {remaining.map((tokenIdx) => (
            <button
              key={tokenIdx}
              type="button"
              disabled={disabled}
              onClick={() => {
                const next = [...orderSeq, tokenIdx];
                setOrderSeq(next);
                onChange(next.length === question.tokens.length ? { kind: 'order', order: next } : null);
              }}
              className="sv-word rounded-lg border border-granite/25 px-3 py-1.5 text-sm hover:border-falu/50 dark:border-white/15"
            >
              {question.tokens[tokenIdx]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'match') {
    const matchedLeft = new Set(matchPairs.map(([l]) => l));
    const matchedRight = new Set(matchPairs.map(([, r]) => r));
    return (
      <div>
        <p className="mb-4 text-lg font-medium">{t('quiz.match.instruction')}</p>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            {question.pairs.map(([sv], i) => (
              <button
                key={i}
                type="button"
                disabled={disabled || matchedLeft.has(i)}
                onClick={() => setActiveLeft(i)}
                className={
                  'sv-word block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ' +
                  (matchedLeft.has(i)
                    ? 'border-pine/40 bg-pine/10 opacity-60'
                    : activeLeft === i
                      ? 'border-falu bg-falu/10'
                      : 'border-granite/20 hover:border-falu/40 dark:border-white/15')
                }
              >
                {sv}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {shuffledRight.map((originalIdx) => (
              <button
                key={originalIdx}
                type="button"
                disabled={disabled || matchedRight.has(originalIdx) || activeLeft === null}
                onClick={() => {
                  if (activeLeft === null) return;
                  const next: Array<[number, number]> = [...matchPairs, [activeLeft, originalIdx]];
                  setMatchPairs(next);
                  setActiveLeft(null);
                  onChange(
                    next.length === question.pairs.length ? { kind: 'match', pairs: next } : null,
                  );
                }}
                className={
                  'block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ' +
                  (matchedRight.has(originalIdx)
                    ? 'border-pine/40 bg-pine/10 opacity-60'
                    : 'border-granite/20 hover:border-falu/40 dark:border-white/15')
                }
              >
                {question.pairs[originalIdx][1]}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
