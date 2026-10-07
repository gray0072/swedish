import { useEffect, useState } from 'react';
import type { Building, Era } from '@/content/schema';
import { useT } from '@/i18n';
import { useLanguage, useSettings } from '@/store/settings';
import { useCityBuildingLevels } from '@/store/city';
import { useWallet } from '@/store/wallet';
import Scene from './scene/Scene';
import MapBuildingPanel from './MapBuildingPanel';

/**
 * The city map's public shell (CITY_VISUALS_TECH.md §1: props unchanged, so `CityPage` never
 * has to know the map was rewritten). This is the one place in the city map that talks to the
 * store — `Scene` itself takes plain data only (plus the raw `cityMotion` setting, which it
 * combines with the OS reduced-motion signal internally), so it stays trivially testable and
 * never re-renders on state the map doesn't actually draw from.
 *
 * It also owns the map's selection: tapping a building or a plot opens its panel under the
 * map and previews its next level in place, so the map is where a building is both seen and
 * built (CITY_VISUALS_BUILDINGS.md §7).
 */
export default function CityMap({ era, buildings }: { era: Era; buildings: Building[] }) {
  const t = useT();
  const lang = useLanguage();
  const levels = useCityBuildingLevels();
  const wallet = useWallet();
  const settings = useSettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState(true);

  // A selection belongs to the era it was made in.
  useEffect(() => setSelectedId(null), [era.id]);

  // Buying a level hides the preview, so the new level is what rises — not a ghost of the
  // one after it. Picking a building again turns the preview back on.
  const selected = buildings.find((b) => b.id === selectedId);
  const selectedLevel = selected ? levels[selected.id] ?? 0 : 0;
  const [levelAtSelect, setLevelAtSelect] = useState(0);
  const showPreview = preview && selectedLevel === levelAtSelect;

  function select(id: string | null) {
    setSelectedId(id);
    setPreview(true);
    setLevelAtSelect(id ? levels[id] ?? 0 : 0);
  }

  useEffect(() => {
    if (!selectedId) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const totalLevels = buildings.reduce((sum, b) => sum + b.maxLevel, 0);
  const builtLevels = buildings.reduce((sum, b) => sum + Math.min(levels[b.id] ?? 0, b.maxLevel), 0);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Scene
          era={era}
          buildings={buildings}
          levels={levels}
          coins={wallet.coins}
          lang={lang}
          cityMotion={settings.cityMotion ?? 'full'}
          selectedId={selectedId}
          preview={showPreview}
          onSelect={select}
        />
        {totalLevels > 0 && (
          <div
            className="pointer-events-none absolute left-2 top-2 rounded-full bg-birch/85 px-2.5 py-1 text-[11px] font-semibold text-granite shadow-sm backdrop-blur-sm dark:bg-midnight/75 dark:text-birch/80 sm:left-3 sm:top-3 sm:text-xs"
            aria-label={`${t('city.map.progress')}: ${builtLevels}/${totalLevels}`}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">🏗</span>
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-granite/20 dark:bg-white/15 sm:w-20">
                <span
                  className="block h-full rounded-full bg-pine transition-[width] duration-700 dark:bg-aurora"
                  style={{ width: `${(builtLevels / totalLevels) * 100}%` }}
                />
              </span>
              <span className="tabular-nums">
                {builtLevels}/{totalLevels}
              </span>
            </span>
          </div>
        )}
      </div>

      {selected ? (
        <MapBuildingPanel
          key={selected.id}
          building={selected}
          preview={showPreview}
          onTogglePreview={() => {
            setPreview(!showPreview);
            setLevelAtSelect(selectedLevel);
          }}
          onSelect={select}
        />
      ) : (
        <p className="text-center text-xs text-granite dark:text-birch/50">{t('city.map.hint')}</p>
      )}
    </div>
  );
}
