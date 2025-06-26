// Playwright E2E test for Super Mario Clone
import { test, expect } from '@playwright/test';

const GAME_URL = 'http://localhost:5173/gito-pong/src/games/supermario/supermario.html';

test.describe('Super Mario Clone', () => {
  test('should load the Super Mario game and display the canvas', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Super Mario');
    await page.screenshot({ path: 'screenshots/supermario-test.png' });
  });

  test('should move Mario and jump', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await expect(page.locator('canvas')).toBeVisible();
    await page.screenshot({ path: 'screenshots/supermario-move.png' });
  });
});
