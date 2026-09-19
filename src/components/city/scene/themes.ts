import type { AmbientEmitter, ClothingTokens, MaterialTokens, SceneTheme } from './types';

/**
 * Era palettes (CITY_VISUALS_SCENE.md §6-7). Each era's *light* theme is authored by hand as
 * hex literals — this is the one file where the whole island's colour story is reviewable by
 * eye. The *dark* variant is derived from it with the small `mix()` helper below (drop 18%
 * lightness, gain 6% hue toward the era accent on sky/water/ground; building fills stay
 * identical, only their strokes lighten) so the two never drift apart by hand-editing one and
 * forgetting the other.
 */

// ---------------------------------------------------------------------------
// mix() — the one place colour maths happens. Everything it produces is still stored as a
// plain hex string on the theme object, so nothing downstream does colour maths at render time.
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d) % 6;
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/** Darken (positive `amount`) or lighten (negative) a hex colour by `amount` lightness points. */
function darken(hex: string, amount: number): string {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  const [r, g, b] = hslToRgb(h, s, Math.max(0, Math.min(1, l - amount / 100)));
  return rgbToHex(r, g, b);
}

function lighten(hex: string, amount: number): string {
  return darken(hex, -amount);
}

/** Shifts a colour's hue a `fraction` of the way toward `target`'s hue. */
function shiftHueToward(hex: string, target: string, fraction: number): string {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  const [th] = rgbToHsl(...hexToRgb(target));
  let delta = th - h;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  const [r, g, b] = hslToRgb((h + delta * fraction + 360) % 360, s, l);
  return rgbToHex(r, g, b);
}

/** The dark-theme rule from CITY_VISUALS_SCENE.md §7, applied to one hex token. */
function toDarkTone(hex: string, accent: string): string {
  return shiftHueToward(darken(hex, 18), accent, 0.06);
}

function toDarkStroke(hex: string): string {
  return lighten(hex, 22);
}

// ---------------------------------------------------------------------------
// Per-era authoring — sky/water/ground/horizon plus the era's four base material colours.
// wallSide/roofSide/glassLit are derived, never hand-duplicated, so a palette tweak only
// touches one line.
// ---------------------------------------------------------------------------

interface EraPaletteSeed {
  sky: [string, string];
  water: { base: string; deep: string; wave: string; foam: string };
  ground: { top: string; cliff: string; wet: string };
  horizon: string;
  wall: string;
  roof: string;
  timber: string;
  trim: string;
  glass: string;
  time: 'day' | 'dusk' | 'night';
  ambient: AmbientEmitter[];
  accent: string;
  /** The era's one costume (CITY_VISUALS_LIFE.md §2) — the whole characterisation budget for
   * every figure drawn in it, light-theme literal values; dark derives via `toDarkStroke`. */
  clothing: ClothingTokens;
}

