import type { EraArt, EraFigures } from '../../scene/types';
import { floatingDistrict } from './floating-district';
import { seaGate } from './sea-gate';
import { kelpFarm } from './kelp-farm';
import { languageArchive } from './language-archive';
import { citizenFloating, workerFloating, boatSubmersible } from '../shared/figures';

/** Era 9's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  'floating-district': floatingDistrict,
  'sea-gate': seaGate,
  'kelp-farm': kelpFarm,
  'language-archive': languageArchive,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). The
 * sea gate is this era's harbour-class building, so a submersible sails once it is built. */
export const figures: EraFigures = {
  citizen: citizenFloating,
  worker: workerFloating,
  boat: boatSubmersible,
};

export default art;
