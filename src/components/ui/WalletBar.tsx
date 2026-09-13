import { Link } from 'react-router-dom';
import { CalendarCheck, Flame, Snowflake, Star } from 'lucide-react';
import { useT } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useStreak, useWallet } from '@/store/wallet';
import { usePerks } from '@/store/city';
import { formatNumber } from '@/lib/format';
import { todayStr } from '@/store/persist';

/**
 * The learner's current resources, shown identically on the home screen and the city map so
 * "what do I have" never depends on which page you happen to be on.
 */
export default function WalletBar({ heading = false }: { heading?: boolean }) {
  const t = useT();
  const wallet = useWallet();
  const streak = useStreak();
  const perks = usePerks();
  const claimedOn = useAppStore((s) => s.dailyIncomeClaimedOn);

  const dailyIncome = Math.round(perks.dailyIncome);
  const collectedToday = dailyIncome > 0 && claimedOn === todayStr();

  return (
    <section className="card !bg-falu/5 dark:!bg-falu/10">
      {heading && (
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-granite dark:text-birch/50">
          {t('wallet.title')}
        </h2>
      )}
      <dl className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-1.5">
          <Star size={15} className="text-gold" aria-hidden="true" />
          <dd className="text-sm font-semibold">{formatNumber(wallet.xp)}</dd>
          <dt className="text-sm text-granite dark:text-birch/60">{t('wallet.xp')}</dt>
        </div>

        <div className="flex items-center gap-1.5">
          <span aria-hidden="true">🪙</span>
          <dd className="text-sm font-semibold">{formatNumber(wallet.coins)}</dd>
          <dt className="text-sm text-granite dark:text-birch/60">{t('wallet.coins')}</dt>
        </div>

        {streak.current > 0 && (
          <Link to="/stats" className="flex items-center gap-1.5 hover:underline">
            <Flame size={15} className="text-falu dark:text-gold" aria-hidden="true" />
            <dd className="text-sm font-semibold">{streak.current}</dd>
            <dt className="text-sm text-granite dark:text-birch/60">{t('wallet.streak')}</dt>
          </Link>
        )}

        {streak.freezesAvailable > 0 && (
          <div className="flex items-center gap-1.5">
            <Snowflake size={15} className="text-blue-flag dark:text-aurora" aria-hidden="true" />
            <dd className="text-sm font-semibold">{streak.freezesAvailable}</dd>
            <dt className="text-sm text-granite dark:text-birch/60">{t('wallet.freezes')}</dt>
          </div>
        )}
      </dl>

      {dailyIncome > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-granite dark:text-birch/60">
          <CalendarCheck size={13} className="text-pine dark:text-aurora" aria-hidden="true" />
          {collectedToday
            ? t('wallet.dailyIncome.collected', { coins: dailyIncome })
            : t('wallet.dailyIncome.pending', { coins: dailyIncome })}
        </p>
      )}
    </section>
  );
}
