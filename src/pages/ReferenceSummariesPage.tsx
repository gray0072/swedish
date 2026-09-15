import { Link } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getReferenceArticlesGrouped } from '@/content/registry';

export default function ReferenceSummariesPage() {
  const t = useT();
  const lang = useLanguage();
  const groups = getReferenceArticlesGrouped();

  return (
    <div className="space-y-3">
      {groups.map(({ group, articles }, i) => (
        // Groups are collapsed by default except the first (REFERENCE.md §6.3) — a phone
        // opens this tab to a handful of headings, not a wall of twenty links.
        <details key={group} open={i === 0} className="card p-0">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-falu dark:text-gold">
            {t(`reference.group.${group}` as never)}
          </summary>
          <ul className="space-y-1 px-3 pb-3">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link
                  to={`/reference/summaries/${a.slug}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-granite/5 dark:hover:bg-white/5"
                >
                  <ScrollText
                    className="shrink-0 text-granite/60 dark:text-birch/40"
                    size={16}
                    aria-hidden="true"
                  />
                  {lang === 'ru' && a.titleRu ? a.titleRu : a.titleEn}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
