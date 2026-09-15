import { MessagesSquare } from 'lucide-react';
import { useT } from '@/i18n';

/**
 * The 30 everyday scenes planned in DIALOGUES.md are not written yet. The tab exists now so
 * the route and the chrome never have to move once they are.
 */
export default function ReferenceDialoguesPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-md space-y-3 py-10 text-center">
      <MessagesSquare
        className="mx-auto text-granite/50 dark:text-birch/30"
        size={36}
        aria-hidden="true"
      />
      <p className="text-sm text-granite dark:text-birch/60">{t('reference.dialogues.comingSoon')}</p>
    </div>
  );
}
