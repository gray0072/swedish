import { useAppStore } from '@/store/appStore';

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

export function speakSwedish(text: string, rate?: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
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

// Voice lists load asynchronously in most browsers — refresh the cache once they arrive.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedSwedishVoices = undefined;
  };
}
