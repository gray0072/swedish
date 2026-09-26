import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useT } from '@/i18n';

/**
 * The app's own confirm/alert, replacing the browser's `window.confirm`/`window.alert`: a card
 * over a dimmed page, in the app's palette and fonts, in both themes. Callers get a promise —
 * `if (await confirmDialog({...})) doIt()` — and one `DialogHost` mounted in the shell renders
 * whichever request is open. Escape and a click on the backdrop answer "cancel".
 */

export type DialogTone = 'default' | 'danger' | 'success' | 'error';

export interface DialogOptions {
  title: string;
  message?: string;
  /** Defaults to "OK" (alert) or "Confirm" (confirm). */
  confirmLabel?: string;
  /** Defaults to "Cancel". Ignored by alerts. */
  cancelLabel?: string;
  tone?: DialogTone;
}

interface DialogRequest extends DialogOptions {
  kind: 'confirm' | 'alert';
  resolve: (answer: boolean) => void;
}

let current: DialogRequest | null = null;
const queue: DialogRequest[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function open(kind: DialogRequest['kind'], options: DialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const request = { ...options, kind, resolve };
    if (current) queue.push(request);
    else current = request;
    emit();
  });
}

function answer(value: boolean) {
  if (!current) return;
  const { resolve } = current;
  current = queue.shift() ?? null;
  emit();
  resolve(value);
}

/** Asks a yes/no question; resolves `true` only when the learner confirms. */
export function confirmDialog(options: DialogOptions): Promise<boolean> {
  return open('confirm', options);
}

/** Tells the learner something; resolves once they dismiss it. */
export function alertDialog(options: DialogOptions): Promise<void> {
  return open('alert', options).then(() => undefined);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const TONE_ICON = {
  default: { Icon: Info, className: 'bg-blue-flag/10 text-blue-flag dark:bg-aurora/15 dark:text-aurora' },
  danger: { Icon: AlertTriangle, className: 'bg-lingon/10 text-lingon dark:bg-lingon/20 dark:text-lingon' },
  success: { Icon: CheckCircle2, className: 'bg-pine/10 text-pine dark:bg-aurora/15 dark:text-aurora' },
  error: { Icon: XCircle, className: 'bg-lingon/10 text-lingon dark:bg-lingon/20 dark:text-lingon' },
} as const;

export function DialogHost() {
  const request = useSyncExternalStore(subscribe, () => current);
  const t = useT();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!request) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // A destructive question starts on "Cancel", so a stray Enter never wipes anything.
    (request.tone === 'danger' ? cancelRef : confirmRef).current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        answer(false);
      } else if (e.key === 'Tab') {
        // Keep focus on the dialog's buttons while it is open.
        const buttons = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        const at = buttons.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        buttons[(at + (e.shiftKey ? buttons.length - 1 : 1)) % buttons.length]?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [request]);

  if (!request) return null;

  const tone = request.tone ?? 'default';
  const { Icon, className: iconClass } = TONE_ICON[tone];
  const isConfirm = request.kind === 'confirm';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-midnight/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={() => answer(false)}
      />
      <div
        role={isConfirm ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby={request.message ? 'app-dialog-message' : undefined}
        className="relative w-full max-w-sm animate-pop-in overflow-hidden rounded-2xl border border-granite/15 bg-birch shadow-2xl dark:border-white/10 dark:bg-midnight-surface"
      >
        <div className="swedish-flag-rule" aria-hidden="true" />
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-6 text-center">
          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}>
            <Icon size={24} aria-hidden="true" />
          </span>
          <h2 id="app-dialog-title" className="text-xl font-semibold leading-snug">
            {request.title}
          </h2>
          {request.message && (
            <p id="app-dialog-message" className="text-sm text-granite dark:text-birch/70">
              {request.message}
            </p>
          )}
        </div>
        <div className="flex gap-2 border-t border-granite/10 bg-granite/5 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          {isConfirm && (
            <button ref={cancelRef} type="button" className="btn-secondary flex-1" onClick={() => answer(false)}>
              {request.cancelLabel ?? t('dialog.cancel')}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            className={
              'flex-1 ' +
              (tone === 'danger' ? 'btn bg-lingon text-white hover:bg-lingon/90' : 'btn-primary')
            }
            onClick={() => answer(true)}
          >
            {request.confirmLabel ?? (isConfirm ? t('dialog.confirm') : t('dialog.ok'))}
          </button>
        </div>
      </div>
    </div>
  );
}
