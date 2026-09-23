import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Building, Era } from '@/content/schema';
import { resolveLocalized, type StudyLanguage } from '@/content/schema';
import { buildingCostAt } from '@/city/economy';
import { hasEraArt, loadEraArt, peekEraArt, peekEraFigures } from '../art/registry';
import { iconFor } from '../icons';
import type { AmbientEmitter, GridCell } from './types';
import { compareDepth, WATER_LINE } from './iso';
import { assignCells } from './placement';
import { buildPathGraph } from './island';
import { DARK_THEMES, LIGHT_THEMES, themeCssVars } from './themes';
import { selectAmbientEmitters, type AmbientInstance } from './ambient';
import {
  citizenPosition,
  computePopulation,
  emptyWorkerQueue,
  makeAgentRng,
  requestWorker,
  spawnCitizen,
  stepAgents,
  stepWorkerQueue,
  type CitizenState,
  type WorkerQueueState,
} from './agents';
import { resolveMotionTier, ambientEnabled, type MotionTier } from './motion';
import { useSceneClock } from './useSceneClock';
import Sky from './layers/Sky';
import Horizon from './layers/Horizon';
import Water from './layers/Water';
import Terrain from './layers/Terrain';
import Plots, { type PlotInstance } from './layers/Plots';
import Buildings, { type BuildingInstance } from './layers/Buildings';
import Agents, { type AgentVisual, type AgentsHandle } from './layers/Agents';
import Vessels, { type VesselRoute, type VesselsHandle } from './layers/Vessels';
import Props from './layers/Props';
import Weather from './layers/Weather';
import HitLayer, { type HitTarget } from './layers/HitLayer';
import DevOverlay from './DevOverlay';
import './city-scene.css';

/** Length of the `building-rise` animation in `city-scene.css`. */
const RISE_MS = 700;

