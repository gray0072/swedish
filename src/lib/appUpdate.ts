import { useEffect, useSyncExternalStore } from 'react';

/**
 * A new deploy, applied only where a reload costs nothing. The service worker is registered in
 * `prompt` mode (vite.config.ts): a new version installs in the background and *waits*, while
 * the running page keeps the old one's cache — its lazy chunks still load. When the learner is
 * off a quiz, `useApplyUpdateWhenIdle` tells the waiting worker to take over and the page
 * reloads into the new version. A run that never leaves a quiz gets it on the next cold start,
 * when the waiting worker activates by itself.
 */

/** Routes a reload would interrupt: a quiz or review run, or a result not yet looked at. */
const BUSY_ROUTES = [/^\/lesson\/[^/]+\/[^/]+\/(quiz|result)$/, /^\/review$/];

/** How often an app left open in the foreground asks the server for a new version. */
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

let applyUpdate: (() => Promise<void>) | null = null;
const listeners = new Set<() => void>();

/** Called by the service-worker registration once a new version is installed and waiting. */
export function markUpdateReady(apply: () => Promise<void>): void {
  applyUpdate = apply;
  listeners.forEach((notify) => notify());
}

/**
 * The browser looks for a new worker only on navigation; an installed Android app is mostly
 * resumed from the background, which is not one. Ask again on every return to the foreground
 * and once an hour while open.
 */
export function watchForUpdates(registration: ServiceWorkerRegistration): void {
  const check = () => {
    if (document.visibilityState !== 'visible' || !navigator.onLine) return;
    registration.update().catch(() => {
      // offline or the server hiccupped — the next check will try again
    });
  };
  document.addEventListener('visibilitychange', check);
  window.setInterval(check, CHECK_INTERVAL_MS);
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function isBusyRoute(pathname: string): boolean {
  return BUSY_ROUTES.some((route) => route.test(pathname));
}

/** Applies a waiting update as soon as the learner is on a route where a reload is harmless. */
export function useApplyUpdateWhenIdle(pathname: string): void {
  const apply = useSyncExternalStore(subscribe, () => applyUpdate);
  useEffect(() => {
    if (apply && !isBusyRoute(pathname)) void apply();
  }, [apply, pathname]);
}
