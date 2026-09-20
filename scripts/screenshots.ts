#!/usr/bin/env tsx
/**
 * Regenerates `docs/screenshots/` from the real app — `npm run screenshots`.
 *
 * The README's shots are documentation, so they have to come from the running app rather than
 * from a hand-built SVG: what ships is what is pictured. The script boots the Vite dev server,
 * seeds one throwaway save into `localStorage` (every era unlocked, every building at its level
 * cap, so each era's island is shown finished), drives the page with the already-installed
 * Chrome via playwright-core, and writes one PNG per era plus the page-level city shot.
 *
 * Nothing here touches a real save: the browser profile is a fresh temporary one every run.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright-core';
import { BUILDING_PRICES, ERA_UNLOCK_XP } from '../src/city/economy';

/**
 * `npm run screenshots` does everything; `-- city` or `-- eras` redoes only that half, which
 * matters because the citizens are mid-walk in every shot — re-running the whole set rewrites
 * ten PNGs that differ only in where the little figures happen to be standing.
 */
const only = process.argv[2] as 'city' | 'eras' | undefined;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'docs', 'screenshots');
const PORT = 5199;
const BASE = `http://localhost:${PORT}`;
/** README shots are 1200 wide at DPR 1 — keep every new one in that family. */
const VIEWPORT = { width: 1200, height: 1300 };

interface EraRecord {
  id: string;
  order: number;
  name: { sv: string; ru: string; en: string };
}

const eras: EraRecord[] = JSON.parse(readFileSync(join(root, 'content/city/eras.json'), 'utf8')).eras;
const buildings: { id: string }[] = JSON.parse(
  readFileSync(join(root, 'content/city/buildings.json'), 'utf8'),
).buildings;

/**
 * A finished city: every building at its cap, and enough XP to have unlocked the last era.
 * The wallet numbers are cosmetic — they only ever show up in the header bar of the shot.
 */
function demoSave() {
  const builtAt = '2025-01-01T09:00:00.000Z';
  const city: Record<string, { level: number; builtAt: string }> = {};
  for (const b of buildings) {
    const price = BUILDING_PRICES[b.id];
    if (!price) throw new Error(`screenshots: building "${b.id}" has no price entry`);
    city[b.id] = { level: price.maxLevel, builtAt };
  }
  return {
    version: 1,
    createdAt: builtAt,
    language: 'en',
    wallet: { xp: Math.max(...Object.values(ERA_UNLOCK_XP)) + 5_000, coins: 12_400 },
    streak: { current: 12, longest: 21, lastActiveDate: null, freezesAvailable: 2 },
    lessons: {},
    items: {},
    city: { buildings: city },
    historyRead: [],
    dialoguesRead: [],
    dailyIncomeClaimedOn: null,
    settings: { theme: 'light', sound: true, ttsRate: 0.95, ttsVoice: null, cityMotion: 'full' },
  };
}

/** Boots `vite dev` and resolves once it is actually serving. */
async function startServer() {
  const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: root,
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('screenshots: vite did not start in 60s')), 60_000);
    server.stdout.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('ready in') || chunk.toString().includes(String(PORT))) {
        clearTimeout(timer);
        resolve();
      }
    });
    server.on('exit', (code) => reject(new Error(`screenshots: vite exited with ${code}`)));
  });
  return server;
}

/** The scene mounts its era art from an async chunk and fades it in over 260 ms. */
async function settle(page: Page) {
  await page.waitForSelector('.city-scene svg');
  await page.waitForTimeout(700);
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ channel: 'chrome' });

  try {
    const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
    // Seed on the app's own origin, then load the city route with the save already in place.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    // zustand's persist wraps the save in { state, version } — seeding the bare save file
    // would be read back as an empty one and every island would come out unbuilt.
    await page.evaluate((stored) => {
      localStorage.setItem('swedish-app', JSON.stringify(stored));
    }, { state: demoSave(), version: 1 });

    await page.goto(`${BASE}/#/city`, { waitUntil: 'networkidle' });
    await settle(page);

    for (const era of only === 'city' ? [] : [...eras].sort((a, b) => a.order - b.order)) {
      await page.getByRole('button', { name: era.name.en, exact: true }).click();
      await settle(page);
      await page.locator('.city-scene').screenshot({ path: join(outDir, `city-${era.id}.png`) });
      console.log(`wrote city-${era.id}.png`);
    }

    if (only !== 'eras') {
      // The page-level shot the README leads with: the Viking era, wallet bar and era tabs in
      // frame. Clicking a tab scrolls it into view, so the page has to be sent back to the top
      // or the shot starts halfway down the bonus panel.
      await page.getByRole('button', { name: 'The Viking Age', exact: true }).click();
      await settle(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await page.screenshot({ path: join(outDir, 'city.png') });
      console.log('wrote city.png');
    }
  } finally {
    await browser.close();
    // On Windows the dev server is a grandchild of the shell npx spawns, so killing the shell
    // alone leaves vite holding the port and the next run fails to start.
    if (process.platform === 'win32' && server.pid) {
      spawn('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      server.kill();
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
