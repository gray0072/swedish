import type { Building, Era } from '@/content/schema';
import { resolveLocalized } from '@/content/schema';
import { useLanguage } from '@/store/settings';
import { useCityBuildingLevels } from '@/store/city';
import CityBackdrop from './CityBackdrop';
import { BuildingIcon, iconFor } from './icons';

function scrollToBuilding(id: string) {
  document.getElementById(`building-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export default function CityMap({ era, buildings }: { era: Era; buildings: Building[] }) {
  const lang = useLanguage();
  const levels = useCityBuildingLevels();

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-granite/15 dark:border-white/10">
      <CityBackdrop era={era} />
      {buildings.map((b) => {
        const level = levels[b.id] ?? 0;
        const owned = level > 0;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => scrollToBuilding(b.id)}
            style={{ left: `${b.position.x}%`, top: `${b.position.y}%` }}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            aria-label={resolveLocalized(b.name, lang)}
            title={resolveLocalized(b.name, lang)}
          >
            <span
              className={
                'flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition-transform group-hover:scale-110 ' +
                (owned
                  ? 'border-falu bg-falu text-birch dark:border-gold dark:bg-gold dark:text-midnight'
                  : 'border-granite/30 bg-white/80 text-granite dark:border-white/20 dark:bg-midnight-surface/80 dark:text-birch/60')
              }
            >
              <BuildingIcon icon={iconFor(b.id)} className="h-5 w-5" />
            </span>
            <span className="max-w-16 truncate rounded bg-birch/90 px-1 text-[10px] font-medium text-midnight opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-midnight/90 dark:text-birch">
              {resolveLocalized(b.name, lang)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
