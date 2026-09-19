import type { EraArt, EraFigures } from '../../scene/types';
import { stadshuset } from './stadshuset';
import { centralStation } from './central-station';
import { skansen } from './skansen';
import { citizenIndustrial, workerIndustrial } from '../shared/figures';

/** Era 5's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  stadshuset,
  'central-station': centralStation,
  skansen,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). No
 * building here is harbour-class, so it sails no boat. */
export const figures: EraFigures = {
  citizen: citizenIndustrial,
  worker: workerIndustrial,
};

export default art;
