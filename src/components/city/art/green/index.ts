import type { EraArt, EraFigures } from '../../scene/types';
import { woodCity } from './wood-city';
import { verticalFarm } from './vertical-farm';
import { electricFerry } from './electric-ferry';
import { climateLab } from './climate-lab';
import { citizenGreen, workerGreen, boatElectric } from '../shared/figures';

/** Era 7's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  'wood-city': woodCity,
  'vertical-farm': verticalFarm,
  'electric-ferry': electricFerry,
  'climate-lab': climateLab,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). The
 * electric ferry is this era's harbour-class building, so it sails once built. */
export const figures: EraFigures = {
  citizen: citizenGreen,
  worker: workerGreen,
  boat: boatElectric,
};

export default art;
