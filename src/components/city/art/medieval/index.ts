import type { EraArt, EraFigures } from '../../scene/types';
import { storkyrkan } from './storkyrkan';
import { stortorgetMarket } from './stortorget-market';
import { cityWall } from './city-wall';
import { riddarholmen } from './riddarholmen';
import { citizenMedieval, workerMedieval } from '../shared/figures';

/** Era 3's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  storkyrkan,
  'stortorget-market': stortorgetMarket,
  'city-wall': cityWall,
  riddarholmen,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). No
 * harbour-class building exists yet this era, so it sails no boat. */
export const figures: EraFigures = {
  citizen: citizenMedieval,
  worker: workerMedieval,
};

export default art;
