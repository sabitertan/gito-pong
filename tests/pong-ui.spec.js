// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Pong Game UI', () => {
  test('should load the game canvas', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const canvas = await page.$('canvas#gameCanvas');
    expect(canvas).not.toBeNull();
  });

  test('should show level display and scoreboard on start', async ({ page }) => {
    await page.goto('http://localhost:5173');
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
    await page.goto('http://localhost:5173');
    for (let lvl = 1; lvl <= 10; lvl++) {
      await page.evaluate(() => {
        window.setGameState({ playerScore: 3 });
        window.forceLevelUp();
      });
      if (lvl < 10) {
        await page.waitForSelector('#nextLevelOverlay', { timeout: 5000 });
        await page.click('#continueBtn');
      }
    }
    // One more call to trigger win overlay
    await page.evaluate(() => {
      window.setGameState({ playerScore: 3 });
      window.forceLevelUp();
    });
    // Retry loop for win overlay
    let found = false;
    for (let i = 0; i < 10; i++) {
      try {
        await page.waitForSelector('#winOverlay', { timeout: 1000 });
        found = true;
        break;
      } catch (e) {
        await page.waitForTimeout(500);
      }
    }
    expect(found).toBe(true);
    if (found) {
      const winText = await page.textContent('#winOverlay h2');
      expect(winText).toContain('You Win');
    }
  });

  // Optionally, add a test for overlays after simulating a win or level up
});
