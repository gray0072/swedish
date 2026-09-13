import { useAppStore } from '@/store/appStore';

/**
 * Feedback sounds, synthesized with the Web Audio API rather than shipped as audio files.
 *
 * Two reasons: SPEC §2 rules out hosting audio assets, and a PWA that precaches every lesson
 * JSON should not also carry megabytes of mp3 for four chimes. Everything here is a few
 * oscillators and an envelope — zero bytes of assets, works offline, instant.
 *
 * House rules (SPEC §11.7): sounds are short, quiet, mutable, and never punish. There is
 * deliberately no sound for a wrong answer — a wrong answer just means the item comes back
 * sooner, and scoring it with a buzzer would contradict the whole tone of the app.
 */

type Voice = OscillatorType;

interface Note {
  /** Hz. */
  freq: number;
  /** Seconds from the start of the phrase. */
  at: number;
  /** Seconds the note rings for. */
  len: number;
  /** Peak gain, 0–1. Kept low: this plays after every correct answer. */
  gain?: number;
  voice?: Voice;
}

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null; // Audio unavailable (locked-down browser, no output device) — stay silent.
    }
  }
  // Browsers start the context suspended until a user gesture. Every sound here follows a
  // click, so resuming on demand is enough and needs no unlock-on-first-tap dance.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function play(notes: Note[]): void {
  if (!useAppStore.getState().settings.sound) return;
  const ac = audioContext();
  if (!ac) return;

  const start = ac.currentTime + 0.01;
  for (const note of notes) {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.type = note.voice ?? 'sine';
    osc.frequency.value = note.freq;

    const from = start + note.at;
    const to = from + note.len;
    const peak = note.gain ?? 0.1;
    // A fast attack into an exponential decay — the shape of a struck bell. Ramping from a
    // near-zero value rather than 0 is required: exponentialRamp cannot start at silence.
    env.gain.setValueAtTime(0.0001, from);
    env.gain.exponentialRampToValueAtTime(peak, from + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, to);

    osc.connect(env).connect(ac.destination);
    osc.start(from);
    osc.stop(to + 0.02);
  }
}

// Equal-temperament frequencies, named so the phrases below read as music.
// The quiz speaks in A major and the city answers in D major, so a sound tells you which
// half of the app it came from before you have read anything on screen.
const D3 = 146.83;
const A3 = 220;
const D4 = 293.66;
const FS4 = 369.99;
const A4 = 440;
const CS5 = 554.37;
const D5 = 587.33;
const E5 = 659.25;
const FS5 = 739.99;
const A5 = 880;
const CS6 = 1108.73;
const E6 = 1318.51;

/** A bright rising fifth after a correct answer — short enough to sit under a fast run. */
export function playCorrect(): void {
  play([
    { freq: A5, at: 0, len: 0.14, gain: 0.09 },
    { freq: E6, at: 0.07, len: 0.2, gain: 0.08 },
    { freq: E5, at: 0, len: 0.12, gain: 0.03, voice: 'triangle' },
  ]);
}

/**
 * The lesson is passed: an A major arpeggio that lands on a held top note. `perfect` adds one
 * more note above it, so a flawless run sounds different from a good one — the audible twin of
 * the aurora sweep the result screen already shows.
 */
export function playFanfare(perfect = false): void {
  const notes: Note[] = [
    { freq: A4, at: 0, len: 0.26, gain: 0.09, voice: 'triangle' },
    { freq: CS5, at: 0.11, len: 0.26, gain: 0.09, voice: 'triangle' },
    { freq: E5, at: 0.22, len: 0.3, gain: 0.09, voice: 'triangle' },
    { freq: A5, at: 0.34, len: 0.75, gain: 0.11, voice: 'triangle' },
    { freq: A4 / 2, at: 0.34, len: 0.8, gain: 0.05 },
  ];
  if (perfect) notes.push({ freq: CS6, at: 0.56, len: 0.7, gain: 0.08, voice: 'triangle' });
  play(notes);
}

/**
 * A new building goes up: a low strike, then a D major chord blooming upward under it. Slower
 * and heavier than anything in the quiz — this is the one moment in the app where something
 * becomes permanent, and it should land like a mallet, not a ping.
 */
export function playBuild(): void {
  play([
    { freq: D3, at: 0, len: 0.2, gain: 0.1, voice: 'triangle' },
    { freq: A3, at: 0.06, len: 0.45, gain: 0.07 },
    { freq: D4, at: 0.12, len: 0.5, gain: 0.07 },
    { freq: FS4, at: 0.18, len: 0.55, gain: 0.06 },
  ]);
}

/**
 * An existing building gains a level: the same D major, three quick steps up. Short and light
 * — upgrades are bought in runs, so this has to stay pleasant the fifth time in a row.
 */
export function playUpgrade(): void {
  play([
    { freq: D5, at: 0, len: 0.12, gain: 0.07, voice: 'triangle' },
    { freq: FS5, at: 0.06, len: 0.12, gain: 0.07, voice: 'triangle' },
    { freq: A5, at: 0.12, len: 0.26, gain: 0.08, voice: 'triangle' },
  ]);
}

/**
 * The lesson ended without a pass. An open fifth, warm and unresolved — it marks the moment
 * without pronouncing a verdict. Never a falling phrase: that is what a buzzer sounds like.
 */
export function playSessionEnd(): void {
  play([
    { freq: D5, at: 0, len: 0.5, gain: 0.06 },
    { freq: A5, at: 0.02, len: 0.5, gain: 0.05 },
  ]);
}
