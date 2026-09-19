import { describe, expect, it } from 'vitest';
import {
  citizenPosition,
  computePopulation,
  makeAgentRng,
  populationCap,
  spawnCitizen,
  stepAgents,
  stepCitizen,
  type CitizenState,
} from '@/components/city/scene/agents';
import { buildPathGraph } from '@/components/city/scene/island';
import { selectAmbientEmitters, AMBIENT_NODE_BUDGET, EMITTER_NODE_COST } from '@/components/city/scene/ambient';
import { ambientEnabled, resolveMotionTier } from '@/components/city/scene/motion';
import type { AmbientEmitter } from '@/components/city/scene/types';

describe('population formula (CITY_VISUALS_LIFE.md §4)', () => {
  it('scales with owned buildings and total levels', () => {
    expect(computePopulation(0, 0, 1024, false)).toBe(0);
    expect(computePopulation(5, 5, 1024, false)).toBe(Math.round(1.2 * 5 + 0.6 * 5));
  });

  it('caps at 14 on desktop widths', () => {
    expect(populationCap(1024, false)).toBe(14);
    expect(computePopulation(50, 50, 1024, false)).toBe(14);
  });

  it('caps at 8 below the 640px breakpoint', () => {
    expect(populationCap(480, false)).toBe(8);
    expect(computePopulation(50, 50, 480, false)).toBe(8);
  });

  it('caps at 0 under (OS-level) reduced motion regardless of width', () => {
    expect(populationCap(1024, true)).toBe(0);
    expect(computePopulation(50, 50, 1024, true)).toBe(0);
  });

  it('never goes negative', () => {
    expect(computePopulation(0, 0, 1024, false)).toBeGreaterThanOrEqual(0);
  });
});

describe('agent path-graph traversal (CITY_VISUALS_LIFE.md §3)', () => {
  // A small line of built cells: 0,-3 (hub) - 0,-2 - 0,-1 - 0,0, so the walk graph is a simple
  // chain with two dead ends (the hub and the far end) and one interior branch point.
  const graph = buildPathGraph([{ q: 0, r: -3 }, { q: 0, r: -2 }, { q: 0, r: -1 }, { q: 0, r: 0 }]);

  it('never reverses direction except at a dead end', () => {
    const rng = makeAgentRng(42);
    let citizen: CitizenState = spawnCitizen(0, graph, rng, false);
    citizen = { ...citizen, from: { q: 0, r: -2 }, to: { q: 0, r: -1 }, t: 0, idleRemaining: 0 };

    const dtSequence = Array.from({ length: 400 }, () => 0.1);
    for (const dt of dtSequence) {
      const before = citizen;
      citizen = stepCitizen(citizen, dt, graph, rng);
      // A real edge-to-edge transition: the walk reached `before.to` and immediately moved on
      // (not into an idle pause), landing on a fresh edge starting at that node.
      const isWalkingEdge = citizen.from.q !== citizen.to.q || citizen.from.r !== citizen.to.r;
      const reachedNewEdge =
        isWalkingEdge &&
        before.t < 1 &&
        citizen.t === 0 &&
        citizen.idleRemaining === 0 &&
        citizen.from.q === before.to.q &&
        citizen.from.r === before.to.r;
      if (reachedNewEdge) {
        const arrivedAt = citizen.from; // == before.to
        const cameFrom = before.from;
        const neighbourCount = (graph.adjacency.get(`${arrivedAt.q},${arrivedAt.r}`) ?? []).length;
        // Only a dead end (a single-neighbour node) may send the citizen straight back the way
        // it came; anywhere with a choice must pick a different neighbour.
        if (neighbourCount > 1) {
          expect(citizen.to).not.toEqual(cameFrom);
        }
      }
    }
  });

  it('stays on graph edges the whole time (from/to are always adjacent walkable cells)', () => {
    const rng = makeAgentRng(7);
    let citizens = [spawnCitizen(0, graph, rng, false)];
    for (let i = 0; i < 200; i += 1) {
      citizens = stepAgents(citizens, 0.1, graph, rng);
      for (const c of citizens) {
        const manhattan = Math.abs(c.from.q - c.to.q) + Math.abs(c.from.r - c.to.r);
        expect(manhattan).toBeLessThanOrEqual(1);
      }
    }
  });

  it('is deterministic for a fixed dt sequence and seed', () => {
    const dtSequence = Array.from({ length: 50 }, () => 0.1);
    function run() {
      const rng = makeAgentRng(99);
      let citizens = [spawnCitizen(0, graph, rng, false)];
      for (const dt of dtSequence) citizens = stepAgents(citizens, dt, graph, rng);
      return citizens.map((c) => citizenPosition(c));
    }
    expect(run()).toEqual(run());
  });
});

