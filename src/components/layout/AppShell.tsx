import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Home, Landmark, Settings as SettingsIcon } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useCloudSync } from '@/store/useCloudSync';
import { useLanguage, useSettings } from '@/store/settings';
import { LANGUAGE_OPTIONS, type StudyLanguage } from '@/content/schema';
import DalaHorse from '@/components/ui/DalaHorse';
import AchievementToasts from '@/components/ui/AchievementToasts';

function PageLoading() {
  return (
    <div className="flex justify-center py-16">
      <DalaHorse spin className="h-16 w-auto opacity-70" />
    </div>
  );
}

function useThemeEffect() {
  const theme = useSettings().theme;
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const wantsDark =
        theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', wantsDark);
      root.setAttribute('data-theme', theme === 'system' ? '' : theme);
    };
    apply();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);
}

function LanguageToggle() {
  const lang = useLanguage();
  const setLanguage = useAppStore((s) => s.setLanguage);
  return (
    <select
      value={lang}
      onChange={(e) => setLanguage(e.target.value as StudyLanguage)}
      aria-label="Study language"
      className="rounded-full border border-granite/30 bg-transparent px-3 py-1.5 text-xs font-semibold text-granite outline-none focus:border-falu dark:text-birch/70"
    >
      {LANGUAGE_OPTIONS.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}

/**
 * The GitHub mark, inlined rather than taken from `lucide-react`: its brand icons are
 * deprecated upstream and due to be removed in v1.0. One path, `currentColor`, so it picks up
 * the header's text colour in both themes exactly like the nav icons do.
 */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const REPO_URL = 'https://github.com/gray0072/swedish';

/**
 * The core loop, and nothing else: seven items overflowed the header row, and the three that
 * are not part of the loop — review, stats, reference — now live on the Topics page and at the
 * foot of the Home page instead (`secondaryNav.ts`). The same four items serve the desktop row
 * and the mobile bottom bar.
 */
const navItems = [
  { to: '/', icon: Home, key: 'nav.home' as const, end: true },
  { to: '/tracks', icon: BookOpen, key: 'nav.tracks' as const, end: false },
  { to: '/city', icon: Landmark, key: 'nav.city' as const, end: false },
  { to: '/settings', icon: SettingsIcon, key: 'nav.settings' as const, end: false },
];

export default function AppShell() {
  useThemeEffect();
  const t = useT();
  const { pathname } = useLocation();
  const touchDailyActivity = useAppStore((s) => s.touchDailyActivity);
  const claimDailyIncome = useAppStore((s) => s.claimDailyIncome);
  // Runs the actual sync effect once at the app root, independent of route changes.
  // SettingsPage shows status/controls via useCloudSyncStatus(), not this hook.
  useCloudSync();

  useEffect(() => {
    touchDailyActivity();
    // Pays the dailyIncome perk on the first visit of the day (SPEC §8.4). Idempotent, so
    // it is safe to run on every mount — the store stamps the date and pays only once.
    claimDailyIncome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen">
      <div className="swedish-flag-rule" aria-hidden="true" />
      <header className="border-b border-granite/15 bg-birch/90 backdrop-blur dark:border-white/10 dark:bg-midnight/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span aria-hidden="true">🇸🇪</span>
            {t('app.title' as never)}
          </NavLink>
          <nav className="hidden gap-1 sm:flex">
            {navItems.map(({ to, icon: Icon, key, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-falu/10 text-falu dark:bg-falu/20 dark:text-gold'
                    : 'text-granite hover:bg-granite/10 dark:text-birch/70 dark:hover:bg-white/10')
                }
              >
                <Icon size={16} aria-hidden="true" />
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t('nav.repo')}
              title={t('nav.repo')}
              className="rounded-lg p-2 text-granite transition-colors hover:bg-granite/10 hover:text-falu dark:text-birch/70 dark:hover:bg-white/10 dark:hover:text-gold"
            >
              <GithubMark />
            </a>
          </div>
        </div>
        <nav className="flex justify-between border-t border-granite/10 sm:hidden">
          {navItems.map(({ to, icon: Icon, key, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ' +
                (isActive ? 'text-falu dark:text-gold' : 'text-granite dark:text-birch/60')
              }
            >
              <Icon size={18} aria-hidden="true" />
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Keyed by path so every page change replays a short rise-in. */}
        <div key={pathname} className="animate-rise-in">
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <AchievementToasts />
    </div>
  );
}
