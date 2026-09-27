import {
  BookOpen,
  Bike,
  Compass,
  Footprints,
  GraduationCap,
  Mountain,
  Sailboat,
  Sprout,
  TrainFront,
  type LucideIcon,
} from 'lucide-react';

/**
 * One icon per course, read as a journey: a sprout for the very first steps, walking, cycling,
 * the train, then the compass, the mountain and the open sea of the SVA delkurser, and a cap at
 * the end. Each course has its own colour too, so the list never reads as one flat column.
 */
const COURSE_LOOK: Record<string, { Icon: LucideIcon; className: string }> = {
  'sfi-a': { Icon: Sprout, className: 'bg-pine/10 text-pine dark:bg-aurora/15 dark:text-aurora' },
  'sfi-b': { Icon: Footprints, className: 'bg-gold/15 text-falu dark:bg-gold/15 dark:text-gold' },
  'sfi-c': { Icon: Bike, className: 'bg-blue-flag/10 text-blue-flag dark:bg-blue-flag/30 dark:text-birch' },
  'sfi-d': { Icon: TrainFront, className: 'bg-lingon/10 text-lingon dark:bg-lingon/25 dark:text-birch' },
  'sva-grund-1': { Icon: Compass, className: 'bg-aurora-violet/15 text-aurora-violet dark:bg-aurora-violet/25 dark:text-birch' },
  'sva-grund-2': { Icon: Mountain, className: 'bg-granite/10 text-granite dark:bg-white/10 dark:text-birch' },
  'sva-grund-3': { Icon: Sailboat, className: 'bg-aurora/15 text-pine dark:bg-aurora/15 dark:text-aurora' },
  'sva-grund-4': { Icon: GraduationCap, className: 'bg-falu/10 text-falu dark:bg-yellow-flag/15 dark:text-yellow-flag' },
};

const FALLBACK = { Icon: BookOpen, className: 'bg-granite/10 text-granite dark:bg-white/10 dark:text-birch/80' };

export default function CourseIcon({ levelId, size = 40 }: { levelId: string; size?: number }) {
  const { Icon, className } = COURSE_LOOK[levelId] ?? FALLBACK;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
