import type { EraArt, EraFigures } from '../../scene/types';
import { royalPalace } from './royal-palace';
import { shipyard } from './shipyard';
import { vasaShip } from './vasa-ship';
import { citizenEmpire, workerEmpire, boatEmpire } from '../shared/figures';

/** Era 4's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  'royal-palace': royalPalace,
  shipyard,
  'vasa-ship': vasaShip,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). The
 * shipyard is this era's harbour-class building, so a tall ship sails once it is built. */
export const figures: EraFigures = {
  citizen: citizenEmpire,
  worker: workerEmpire,
  boat: boatEmpire,
};

export default art;
