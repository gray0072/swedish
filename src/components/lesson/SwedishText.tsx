import { Fragment } from 'react';

/**
 * Swedish text with its `[notes]` set apart (see src/content/swedishText.ts): a note is not
 * part of the Swedish, so it reads as a small muted annotation — "anden accent 1" — rather
 * than as literal brackets inside the word.
 */
export default function SwedishText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]*\])/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[') && part.endsWith(']') ? (
          <span
            key={i}
            className="mx-0.5 rounded bg-granite/10 px-1 py-px align-middle text-[0.75em] font-normal not-italic text-granite dark:bg-white/10 dark:text-birch/60"
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
