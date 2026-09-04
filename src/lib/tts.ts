let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickSwedishVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  if (typeof window === 'undefined' || !window.speechSynthesis) return (cachedVoice = null);
  const voices = window.speechSynthesis.getVoices();
  cachedVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('sv')) ?? null;
  return cachedVoice;
}

export function hasSwedishVoice(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  // Voices often load async; if the list is empty we can't be sure yet, so don't say "no".
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return true;
  return voices.some((v) => v.lang?.toLowerCase().startsWith('sv'));
}

export function speakSwedish(text: string, rate = 0.95): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'sv-SE';
  utterance.rate = rate;
  const voice = pickSwedishVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

// Voice lists load asynchronously in most browsers — refresh the cache once they arrive.
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = undefined;
  };
}
