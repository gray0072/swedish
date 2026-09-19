import type { EraArt, EraFigures } from '../../scene/types';
import { hut } from './hut';
import { campfire } from './campfire';
import { rockCarving } from './rock-carving';
import { stoneShip } from './stone-ship';
import { citizenTribe, workerTribe } from '../shared/figures';

/** Era 1's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  hut,
  campfire,
  'rock-carving': rockCarving,
  'stone-ship': stoneShip,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). */
export const figures: EraFigures = {
  citizen: citizenTribe,
  worker: workerTribe,
};

export default art;
