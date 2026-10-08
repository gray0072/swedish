import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getBuilding, getBuildings, getBuildingsForEra, getEras, getHistoryCardsForEra } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels } from '@/store/city';
import { isEraComplete, pickInitialEra } from '@/city/progress';
import BuildingCard from '@/components/city/BuildingCard';
import HistoryCard from '@/components/city/HistoryCard';
import CityMap from '@/components/city/CityMap';
import EraFrame from '@/components/ui/EraFrame';
import KurbitsDivider from '@/components/ui/KurbitsDivider';
import WalletBar from '@/components/ui/WalletBar';
import Fireworks from '@/components/ui/Fireworks';
import NextLessonCard from '@/components/lesson/NextLessonCard';

export default function CityPage() {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const eras = getEras();
  const levels = useCityBuildingLevels();
  // `?building=<id>` comes from the result page's "you can now build …" link: open on that
  // building's era and bring its card into view, instead of leaving the learner to find it.
  const [searchParams, setSearchParams] = useSearchParams();
  const [focusBuildingId] = useState(() => searchParams.get('building'));
  // Lazy initial state, not an effect: the tab is chosen once, when the page opens, and
  // never yanked out from under a learner who has since switched era by hand.
  const [selectedEraId, setSelectedEraId] = useState(() => {
    const focusEra = eras.find((e) => e.id === getBuilding(focusBuildingId ?? '')?.era);
    if (focusEra && wallet.xp >= focusEra.unlockXp) return focusEra.id;
    return pickInitialEra(eras, getBuildings(), levels, wallet.xp)?.id ?? eras[0]?.id;
  });
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusBuildingId) return;
    // Drop the parameter so a reload or a later visit opens the page normally.
    setSearchParams({}, { replace: true });
    // One frame for the era's cards to lay out before scrolling to one of them.
    const frame = window.requestAnimationFrame(() => {
      const card = document.getElementById(`building-${focusBuildingId}`);
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(focusBuildingId);
    });
    const timer = window.setTimeout(() => setHighlightedId(null), 2500);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, for the building the page was opened with
  }, []);

  const selectedEra = eras.find((e) => e.id === selectedEraId) ?? eras[0];

  // The era strip scrolls sideways; keep the selected era in view — on arrival (the era the
  // page opened on is often far to the right) and whenever the selection changes. Scrolls the
  // strip itself rather than `scrollIntoView`, which would also move the page vertically.
  const stripRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLButtonElement>(null);
  const firstScroll = useRef(true);
  useEffect(() => {
    const strip = stripRef.current;
    const tab = selectedTabRef.current;
    if (!strip || !tab) return;
    const left = tab.offsetLeft - strip.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: firstScroll.current ? 'auto' : 'smooth' });
    firstScroll.current = false;
  }, [selectedEra?.id]);
  const unlocked = wallet.xp >= (selectedEra?.unlockXp ?? 0);
  const buildings = selectedEra ? getBuildingsForEra(selectedEra.id) : [];
  const historyCards = selectedEra ? getHistoryCardsForEra(selectedEra.id) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('city.title')}</h1>
      <Fireworks />

      <WalletBar />

      <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1">
        {eras.map((era) => {
          const isUnlocked = wallet.xp >= era.unlockXp;
          const complete =
            isUnlocked && getBuildingsForEra(era.id).length > 0 && isEraComplete(era, getBuildings(), levels);
          const isSelected = era.id === selectedEra?.id;
          return (
            <button
              key={era.id}
              ref={isSelected ? selectedTabRef : undefined}
              onClick={() => setSelectedEraId(era.id)}
              title={complete ? t('city.eraComplete') : undefined}
              className={
                'inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ' +
                (isSelected
                  ? 'border-falu bg-falu text-birch'
                  : isUnlocked
                    ? 'border-granite/25 hover:border-falu/40 dark:border-white/15'
                    : 'border-granite/15 text-granite/50 dark:border-white/10 dark:text-birch/30')
              }
            >
              {complete && (
                <span
                  className={
                    'inline-flex h-4 w-4 items-center justify-center rounded-full ' +
                    (isSelected ? 'bg-birch text-falu' : 'bg-pine text-birch dark:bg-aurora dark:text-midnight')
                  }
                >
                  <Check size={11} strokeWidth={3} aria-hidden="true" />
                  <span className="sr-only">{t('city.eraComplete')}</span>
                </span>
              )}
              {resolveLocalized(era.name, lang)}
              {!isUnlocked && ' 🔒'}
            </button>
          );
        })}
      </div>

      {selectedEra && !unlocked && (
        <p className="card !bg-granite/5 text-sm text-granite dark:!bg-white/5 dark:text-birch/60">
          {t('city.locked')}: {selectedEra.unlockXp} XP
        </p>
      )}

      {selectedEra?.id === 'viking' && (
        <p className="card !border-l-4 !border-l-gold text-sm">{t('city.eraIntro.viking')}</p>
      )}

      {/* The six historical eras are real history (SPEC §12.6); the four future ones are
          informed guesses and have to say so wherever they are shown (SPEC §12.8). */}
      {selectedEra?.speculative && (
        <p className="card !border-l-4 !border-l-aurora text-sm">{t('city.eraIntro.future')}</p>
      )}

      {/* A locked era is not a blank page: its buildings are listed read-only, so the XP that
          opens it buys something the learner has already seen and wants. History cards stay
          hidden — those are the reward for actually getting here. */}
      {selectedEra && !unlocked && buildings.length > 0 && (
        <section className="space-y-3">
          <KurbitsDivider />
          <div>
            <h2 className="font-display text-lg font-semibold">{t('city.preview.title')}</h2>
            <p className="mt-1 text-xs text-granite dark:text-birch/50">{t('city.preview.hint')}</p>
          </div>
          <div className="grid gap-3 opacity-80 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => (
              <BuildingCard key={b.id} building={b} preview />
            ))}
          </div>
        </section>
      )}

      {unlocked && selectedEra && (
        <>
          <EraFrame>{resolveLocalized(selectedEra.name, lang)}</EraFrame>
          <div id="city-map" className="scroll-mt-20">
            <CityMap era={selectedEra} buildings={buildings} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => (
              <div
                key={b.id}
                id={`building-${b.id}`}
                className={
                  'scroll-mt-20 rounded-2xl transition-shadow duration-500 ' +
                  (highlightedId === b.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-birch dark:ring-offset-midnight' : '')
                }
              >
                <BuildingCard building={b} />
              </div>
            ))}
          </div>

          {historyCards.length > 0 && (
            <section className="space-y-3">
              <KurbitsDivider />
              <h2 className="font-display text-lg font-semibold">
                📜 {resolveLocalized(selectedEra.name, lang)}
              </h2>
              {historyCards.map((card) => (
                <HistoryCard key={card.id} card={card} />
              ))}
            </section>
          )}
        </>
      )}

      {/* Coins come from lessons: the foot of the city points straight back to the next one. */}
      <NextLessonCard />
    </div>
  );
}
