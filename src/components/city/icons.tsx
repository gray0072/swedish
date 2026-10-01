import type { ReactNode } from 'react';

/**
 * Small flat pictogram set for city buildings — PROMPT/SPEC §11.5 style: flat vector,
 * 2px stroke, no photorealism. Every building has a pictogram of its own (no two share one),
 * shown on its card and as the scene's fallback badge. Icons are looked up by a static
 * id->icon map below rather than a content field, so this stays a pure presentation concern
 * (content JSON is untouched).
 */
export type IconKey =
  // tribe
  | 'hut'
  | 'fire'
  | 'carving'
  | 'stoneShip'
  // viking
  | 'longhouse'
  | 'anchor'
  | 'runestone'
  | 'scales'
  | 'anvil'
  // medieval
  | 'wall'
  | 'church'
  | 'market'
  | 'spire'
  // empire
  | 'crane'
  | 'ship'
  | 'palace'
  // industrial
  | 'station'
  | 'cottage'
  | 'cityHall'
  // modern
  | 'metro'
  | 'globe'
  | 'note'
  // green
  | 'timber'
  | 'farm'
  | 'ferry'
  | 'flask'
  // connected
  | 'skyGarden'
  | 'train'
  | 'server'
  | 'chat'
  // floating
  | 'floating'
  | 'gate'
  | 'kelp'
  | 'book'
  // stellar
  | 'beacon'
  | 'medal'
  | 'rocket'
  | 'planet'
  // fallback
  | 'star';

