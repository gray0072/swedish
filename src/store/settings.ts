import { useAppStore } from './appStore';

export function useLanguage() {
  return useAppStore((s) => s.language);
}

export function useSettings() {
  return useAppStore((s) => s.settings);
}
