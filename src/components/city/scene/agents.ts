import type { GridCell } from './types';
import type { PathGraph } from './island';
import { cellKey, toScreen, type ScreenPoint } from './iso';
import { makeSeededRandom } from './wobble';

/**
 * The citizen/worker simulation (CITY_VISUALS_LIFE.md §3-5). Pure state + a pure step
 * function — no DOM, no rAF, no `Math.random()` at tick time. `useSceneClock` calls `stepAgents`
 * once per frame and the scene layer applies the result to refs (CITY_VISUALS_TECH.md §4): the
 * simulation itself never touches React or the DOM, which is what makes it testable without a
 * browser and cheap to run at 30 fps.
 */

export type WalkPhase = 0 | 1;

const WALK_SPEED_MIN = 14; // world units / s (CITY_VISUALS_LIFE.md §3)
const WALK_SPEED_MAX = 22;
const PHASE_FLIP_MS = 320; // the 2-frame woodcut cycle (LIFE.md §2)
const IDLE_CHANCE = 0.2;
const IDLE_MIN_MS = 1000;
const IDLE_MAX_MS = 2000; // 1-3s total once IDLE_MIN_MS is added
const FADE_IN_MS = 600; // population growth fades in rather than popping (LIFE.md §4)
const WORKER_DURATION_MS = 6000; // LIFE.md §5
const WORKER_PHASE_MS = 500;
const MAX_ACTIVE_WORKERS = 2;

export interface CitizenState {
  id: number;
  from: GridCell;
  to: GridCell;
  /** Progress from `from` to `to`, 0..1. */
  t: number;
  speed: number;
  phase: WalkPhase;
  phaseElapsed: number;
  /** > 0 while idling at `from` (== `to`); counts down to 0. */
  idleRemaining: number;
  /** 0..1 fade-in opacity; reaches 1 after `FADE_IN_MS`. */
  fade: number;
  /** Set while the citizen has run off to a building that was just built or upgraded. */
  rally?: RallyState;
}

// ---------------------------------------------------------------------------
// Rally: a purchase draws the town (CITY_VISUALS_LIFE.md §5a)
// ---------------------------------------------------------------------------

const RALLY_RUN_SPEED = 110; // world units / s — a run, several times the stroll
const RALLY_RUN_MIN_S = 0.5;
const RALLY_RUN_MAX_S = 2;
const RALLY_ACT_MS = 4000;
const RALLY_ACT_JITTER_MS = 1200; // so they drift home one by one, not as a block
const RALLY_BUILDERS = 2;
const RUN_PHASE_MS = 140;
const SWING_PHASE_MS = 250;
const HOP_HEIGHT = 7;
const HOP_HZ = 1.8;

export type RallyRole = 'build' | 'cheer';

export interface RallyState {
  role: RallyRole;
  /** Running there, working or cheering on the spot, running back. */
  stage: 'go' | 'act' | 'back';
  from: ScreenPoint;
  to: ScreenPoint;
  /** Where on its path the citizen was — the walk resumes from here afterwards. */
  home: ScreenPoint;
  /** Run progress 0..1 over `runSeconds`. */
  t: number;
  runSeconds: number;
  /** Time spent in the `act` stage, and how long that stage lasts for this citizen. */
  elapsed: number;
  actMs: number;
}

function runSeconds(a: ScreenPoint, b: ScreenPoint): number {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return Math.max(RALLY_RUN_MIN_S, Math.min(RALLY_RUN_MAX_S, d / RALLY_RUN_SPEED));
}

/**
 * Sends every citizen running to the building at `center`: the nearest `RALLY_BUILDERS` get
 * to work on it, the rest gather in an arc in front and cheer. `radius` is the footprint's
 * half-size in world units, so a landmark draws a wider crowd than a hut. Citizens already
 * mid-rally simply turn towards the new building.
 */
