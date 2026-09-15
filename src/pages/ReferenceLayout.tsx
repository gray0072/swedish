import { NavLink, Outlet } from 'react-router-dom';
import { MessagesSquare, ScrollText, Table2 } from 'lucide-react';
import { useT } from '@/i18n';

const tabs = [
  { to: '/reference/summaries', icon: ScrollText, key: 'reference.tab.summaries' as const },
  { to: '/reference/words', icon: Table2, key: 'reference.tab.words' as const },
  { to: '/reference/dialogues', icon: MessagesSquare, key: 'reference.tab.dialogues' as const },
];

/**
 * The reference section is one navigation entry with three tabs (REFERENCE.md §6.2) — depth
 * lives here, not in the app's chrome. No progress rings, no scores: this is a library, not a
 * course (REFERENCE.md §3.1).
 */
export default function ReferenceLayout() {
  const t = useT();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('reference.title')}</h1>
        <p className="mt-1 text-sm text-granite dark:text-birch/60">{t('reference.subtitle')}</p>
      </div>
      <nav className="flex gap-1 border-b border-granite/15 dark:border-white/10">
        {tabs.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ' +
              (isActive
                ? 'border-falu text-falu dark:border-gold dark:text-gold'
                : 'border-transparent text-granite hover:text-falu dark:text-birch/60 dark:hover:text-gold')
            }
          >
            <Icon size={16} aria-hidden="true" />
            {t(key)}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
