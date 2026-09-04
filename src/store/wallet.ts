import { useAppStore } from './appStore';

export function useWallet() {
  return useAppStore((s) => s.wallet);
}

export function useStreak() {
  return useAppStore((s) => s.streak);
}
