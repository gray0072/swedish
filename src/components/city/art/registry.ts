import type { EraArt, EraArtModule, EraFigures } from '../scene/types';

/**
 * Era id → its art chunk. Each era is a separate dynamic import so only the viewed era's
 * drawings are ever loaded (CITY_VISUALS_TECH.md §3). An era with no art yet is simply
 * absent: the scene falls back to the icon badge on the plot, which is the intended mixed
 * state while the eras are drawn one phase at a time.
 */
const ERA_ART: Record<string, () => Promise<EraArtModule>> = {
  tribe: () => import('./tribe'),
  viking: () => import('./viking'),
  medieval: () => import('./medieval'),
  empire: () => import('./empire'),
  industrial: () => import('./industrial'),
  modern: () => import('./modern'),
  green: () => import('./green'),
  connected: () => import('./connected'),
  floating: () => import('./floating'),
  stellar: () => import('./stellar'),
};

const cache = new Map<string, EraArt>();
const figureCache = new Map<string, EraFigures | undefined>();

export function hasEraArt(eraId: string): boolean {
  return eraId in ERA_ART;
}

/** Already-resolved art for an era, or undefined if it has none or has not loaded yet. */
export function peekEraArt(eraId: string): EraArt | undefined {
  return cache.get(eraId);
}

export async function loadEraArt(eraId: string): Promise<EraArt> {
  const cached = cache.get(eraId);
  if (cached) return cached;
  const load = ERA_ART[eraId];
  if (!load) return {};
  const mod = await load();
  cache.set(eraId, mod.default);
  figureCache.set(eraId, mod.figures);
  return mod.default;
}

/**
 * The era's figures, available only once its art chunk has loaded — they ship in the same
 * chunk, so there is nothing extra to fetch. Undefined means this era has nobody drawn yet
 * and its streets stay empty, exactly as an era with no building art keeps its icon badges.
 */
export function peekEraFigures(eraId: string): EraFigures | undefined {
  return figureCache.get(eraId);
}
