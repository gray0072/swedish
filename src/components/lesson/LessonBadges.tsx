import { BookA, Blocks, Layers, MessagesSquare, type LucideIcon } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import type { LessonKind } from '@/content/schema';
import { tagLabel } from '@/content/tags';

/**
 * A lesson's kind as a coloured pill with an icon — one colour per kind, so a course list
 * reads at a glance as words / grammar / phrases — and its tags as quiet hashtag chips.
 */
const KIND_LOOK: Record<LessonKind, { Icon: LucideIcon; className: string }> = {
  vocab: { Icon: BookA, className: 'bg-falu/10 text-falu dark:bg-gold/15 dark:text-gold' },
  grammar: { Icon: Blocks, className: 'bg-blue-flag/10 text-blue-flag dark:bg-aurora/15 dark:text-aurora' },
  phrases: { Icon: MessagesSquare, className: 'bg-pine/10 text-pine dark:bg-aurora-violet/25 dark:text-birch' },
  mixed: { Icon: Layers, className: 'bg-granite/10 text-granite dark:bg-white/10 dark:text-birch/80' },
};

export function KindBadge({ kind, className = '' }: { kind: LessonKind; className?: string }) {
  const t = useT();
  const { Icon, className: look } = KIND_LOOK[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${look} ${className}`}
    >
      <Icon size={12} aria-hidden="true" />
      {t(`level.kind.${kind}`)}
    </span>
  );
}

export function TagChips({ tags, className = '' }: { tags: string[]; className?: string }) {
  const lang = useLanguage();
  if (tags.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-granite/15 px-2 py-0.5 text-[11px] leading-4 text-granite dark:border-white/10 dark:text-birch/60"
        >
          <span className="text-granite/50 dark:text-birch/35" aria-hidden="true">
            #
          </span>
          {tagLabel(tag, lang)}
        </li>
      ))}
    </ul>
  );
}
