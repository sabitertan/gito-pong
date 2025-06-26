// Playwright E2E test for Pong (80s Edition)
import { test, expect } from '@playwright/test';

const GAME_URL = 'http://localhost:5173/gito-pong/src/games/pong/pong.html';

test.describe('Pong (80s Edition)', () => {
  test('should load the Pong game and display the canvas', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Pong');
    await page.screenshot({ path: 'screenshots/pong-test.png' });
  });

  test('should start the game and move the paddle', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('canvas')).toBeVisible();
    await page.screenshot({ path: 'screenshots/pong-move.png' });
  });
});
