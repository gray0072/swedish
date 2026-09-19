import type { EraArt, EraFigures } from '../../scene/types';
import { longhouse } from './longhouse';
import { smithy } from './smithy';
import { harbour } from './harbour';
import { tradingSquare } from './trading-square';
import { runeStone } from './rune-stone';
import { citizenViking, workerViking, boatViking } from '../shared/figures';

/** Era 2's building art, keyed by content id (content/city/buildings.json). */
const art: EraArt = {
  longhouse,
  smithy,
  harbour,
  'trading-square': tradingSquare,
  'rune-stone': runeStone,
};

/** The era's people, loaded in the same chunk as its buildings (CITY_VISUALS_LIFE.md §2). */
export const figures: EraFigures = {
  citizen: citizenViking,
  worker: workerViking,
  boat: boatViking,
};

export default art;
