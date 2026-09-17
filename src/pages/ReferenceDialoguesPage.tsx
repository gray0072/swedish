import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { resolveLocalized } from '@/content/schema';
import { getDialoguesGrouped } from '@/content/registry';
import { useAppStore } from '@/store/appStore';

/**
 * The dialogue list, grouped by the five sections of DIALOGUES.md §5, only the first
 * expanded by default — same shell as ReferenceSummariesPage (REFERENCE.md §6.3/DIALOGUES.md §6).
 */
export default function ReferenceDialoguesPage() {
  const t = useT();
  const lang = useLanguage();
  const groups = getDialoguesGrouped();
  const dialoguesRead = useAppStore((s) => s.dialoguesRead);

  return (
    <div className="space-y-3">
      {groups.map(({ group, dialogues }, i) => (
        <details key={group} open={i === 0} className="card p-0">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-falu dark:text-gold">
            {t(`reference.dialogueGroup.${group}` as never)}
          </summary>
          <ul className="space-y-1 px-3 pb-3">
            {dialogues.map((d) => (
              <li key={d.id}>
                <Link
                  to={`/reference/dialogues/${d.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm hover:bg-granite/5 dark:hover:bg-white/5"
                >
                  <span className="flex items-center gap-3">
                    <MessagesSquare
                      className="shrink-0 text-granite/60 dark:text-birch/40"
                      size={16}
                      aria-hidden="true"
                    />
                    {resolveLocalized(d.title, lang)}
                  </span>
                  {dialoguesRead.includes(d.id) && (
                    <span className="shrink-0 text-xs font-semibold text-pine dark:text-aurora">✓</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