const paths: Record<IconKey, ReactNode> = {
  hut: (
    <>
      <path d="M4 20 12 5l8 15Z" />
      <path d="M10 3.5 12 5l2-1.5" />
      <path d="M10 20l2-5 2 5" />
    </>
  ),
  fire: (
    <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1-1-2-1-3 2 1 3 4 3 6a4 4 0 0 1-8 0c0-4 3-6 4-10Z" />
  ),
  carving: (
    <>
      <path d="M3 20l2-8 5-6h5l5 6 1 8Z" />
      <path d="M6.5 14q5.5 3 11 0" />
      <path d="M9 14.8v-2.3M12 15.5v-2.5M15 14.8v-2.3" />
    </>
  ),
  stoneShip: (
    <>
      <circle cx="3" cy="12" r="1" />
      <circle cx="5.5" cy="9.5" r="1" />
      <circle cx="9" cy="8" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="15" cy="8" r="1" />
      <circle cx="18.5" cy="9.5" r="1" />
      <circle cx="21" cy="12" r="1" />
      <circle cx="5.5" cy="14.5" r="1" />
      <circle cx="9" cy="16" r="1" />
      <circle cx="12" cy="16.5" r="1" />
      <circle cx="15" cy="16" r="1" />
      <circle cx="18.5" cy="14.5" r="1" />
    </>
  ),
  longhouse: (
    <>
      <path d="M2 15q10-11 20 0" />
      <path d="M4 13.5V20h16v-6.5" />
      <path d="M10.5 20v-3h3v3" />
      <path d="M2 15l-.5-2.5M22 15l.5-2.5" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13M8.5 10h7" />
      <path d="M4 13a8 7 0 0 0 16 0" />
      <path d="M4 13l-1.5 2M4 13l2 1M20 13l1.5 2M20 13l-2 1" />
    </>
  ),
  runestone: (
    <>
      <path d="M7 21V8c0-3 2-5 5-5s5 2 5 5v13" />
      <path d="M4 21h16" />
      <path d="M11 8v9M11 10l2.5-2M11 13l2.5 2" />
    </>
  ),
  scales: (
    <>
      <path d="M12 4v16M8 20h8M5 7h14" />
      <path d="M5 7l-3 6a3 3 0 0 0 6 0Z" />
      <path d="M19 7l-3 6a3 3 0 0 0 6 0Z" />
    </>
  ),
  anvil: (
    <>
      <path d="M3 7h15l3 2.5h-6V14H9v-4C5.5 10 3 9 3 7Z" />
      <path d="M7 19l2-5h6l2 5Z" />
    </>
  ),
  wall: (
    <>
      <path d="M3 20V7h3v3h4.5V7h3v3H18V7h3v13Z" />
      <path d="M10 20v-4a2 2 0 0 1 4 0v4" />
    </>
  ),
  church: (
    <>
      <path d="M5 20V11L12 6l7 5v9" />
      <path d="M12 6V2M10 3h4" />
      <path d="M10 20v-5a2 2 0 0 1 4 0v5" />
    </>
  ),
  market: (
    <>
      <path d="M4 9l1-4h14l1 4" />
      <path d="M4 9v11h16V9" />
      <path d="M4 9c0 2 2 2 2 0M8 9c0 2 2 2 2 0M12 9c0 2 2 2 2 0M16 9c0 2 2 2 2 0" />
    </>
  ),
  spire: (
    <>
      <path d="M10 11l2-9 2 9" />
      <path d="M10 20v-9h4v9" />
      <path d="M14 13.5l6 2V20" />
      <path d="M3 20h18M11 7.5h2" />
    </>
  ),
  crane: (
    <>
      <path d="M6 21V4h13M6 8l4-4" />
      <path d="M17 4v5" />
      <path d="M17 9a1.5 1.5 0 1 1-1.5 1.5" />
      <path d="M10 15h11l-2 4h-7Z" />
      <path d="M3 21h18" />
    </>
  ),
  ship: (
    <>
      <path d="M3 14h18l-3 6H6Z" />
      <path d="M9 14V3M15 14V5" />
      <path d="M6 5h6l-1 6H7ZM12 7h6l-1 5h-4Z" />
    </>
  ),
  palace: (
    <>
      <path d="M3 20V10h18v10M2 20h20" />
      <path d="M9 10l3-3 3 3" />
      <path d="M9.5 5.5 10 3l2 1.5L14 3l.5 2.5Z" />
      <path d="M6 13v2M9 13v2M15 13v2M18 13v2M11 20v-3h2v3" />
    </>
  ),
  station: (
    <>
      <path d="M4 20V9a8 8 0 0 1 16 0v11" />
      <path d="M4 20h16M8 20v-6h8v6" />
    </>
  ),
  cottage: (
    <>
      <path d="M3 20v-7l5-4 5 4v7" />
      <path d="M7 20v-3h2v3" />
      <path d="M17 20v-3M17 4l3.5 6h-2l2.5 5h-8l2.5-5h-2Z" />
      <path d="M2 20h20" />
    </>
  ),
  cityHall: (
    <>
      <path d="M10 21V7h4v14" />
      <path d="M10 7l2-2.5L14 7M12 4.5V3" />
      <path d="M11 2h2" />
      <path d="M3 21v-8h7M14 14h7v7" />
      <path d="M12 10v2.5M2 21h20" />
    </>
  ),
  metro: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 8h8M12 8v9" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8" />
      <path d="M4 12h16M3 21h18" />
    </>
  ),
  note: (
    <>
      <path d="M9 18V6l10-2v12M9 9l10-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="16" r="2" />
    </>
  ),
  timber: (
    <>
      <path d="M7 21V4h10v17" />
      <path d="M7 8h10M7 12h10M7 16h10M12 4v17" />
      <path d="M4 21h16" />
    </>
  ),
  farm: (
    <>
      <path d="M5 21V4h14v17M5 10h14M5 16h14" />
      <path d="M8 10a1.5 1.5 0 0 1 3 0M13 10a1.5 1.5 0 0 1 3 0" />
      <path d="M8 16a1.5 1.5 0 0 1 3 0M13 16a1.5 1.5 0 0 1 3 0" />
    </>
  ),
  ferry: (
    <>
      <path d="M3 15h18l-2.5 5h-13Z" />
      <path d="M7 15v-4h9l2 4" />
      <path d="M13 2l-3 4h3l-2 3.5" />
    </>
  ),
  flask: (
    <>
      <path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
      <path d="M9 3h6M7 15h10" />
    </>
  ),
  skyGarden: (
    <>
      <path d="M8 21v-9h8v9M5 21h14" />
      <circle cx="9.5" cy="8" r="2.5" />
      <circle cx="14.5" cy="7" r="3" />
      <path d="M9.5 10.5V12M14.5 10v2M10.5 15h3M10.5 18h3" />
    </>
  ),
  train: (
    <>
      <rect x="6" y="3" width="12" height="14" rx="3" />
      <path d="M6 9h12M9 13h.01M15 13h.01" />
      <path d="M8 21l2-4M16 21l-2-4" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="3" width="16" height="5" rx="1" />
      <rect x="4" y="10" width="16" height="5" rx="1" />
      <path d="M7 5.5h.01M7 12.5h.01" />
      <path d="M3 19q3-2 6 0t6 0 6 0" />
    </>
  ),
  chat: (
    <>
      <path d="M3 4h12v8H8l-3 3v-3H3Z" />
      <path d="M18 8h3v8h-2v3l-3-3h-5v-2" />
    </>
  ),
  floating: (
    <>
      <path d="M5 13V9l3-3 3 3v4M13 13V8l3-3 3 3v5" />
      <path d="M3 13h18v2H3Z" />
      <path d="M3 19q3-2 6 0t6 0 6 0" />
    </>
  ),
  gate: (
    <>
      <path d="M5 20V5h3v15M16 20V5h3v15" />
      <path d="M8 8h8M8 11h8v4H8" />
      <path d="M2 20q2.5-1.5 5 0t5 0 5 0 5 0" />
    </>
  ),
  kelp: (
    <>
      <path d="M7 21c-2-4 2-6 0-10s2-6 0-8" />
      <path d="M12 21c2-4-2-6 0-10s-2-5 0-7" />
      <path d="M17 21c-2-3 2-5 0-8s2-4 0-6" />
      <path d="M3 21h18" />
    </>
  ),
  book: (
    <>
      <path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5Z" />
      <path d="M12 6v14.5" />
    </>
  ),
  beacon: (
    <>
      <path d="M10 21l1-12h2l1 12M7 21h10" />
      <path d="M10 9h4V6h-4ZM10 6l2-2 2 2" />
      <path d="M7 7.5H4M20 7.5h-3M7.5 4.5 5 3M16.5 4.5 19 3" />
    </>
  ),
  medal: (
    <>
      <path d="M7 3l3.5 7M17 3l-3.5 7M7 3h3M14 3h3" />
      <circle cx="12" cy="15" r="5.5" />
      <circle cx="12" cy="15" r="2.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2c3 3 4 7 4 11l-4 3-4-3c0-4 1-8 4-11Z" />
      <path d="M8 13l-3 3 2 1 1 3 3-3M16 13l3 3-2 1-1 3-3-3" />
      <circle cx="12" cy="9" r="1.5" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="5" />
      <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-20 12 12)" />
      <path d="M19 2v3M17.5 3.5h3" />
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

