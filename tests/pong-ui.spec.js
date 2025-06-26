// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Pong Game UI', () => {
  // Go to the catalog, click Play Pong, then test the game UI
  test('should load the game canvas', async ({ page }) => {
    await page.goto('http://localhost:5173/src/games/pong/pong.html');
    await page.waitForSelector('canvas#gameCanvas');
    const canvas = await page.$('canvas#gameCanvas');
    expect(canvas).not.toBeNull();
  });

  test('should show level display and scoreboard on start', async ({ page }) => {
    await page.goto('http://localhost:5173/src/games/pong/pong.html');
    await page.waitForSelector('#levelDisplay');
    await page.waitForSelector('#scoreboard');
    const levelDisplay = await page.$('#levelDisplay');
    const scoreboard = await page.$('#scoreboard');
    expect(levelDisplay).not.toBeNull();
    expect(scoreboard).not.toBeNull();
  });

  // Simulate scoring 3 points per level to trigger level up
  test('should allow user to win all 10 levels (force level up)', async ({ page }) => {
    // Capture browser console logs
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('BROWSER LOG:', msg.text());
      }
    });
    await page.goto('http://localhost:5173/src/games/pong/pong.html');
    await page.waitForSelector('canvas#gameCanvas');
    for (let lvl = 1; lvl <= 10; lvl++) {
      await page.evaluate(() => {
        window.setGameState({ playerScore: 3 });
        window.forceLevelUp();
      });
      await page.waitForTimeout(200);
    }
    // Check for win overlay
    await page.waitForSelector('#winOverlay');
    const winOverlay = await page.$('#winOverlay');
    expect(winOverlay).not.toBeNull();
  });

  // Optionally, add a test for overlays after simulating a win or level up
});
