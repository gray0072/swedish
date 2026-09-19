import type { Building, Era } from '@/content/schema';
import { useLanguage, useSettings } from '@/store/settings';
import { useCityBuildingLevels } from '@/store/city';
import { useWallet } from '@/store/wallet';
import Scene from './scene/Scene';

/**
 * The city map's public shell (CITY_VISUALS_TECH.md §1: props unchanged, so `CityPage` never
 * has to know the map was rewritten). This is the one place in the city map that talks to the
 * store — `Scene` itself takes plain data only (plus the raw `cityMotion` setting, which it
 * combines with the OS reduced-motion signal internally), so it stays trivially testable and
 * never re-renders on state the map doesn't actually draw from.
 */
export default function CityMap({ era, buildings }: { era: Era; buildings: Building[] }) {
  const lang = useLanguage();
  const levels = useCityBuildingLevels();
  const wallet = useWallet();
  const settings = useSettings();

  return (
    <Scene
      era={era}
      buildings={buildings}
      levels={levels}
      coins={wallet.coins}
      lang={lang}
      cityMotion={settings.cityMotion ?? 'full'}
    />
  );
}
