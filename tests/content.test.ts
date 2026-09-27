import { describe, expect, it } from 'vitest';
import { getContentErrors, getAllLessons, getEras, getBuildings } from '@/content/registry';

describe('content registry', () => {
  it('loads without validation errors', () => {
    expect(getContentErrors()).toEqual([]);
  });

  it('has at least one lesson with a big enough question pool', () => {
    const lessons = getAllLessons();
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson.pool.length).toBeGreaterThanOrEqual(lesson.meta.quiz.questionsPerRun);
    }
  });

  it('every lesson id is <level>/<slug>, and every question id is <lesson id>/<local>', () => {
    const seen = new Set<string>();
    for (const lesson of getAllLessons()) {
      expect(lesson.meta.id).toBe(`${lesson.meta.levels[0]}/${lesson.meta.slug}`);
      for (const q of lesson.pool) {
        expect(q.id.startsWith(`${lesson.meta.id}/`), q.id).toBe(true);
        expect(seen.has(q.id), `duplicate question id ${q.id}`).toBe(false);
        seen.add(q.id);
      }
    }
  });

  it('every lesson fits the 5-minute rule', () => {
    for (const lesson of getAllLessons()) {
      expect(lesson.meta.estimatedMinutes).toBeLessThanOrEqual(5);
    }
  });

  it('defines at least 12 buildings across the first three eras', () => {
    const eras = getEras()
      .filter((e) => e.order <= 3)
      .map((e) => e.id);
    const count = getBuildings().filter((b) => eras.includes(b.era)).length;
    expect(count).toBeGreaterThanOrEqual(12);
  });
});

describe('findNextOpenLesson', () => {
  it('skips passed lessons, starts after the current one and wraps round', async () => {
    const { findNextOpenLesson, getLessonsInCurriculumOrder } = await import('@/content/registry');
    const ladder = getLessonsInCurriculumOrder();
    const [a, b, c] = ladder.map((l) => l.meta.id);
    expect(findNextOpenLesson(() => false)?.meta.id).toBe(a);
    expect(findNextOpenLesson((id) => id === a || id === b)?.meta.id).toBe(c);
    // After lesson c with b passed and a still open, "next" is the one after c, not a.
    expect(findNextOpenLesson((id) => id === b, c)?.meta.id).toBe(ladder[3].meta.id);
    // Everything after c passed: wraps back to the gap at a.
    const done = new Set(ladder.slice(1).map((l) => l.meta.id));
    expect(findNextOpenLesson((id) => done.has(id), c)?.meta.id).toBe(a);
  });
});
