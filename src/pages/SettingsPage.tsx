import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Cloud, CloudAlert, Loader2, LogOut, Volume2 } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useSettings } from '@/store/settings';
import { exportSaveToFile } from '@/store/persist';
import { useCloudSyncStatus } from '@/store/cloudSyncStatus';
import { listSwedishVoices, previewVoice } from '@/lib/tts';
import { alertDialog, confirmDialog } from '@/components/ui/Dialog';
import { LanguageCards } from '@/components/ui/LanguagePicker';

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

function CloudStatusPill({ status }: { status: string }) {
  const t = useT();
  const look =
    status === 'syncing'
      ? { Icon: Loader2, spin: true, key: 'settings.cloud.status.syncing', tone: 'bg-blue-flag/10 text-blue-flag dark:bg-aurora/15 dark:text-aurora' }
      : status === 'synced'
        ? { Icon: CheckCircle2, spin: false, key: 'settings.cloud.status.synced', tone: 'bg-pine/10 text-pine dark:bg-aurora/15 dark:text-aurora' }
        : status === 'error'
          ? { Icon: CloudAlert, spin: false, key: 'settings.cloud.status.error', tone: 'bg-lingon/10 text-lingon' }
          : { Icon: Cloud, spin: false, key: null, tone: '' };
  if (!look.key) return null;
  const { Icon } = look;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${look.tone}`}>
      <Icon size={13} aria-hidden="true" className={look.spin ? 'animate-spin' : undefined} />
      {t(look.key as never)}
    </span>
  );
}

export default function SettingsPage() {
  const t = useT();
  const settings = useSettings();
  const setTheme = useAppStore((s) => s.setTheme);
  const setSound = useAppStore((s) => s.setSound);
  const setCityMotion = useAppStore((s) => s.setCityMotion);
  const setTtsVoice = useAppStore((s) => s.setTtsVoice);
  const voices = useSwedishVoiceList();
  const resetSave = useAppStore((s) => s.resetSave);
  const importSave = useAppStore((s) => s.importSave);
  const fileInput = useRef<HTMLInputElement>(null);

  const fullState = useAppStore((s) => s);
  const cloudSync = useCloudSyncStatus();

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
        if (importSave(json)) {
          void alertDialog({ title: t('settings.importSuccess'), tone: 'success' });
          return;
        }
      } catch {
        // falls through to the error below
      }
      void alertDialog({ title: t('settings.importError.title'), message: t('settings.importError'), tone: 'error' });
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleReset() {
    const reset = await confirmDialog({
      title: t('settings.reset.confirm.title'),
      message: t('settings.reset.confirm'),
      confirmLabel: t('settings.reset.confirm.action'),
      tone: 'danger',
    });
    if (reset) resetSave();
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>

      <section className="card space-y-2">
        <p className="text-sm font-semibold">{t('settings.language')}</p>
        <LanguageCards />
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
        <label className="text-sm font-semibold">{t('settings.cityMotion')}</label>
        <div className="flex flex-wrap gap-2">
          {(['full', 'calm', 'off'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setCityMotion(tier)}
              className={settings.cityMotion === tier ? 'btn-primary' : 'btn-secondary'}
            >
              {t(`settings.cityMotion.${tier}` as never)}
            </button>
          ))}
        </div>
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

      {cloudSync.available && (
        <section className="card space-y-2">
          <label className="text-sm font-semibold">{t('settings.cloud.title')}</label>
          <p className="text-xs text-granite dark:text-birch/60">{t('settings.cloud.description')}</p>
          {cloudSync.user ? (
            // Email and status each get their own line: side by side with the button they
            // were squeezed into one truncated row, and a phone showed "…" instead of "Synced".
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="break-all text-sm font-medium">{cloudSync.user.email}</p>
                <CloudStatusPill status={cloudSync.status} />
              </div>
              <button className="btn-secondary shrink-0" onClick={cloudSync.signOut}>
                <LogOut size={15} aria-hidden="true" />
                {t('settings.cloud.signOut')}
              </button>
            </div>
          ) : (
            <button className="btn-secondary w-full" onClick={cloudSync.signIn}>
              {t('settings.cloud.signIn')}
            </button>
          )}
        </section>
      )}

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
      </section>

      <section className="card">
        <button className="w-full text-sm font-semibold text-lingon" onClick={handleReset}>
          {t('settings.reset')}
        </button>
      </section>
    </div>
  );
}
