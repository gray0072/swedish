import { useState } from 'react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getBuildings, getBuildingsForEra, getEras, getHistoryCardsForEra } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useWallet } from '@/store/wallet';
import { useCityBuildingLevels } from '@/store/city';
import { pickInitialEra } from '@/city/progress';
import BuildingCard from '@/components/city/BuildingCard';
import HistoryCard from '@/components/city/HistoryCard';
import CityMap from '@/components/city/CityMap';
import EraFrame from '@/components/ui/EraFrame';
import KurbitsDivider from '@/components/ui/KurbitsDivider';
import WalletBar from '@/components/ui/WalletBar';
import PerkPanel from '@/components/city/PerkDisplay';

export default function CityPage() {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const eras = getEras();
  const levels = useCityBuildingLevels();
  // Lazy initial state, not an effect: the tab is chosen once, when the page opens, and
  // never yanked out from under a learner who has since switched era by hand.
  const [selectedEraId, setSelectedEraId] = useState(
    () => pickInitialEra(eras, getBuildings(), levels, wallet.xp)?.id ?? eras[0]?.id,
  );

  const selectedEra = eras.find((e) => e.id === selectedEraId) ?? eras[0];
  const unlocked = wallet.xp >= (selectedEra?.unlockXp ?? 0);
  const buildings = selectedEra ? getBuildingsForEra(selectedEra.id) : [];
  const historyCards = selectedEra ? getHistoryCardsForEra(selectedEra.id) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('city.title')}</h1>

      <WalletBar />
      <PerkPanel compact />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {eras.map((era) => {
          const isUnlocked = wallet.xp >= era.unlockXp;
          return (
            <button
              key={era.id}
              onClick={() => setSelectedEraId(era.id)}
              className={
                'shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ' +
                (era.id === selectedEra?.id
                  ? 'border-falu bg-falu text-birch'
                  : isUnlocked
                    ? 'border-granite/25 hover:border-falu/40 dark:border-white/15'
                    : 'border-granite/15 text-granite/50 dark:border-white/10 dark:text-birch/30')
              }
            >
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
          <CityMap era={selectedEra} buildings={buildings} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((b) => (
              <div key={b.id} id={`building-${b.id}`} className="scroll-mt-20">
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
    </div>
  );
}
