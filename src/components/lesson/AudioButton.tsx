import { Volume2 } from 'lucide-react';
import { speakSwedish } from '@/lib/tts';

export default function AudioButton({ text, rate }: { text: string; rate?: number }) {
  return (
    <button
      type="button"
      onClick={() => speakSwedish(text, rate)}
      aria-label={`Lyssna: ${text}`}
      title={`Lyssna: ${text}`}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-granite hover:bg-granite/10 hover:text-falu dark:text-birch/60 dark:hover:bg-white/10 dark:hover:text-gold"
    >
      <Volume2 size={15} aria-hidden="true" />
    </button>
  );
}
