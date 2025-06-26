// Playwright E2E test for Temple Run 4-Lane
import { test, expect } from '@playwright/test';

const GAME_URL = 'http://localhost:5173/gito-pong/src/games/templerun/templerun.html';

test.describe('Temple Run 4-Lane', () => {
  test('should load the Temple Run game and display the canvas', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Temple Run');
    await page.screenshot({ path: 'screenshots/templerun-test.png' });
  });

  test('should move and jump in Temple Run', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('canvas')).toBeVisible();
    await page.screenshot({ path: 'screenshots/templerun-move.png' });
  });
});
