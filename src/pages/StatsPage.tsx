import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { useAllLessonProgress, useWordsLearned } from '@/store/progress';
import { useStreak } from '@/store/wallet';
import { useAchievementStatuses } from '@/store/achievements';
import { resolveLocalized } from '@/content/schema';

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

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

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

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('stats.achievements')} ({unlockedCount}/{achievements.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map(({ achievement, unlocked }) => (
            <div
              key={achievement.id}
              className={
                'card flex items-start gap-2 !p-3 text-left transition-opacity ' +
                (unlocked ? '' : 'opacity-40 grayscale')
              }
              title={resolveLocalized(achievement.description, lang)}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {achievement.icon}
              </span>
              <div>
                <p className="text-sm font-semibold">{resolveLocalized(achievement.name, lang)}</p>
                <p className="mt-0.5 text-xs text-granite dark:text-birch/60">
                  {resolveLocalized(achievement.description, lang)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