export function rallyCitizens(
  citizens: CitizenState[],
  center: ScreenPoint,
  radius: { x: number; y: number },
  rng: () => number,
): CitizenState[] {
  const byDistance = citizens
    .map((c, i) => {
      const p = citizenPosition(c);
      return { i, d: Math.hypot(p.x - center.x, p.y - center.y) };
    })
    .sort((a, b) => a.d - b.d)
    .map((e) => e.i);
  const builders = new Set(byDistance.slice(0, RALLY_BUILDERS));
  const crowd = byDistance.filter((i) => !builders.has(i));

  const spot = (i: number): ScreenPoint => {
    if (builders.has(i)) {
      // Close in at the front corners, one each side.
      const side = byDistance.indexOf(i) === 0 ? -1 : 1;
      return { x: center.x + side * radius.x * 0.55, y: center.y + radius.y * 0.45 };
    }
    // The crowd fans out along the front half of an ellipse round the footprint.
    const k = crowd.indexOf(i);
    const angle = Math.PI * (0.12 + (0.76 * (k + 0.5)) / Math.max(1, crowd.length));
    const reach = 1.25 + rng() * 0.25;
    return {
      x: center.x + Math.cos(angle) * radius.x * reach,
      y: center.y + Math.sin(angle) * radius.y * reach,
    };
  };

  return citizens.map((c, i) => {
    const from = citizenPosition(c);
    const to = spot(i);
    return {
      ...c,
      rally: {
        role: builders.has(i) ? 'build' : 'cheer',
        stage: 'go',
        from,
        to,
        home: pathPosition(c),
        t: 0,
        runSeconds: runSeconds(from, to),
        elapsed: 0,
        actMs: RALLY_ACT_MS + rng() * RALLY_ACT_JITTER_MS,
      },
    };
  });
}

function stepRally(citizen: CitizenState, rally: RallyState, dtMs: number, fade: number): CitizenState {
  let { phase, phaseElapsed } = citizen;
  const flipEvery = rally.stage === 'act' ? SWING_PHASE_MS : RUN_PHASE_MS;
  phaseElapsed += dtMs;
  if (phaseElapsed >= flipEvery) {
    phaseElapsed -= flipEvery;
    phase = phase === 0 ? 1 : 0;
  }

  if (rally.stage === 'act') {
    const elapsed = rally.elapsed + dtMs;
    if (elapsed < rally.actMs) return { ...citizen, phase, phaseElapsed, fade, rally: { ...rally, elapsed } };
    const back = { ...rally, stage: 'back' as const, from: rally.to, to: rally.home, t: 0, runSeconds: runSeconds(rally.to, rally.home) };
    return { ...citizen, phase, phaseElapsed, fade, rally: back };
  }

  const t = rally.t + dtMs / 1000 / rally.runSeconds;
  if (t < 1) return { ...citizen, phase, phaseElapsed, fade, rally: { ...rally, t } };
  if (rally.stage === 'back') return { ...citizen, phase, phaseElapsed, fade, rally: undefined };
  return { ...citizen, phase, phaseElapsed, fade, rally: { ...rally, stage: 'act', t: 1, elapsed: 0 } };
}

/** A worker mid-job at a building's `workSpot`, before it walks off and becomes a citizen. */
export interface WorkerState {
  buildingId: string;
  elapsed: number;
  phase: WalkPhase;
  phaseElapsed: number;
}

export interface WorkerQueueState {
  active: WorkerState[];
  pending: string[];
}

export function emptyWorkerQueue(): WorkerQueueState {
  return { active: [], pending: [] };
}

/** Queues a worker for `buildingId` — called once when a building is bought or upgraded. */
export function requestWorker(state: WorkerQueueState, buildingId: string): WorkerQueueState {
  return { active: state.active, pending: [...state.pending, buildingId] };
}

/**
 * Advances the worker queue by `dtMs`: ages active workers off after `WORKER_DURATION_MS`,
 * then promotes queued buildings into the freed slots (LIFE.md §5's "at most 2 workers at
 * once; further purchases queue behind them").
 */
