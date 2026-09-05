import type { ReactNode } from 'react';

/**
 * Small flat pictogram set for city buildings — PROMPT/SPEC §11.5 style: flat vector,
 * 2px stroke, no photorealism. Icons are looked up by a static id->icon map below rather
 * than a content field, so this stays a pure presentation concern (content JSON is untouched).
 */
export type IconKey =
  | 'hut'
  | 'fire'
  | 'anvil'
  | 'stone'
  | 'ship'
  | 'hall'
  | 'market'
  | 'church'
  | 'tower'
  | 'castle'
  | 'tree'
  | 'station'
  | 'arena'
  | 'museum'
  | 'star';

const paths: Record<IconKey, ReactNode> = {
  hut: (
    <>
      <path d="M4 20V11L12 5l8 6v9" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  fire: (
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-1-2-1-3 2 1 3 4 3 6a4 4 0 0 1-8 0c0-4 3-6 4-10Z" />
  ),
  anvil: (
    <>
      <path d="M4 17h8l2-3h6v3h-2" />
      <path d="M10 17v3h4v-3" />
      <path d="M14 14V9a2 2 0 0 0-2-2h-1" />
    </>
  ),
  stone: (
    <>
      <path d="M4 18l3-9 5-3 5 3 3 9Z" />
      <path d="M8 12l3 1 3-1" />
    </>
  ),
  ship: (
    <>
      <path d="M3 15h18l-2 5H5Z" />
      <path d="M12 15V4" />
      <path d="M12 6l6 4H12Z" />
    </>
  ),
  hall: (
    <>
      <path d="M3 20V10l9-6 9 6v10" />
      <path d="M9 20v-7h6v7" />
      <path d="M3 10h18" />
    </>
  ),
  market: (
    <>
      <path d="M4 9l1-4h14l1 4" />
      <path d="M4 9v11h16V9" />
      <path d="M4 9c0 2 2 2 2 0M8 9c0 2 2 2 2 0M12 9c0 2 2 2 2 0M16 9c0 2 2 2 2 0" />
    </>
  ),
  church: (
    <>
      <path d="M5 20V11L12 6l7 5v9" />
      <path d="M12 6V2M10 3h4" />
      <path d="M10 20v-5a2 2 0 0 1 4 0v5" />
    </>
  ),
  tower: (
    <>
      <path d="M8 20V8l4-5 4 5v12" />
      <path d="M8 8h8M6 8v-2h2v2M16 8v-2h2v2" />
      <path d="M10 20v-4h4v4" />
    </>
  ),
  castle: (
    <>
      <path d="M4 20v-8h3v-3h2v3h6v-3h2v3h3v8Z" />
      <path d="M9 20v-4a3 3 0 0 1 6 0v4" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3l4 6h-3l4 6h-4v6h-2v-6H7l4-6H8Z" />
    </>
  ),
  station: (
    <>
      <path d="M4 20V9a8 8 0 0 1 16 0v11" />
      <path d="M4 20h16M8 20v-6h8v6" />
    </>
  ),
  arena: (
    <>
      <ellipse cx="12" cy="14" rx="9" ry="6" />
      <path d="M3 14a9 4 0 0 0 18 0" />
      <path d="M12 8V4" />
    </>
  ),
  museum: (
    <>
      <path d="M3 9l9-5 9 5" />
      <path d="M5 9v10M9 9v10M15 9v10M19 9v10" />
      <path d="M3 19h18" />
    </>
  ),
  star: (
    <path d="M12 3l2.4 5.8 6.2.5-4.7 4.1 1.5 6.1L12 16.6 6.6 19.5l1.5-6.1-4.7-4.1 6.2-.5Z" />
  ),
};

export function BuildingIcon({ icon, className }: { icon: IconKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[icon]}
    </svg>
  );
}

/** Static id -> icon lookup. Falls back to `star` for anything not listed. */
export const BUILDING_ICONS: Record<string, IconKey> = {
  hut: 'hut',
  campfire: 'fire',
  'rock-carving': 'stone',
  'stone-ship': 'ship',

  longhouse: 'hall',
  harbour: 'ship',
  'rune-stone': 'stone',
  'trading-square': 'market',
  smithy: 'anvil',

  'city-wall': 'tower',
  storkyrkan: 'church',
  'stortorget-market': 'market',
  riddarholmen: 'tower',

  shipyard: 'ship',
  'vasa-ship': 'ship',
  'royal-palace': 'castle',

  'central-station': 'station',
  skansen: 'tree',
  stadshuset: 'tower',

  'metro-art-station': 'station',
  'avicii-arena': 'arena',
  'abba-museum': 'museum',
};

export function iconFor(buildingId: string): IconKey {
  return BUILDING_ICONS[buildingId] ?? 'star';
}
