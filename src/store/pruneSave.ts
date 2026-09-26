import {
  getAchievements,
  getAllQuestionIds,
  getBuilding,
  getDialogue,
  getHistoryCards,
  getLesson,
} from '@/content/registry';
import type { SaveFile } from './persist';

/**
 * Drops every id the current content no longer knows — lessons, SRS items, buildings,
 * history cards, dialogues and achievements. Content ids change when lessons are renamed, moved or
 * removed; a save keeps the old ids forever otherwise, and they would inflate counts
 * (achievements, review deck size) while pointing at nothing. Run on every save that
 * enters the store: localStorage, an imported file, a cloud copy.
 */
export function pruneUnknownIds(save: SaveFile): SaveFile {
  const questionIds = getAllQuestionIds();
  const historyIds = new Set(getHistoryCards().map((c) => c.id));

  const lessons: SaveFile['lessons'] = {};
  for (const [id, progress] of Object.entries(save.lessons)) {
    if (!getLesson(id)) continue;
    lessons[id] = {
      ...progress,
      lastRunQuestionIds: (progress.lastRunQuestionIds ?? []).filter((q) => questionIds.has(q)),
    };
  }

  const items: SaveFile['items'] = {};
  for (const [id, item] of Object.entries(save.items)) {
    if (questionIds.has(id)) items[id] = item;
  }

  const buildings: SaveFile['city']['buildings'] = {};
  for (const [id, building] of Object.entries(save.city.buildings)) {
    if (getBuilding(id)) buildings[id] = building;
  }

  const achievementIds = new Set(getAchievements().map((a) => a.id));
  const unlocked: SaveFile['achievements']['unlocked'] = {};
  for (const [id, entry] of Object.entries(save.achievements.unlocked)) {
    if (achievementIds.has(id)) unlocked[id] = entry;
  }

  return {
    ...save,
    lessons,
    items,
    city: { ...save.city, buildings },
    historyRead: save.historyRead.filter((id) => historyIds.has(id)),
    dialoguesRead: save.dialoguesRead.filter((id) => Boolean(getDialogue(id))),
    achievements: { ...save.achievements, unlocked },
  };
}