export function stepWorkerQueue(state: WorkerQueueState, dtMs: number): WorkerQueueState {
  const active: WorkerState[] = [];
  for (const worker of state.active) {
    if (worker.elapsed + dtMs >= WORKER_DURATION_MS) continue; // finished — walks off, becomes a citizen
    let phaseElapsed = worker.phaseElapsed + dtMs;
    let phase = worker.phase;
    if (phaseElapsed >= WORKER_PHASE_MS) {
      phaseElapsed -= WORKER_PHASE_MS;
      phase = phase === 0 ? 1 : 0;
    }
    active.push({ buildingId: worker.buildingId, elapsed: worker.elapsed + dtMs, phase, phaseElapsed });
  }
  const pending = [...state.pending];
  while (active.length < MAX_ACTIVE_WORKERS && pending.length > 0) {
    active.push({ buildingId: pending.shift()!, elapsed: 0, phase: 0, phaseElapsed: 0 });
  }
  return { active, pending };
}

// ---------------------------------------------------------------------------
// Population (CITY_VISUALS_LIFE.md §4)
// ---------------------------------------------------------------------------

const DESKTOP_CAP = 14;
const NARROW_CAP = 8;
const NARROW_BREAKPOINT = 640;

export function populationCap(viewportWidth: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return viewportWidth < NARROW_BREAKPOINT ? NARROW_CAP : DESKTOP_CAP;
}

export function computePopulation(
  ownedBuildings: number,
  totalLevels: number,
  viewportWidth: number,
  reducedMotion: boolean,
): number {
  const cap = populationCap(viewportWidth, reducedMotion);
  const raw = Math.round(1.2 * ownedBuildings + 0.6 * totalLevels);
  return Math.max(0, Math.min(cap, raw));
}

// ---------------------------------------------------------------------------
// Path-graph walk (CITY_VISUALS_LIFE.md §3)
// ---------------------------------------------------------------------------

function edgeLength(a: GridCell, b: GridCell): number {
  const pa = toScreen(a);
  const pb = toScreen(b);
  return Math.hypot(pb.x - pa.x, pb.y - pa.y) || 1;
}

/** Every neighbour of `to` in the graph, excluding the node just arrived from unless it is a dead end. */
function nextCandidates(graph: PathGraph, from: GridCell, to: GridCell): GridCell[] {
  const neighbours = graph.adjacency.get(cellKey(to)) ?? [];
  const withoutBacktrack = neighbours.filter((n) => cellKey(n) !== cellKey(from));
  return withoutBacktrack.length > 0 ? withoutBacktrack : neighbours;
}

/** Builds one citizen at a random point on the graph, for population growth or initial spawn. */
export function spawnCitizen(id: number, graph: PathGraph, rng: () => number, fadeIn: boolean): CitizenState {
  const nodes = [...graph.adjacency.keys()];
  const fromKey = nodes.length > 0 ? nodes[Math.floor(rng() * nodes.length)] : '0,0';
  const [fq, fr] = fromKey.split(',').map(Number);
  const from: GridCell = { q: fq, r: fr };
  const candidates = graph.adjacency.get(fromKey) ?? [from];
  const to = candidates[Math.floor(rng() * candidates.length)] ?? from;
  return {
    id,
    from,
    to,
    t: 0,
    speed: WALK_SPEED_MIN + rng() * (WALK_SPEED_MAX - WALK_SPEED_MIN),
    phase: 0,
    phaseElapsed: 0,
    idleRemaining: 0,
    fade: fadeIn ? 0 : 1,
  };
}

/**
 * Advances one citizen by `dtSeconds`. Deterministic given `rng` — callers seed it once per
 * scene (never per tick) so a fixed `dt` sequence always produces the same walk, which is what
 * makes this testable without a browser.
 */