function scrollToBuilding(id: string) {
  document.getElementById(`building-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Watches the app's `.dark` class on `<html>` (toggled by `AppShell`) so building art — which
 * bakes literal `MaterialTokens` hex values rather than CSS variables, per the frozen
 * `BuildingArtLevel.render` contract in `types.ts` — can pick the right variant. Everything
 * else in the scene reacts to dark mode through the CSS custom properties in
 * `city-scene.css` instead; this is the one spot that needs to know in JS.
 */
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

/**
 * The OS-level `prefers-reduced-motion` signal — always wins over `settings.cityMotion`
 * (CITY_VISUALS_MOTION.md §4) and, per CITY_VISUALS_LIFE.md §4, is also what zeroes the
 * population cap. `settings.cityMotion: 'off'` on its own does *not* zero it: the still frame
 * that tier produces still needs citizens standing at their nodes to look composed.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useViewportWidth(): number {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export interface SceneProps {
  era: Era;
  buildings: Building[];
  levels: Record<string, number>;
  coins: number;
  lang: StudyLanguage;
  /** Persisted motion preference (CITY_VISUALS_MOTION.md §4) — `Scene` combines it with the
   * OS `prefers-reduced-motion` signal itself, so callers only ever pass the raw setting. */
  cityMotion?: MotionTier;
}

/**
 * The stage (CITY_VISUALS_SCENE.md, CITY_VISUALS_TECH.md §1/§4). Renders from `era`,
 * `buildings`, `levels` and `coins` alone — no store subscriptions of its own — so it is
 * trivially testable and only re-renders when one of those actually changes.
 */
export default function Scene({
  era: incomingEra,
  buildings: incomingBuildings,
  levels,
  coins,
  lang,
  cityMotion = 'full',
}: SceneProps) {
  // Era cross-fade (CITY_VISUALS_TECH.md §3): the scene keeps rendering the era it already
  // has art for until the next era's chunk resolves, then swaps both at once and replays
  // `era-fade`. Switching tabs therefore never flashes an island with nothing standing on
  // it. `fadeKey` remounts the scene's contents so the animation restarts on every swap.
  const [shown, setShown] = useState(() => ({
    era: incomingEra,
    buildings: incomingBuildings,
    art: peekEraArt(incomingEra.id),
    fadeKey: 0,
  }));

  useEffect(() => {
    if (incomingEra.id === shown.era.id) {
      // Same era — a purchase changed the building list, so follow it without a fade. This
      // also covers the very first render: `shown.art` was seeded from whatever `peekEraArt`
      // had *already* resolved at mount time (usually nothing yet), so the initial era's art
      // still needs a real load below rather than being treated as done just because its id
      // hasn't changed.
      if (incomingBuildings !== shown.buildings) {
        setShown((s) => ({ ...s, era: incomingEra, buildings: incomingBuildings }));
      }
      if (shown.art || !hasEraArt(shown.era.id)) return;
    }
    const ready = peekEraArt(incomingEra.id);
    if (ready || !hasEraArt(incomingEra.id)) {
      setShown((s) => ({
        era: incomingEra,
        buildings: incomingBuildings,
        art: ready,
        fadeKey: s.fadeKey + 1,
      }));
      return;
    }
    let active = true;
    loadEraArt(incomingEra.id).then((loaded) => {
      if (!active) return;
      setShown((s) => ({
        era: incomingEra,
        buildings: incomingBuildings,
        art: loaded,
        fadeKey: s.fadeKey + 1,
      }));
    });
    return () => {
      active = false;
    };
  }, [incomingEra, incomingBuildings, shown.era.id, shown.buildings, shown.art]);

  const { era, buildings, art } = shown;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tappedKey, setTappedKey] = useState<{ id: string; key: number } | null>(null);
  const isDark = useIsDarkMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportWidth = useViewportWidth();
  const tier = resolveMotionTier(cityMotion, prefersReducedMotion);

  // A building that just gained a level rises into place (SPEC §11.6) — a reaction, so it
  // runs at `calm` too and only `off` drops it. `risingUntil` keeps the class on for the
  // animation's whole length: re-renders during it (hover, agents) must not cut it short.
  // Switching era leaves `levels` untouched, so a tab change never replays it.
  const riseBaselineRef = useRef(levels);
  const risingUntilRef = useRef(new Map<string, number>());
  const now = Date.now();
  if (tier !== 'off') {
    for (const [id, level] of Object.entries(levels)) {
      if (level > (riseBaselineRef.current[id] ?? 0) && !risingUntilRef.current.has(id)) {
        risingUntilRef.current.set(id, now + RISE_MS);
      }
    }
  }
  useEffect(() => {
    riseBaselineRef.current = levels;
    const timer = setTimeout(() => risingUntilRef.current.clear(), RISE_MS);
    return () => clearTimeout(timer);
  }, [levels]);
  const isRising = (id: string) => (risingUntilRef.current.get(id) ?? 0) > now;
  const figures = peekEraFigures(era.id);

  // Footprint has three possible sources, in precedence order: the content record (once the
  // CITY_VISUALS_TECH.md §2 migration lands), the era's art (which is the authority today —
  // a 2x2 landmark placed as 1x1 would overlap its neighbours), then a single cell. Art is
  // a dependency because placement has to be redone when the era's chunk resolves.
  const placements = useMemo(
    () =>
      assignCells(
        buildings.map((b) => ({
          id: b.id,
          position: b.position,
          cell: b.cell,
          footprint: b.footprint ?? art?.[b.id]?.footprint,
        })),
      ),
    [buildings, art],
  );

  const light = LIGHT_THEMES[era.id] ?? LIGHT_THEMES.tribe;
  const dark = DARK_THEMES[era.id] ?? DARK_THEMES.tribe;
  const themeVars = useMemo(() => themeCssVars(light, dark), [light, dark]);
  const theme = isDark ? dark : light;
  const activeMaterial = theme.material;
  const clothing = theme.clothing;

  const sorted = useMemo(
    () => [...buildings].sort((a, b) => compareDepth(placements.get(a.id)!.cell, placements.get(b.id)!.cell)),
    [buildings, placements],
  );

  const plotInstances: PlotInstance[] = [];
  const buildingInstances: BuildingInstance[] = [];
  const hitTargets: HitTarget[] = [];
  const builtCells: GridCell[] = [];
  let ownedBuildings = 0;
  let totalLevels = 0;

  // Ambient budget (CITY_VISUALS_LIFE.md §7 / CITY_VISUALS_MOTION.md §5): every built building
  // contributes its art's `ambient` list; the era contributes its own on top. Sorted and
  // truncated once here, then handed to whichever layer draws each kind.
  const ambientSources = sorted
    .filter((b) => (levels[b.id] ?? 0) > 0)
    .map((b) => ({ buildingId: b.id, emitters: art?.[b.id]?.ambient ?? [] }));
  const selectedAmbient = useMemo(
    () => selectAmbientEmitters(ambientSources, theme.ambient.emitters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ambientSources is a fresh array every render; keyed by its content instead
    [JSON.stringify(ambientSources), theme.ambient.emitters.join(',')],
  );
  const ambientByBuilding = new Map<string, AmbientEmitter[]>();
  let weatherKind: AmbientInstance | undefined;
  for (const instance of selectedAmbient) {
    if (instance.buildingId) {
      const list = ambientByBuilding.get(instance.buildingId) ?? [];
      list.push(instance.type);
      ambientByBuilding.set(instance.buildingId, list);
    } else if (instance.type === 'snow' || instance.type === 'pollen' || instance.type === 'rain') {
      weatherKind = instance;
    }
  }

  for (const b of sorted) {
    const placement = placements.get(b.id)!;
    const level = levels[b.id] ?? 0;
    const name = resolveLocalized(b.name, lang);
    // "<name> — level n of m" (CITY_VISUALS_BUILDINGS.md §7) — always English: this is a new
    // accessibility string with no i18n key yet, and the map's a11y contract is the hit
    // layer's label, not the localized card copy underneath it.
    const label = `${name} — level ${level} of ${b.maxLevel}`;
    hitTargets.push({ id: b.id, cell: placement.cell, footprint: placement.footprint, label });

    if (level > 0) {
      builtCells.push(placement.cell);
      ownedBuildings += 1;
      totalLevels += level;
      buildingInstances.push({
        id: b.id,
        cell: placement.cell,
        footprint: placement.footprint,
        level,
        maxLevel: b.maxLevel,
        icon: iconFor(b.id),
        art: art?.[b.id],
        isHovered: hoveredId === b.id,
        rising: isRising(b.id),
        ambient: ambientByBuilding.get(b.id),
      });
    } else {
      const missingRequirement = b.requires.some((reqId) => (levels[reqId] ?? 0) < 1);
      const cost = buildingCostAt(b, level);
      plotInstances.push({
        id: b.id,
        cell: placement.cell,
        footprint: placement.footprint,
        locked: missingRequirement,
        affordable: !missingRequirement && coins >= cost,
      });
    }
  }

  // -- Agents (CITY_VISUALS_LIFE.md §3-5, Phase 4) ---------------------------------------
  const containerRef = useRef<HTMLDivElement>(null);
  const graph = useMemo(() => buildPathGraph(builtCells), [JSON.stringify(builtCells)]);
  const population = computePopulation(ownedBuildings, totalLevels, viewportWidth, prefersReducedMotion);

  // The simulation lives outside React state (CITY_VISUALS_TECH.md §4): one seeded rng, one
  // citizen array and one worker queue per era, held in a ref and mutated in place by the
  // clock. Rebuilt only when the era or the walkable graph actually changes shape.
  const simRef = useRef<{ rng: () => number; citizens: CitizenState[]; workers: WorkerQueueState; nextId: number }>({
    rng: makeAgentRng(1),
    citizens: [],
    workers: emptyWorkerQueue(),
    nextId: 0,
  });
  const graphKey = graph.edges.map(([a, b]) => `${a.q},${a.r}-${b.q},${b.r}`).join('|');
  useEffect(() => {
    const sim = { rng: makeAgentRng(era.id.length * 7919 + 1), citizens: [] as CitizenState[], workers: emptyWorkerQueue(), nextId: 0 };
    for (let i = 0; i < population; i += 1) {
      sim.citizens.push(spawnCitizen(sim.nextId, graph, sim.rng, false));
      sim.nextId += 1;
    }
    simRef.current = sim;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- population/graph identity changes are the intended trigger
  }, [era.id, graphKey]);

  // Growing the population (more buildings/levels bought) fades new citizens in rather than
  // resizing the array outright (LIFE.md §4) — shrinking (a rare case: narrower viewport) just
  // drops the newest ones.
  useEffect(() => {
    const sim = simRef.current;
    while (sim.citizens.length < population) {
      sim.citizens.push(spawnCitizen(sim.nextId, graph, sim.rng, true));
      sim.nextId += 1;
    }
    if (sim.citizens.length > population) sim.citizens.length = population;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [population]);

  // A building crossing from level N to N+1 gets a worker (LIFE.md §5). Tracked by a ref
  // rather than effect deps so a re-render that changes nothing about levels never re-fires it.
  const prevLevelsRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const prev = prevLevelsRef.current;
    for (const b of buildings) {
      const before = prev[b.id] ?? 0;
      const nowLevel = levels[b.id] ?? 0;
      if (nowLevel > before) simRef.current.workers = requestWorker(simRef.current.workers, b.id);
    }
    prevLevelsRef.current = { ...levels };
  }, [buildings, levels]);

  const agentsHandleRef = useRef<AgentsHandle>(null);
  const vesselsHandleRef = useRef<VesselsHandle>(null);
  // Throttle for the walk-cycle's React-state phase swap (see AgentsHandle.setPhases) — the
  // frame is redrawn only a few times a second, off the same clock, never every 30fps tick.
  const phaseThrottleRef = useRef(0);

  const onTick = useCallback(
    (dtSeconds: number) => {
      const sim = simRef.current;
      sim.citizens = stepAgents(sim.citizens, dtSeconds, graph, sim.rng);
      sim.workers = stepWorkerQueue(sim.workers, dtSeconds * 1000);

      const visuals: AgentVisual[] = sim.citizens.map((c) => {
        const pos = citizenPosition(c);
        return {
          x: pos.x,
          y: pos.y,
          phase: c.phase,
          opacity: c.fade,
          body: clothing?.body ?? '#8A7A63',
          head: clothing?.head ?? '#C9A876',
          accent: clothing?.accent ?? '#4A3F31',
          kind: 'citizen',
        };
      });
      agentsHandleRef.current?.sync(visuals);
      vesselsHandleRef.current?.tick(dtSeconds);

      phaseThrottleRef.current += dtSeconds;
      if (phaseThrottleRef.current >= 0.32) {
        phaseThrottleRef.current = 0;
        agentsHandleRef.current?.setPhases(sim.citizens.map((c) => c.phase));
      }
    },
    [graph, clothing],
  );

  const ambientActive = useSceneClock(containerRef, tier, onTick) && ambientEnabled(tier);

  // Initial (pre-tick) agent frame, so the very first paint already shows the population
  // spread across the graph instead of stacked at the hub for one frame.
  const initialAgentVisuals: AgentVisual[] = simRef.current.citizens.map((c) => {
    const pos = citizenPosition(c);
    return {
      x: pos.x,
      y: pos.y,
      phase: c.phase,
      opacity: c.fade,
      body: clothing?.body ?? '#8A7A63',
      head: clothing?.head ?? '#C9A876',
      accent: clothing?.accent ?? '#4A3F31',
      kind: 'citizen',
    };
  });

  // Vessels only sail once the era has a boat figure AND its harbour-class building is
  // built (CITY_VISUALS_LIFE.md §6) — before that the water is empty, which is itself
  // information. The art declares which building that is; nothing here guesses from ids.
  const hasHarbour = buildings.some((b) => (levels[b.id] ?? 0) > 0 && art?.[b.id]?.harbour === true);
  const vesselRoutes: VesselRoute[] = useMemo(() => {
    if (!hasHarbour || !figures?.boat) return [];
    // The route is a shallow ellipse in the *far* water, between the horizon and the island's
    // back shore: this layer draws behind the terrain, so a boat crossing the front of the
    // ellipse slips behind the island and back out the other side, which reads as sailing
    // around it. A route in the foreground water would be swallowed by the island instead.
    return [
      { cx: 600, cy: WATER_LINE + 58, rx: 470, ry: 26, lapSeconds: 34, phase: 0, hull: theme.material.timber, sail: theme.material.wall },
    ];
  }, [hasHarbour, figures?.boat, theme.material.timber, theme.material.wall]);

  return (
    <div
      ref={containerRef}
      className="city-scene relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-granite/15 dark:border-white/10"
      style={themeVars as React.CSSProperties}
    >
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        // Deliberately NOT role="img": that flattens the subtree for assistive tech, which
        // would hide the hit layer's focusable building targets. A labelled group keeps both
        // the scene's name and its buttons reachable (CITY_VISUALS_TECH.md §6).
        role="group"
        aria-label={resolveLocalized(era.name, lang)}
      >
        <g key={shown.fadeKey} className="era-fade">
        <Sky theme={theme} eraId={era.id} active={ambientActive} />
        <Horizon />
        <Water active={ambientActive} />
        <Vessels ref={vesselsHandleRef} routes={vesselRoutes} figures={figures} />
        <Terrain builtCells={builtCells} />
        <Plots plots={plotInstances} ambientActive={ambientActive} />
        <Buildings instances={buildingInstances} material={activeMaterial} ambientActive={ambientActive} />
        <Agents ref={agentsHandleRef} initial={initialAgentVisuals} figures={figures} />
        <Props active={ambientActive} />
        <Weather
          kind={weatherKind?.type === 'snow' || weatherKind?.type === 'pollen' || weatherKind?.type === 'rain' ? weatherKind.type : undefined}
          active={ambientActive}
        />
        <HitLayer
          targets={hitTargets}
          hoveredId={hoveredId}
          tappedKey={tappedKey}
          onHover={setHoveredId}
          onActivate={(id) => {
            setTappedKey({ id, key: Date.now() });
            scrollToBuilding(id);
          }}
        />
        </g>
      </svg>
      <DevOverlay
        era={era}
        placements={placements}
        builtCells={builtCells}
        agentCount={simRef.current.citizens.length}
        motionTier={tier}
      />
    </div>
  );
}
