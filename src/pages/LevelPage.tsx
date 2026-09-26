import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getLevel, getLessonsForLevel, groupLessonsForList } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useAllLessonProgress } from '@/store/progress';
import { CheckCircle2, Clock } from 'lucide-react';
import { displayTags } from '@/content/tags';
import { KindBadge, TagChips } from '@/components/lesson/LessonBadges';
import NotFoundPage from './NotFoundPage';

export default function LevelPage() {
  const { trackId = '', levelId = '' } = useParams();
  const t = useT();
  const lang = useLanguage();
  const level = getLevel(trackId, levelId);
  const lessons = getLessonsForLevel(levelId);
  const groups = groupLessonsForList(lessons);
  const progress = useAllLessonProgress();
  const firstOpenRef = useRef<HTMLLIElement>(null);
  const firstOpenIndex = groups.findIndex((g) => !g.lessons.every((l) => progress[l.meta.id]?.passed));

  // Opening a course lands on the first topic not yet passed. Runs once per course, not on
  // every progress change, so it never yanks the list while the learner is scrolling it.
  useEffect(() => {
    if (firstOpenIndex > 0) firstOpenRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  if (!level) return <NotFoundPage />;

  return (
    <div className="space-y-4">
      <Link to="/tracks" className="text-sm text-granite hover:underline dark:text-birch/60">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-semibold">{resolveLocalized(level.title, lang)}</h1>

      <ul className="space-y-2">
        {groups.map((group, index) => {
          const first = group.lessons[0];
          const allPassed = group.lessons.every((l) => progress[l.meta.id]?.passed);
          const target = `/lesson/${levelId}/${first.meta.slug}`;
          return (
            <li
              key={group.key}
              ref={index === firstOpenIndex ? firstOpenRef : undefined}
              className="animate-rise-in"
              style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
            >
              <Link to={target} className="card card-hover flex items-center justify-between gap-3 hover:border-falu/40">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {resolveLocalized(first.meta.title, lang)}
                    {group.series && (
                      <span className="ml-2 text-xs font-normal text-granite dark:text-birch/50">
                        · {group.lessons.length} {t('level.part')}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <KindBadge kind={first.meta.kind} />
                    <span className="inline-flex items-center gap-1 text-xs text-granite dark:text-birch/60">
                      <Clock size={12} aria-hidden="true" />
                      {first.meta.estimatedMinutes} {t('level.minutes')}
                    </span>
                    <TagChips tags={displayTags(first.meta, 3)} />
                  </div>
                </div>
                {allPassed && <CheckCircle2 className="shrink-0 text-pine dark:text-aurora" size={20} aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
