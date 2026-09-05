import type { ReactNode } from 'react';

/**
 * A serpent-band (ormslinga) frame around era headings — the inscription-band motif from
 * Uppland rune stones. City-only ornament, per SPEC.md §11.4.
 */
export default function EraFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Band flip />
      <h2 className="whitespace-nowrap font-display text-xl font-semibold">{children}</h2>
      <Band />
    </div>
  );
}

function Band({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      className={'h-3 flex-1 text-granite/40 dark:text-gold/30 ' + (flip ? 'scale-x-[-1]' : '')}
      aria-hidden="true"
    >
      <path
        d="M0 6 C 8 0, 16 12, 24 6 S 40 0, 48 6 S 64 12, 72 6 S 88 0, 100 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
