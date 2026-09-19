import type { GridCell } from './types';
import type { PathGraph } from './island';
import { cellKey } from './iso';
import { toScreen } from './iso';
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

/** World-space position of a citizen along its current edge, for rendering. */
export function citizenPosition(citizen: CitizenState): { x: number; y: number } {
  const a = toScreen(citizen.from);
  const b = toScreen(citizen.to);
  return { x: a.x + (b.x - a.x) * citizen.t, y: a.y + (b.y - a.y) * citizen.t };
}

/** Deterministic per-scene RNG — one instance per mounted era, never re-seeded per tick. */
export function makeAgentRng(seed: number): () => number {
  return makeSeededRandom(seed);
}
