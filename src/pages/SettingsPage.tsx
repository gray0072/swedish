import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useSettings, useLanguage } from '@/store/settings';
import { LANGUAGE_OPTIONS, type StudyLanguage } from '@/content/schema';
import { exportSaveToFile } from '@/store/persist';
import { listSwedishVoices, previewVoice } from '@/lib/tts';

/** Re-reads the installed sv-SE voice list, refreshing once the browser loads it async. */
function useSwedishVoiceList(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => listSwedishVoices());
  useEffect(() => {
    const refresh = () => setVoices(listSwedishVoices());
    refresh();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', refresh);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh);
    }
  }, []);
  return voices;
}

export default function SettingsPage() {
  const t = useT();
  const lang = useLanguage();
  const settings = useSettings();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const setSound = useAppStore((s) => s.setSound);
  const setTtsVoice = useAppStore((s) => s.setTtsVoice);
  const voices = useSwedishVoiceList();
  const resetSave = useAppStore((s) => s.resetSave);
  const importSave = useAppStore((s) => s.importSave);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const fullState = useAppStore((s) => s);

  function handleExport() {
    exportSaveToFile(fullState);
  }

  function handleImportClick() {
    fileInput.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const ok = importSave(json);
        setImportMessage(ok ? t('settings.importSuccess') : t('settings.importError'));
      } catch {
        setImportMessage(t('settings.importError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (window.confirm(t('settings.reset.confirm'))) resetSave();
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>

      <section className="card space-y-2">
        <label className="text-sm font-semibold" htmlFor="language-select">
          {t('settings.language')}
        </label>
        <select
          id="language-select"
          value={lang}
          onChange={(e) => setLanguage(e.target.value as StudyLanguage)}
          className="w-full rounded-xl border border-granite/25 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-falu dark:border-white/20"
        >
          {LANGUAGE_OPTIONS.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </section>

      <section className="card space-y-2">
        <label className="text-sm font-semibold">{t('settings.theme')}</label>
        <div className="flex flex-wrap gap-2">
          {(['system', 'light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => setTheme(theme)}
              className={settings.theme === theme ? 'btn-primary' : 'btn-secondary'}
            >
              {t(`settings.theme.${theme}` as never)}
            </button>
          ))}
        </div>
      </section>

      <section className="card flex items-center justify-between">
        <label className="text-sm font-semibold" htmlFor="sound-toggle">
          {t('settings.sound')}
        </label>
        <input
          id="sound-toggle"
          type="checkbox"
          checked={settings.sound}
          onChange={(e) => setSound(e.target.checked)}
          className="h-5 w-5 accent-falu"
        />
      </section>

      <section className="card space-y-2">
        <label className="text-sm font-semibold" htmlFor="voice-select">
          {t('settings.voice')}
        </label>
        {voices.length === 0 ? (
          <p className="text-xs text-granite dark:text-birch/60">{t('settings.voice.none')}</p>
        ) : (
          <div className="flex gap-2">
            <select
              id="voice-select"
              value={settings.ttsVoice ?? ''}
              onChange={(e) => setTtsVoice(e.target.value || null)}
              className="w-full rounded-xl border border-granite/25 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-falu dark:border-white/20"
            >
              <option value="">{t('settings.voice.auto')}</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} {v.localService ? '' : '☁︎'}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => previewVoice(settings.ttsVoice || voices[0].voiceURI, settings.ttsRate)}
              aria-label={t('settings.voice.preview')}
              title={t('settings.voice.preview')}
            >
              <Volume2 size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <section className="card space-y-3">
        <button className="btn-secondary w-full" onClick={handleExport}>
          {t('settings.export')}
        </button>
        <button className="btn-secondary w-full" onClick={handleImportClick}>
          {t('settings.import')}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        {importMessage && <p className="text-xs text-granite dark:text-birch/60">{importMessage}</p>}
      </section>

      <section className="card">
        <button className="w-full text-sm font-semibold text-lingon" onClick={handleReset}>
          {t('settings.reset')}
        </button>
      </section>
    </div>
  );
}
