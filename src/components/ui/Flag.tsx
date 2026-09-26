import type { StudyLanguage } from '@/content/schema';

/**
 * Flags drawn as SVG rather than emoji: Windows ships no flag glyphs, so "🇬🇧" renders there as
 * the bare letters "GB". Each flag is a 3:2 (or 2:1) viewBox scaled to the given height, with a
 * hairline ring so a white stripe never melts into a light background.
 */
type FlagCode = 'se' | 'gb' | 'ru';

const FLAG_FOR_LANGUAGE: Record<StudyLanguage, FlagCode> = { en: 'gb', ru: 'ru' };

function FlagArt({ code }: { code: FlagCode }) {
  switch (code) {
    case 'se':
      return (
        <svg viewBox="0 0 16 10" preserveAspectRatio="none">
          <rect width="16" height="10" fill="#006AA7" />
          <rect x="5" width="2" height="10" fill="#FECC00" />
          <rect y="4" width="16" height="2" fill="#FECC00" />
        </svg>
      );
    case 'gb':
      return (
        <svg viewBox="0 0 60 30" preserveAspectRatio="none">
          <clipPath id="flag-gb-clip">
            <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#flag-gb-clip)" />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      );
    case 'ru':
      return (
        <svg viewBox="0 0 9 6" preserveAspectRatio="none">
          <rect width="9" height="2" fill="#fff" />
          <rect y="2" width="9" height="2" fill="#0039A6" />
          <rect y="4" width="9" height="2" fill="#D52B1E" />
        </svg>
      );
  }
}

export function Flag({ code, className = 'h-4' }: { code: FlagCode; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block aspect-[3/2] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(14,36,56,0.15)] [&>svg]:h-full [&>svg]:w-full ${className}`}
    >
      <FlagArt code={code} />
    </span>
  );
}

export function LanguageFlag({ language, className }: { language: StudyLanguage; className?: string }) {
  return <Flag code={FLAG_FOR_LANGUAGE[language]} className={className} />;
}
