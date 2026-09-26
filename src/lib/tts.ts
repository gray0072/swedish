import { useAppStore } from '@/store/appStore';
import { withoutNotes } from '@/content/swedishText';

let cachedSwedishVoices: SpeechSynthesisVoice[] | undefined;

function loadSwedishVoices(): SpeechSynthesisVoice[] {
  if (cachedSwedishVoices !== undefined) return cachedSwedishVoices;
  if (typeof window === 'undefined' || !window.speechSynthesis) return (cachedSwedishVoices = []);
  const all = window.speechSynthesis.getVoices();
  cachedSwedishVoices = all.filter((v) => v.lang?.toLowerCase().startsWith('sv'));
  return cachedSwedishVoices;
}

/** All installed sv-SE voices — used to populate the voice picker in Settings. */
export function listSwedishVoices(): SpeechSynthesisVoice[] {
  return loadSwedishVoices();
}

export function hasSwedishVoice(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const all = window.speechSynthesis.getVoices();
  // Voices often load async; if the list is empty altogether we can't be sure yet, so
  // don't say "no" — only say "no" once the browser has reported *some* voices.
  if (all.length === 0) return true;
  return loadSwedishVoices().length > 0;
}

function resolveVoice(): SpeechSynthesisVoice | null {
  const voices = loadSwedishVoices();
  if (voices.length === 0) return null;
  const preferredURI = useAppStore.getState().settings.ttsVoice;
  if (preferredURI) {
    const preferred = voices.find((v) => v.voiceURI === preferredURI);
    if (preferred) return preferred;
  }
  return voices[0];
}

/**
 * What the speech engine gets: no [notes], no ✓/✗ marks, no leading dialogue dash, and arrows,
 * slashes and spaced dashes read as a pause — some voices otherwise say "right arrow" or "slash".
 */
export function speakableSwedish(text: string): string {
  return withoutNotes(text)
    .replace(/[✓✗]/g, '')
    .replace(/^\s*[–—]\s*/, '')
    .replace(/\s*(?:→|\/|\s[–—])\s*/g, ', ')
    .replace(/([.!?…]),/g, '$1')
    .trim();
}

export function speakSwedish(text: string, rate?: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(speakableSwedish(text));
  utterance.lang = 'sv-SE';
  utterance.rate = rate ?? useAppStore.getState().settings.ttsRate;
  const voice = resolveVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

/** Preview a specific voice regardless of the stored preference — used by the Settings picker. */
export function previewVoice(voiceURI: string, rate?: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance('Hej! Hur mår du?');
  utterance.lang = 'sv-SE';
  utterance.rate = rate ?? useAppStore.getState().settings.ttsRate;
  const voice = loadSwedishVoices().find((v) => v.voiceURI === voiceURI);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export interface DialogueCue {
  text: string;
  roleIndex: number;
}

// Alternating rate for role 1 vs role 0 when only one sv-SE voice is installed (the common
// case) — the only way to make two speakers sound distinct without a second voice.
const ROLE_RATE_OFFSET = -0.15;

export interface SpeakDialogueOptions {
  /** Called just before each cue starts playing, with its index into the cues array. */
  onCueStart?: (index: number) => void;
  /** Called once the whole scene has finished playing (not called if stop() cuts it short). */
  onDone?: () => void;
}

/** Plays a whole dialogue scene in order, alternating voice (if more than one is installed)
 * or rate per role, chaining each utterance to the next (DIALOGUES.md §3 "listen" mode). */
export function speakDialogue(cues: DialogueCue[], options: SpeakDialogueOptions = {}): { stop: () => void } {
  if (typeof window === 'undefined' || !window.speechSynthesis || cues.length === 0) {
    return { stop: () => {} };
  }
  window.speechSynthesis.cancel();
  const voices = loadSwedishVoices();
  const baseRate = useAppStore.getState().settings.ttsRate;
  let cancelled = false;

  function playFrom(index: number) {
    if (cancelled) return;
    if (index >= cues.length) {
      options.onDone?.();
      return;
    }
    const cue = cues[index];
    options.onCueStart?.(index);
    const utterance = new SpeechSynthesisUtterance(cue.text);
    utterance.lang = 'sv-SE';
    if (voices.length > 1) {
      utterance.voice = voices[cue.roleIndex % voices.length];
      utterance.rate = baseRate;
    } else {
      if (voices[0]) utterance.voice = voices[0];
      utterance.rate = cue.roleIndex % 2 === 0 ? baseRate : Math.max(0.5, baseRate + ROLE_RATE_OFFSET);
    }
    utterance.onend = () => playFrom(index + 1);
    window.speechSynthesis.speak(utterance);
  }

  playFrom(0);
  return {
    stop: () => {
      cancelled = true;
      window.speechSynthesis.cancel();
    },
  };
}

// Voice lists load asynchronously in most browsers — refresh the cache once they arrive.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedSwedishVoices = undefined;
  };
}