const ERA_SEEDS: Record<string, EraPaletteSeed> = {
  // Bare rock, birch scrub, one firepit's smoke, no quays.
  tribe: {
    sky: ['#BFD3D6', '#E8DCC2'],
    water: { base: '#3F6B73', deep: '#2C4E56', wave: '#5C8A91', foam: '#F2F6EE' },
    ground: { top: '#8C8266', cliff: '#6E6650', wet: '#5A6B5E' },
    horizon: '#7A8C82',
    wall: '#8A7A63', roof: '#5E6E52', timber: '#4A3F31', trim: '#7C3228', glass: '#CFE0DD',
    time: 'day', ambient: ['smoke', 'birds'], accent: '#7C3228',
    clothing: { body: '#5A6B4A', head: '#C9A876', accent: '#4A3F31' }, // cloak and staff
  },
  // Timber, turf roofs, a longship at a wooden jetty.
  viking: {
    sky: ['#AFCBDD', '#E4DDB8'],
    water: { base: '#2E5A63', deep: '#1F3F47', wave: '#4A7A82', foam: '#EFF3E2' },
    ground: { top: '#6E7A4E', cliff: '#525D3B', wet: '#43574C' },
    horizon: '#4E6357',
    wall: '#7A5A3A', roof: '#4C5A3C', timber: '#3A2C1E', trim: '#C8A24A', glass: '#C8DCD6',
    time: 'day', ambient: ['smoke', 'flag', 'birds'], accent: '#C8A24A',
    clothing: { body: '#7A5A3A', head: '#D9B98A', accent: '#C8A24A' }, // tunic and axe
  },
  // Brick and lime plaster, a wall ring, church spire, dusk.
  medieval: {
    sky: ['#E7A46B', '#F6D9A6'],
    water: { base: '#2C4A57', deep: '#1C323C', wave: '#456B78', foam: '#F7E8CE' },
    ground: { top: '#B3856A', cliff: '#8C6650', wet: '#5C6660' },
    horizon: '#8C6F63',
    wall: '#B24A3C', roof: '#5A4638', timber: '#3B2C22', trim: '#C8A24A', glass: '#EAD9B0',
    time: 'dusk', ambient: ['flag', 'birds'], accent: '#C8A24A',
    clothing: { body: '#5A4A6E', head: '#3B2C22', accent: '#8C6650' }, // hooded robe
  },
  // Baroque stone, pale yellow plaster, tall ships.
  empire: {
    sky: ['#BFE0EF', '#F2E7C2'],
    water: { base: '#1F6C9C', deep: '#154A6C', wave: '#3F8FBC', foam: '#F5F2E2' },
    ground: { top: '#D6C79A', cliff: '#AE9C6E', wet: '#6E7A6A' },
    horizon: '#8FA4AE',
    wall: '#E4D19A', roof: '#7C5A45', timber: '#4A3626', trim: '#C8A24A', glass: '#D9E9EC',
    time: 'day', ambient: ['flag', 'birds'], accent: '#006AA7',
    clothing: { body: '#2C4A6E', head: '#D9C7A0', accent: '#C8A24A' }, // coat and hat
  },
  // Red brick, iron, smoke plumes, lit windows appearing, dusk.
  industrial: {
    sky: ['#8E97A0', '#D9A876'],
    water: { base: '#2A3E45', deep: '#1A2A30', wave: '#41595F', foam: '#E8DCC6' },
    ground: { top: '#6E5C52', cliff: '#4E4038', wet: '#3E4A48', },
    horizon: '#5C5450',
    wall: '#7A3C34', roof: '#3A3A3E', timber: '#2A2422', trim: '#006AA7', glass: '#B7C4C2',
    time: 'dusk', ambient: ['smoke', 'birds'], accent: '#006AA7',
    clothing: { body: '#4A4A4E', head: '#C9A876', accent: '#7A3C34' }, // flat cap
  },
  // Concrete, glass, lit metro sign, warm window grid, night.
  modern: {
    sky: ['#0E2438', '#274257'],
    water: { base: '#0B2230', deep: '#071620', wave: '#173A4C', foam: '#BFD8DE' },
    ground: { top: '#565C60', cliff: '#3E4346', wet: '#2C3638' },
    horizon: '#2E3E4A',
    wall: '#6A6E70', roof: '#3A3E42', timber: '#26282A', trim: '#3FBF9F', glass: '#9FD8DC',
    time: 'night', ambient: ['birds'], accent: '#3FBF9F',
    clothing: { body: '#4A5A6E', head: '#C9A876', accent: '#3FBF9F' }, // puffer jacket and a dog
  },
  // Timber towers, planted roofs, unusually green island.
  green: {
    sky: ['#BEE3D6', '#E9EFC8'],
    water: { base: '#2E7A6C', deep: '#1F5A4E', wave: '#4EA08E', foam: '#F1F6E4' },
    ground: { top: '#5E8A52', cliff: '#436A3C', wet: '#38584A' },
    horizon: '#4E7A5E',
    wall: '#8A6E4A', roof: '#3E7A4C', timber: '#3A2C1E', trim: '#7FD4A8', glass: '#D6ECE0',
    time: 'day', ambient: ['birds', 'pollen'], accent: '#7FD4A8',
    clothing: { body: '#3E7A4C', head: '#C9A876', accent: '#8A6E4A' }, // cargo bike
  },
  // Glass and light, faint drone traffic, dusk.
  connected: {
    sky: ['#5A6BA0', '#C4B8E0'],
    water: { base: '#243154', deep: '#161E38', wave: '#3B4C7A', foam: '#DDE0F2' },
    ground: { top: '#5A5E72', cliff: '#3E4256', wet: '#2E3448' },
    horizon: '#3E4666',
    wall: '#7A8098', roof: '#4A4E62', timber: '#2A2C3A', trim: '#8AB4FF', glass: '#C3D4FF',
    time: 'dusk', ambient: ['rotor', 'birds'], accent: '#8AB4FF',
    clothing: { body: '#7A8098', head: '#C3D4FF', accent: '#8AB4FF' }, // visor
  },
  // Higher waterline, pontoon rings extending past the island edge.
  floating: {
    sky: ['#BFE7EE', '#E4F5EE'],
    water: { base: '#0E6E86', deep: '#0A4E60', wave: '#2E96AC', foam: '#EAFBF6' },
    ground: { top: '#7A8A80', cliff: '#5C6C64', wet: '#3E5C58' },
    horizon: '#4E7A82',
    wall: '#8A9690', roof: '#2E6E78', timber: '#2A3A38', trim: '#4FD6E8', glass: '#CFF2F0',
    time: 'day', ambient: ['birds'], accent: '#4FD6E8',
    clothing: { body: '#0E6E86', head: '#CFF2F0', accent: '#4FD6E8' }, // drysuit
  },
  // Deep violet sky, aurora band, beacon light sweeping, night.
  stellar: {
    sky: ['#120F30', '#2C2460'],
    water: { base: '#160F3A', deep: '#0C0824', wave: '#2A2060', foam: '#C9B6FF' },
    ground: { top: '#3A3458', cliff: '#26223E', wet: '#1C1A30' },
    horizon: '#241E48',
    wall: '#4A4470', roof: '#302A50', timber: '#1C1830', trim: '#C9B6FF', glass: '#D8CCFF',
    time: 'night', ambient: ['aurora', 'beacon'], accent: '#C9B6FF',
    clothing: { body: '#4A4470', head: '#D8CCFF', accent: '#C9B6FF' }, // soft-suit
  },
};

