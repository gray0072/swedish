import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { resolveLocalized, type DialogueLine } from '@/content/schema';
import { getDialogue, getDialogueQuestionIdsFor } from '@/content/registry';
import { useAppStore } from '@/store/appStore';
import { REWARDS } from '@/city/economy';
import { hasSwedishVoice, speakDialogue } from '@/lib/tts';
import AudioButton from '@/components/lesson/AudioButton';
import NotFoundPage from './NotFoundPage';

type Mode = 'read' | 'listen' | 'rolePlay';
const MODES: Mode[] = ['read', 'listen', 'rolePlay'];

// Cycles through 4 role colours; every dialogue has 2-4 roles (DIALOGUES.md §2 examples).
const ROLE_STYLES = [
  'text-falu dark:text-gold',
  'text-pine dark:text-aurora',
  'text-aurora-violet dark:text-aurora-violet',
  'text-granite dark:text-birch/70',
];

export default function ReferenceDialoguePage() {
  const { slug = '' } = useParams();
  const t = useT();
  const lang = useLanguage();
  const dialogue = getDialogue(slug);

  const markDialogueRead = useAppStore((s) => s.markDialogueRead);
  const seedReviewItems = useAppStore((s) => s.seedReviewItems);
  const isRead = useAppStore((s) => (dialogue ? s.dialoguesRead.includes(dialogue.id) : false));

  // Reading the page once is the "read" moment (DIALOGUES.md §3) — no click to confirm needed,
  // unlike a history card's collapsed-by-default list entry.
  useEffect(() => {
    if (!dialogue || isRead) return;
    markDialogueRead(dialogue.id, REWARDS.dialogueCoins);
    seedReviewItems(getDialogueQuestionIdsFor(dialogue.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogue?.id]);

  const [mode, setMode] = useState<Mode>('read');
  const [hideTranslations, setHideTranslations] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const stopRef = useRef<() => void>(() => {});

  const roleIndexById = useMemo(() => {
    const map = new Map<string, number>();
    dialogue?.roles.forEach((r, i) => map.set(r.id, i));
    return map;
  }, [dialogue]);

  // Stop any playback when leaving the page or switching dialogues.
  useEffect(() => () => stopRef.current(), [dialogue?.id]);

  if (!dialogue) return <NotFoundPage />;

  function roleStyle(roleId: string): string {
    return ROLE_STYLES[(roleIndexById.get(roleId) ?? 0) % ROLE_STYLES.length];
  }

  function roleName(roleId: string): string {
    return dialogue!.roles.find((r) => r.id === roleId)?.name ?? roleId;
  }

  function stopPlayback() {
    stopRef.current();
    stopRef.current = () => {};
    setPlayingIndex(null);
  }

  function handlePlay() {
    const cues = dialogue!.lines.map((l) => ({ text: l.sv, roleIndex: roleIndexById.get(l.role) ?? 0 }));
    const { stop } = speakDialogue(cues, {
      onCueStart: setPlayingIndex,
      onDone: () => setPlayingIndex(null),
    });
    stopRef.current = stop;
  }

  function pickRole(id: string) {
    setRoleId(id);
    setRevealed(new Set());
  }

  return (
    <div className="max-w-xl space-y-4">
      <Link
        to="/reference/dialogues"
        className="text-sm text-granite hover:underline dark:text-birch/60"
      >
        ← {t('dialogue.back')}
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold">{resolveLocalized(dialogue.title, lang)}</h1>
        <p className="mt-1 text-sm text-granite dark:text-birch/60">
          {lang === 'ru' ? dialogue.setting.ru : dialogue.setting.en}
        </p>
        <p className="mt-2 text-xs font-semibold text-falu dark:text-gold">
          {isRead ? `✓ ${t('dialogue.read')}` : t('dialogue.reward', { coins: REWARDS.dialogueCoins })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-granite/15 pb-3 dark:border-white/10">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              stopPlayback();
              setMode(m);
            }}
            className={mode === m ? 'btn-primary' : 'btn-secondary'}
          >
            {t(`dialogue.mode.${m}` as never)}
          </button>
        ))}
      </div>

      {mode === 'read' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hideTranslations}
              onChange={(e) => setHideTranslations(e.target.checked)}
              className="h-4 w-4 accent-falu"
            />
            {t('dialogue.hideTranslations')}
          </label>
          {dialogue.lines.map((line, i) => (
            <ReadLine
              key={i}
              line={line}
              roleName={roleName(line.role)}
              roleClass={roleStyle(line.role)}
              translation={lang === 'ru' ? line.ru : line.en}
              hideTranslation={hideTranslations}
            />
          ))}
        </div>
      )}

      {mode === 'listen' && (
        <div className="space-y-3">
          {hasSwedishVoice() ? (
            <button type="button" className="btn-primary" onClick={playingIndex === null ? handlePlay : stopPlayback}>
              {playingIndex === null ? t('dialogue.listen.play') : t('dialogue.listen.stop')}
            </button>
          ) : (
            <p className="text-sm text-granite dark:text-birch/60">{t('dialogue.listen.unavailable')}</p>
          )}
          {dialogue.lines.map((line, i) => (
            <div
              key={i}
              className={
                'rounded-xl border-l-4 px-3 py-2 text-sm transition-colors ' +
                (i === playingIndex
                  ? 'border-l-gold bg-gold/10'
                  : 'border-l-transparent')
              }
            >
              <span className={'font-semibold ' + roleStyle(line.role)}>{roleName(line.role)}:</span>{' '}
              <span className="sv-word">{line.sv}</span>
            </div>
          ))}
        </div>
      )}

      {mode === 'rolePlay' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{t('dialogue.rolePlay.pickRole')}</span>
            {dialogue.roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickRole(r.id)}
                className={roleId === r.id ? 'btn-primary' : 'btn-secondary'}
              >
                {r.name}
              </button>
            ))}
          </div>
          {roleId &&
            dialogue.lines.map((line, i) => {
              const isMine = line.role === roleId;
              const isRevealed = revealed.has(i);
              return (
                <div key={i} className="rounded-xl border-l-4 border-l-granite/20 px-3 py-2 text-sm dark:border-l-white/10">
                  <span className={'font-semibold ' + roleStyle(line.role)}>{roleName(line.role)}:</span>{' '}
                  {isMine && !isRevealed ? (
                    <button
                      type="button"
                      className="text-granite underline underline-offset-2 dark:text-birch/60"
                      onClick={() => setRevealed((prev) => new Set(prev).add(i))}
                    >
                      {t('dialogue.rolePlay.tapToReveal')}
                    </button>
                  ) : (
                    <span className="sv-word">{line.sv}</span>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {dialogue.keyPhrases.length > 0 && (
        <div className="border-t border-granite/10 pt-3 dark:border-white/10">
          <p className="mb-2 text-sm font-semibold text-granite dark:text-birch/70">
            {t('dialogue.keyPhrases')}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {dialogue.keyPhrases.map((phrase) => (
              <li
                key={phrase}
                className="flex items-center gap-1 rounded-full bg-granite/10 py-0.5 pl-1 pr-2.5 text-xs dark:bg-white/10"
              >
                <AudioButton text={phrase} />
                <span className="sv-word">{phrase}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dialogue.culture && (
        <div className="rounded-xl bg-gold/10 p-3 text-sm dark:bg-gold/5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-falu dark:text-gold">
            {t('dialogue.culture')}
          </p>
          <p>{lang === 'ru' ? dialogue.culture.ru : dialogue.culture.en}</p>
        </div>
      )}
    </div>
  );
}

function ReadLine({
  line,
  roleName,
  roleClass,
  translation,
  hideTranslation,
}: {
  line: DialogueLine;
  roleName: string;
  roleClass: string;
  translation: string;
  hideTranslation: boolean;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border-l-4 border-l-granite/20 px-3 py-2 dark:border-l-white/10">
      <AudioButton text={line.sv} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className={'font-semibold ' + roleClass}>{roleName}:</span>{' '}
          <span className="sv-word">{line.sv}</span>
        </p>
        {!hideTranslation && (
          <p className="mt-0.5 text-sm text-granite dark:text-birch/60">{translation}</p>
        )}
        {line.note && (
          <p className="mt-0.5 text-xs italic text-granite/70 dark:text-birch/40">{line.note.en}</p>
        )}
      </div>
    </div>
  );
}
