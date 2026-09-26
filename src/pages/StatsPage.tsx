import { useT, type I18nKey } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useAllLessonProgress, useWordsLearned } from '@/store/progress';
import { useStreak } from '@/store/wallet';
import { useAchievementStatuses, type AchievementStatus } from '@/store/achievements';
import { resolveLocalized, type AchievementCategory } from '@/content/schema';
import { describeAchievement, formatCount } from '@/achievements/describe';
import AchievementMedal, { romanTier, TIER_BG } from '@/components/ui/AchievementMedal';

const CATEGORIES: { id: AchievementCategory; icon: string }[] = [
  { id: 'words', icon: '📚' },
  { id: 'lessons', icon: '📖' },
  { id: 'habits', icon: '🔥' },
  { id: 'city', icon: '🏙️' },
  { id: 'secret', icon: '🤫' },
];

function AchievementCard({ status }: { status: AchievementStatus }) {
  const t = useT();
  const lang = useLanguage();
  const { achievement, tier, value, next, prev } = status;
  const total = achievement.tiers.length;
  const complete = tier >= total;
  const hidden = achievement.secret && tier === 0;
  const fraction = next ? Math.max(0, Math.min(1, (value - prev) / (next - prev))) : 1;
  const name = hidden ? '???' : resolveLocalized(achievement.name, lang);

  return (
    <div
      className={
        'card flex items-start gap-3 !p-3 text-left ' +
        (complete ? 'ring-1 ring-gold/40' : '')
      }
    >
      <AchievementMedal status={status} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={'truncate text-sm font-semibold ' + (tier === 0 ? 'text-granite dark:text-birch/60' : '')}>
            {name}
          </p>
          {total > 1 && !hidden && (
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-granite dark:text-birch/50">
              {tier > 0 ? romanTier(tier) : '–'} / {romanTier(total)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-granite dark:text-birch/60">
          {hidden ? t('achievements.secretHint') : describeAchievement(achievement, tier, lang)}
        </p>

        {!hidden && !complete && next !== null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-granite/15 dark:bg-white/10">
              <div
                className={'h-full rounded-full transition-[width] duration-500 ' + TIER_BG[Math.min(tier, TIER_BG.length - 1)]}
                style={{ width: `${Math.round(fraction * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-granite dark:text-birch/60">
              {formatCount(Math.min(value, next), lang)} / {formatCount(next, lang)}
            </span>
          </div>
        )}

        {complete && (
          <p className="mt-1.5 text-[11px] font-semibold text-pine dark:text-aurora">
            ✓ {t('achievements.complete')}
            {status.unlockedAt &&
              ` · ${new Date(status.unlockedAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}`}
          </p>
        )}

        {total > 1 && !hidden && (
          <div className="mt-1.5 flex gap-1" aria-label={t('achievements.tiersLabel', { tier, total })}>
            {achievement.tiers.map((threshold, i) => (
              <span
                key={threshold}
                title={formatCount(threshold, lang)}
                className={'h-1.5 w-4 rounded-full ' + (i < tier ? TIER_BG[i] : 'bg-granite/15 dark:bg-white/10')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const t = useT();
  const lang = useLanguage();
  const wordsLearned = useWordsLearned();
  const lessons = useAllLessonProgress();
  const streak = useStreak();
  const achievements = useAchievementStatuses();
  const lessonsPassed = Object.values(lessons).filter((l) => l.passed).length;

  const stats = [
    { label: t('stats.wordsLearned'), value: wordsLearned },
    { label: t('stats.lessonsPassed'), value: lessonsPassed },
    { label: t('stats.streak'), value: streak.current },
    { label: t('stats.longestStreak'), value: streak.longest },
  ];

  const medals = achievements.filter((a) => a.tier > 0).length;
  const tiersReached = achievements.reduce((n, a) => n + a.tier, 0);
  const tiersTotal = achievements.reduce((n, a) => n + a.achievement.tiers.length, 0);
  const recent = achievements
    .filter((a) => a.tier > 0 && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('stats.title')}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-bold text-falu dark:text-gold">{s.value}</p>
            <p className="mt-1 text-xs text-granite dark:text-birch/60">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="card space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{t('stats.achievements')}</h2>
            <p className="text-sm text-granite dark:text-birch/60">
              {t('achievements.summary', {
                medals,
                total: achievements.length,
                tiers: tiersReached,
                tiersTotal,
              })}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-granite/15 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-falu via-gold to-aurora transition-[width] duration-500"
              style={{ width: `${tiersTotal ? Math.round((tiersReached / tiersTotal) * 100) : 0}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-granite dark:text-birch/60">
            {TIER_BG.map((bg, i) => (
              <span key={bg} className="flex items-center gap-1">
                <span className={'h-2 w-2 rounded-full ' + bg} aria-hidden="true" />
                {romanTier(i + 1)} · {t(`achievements.tier.${i + 1}` as I18nKey)}
              </span>
            ))}
          </div>
          {recent.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-granite dark:text-birch/60">{t('achievements.recent')}</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((s) => (
                  <span key={s.achievement.id} title={resolveLocalized(s.achievement.name, lang)}>
                    <AchievementMedal status={s} size={40} showRing={false} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {CATEGORIES.map(({ id, icon }) => {
          const inCategory = achievements.filter((a) => a.achievement.category === id);
          if (inCategory.length === 0) return null;
          const done = inCategory.filter((a) => a.tier > 0).length;
          return (
            <div key={id} className="space-y-2">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <span aria-hidden="true">{icon}</span>
                {t(`achievements.category.${id}` as I18nKey)}
                <span className="text-xs font-normal text-granite dark:text-birch/50">
                  {done}/{inCategory.length}
                </span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inCategory.map((status) => (
                  <AchievementCard key={status.achievement.id} status={status} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
