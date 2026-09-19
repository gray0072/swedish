import type { EraArt, EraFigures } from '../../scene/types';
import { auroraBeacon } from './aurora-beacon';
import { nobelStation } from './nobel-station';
import { spacePort } from './space-port';
import { spaceSchool } from './space-school';
import { citizenStellar, workerStellar, boatShuttle } from '../shared/figures';

/** Era 10's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  'aurora-beacon': auroraBeacon,
  'nobel-station': nobelStation,
  'space-port': spacePort,
  'space-school': spaceSchool,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). The
 * spaceport is this era's harbour-class building, so a shuttle sails once it is built. */
export const figures: EraFigures = {
  citizen: citizenStellar,
  worker: workerStellar,
  boat: boatShuttle,
};

export default art;
