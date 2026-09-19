import type { AmbientEmitter } from './types';

/**
 * Ambient emitter selection (CITY_VISUALS_LIFE.md §7): each building opts into emitters via its
 * art's `ambient` field, each era opts into a few more via `SceneTheme.ambient`. Both lists are
 * merged, sorted by priority and truncated to the node budget — so a content author can add an
 * emitter to a building without ever risking the shared ceiling; the lowest-priority emitter
 * already on the island simply falls off the end instead.
 */

export interface AmbientSource {
  buildingId?: string;
  emitters: AmbientEmitter[];
}

export interface AmbientInstance {
  type: AmbientEmitter;
  buildingId?: string;
  priority: number;
  nodeCost: number;
}

/** SVG node cost per emitter, straight off the LIFE.md §7 table. */
export const EMITTER_NODE_COST: Record<AmbientEmitter, number> = {
  smoke: 3,
  birds: 4,
  flag: 1,
  rotor: 1,
  beacon: 1,
  aurora: 2,
  snow: 20,
  pollen: 20,
  rain: 20,
};

/**
 * Priority order, highest first. Building-tied emitters that read as "this place is working"
 * (smoke, a turning rotor, a flapping flag) rank above sky-wide decoration (birds, aurora,
 * beacon), which in turn ranks above the expensive weather particles — those are the ones the
 * budget is meant to squeeze out first, matching LIFE.md §7's "off by default" note on them.
 */
export const EMITTER_PRIORITY: Record<AmbientEmitter, number> = {
  smoke: 90,
  flag: 80,
  rotor: 75,
  beacon: 70,
  aurora: 60,
  birds: 50,
  snow: 20,
  pollen: 20,
  rain: 20,
};

export const AMBIENT_NODE_BUDGET = 60;

/**
 * Merges building and era emitter lists, sorts by priority (stable — ties keep source order),
 * then truncates by running node cost. Truncation, not bin-packing: a lower-priority emitter
 * that would fit after a skipped higher-cost one still does not make the cut, so the result is
 * always a strict priority prefix and the budget is honoured by construction.
 */
export function selectAmbientEmitters(
  sources: AmbientSource[],
  eraEmitters: AmbientEmitter[],
  budget: number = AMBIENT_NODE_BUDGET,
): AmbientInstance[] {
  const candidates: AmbientInstance[] = [];
  for (const source of sources) {
    for (const type of source.emitters) {
      candidates.push({
        type,
        buildingId: source.buildingId,
        priority: EMITTER_PRIORITY[type],
        nodeCost: EMITTER_NODE_COST[type],
      });
    }
  }
  for (const type of eraEmitters) {
    candidates.push({ type, priority: EMITTER_PRIORITY[type], nodeCost: EMITTER_NODE_COST[type] });
  }

  const sorted = candidates
    .map((c, index) => ({ c, index }))
    .sort((a, b) => b.c.priority - a.c.priority || a.index - b.index)
    .map(({ c }) => c);

  const selected: AmbientInstance[] = [];
  let used = 0;
  for (const candidate of sorted) {
    if (used + candidate.nodeCost > budget) break;
    selected.push(candidate);
    used += candidate.nodeCost;
  }
  return selected;
}
