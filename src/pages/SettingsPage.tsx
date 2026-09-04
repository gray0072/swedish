import { useRef, useState } from 'react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useSettings, useLanguage } from '@/store/settings';
import { exportSaveToFile } from '@/store/persist';

export default function SettingsPage() {
  const t = useT();
  const lang = useLanguage();
  const settings = useSettings();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const setSound = useAppStore((s) => s.setSound);
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
        <label className="text-sm font-semibold">{t('settings.language')}</label>
        <div className="flex gap-2">
          {(['ru', 'en'] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={lang === code ? 'btn-primary' : 'btn-secondary'}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
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