export function stepCitizen(citizen: CitizenState, dtSeconds: number, graph: PathGraph, rng: () => number): CitizenState {
  const dtMs = dtSeconds * 1000;
  const fade = Math.min(1, citizen.fade + dtMs / FADE_IN_MS);

  // A rally pauses the path walk; it picks up exactly where it left off afterwards.
  if (citizen.rally) return stepRally(citizen, citizen.rally, dtMs, fade);

  if (citizen.idleRemaining > 0) {
    const idleRemaining = Math.max(0, citizen.idleRemaining - dtMs);
    return { ...citizen, idleRemaining, fade };
  }

  let phase = citizen.phase;
  let phaseElapsed = citizen.phaseElapsed + dtMs;
  if (phaseElapsed >= PHASE_FLIP_MS) {
    phaseElapsed -= PHASE_FLIP_MS;
    phase = phase === 0 ? 1 : 0;
  }

  const length = edgeLength(citizen.from, citizen.to);
  let t = citizen.t + (citizen.speed * dtSeconds) / length;

  if (t < 1) {
    return { ...citizen, t, phase, phaseElapsed, fade };
  }

  // Arrived at `to` — decide whether to idle here or continue onto a new edge.
  const arrivedAt = citizen.to;
  if (rng() < IDLE_CHANCE) {
    return {
      ...citizen,
      from: arrivedAt,
      to: arrivedAt,
      t: 0,
      idleRemaining: IDLE_MIN_MS + rng() * IDLE_MAX_MS,
      phase,
      phaseElapsed,
      fade,
    };
  }
  const candidates = nextCandidates(graph, citizen.from, arrivedAt);
  const next = candidates[Math.floor(rng() * candidates.length)] ?? arrivedAt;
  return {
    ...citizen,
    from: arrivedAt,
    to: next,
    t: 0,
    phase,
    phaseElapsed,
    fade,
  };
}

export function stepAgents(
  citizens: CitizenState[],
  dtSeconds: number,
  graph: PathGraph,
  rng: () => number,
): CitizenState[] {
  return citizens.map((c) => stepCitizen(c, dtSeconds, graph, rng));
}

/** World-space position of a citizen along its current path edge, ignoring any rally. */
function pathPosition(citizen: CitizenState): ScreenPoint {
  const a = toScreen(citizen.from);
  const b = toScreen(citizen.to);
  return { x: a.x + (b.x - a.x) * citizen.t, y: a.y + (b.y - a.y) * citizen.t };
}

/**
 * How far above the ground a rallying citizen is drawn: cheerers hop, builders bob with each
 * swing of the tool. Pure function of the rally clock, so it needs no state of its own.
 */
function rallyLift(rally: RallyState, phase: WalkPhase): number {
  if (rally.stage !== 'act') return 0;
  if (rally.role === 'build') return phase === 1 ? -1.5 : 0;
  return -Math.abs(Math.sin((rally.elapsed / 1000) * Math.PI * HOP_HZ)) * HOP_HEIGHT;
}

/** World-space position of a citizen, for rendering — on its path, or wherever a rally took it. */
export function citizenPosition(citizen: CitizenState): ScreenPoint {
  const rally = citizen.rally;
  if (!rally) return pathPosition(citizen);
  // Ease in and out, so the run starts with a burst and slows as they arrive.
  const e = rally.t * rally.t * (3 - 2 * rally.t);
  return {
    x: rally.from.x + (rally.to.x - rally.from.x) * e,
    y: rally.from.y + (rally.to.y - rally.from.y) * e + rallyLift(rally, citizen.phase),
  };
}

/** Builders at work are drawn as the era's worker figure, tool in hand. */
export function citizenKind(citizen: CitizenState): 'citizen' | 'worker' {
  return citizen.rally?.role === 'build' && citizen.rally.stage === 'act' ? 'worker' : 'citizen';
}

export function isRallying(citizens: CitizenState[]): boolean {
  return citizens.some((c) => c.rally);
}

/** Deterministic per-scene RNG — one instance per mounted era, never re-seeded per tick. */
export function makeAgentRng(seed: number): () => number {
  return makeSeededRandom(seed);
}
