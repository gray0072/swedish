import { useT } from '@/i18n';
import { useAllLessonProgress, useWordsLearned } from '@/store/progress';
import { useStreak } from '@/store/wallet';

export default function StatsPage() {
  const t = useT();
  const wordsLearned = useWordsLearned();
  const lessons = useAllLessonProgress();
  const streak = useStreak();
  const lessonsPassed = Object.values(lessons).filter((l) => l.passed).length;

  const stats = [
    { label: t('stats.wordsLearned'), value: wordsLearned },
    { label: t('stats.lessonsPassed'), value: lessonsPassed },
    { label: t('stats.streak'), value: streak.current },
    { label: t('stats.longestStreak'), value: streak.longest },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('stats.title')}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-bold text-falu dark:text-gold">{s.value}</p>
            <p className="mt-1 text-xs text-granite dark:text-birch/60">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
