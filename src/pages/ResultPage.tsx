import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Download, PartyPopper, RotateCcw } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getAllLessons, getLesson } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import type { RewardResult } from '@/quiz/engine';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels } from '@/store/city';
import { getBuildings } from '@/content/registry';
import { buildingCostAt } from '@/city/economy';
import { renderShareCard } from '@/lib/shareCard';
import { playFanfare, playSessionEnd } from '@/lib/sound';
import { useCountUp } from '@/lib/useCountUp';

// Where the coins of a perfect run land, relative to the coin figure (SPEC §11.6, 1.2 s max).
const COIN_THROWS = [
  [-90, -70],
  [-55, -110],
  [-20, -85],
  [15, -120],
  [50, -90],
  [85, -65],
  [-70, -30],
  [70, -35],
];

function CoinBurst() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
      {COIN_THROWS.map(([dx, dy], i) => (
        <span
          key={i}
          className="absolute -ml-2 -mt-2 animate-coin-fly text-base opacity-0"
          style={{ '--dx': `${dx}px`, '--dy': `${dy}px`, animationDelay: `${150 + i * 40}ms` } as React.CSSProperties}
        >
          🪙
        </span>
      ))}
    </span>
  );
}

export default function ResultPage() {
  const { levelId = '', slug = '' } = useParams();
  const lessonId = `${levelId}/${slug}`;
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const buildingLevels = useCityBuildingLevels();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // StrictMode runs mount effects twice in dev; without this the fanfare plays over itself.
  const celebrated = useRef(false);

  const reward = (location.state as { reward?: RewardResult } | null)?.reward;
  const shownXp = useCountUp(reward?.xp ?? 0, { from: 0, duration: 900 });
  const shownCoins = useCountUp(reward?.coins ?? 0, { from: 0, duration: 900 });

  useEffect(() => {
    if (!reward) {
      navigate(`/lesson/${levelId}/${slug}`, { replace: true });
      return;
    }
    // The lesson is over: a fanfare if it was passed, a neutral chime if it wasn't. A run
    // that fell short still gets a sound — silence would read as a bug — but not a verdict.
    if (celebrated.current) return;
    celebrated.current = true;
    if (reward.passed) playFanfare(reward.perfect);
    else playSessionEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!reward) return null;

  const lesson = getLesson(lessonId);

  async function handleShare() {
    if (!reward || !canvasRef.current || !lesson) return;
    renderShareCard(canvasRef.current, {
      lessonTitle: resolveLocalized(lesson.meta.title, lang),
      score: reward.score,
      total: reward.total,
      xp: reward.xp,
      coins: reward.coins,
      dateLabel: new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US'),
      perfectLabel: t('result.perfect'),
    });
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'swedish-result.png', { type: 'image/png' });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
        share?: (data: { files: File[]; title?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: 'Swedish' });
          return;
        } catch {
          // user cancelled the native share sheet — fall through to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'swedish-result.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  const allLessons = getAllLessons();
  const nextLesson = allLessons.find((l) => l.meta.order > (lesson?.meta.order ?? 0));

  const affordable = getBuildings().find((b) => {
    const level = buildingLevels[b.id] ?? 0;
    if (level >= b.maxLevel) return false;
    return buildingCostAt(b, level) <= wallet.coins;
  });

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {reward.perfect && (
        <div className="animate-aurora-sweep text-sm font-semibold text-aurora">
          ✨ {t('result.perfect')}
        </div>
      )}

      <div className="card">
        <PartyPopper
          className={reward.passed ? 'mx-auto animate-bounce-in text-gold' : 'mx-auto text-granite'}
          size={40}
          aria-hidden="true"
        />
        <h1 className="mt-2 text-xl font-semibold">
          {reward.passed ? t('result.passed') : t('result.failed')}
        </h1>
        <p className="mt-1 text-sm text-granite dark:text-birch/70">
          {t('result.score')}: {reward.score}/{reward.total}
        </p>

        <div className="mt-4 flex justify-center gap-6">
          <div>
            <p className="text-2xl font-bold tabular-nums text-gold">+{shownXp}</p>
            <p className="text-xs text-granite dark:text-birch/60">{t('result.xpEarned')}</p>
          </div>
          <div className="relative">
            {reward.perfect && <CoinBurst />}
            <p className="text-2xl font-bold tabular-nums text-falu dark:text-gold">+{shownCoins}</p>
            <p className="text-xs text-granite dark:text-birch/60">{t('result.coinsEarned')}</p>
          </div>
        </div>

        {reward.passed && reward.xp === 0 && (
          <p className="mt-3 text-xs text-granite dark:text-birch/50">{t('result.rewardCapped')}</p>
        )}

        {affordable && (
          <Link
            to="/city"
            className="mt-4 block rounded-lg bg-gold/15 px-3 py-2 text-sm font-semibold text-falu dark:text-gold"
          >
            {t('result.canAfford')} «{resolveLocalized(affordable.name, lang)}» →
          </Link>
        )}

        {reward.perfect && (
          <button onClick={handleShare} className="btn-secondary mt-4 w-full">
            <Download size={16} aria-hidden="true" />
            {t('result.share')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {reward.score < reward.total && (
          <Link
            to={`/lesson/${levelId}/${slug}/quiz`}
            replace
            className="flex items-center justify-center gap-1.5 rounded-xl border border-lingon/40 px-4 py-2 text-sm font-semibold text-lingon hover:bg-lingon/10"
          >
            <RotateCcw size={16} aria-hidden="true" />
            {t('result.retry')}
          </Link>
        )}
        <Link to={`/lesson/${levelId}/${slug}`} className="btn-secondary">
          {t('result.backToLesson')}
        </Link>
        {nextLesson && (
          <Link to={`/lesson/${nextLesson.meta.levels[0]}/${nextLesson.meta.slug}`} className="btn-primary">
            {t('result.nextLesson')}
          </Link>
        )}
        <Link to="/city" className="btn-secondary">
          {t('result.toCity')}
        </Link>
      </div>
    </div>
  );
}
