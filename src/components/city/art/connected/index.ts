import type { EraArt, EraFigures } from '../../scene/types';
import { skyGarden } from './sky-garden';
import { autoMetro } from './auto-metro';
import { dataHarbour } from './data-harbour';
import { languageLab } from './language-lab';
import { citizenConnected, workerConnected } from '../shared/figures';

/** Era 8's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  'sky-garden': skyGarden,
  'auto-metro': autoMetro,
  'data-harbour': dataHarbour,
  'language-lab': languageLab,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). The
 * "worker" is a drone from this era on (§5); the data harbour handles data, not ships, so
 * this era sails no boat. */
export const figures: EraFigures = {
  citizen: citizenConnected,
  worker: workerConnected,
};

export default art;
