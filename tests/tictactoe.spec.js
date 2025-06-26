// Playwright E2E test for Tic Tac Toe
import { test, expect } from '@playwright/test';

const GAME_URL = 'http://localhost:5173/gito-pong/src/games/tictactoe/tictactoe.html';

test.describe('Tic Tac Toe', () => {
  test('should load the Tic Tac Toe game and display the board', async ({ page }) => {
    await page.goto(GAME_URL);
    await expect(page.locator('.ttt-board')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Tic Tac Toe');
    await page.screenshot({ path: 'screenshots/tictactoe-test.png' });
  });

  test('should interact with the Tic Tac Toe board', async ({ page }) => {
    await page.goto(GAME_URL);
    // Click first cell, then second cell
    await page.locator('.ttt-cell').nth(0).click();
    await page.locator('.ttt-cell').nth(1).click();
    await expect(page.locator('.ttt-board')).toBeVisible();
    await page.screenshot({ path: 'screenshots/tictactoe-move.png' });
  });
});
