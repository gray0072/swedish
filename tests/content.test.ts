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
