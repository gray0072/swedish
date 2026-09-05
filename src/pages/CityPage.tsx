import { useState } from 'react';
import { useT } from '@/i18n';
import { useLanguage } from '@/store/settings';
import { getBuildingsForEra, getEras, getHistoryCardsForEra } from '@/content/registry';
import { resolveLocalized } from '@/content/schema';
import { useWallet } from '@/store/wallet';
import BuildingCard from '@/components/city/BuildingCard';
import HistoryCard from '@/components/city/HistoryCard';
import CityMap from '@/components/city/CityMap';
import EraFrame from '@/components/ui/EraFrame';
import KurbitsDivider from '@/components/ui/KurbitsDivider';

export default function CityPage() {
  const t = useT();
  const lang = useLanguage();
  const wallet = useWallet();
  const eras = getEras();
  const [selectedEraId, setSelectedEraId] = useState(eras[0]?.id);

  const selectedEra = eras.find((e) => e.id === selectedEraId) ?? eras[0];
  const unlocked = wallet.xp >= (selectedEra?.unlockXp ?? 0);
  const buildings = selectedEra ? getBuildingsForEra(selectedEra.id) : [];
  const historyCards = selectedEra ? getHistoryCardsForEra(selectedEra.id) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t('city.title')}</h1>

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
