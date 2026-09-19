import type { EraArt, EraFigures } from '../../scene/types';
import { aviciiArena } from './avicii-arena';
import { metroArtStation } from './metro-art-station';
import { abbaMuseum } from './abba-museum';
import { citizenModern, workerModern } from '../shared/figures';

/** Era 6's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  'avicii-arena': aviciiArena,
  'metro-art-station': metroArtStation,
  'abba-museum': abbaMuseum,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). No
 * building here is harbour-class, so it sails no boat. */
export const figures: EraFigures = {
  citizen: citizenModern,
  worker: workerModern,
};

export default art;