/** Static id -> icon lookup, one pictogram per building. Falls back to `star` for anything not listed. */
export const BUILDING_ICONS: Record<string, IconKey> = {
  hut: 'hut',
  campfire: 'fire',
  'rock-carving': 'carving',
  'stone-ship': 'stoneShip',

  longhouse: 'longhouse',
  harbour: 'anchor',
  'rune-stone': 'runestone',
  'trading-square': 'scales',
  smithy: 'anvil',

  'city-wall': 'wall',
  storkyrkan: 'church',
  'stortorget-market': 'market',
  riddarholmen: 'spire',

  shipyard: 'crane',
  'vasa-ship': 'ship',
  'royal-palace': 'palace',

  'central-station': 'station',
  skansen: 'cottage',
  stadshuset: 'cityHall',

  'metro-art-station': 'metro',
  'avicii-arena': 'globe',
  'abba-museum': 'note',

  'wood-city': 'timber',
  'vertical-farm': 'farm',
  'electric-ferry': 'ferry',
  'climate-lab': 'flask',

  'sky-garden': 'skyGarden',
  'auto-metro': 'train',
  'data-harbour': 'server',
  'language-lab': 'chat',

  'floating-district': 'floating',
  'sea-gate': 'gate',
  'kelp-farm': 'kelp',
  'language-archive': 'book',

  'aurora-beacon': 'beacon',
  'nobel-station': 'medal',
  'space-port': 'rocket',
  'space-school': 'planet',
};

export function iconFor(buildingId: string): IconKey {
  return BUILDING_ICONS[buildingId] ?? 'star';
}