function buildMaterial(seed: EraPaletteSeed, stroke: (hex: string) => string): MaterialTokens {
  return {
    wall: seed.wall,
    wallSide: darken(seed.wall, 12),
    roof: seed.roof,
    roofSide: darken(seed.roof, 6),
    timber: stroke(seed.timber),
    trim: stroke(seed.trim),
    glass: seed.glass,
    glassLit: shiftHueToward(lighten(seed.glass, 18), '#FFD37A', 0.6),
  };
}

function buildLightTheme(seed: EraPaletteSeed): SceneTheme {
  return {
    sky: seed.sky,
    water: seed.water,
    ground: seed.ground,
    horizon: seed.horizon,
    material: buildMaterial(seed, (hex) => hex),
    time: seed.time,
    ambient: { emitters: seed.ambient },
    clothing: seed.clothing,
  };
}

function buildDarkTheme(seed: EraPaletteSeed): SceneTheme {
  return {
    sky: [toDarkTone(seed.sky[0], seed.accent), toDarkTone(seed.sky[1], seed.accent)],
    water: {
      base: toDarkTone(seed.water.base, seed.accent),
      deep: toDarkTone(seed.water.deep, seed.accent),
      wave: toDarkTone(seed.water.wave, seed.accent),
      foam: seed.water.foam,
    },
    ground: {
      top: toDarkTone(seed.ground.top, seed.accent),
      cliff: toDarkTone(seed.ground.cliff, seed.accent),
      wet: toDarkTone(seed.ground.wet, seed.accent),
    },
    horizon: toDarkTone(seed.horizon, seed.accent),
    // Building fills stay identical in dark theme; only their strokes lighten (SCENE.md §7).
    material: buildMaterial(seed, toDarkStroke),
    time: seed.time,
    ambient: { emitters: seed.ambient },
    // Body/head stay identical in dark theme, same rule as building fills; only the accent
    // (the one stroke-weight detail on a figure) lightens to keep reading against dark water.
    clothing: { body: seed.clothing.body, head: seed.clothing.head, accent: toDarkStroke(seed.clothing.accent) },
  };
}

export const LIGHT_THEMES: Record<string, SceneTheme> = Object.fromEntries(
  Object.entries(ERA_SEEDS).map(([id, seed]) => [id, buildLightTheme(seed)]),
);

export const DARK_THEMES: Record<string, SceneTheme> = Object.fromEntries(
  Object.entries(ERA_SEEDS).map(([id, seed]) => [id, buildDarkTheme(seed)]),
);

/** Both variants exist for every era listed in content/city/eras.json. */
export function themeFor(eraId: string, dark: boolean): SceneTheme {
  const table = dark ? DARK_THEMES : LIGHT_THEMES;
  return table[eraId] ?? LIGHT_THEMES.tribe;
}

/**
 * Flattens both theme variants into the `--token-light` / `--token-dark` CSS custom property
 * pairs that `city-scene.css` switches between under the app's `.dark` class. This is the
 * only place Scene.tsx needs to know both variants exist — every layer downstream just reads
 * `var(--token)` and never branches on light/dark itself.
 */
export function themeCssVars(light: SceneTheme, dark: SceneTheme): Record<string, string> {
  const pairs: [string, string, string][] = [
    ['sky-0', light.sky[0], dark.sky[0]],
    ['sky-1', light.sky[1], dark.sky[1]],
    ['water-base', light.water.base, dark.water.base],
    ['water-deep', light.water.deep, dark.water.deep],
    ['water-wave', light.water.wave, dark.water.wave],
    ['water-foam', light.water.foam, dark.water.foam],
    ['ground-top', light.ground.top, dark.ground.top],
    ['ground-cliff', light.ground.cliff, dark.ground.cliff],
    ['ground-wet', light.ground.wet, dark.ground.wet],
    ['horizon', light.horizon, dark.horizon],
    ['wall', light.material.wall, dark.material.wall],
    ['wall-side', light.material.wallSide, dark.material.wallSide],
    ['roof', light.material.roof, dark.material.roof],
    ['roof-side', light.material.roofSide, dark.material.roofSide],
    ['timber', light.material.timber, dark.material.timber],
    ['trim', light.material.trim, dark.material.trim],
    ['glass', light.material.glass, dark.material.glass],
    ['glass-lit', light.material.glassLit, dark.material.glassLit],
  ];
  const vars: Record<string, string> = {};
  for (const [name, lightValue, darkValue] of pairs) {
    vars[`--${name}-light`] = lightValue;
    vars[`--${name}-dark`] = darkValue;
  }
  return vars;
}
