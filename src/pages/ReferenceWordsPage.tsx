import { Table2 } from 'lucide-react';
import { useT } from '@/i18n';

/**
 * The word bank is a generated view over every vocab.json in the app (REFERENCE.md §5) — not
 * authored content, so it has nothing to show until the noun/verb/adjective form backfill from
 * REFERENCE.md §5.3 lands. The tab exists now so the route and the chrome never have to move.
 */
export default function ReferenceWordsPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-md space-y-3 py-10 text-center">
      <Table2 className="mx-auto text-granite/50 dark:text-birch/30" size={36} aria-hidden="true" />
      <p className="text-sm text-granite dark:text-birch/60">{t('reference.words.comingSoon')}</p>
    </div>
  );
}
