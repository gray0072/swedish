import type { ReactNode } from 'react';

/**
 * The contract between the two halves of the city scene (CITY_VISUALS.md): the *stage*
 * (`scene/**` — grid, terrain, layers, themes) and the *art* (`art/**` — buildings,
 * figures, props). Neither side imports the other; both import this file.
 */

// -- Grid -------------------------------------------------------------------

/** Isometric grid cell. See CITY_VISUALS_SCENE.md §2 for the projection. */
export interface GridCell {
  q: number;
  r: number;
}

/** Footprint in grid cells, anchored at the building's front-bottom corner. */
export interface Footprint {
  w: number;
  h: number;
}

// -- Colour -----------------------------------------------------------------

/** One build period's materials. Every building in an era draws from these alone. */
export interface MaterialTokens {
  wall: string;
  wallSide: string;
  roof: string;
  roofSide: string;
  timber: string;
  trim: string;
  glass: string;
  glassLit: string;
}

export type AmbientEmitter =
  | 'smoke'
  | 'birds'
  | 'flag'
  | 'rotor'
  | 'beacon'
  | 'aurora'
  | 'snow'
  | 'pollen'
  | 'rain';

export interface AmbientFlags {
  emitters: AmbientEmitter[];
}

/**
 * What the era's people wear. Deliberately separate from `MaterialTokens`: a citizen's cloak
 * is not a building material, and CITY_VISUALS_LIFE.md §2 treats costume as the era's whole
 * characterisation budget. Optional while the eras are filled in; the scene falls back to
 * the granite/birch neutrals when an era has none.
 */
export interface ClothingTokens {
  body: string;
  head: string;
  accent: string;
}

export interface SceneTheme {
  /** Vertical sky gradient stops, top → horizon. */
  sky: [string, string];
  water: { base: string; deep: string; wave: string; foam: string };
  ground: { top: string; cliff: string; wet: string };
  horizon: string;
  material: MaterialTokens;
  time: 'day' | 'dusk' | 'night';
  ambient: AmbientFlags;
  clothing?: ClothingTokens;
}

// -- Building art -----------------------------------------------------------

/**
 * One level of a building. `render` draws in a LOCAL space whose origin is the footprint's
 * front-bottom corner with **y pointing up** — the scene applies the isometric transform,
 * so art files never do coordinate maths.
 */
export interface BuildingArtLevel {
  /** Silhouette height in world units; drives hover lift and the level star's position. */
  height: number;
  render: (m: MaterialTokens) => ReactNode;
}

export interface BuildingArt {
  footprint: Footprint;
  /** One entry per level, exactly `maxLevel` long (validated). Level 0 is the plot, drawn by the scene. */
  levels: BuildingArtLevel[];
  /** Fine placement nudge in world units. */
  anchor?: { dx: number; dy: number };
  /** Ambient emitters this building owns (CITY_VISUALS_LIFE.md §7). */
  ambient?: AmbientEmitter[];
  /** Where a worker figure stands after a build or upgrade, in local space. */
  workSpot?: { dx: number; dy: number };
  /**
   * True for the era's harbour-class building — the quay, jetty or pad that has to exist
   * before the era's boat sails (CITY_VISUALS_LIFE.md §6). It is a property of the drawing
   * (does this art have somewhere to moor?), which is why it lives here and not in content.
   */
  harbour?: boolean;
}

/** An era's art module: building id → art. */
export type EraArt = Record<string, BuildingArt>;

// -- Figures ----------------------------------------------------------------

/** Two-frame woodcut walk cycle (CITY_VISUALS_LIFE.md §2) — there is no smooth in-between. */
export type WalkPhase = 0 | 1;

export interface FigureColours {
  body: string;
  head: string;
  accent: string;
}

export interface FigureOptions extends FigureColours {
  x: number;
  y: number;
  phase: WalkPhase;
}

export interface BoatOptions {
  x: number;
  y: number;
  w: number;
  hull: string;
  /** Omitted for a moored or unrigged boat. */
  sail?: string;
}

/**
 * An era's people, drawn one frame at a time. Movement, placement and the clock belong to
 * the scene; these only know how to draw. An era with no figures simply has nobody on its
 * streets yet, which is the same deliberate mixed state as a building with no art.
 */
export interface EraFigures {
  citizen: (options: FigureOptions) => ReactNode;
  worker: (options: FigureOptions) => ReactNode;
  boat?: (options: BoatOptions) => ReactNode;
}

/** The shape of an era's art chunk. */
export interface EraArtModule {
  default: EraArt;
  figures?: EraFigures;
}
