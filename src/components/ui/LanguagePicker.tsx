import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/store/settings';
import { LANGUAGE_OPTIONS, type StudyLanguage } from '@/content/schema';
import { LanguageFlag } from './Flag';

/**
 * The header's language switch: a flag pill that opens a small menu of flags and native
 * names. A listbox rather than a native <select>, so the flags show and the menu wears the
 * app's palette in both themes. Arrow keys move, Enter/Space pick, Escape or a click outside
 * closes.
 */
export function LanguageMenu() {
  const lang = useLanguage();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useT();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, LANGUAGE_OPTIONS.findIndex((o) => o.code === lang)));
    listRef.current?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open, lang]);

  function choose(code: StudyLanguage) {
    setLanguage(code);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onListKey(e: React.KeyboardEvent) {
    const last = LANGUAGE_OPTIONS.length - 1;
    if (e.key === 'ArrowDown') setActive((i) => (i >= last ? 0 : i + 1));
    else if (e.key === 'ArrowUp') setActive((i) => (i <= 0 ? last : i - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(last);
    else if (e.key === 'Enter' || e.key === ' ') choose(LANGUAGE_OPTIONS[active].code);
    else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      if (e.key === 'Escape') buttonRef.current?.focus();
      return;
    } else return;
    e.preventDefault();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={t('settings.language')}
        title={t('settings.language')}
        onClick={() => setOpen((o) => !o)}
        className={
          'flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-2 text-xs font-semibold uppercase tracking-wide transition-colors ' +
          (open
            ? 'border-falu/50 bg-falu/5 text-falu dark:border-gold/50 dark:bg-gold/10 dark:text-gold'
            : 'border-granite/25 text-granite hover:border-granite/40 hover:bg-granite/5 dark:border-white/15 dark:text-birch/70 dark:hover:bg-white/5')
        }
      >
        <LanguageFlag language={lang} className="h-4" />
        {lang}
        <ChevronDown size={13} aria-hidden="true" className={'transition-transform ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t('settings.language')}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          className="absolute right-0 top-full z-40 mt-2 min-w-[11rem] origin-top-right animate-pop-in overflow-hidden rounded-xl border border-granite/15 bg-birch p-1 shadow-xl outline-none dark:border-white/10 dark:bg-midnight-surface"
        >
          {LANGUAGE_OPTIONS.map(({ code, label }, i) => {
            const selected = code === lang;
            return (
              <li
                key={code}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onClick={() => choose(code)}
                onPointerEnter={() => setActive(i)}
                className={
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ' +
                  (i === active ? 'bg-granite/10 dark:bg-white/10 ' : '') +
                  (selected ? 'font-semibold text-falu dark:text-gold' : 'text-midnight dark:text-birch')
                }
              >
                <LanguageFlag language={code} className="h-5" />
                <span className="flex-1">{label}</span>
                {selected && <Check size={15} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Settings' language choice: one flag card per language, the current one highlighted. */
export function LanguageCards() {
  const lang = useLanguage();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('settings.language')} className="grid grid-cols-2 gap-2">
      {LANGUAGE_OPTIONS.map(({ code, label }) => {
        const selected = code === lang;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setLanguage(code)}
            className={
              'relative flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition duration-150 active:scale-[0.98] ' +
              (selected
                ? 'border-falu bg-falu/5 text-falu shadow-sm dark:border-gold dark:bg-gold/10 dark:text-gold'
                : 'border-granite/25 hover:bg-granite/5 dark:border-white/15 dark:hover:bg-white/5')
            }
          >
            <LanguageFlag language={code} className="h-6" />
            <span className="flex-1">{label}</span>
            {selected && <Check size={16} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
