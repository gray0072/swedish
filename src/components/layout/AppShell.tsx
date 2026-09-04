import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Home, Landmark, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useLanguage, useSettings } from '@/store/settings';

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
    <div
      className="flex overflow-hidden rounded-full border border-granite/30 text-xs font-semibold"
      role="group"
      aria-label="Study language"
    >
      {(['ru', 'en'] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          aria-pressed={lang === code}
          className={
            'px-3 py-1.5 transition-colors ' +
            (lang === code
              ? 'bg-falu text-birch'
              : 'text-granite hover:bg-granite/10 dark:text-birch/70')
          }
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const navItems = [
  { to: '/', icon: Home, key: 'nav.home' as const, end: true },
  { to: '/tracks', icon: BookOpen, key: 'nav.tracks' as const, end: false },
  { to: '/review', icon: RotateCcw, key: 'nav.review' as const, end: false },
  { to: '/city', icon: Landmark, key: 'nav.city' as const, end: false },
  { to: '/settings', icon: SettingsIcon, key: 'nav.settings' as const, end: false },
];

export default function AppShell() {
  useThemeEffect();
  const t = useT();
  const touchDailyActivity = useAppStore((s) => s.touchDailyActivity);

  useEffect(() => {
    touchDailyActivity();
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
          <LanguageToggle />
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
        <Outlet />
      </main>
    </div>
  );
}