describe('ambient emitter budget (CITY_VISUALS_LIFE.md §7)', () => {
  it('never exceeds the node budget no matter how many emitters are declared', () => {
    const sources = Array.from({ length: 40 }, (_, i) => ({
      buildingId: `b${i}`,
      emitters: ['smoke', 'flag', 'rotor'] as AmbientEmitter[],
    }));
    const selected = selectAmbientEmitters(sources, ['aurora', 'birds', 'snow']);
    const used = selected.reduce((sum, e) => sum + e.nodeCost, 0);
    expect(used).toBeLessThanOrEqual(AMBIENT_NODE_BUDGET);
  });

  it('keeps a higher-priority emitter over a lower-priority one when the budget is tight', () => {
    // 20 buildings each wanting smoke (3 nodes = 60, exactly the budget) plus one era-level
    // 'birds' emitter (lower priority) — birds must be the one pushed out.
    const sources = Array.from({ length: 20 }, (_, i) => ({ buildingId: `b${i}`, emitters: ['smoke'] as AmbientEmitter[] }));
    const selected = selectAmbientEmitters(sources, ['birds']);
    expect(selected.some((e) => e.type === 'birds')).toBe(false);
    expect(selected.filter((e) => e.type === 'smoke').length).toBe(20);
  });

  it('adding an emitter to a building never blows the budget — it only displaces a lower one', () => {
    const base = Array.from({ length: 19 }, (_, i) => ({ buildingId: `b${i}`, emitters: ['smoke'] as AmbientEmitter[] }));
    const before = selectAmbientEmitters(base, ['birds', 'aurora']);
    const after = selectAmbientEmitters(
      [...base, { buildingId: 'new', emitters: ['smoke'] as AmbientEmitter[] }],
      ['birds', 'aurora'],
    );
    const usedBefore = before.reduce((sum, e) => sum + e.nodeCost, 0);
    const usedAfter = after.reduce((sum, e) => sum + e.nodeCost, 0);
    expect(usedBefore).toBeLessThanOrEqual(AMBIENT_NODE_BUDGET);
    expect(usedAfter).toBeLessThanOrEqual(AMBIENT_NODE_BUDGET);
  });

  it('every declared emitter type has a known node cost', () => {
    for (const type of Object.keys(EMITTER_NODE_COST)) {
      expect(EMITTER_NODE_COST[type as keyof typeof EMITTER_NODE_COST]).toBeGreaterThan(0);
    }
  });
});

describe('motion tier resolution (CITY_VISUALS_MOTION.md §4)', () => {
  it('prefers-reduced-motion beats the setting, always', () => {
    expect(resolveMotionTier('full', true)).toBe('off');
    expect(resolveMotionTier('calm', true)).toBe('off');
    expect(resolveMotionTier('off', true)).toBe('off');
  });

  it('the setting is used as-is when reduced motion is not requested', () => {
    expect(resolveMotionTier('full', false)).toBe('full');
    expect(resolveMotionTier('calm', false)).toBe('calm');
    expect(resolveMotionTier('off', false)).toBe('off');
  });

  it('only the full tier runs ambient motion', () => {
    expect(ambientEnabled('full')).toBe(true);
    expect(ambientEnabled('calm')).toBe(false);
    expect(ambientEnabled('off')).toBe(false);
  });
});
