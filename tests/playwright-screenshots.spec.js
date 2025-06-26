// playwright-screenshots.spec.js
// Run with: npx playwright test tests/playwright-screenshots.spec.js
import { test, expect } from '@playwright/test';

test('Capture Pong Screenshots and Demo GIF Frames', async ({ page }) => {
  await page.goto('http://localhost:5173/src/games/pong/pong.html');

  // Main menu (start screen)
  await page.screenshot({ path: 'screenshots/pong-main.png' });

  // Gameplay: simulate a few frames
  await page.waitForSelector('canvas#gameCanvas');
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: 'screenshots/pong-gameplay.png' });

  // Level up: force level up and capture overlay
  await page.evaluate(() => {
    window.setGameState({ playerScore: 3 });
    window.forceLevelUp();
  });
  await page.waitForSelector('#nextLevelOverlay', { timeout: 2000 });
  await page.screenshot({ path: 'screenshots/pong-levelup.png' });
  await page.click('#continueBtn');

  // Win screen: force win and capture overlay
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      window.setGameState({ playerScore: 3 });
      window.forceLevelUp();
    });
    await page.waitForTimeout(100);
    // Wait for either nextLevelOverlay or winOverlay
    let overlayFound = false;
    for (let retry = 0; retry < 5; retry++) {
      if (await page.$('#nextLevelOverlay')) {
        overlayFound = true;
        break;
      }
      if (await page.$('#winOverlay')) {
        overlayFound = true;
        break;
      }
      await page.waitForTimeout(100);
    }
    if (await page.$('#winOverlay')) break;
    if (await page.$('#nextLevelOverlay')) await page.click('#continueBtn');
  }
  await page.waitForSelector('#winOverlay', { timeout: 2000 });
  await page.screenshot({ path: 'screenshots/pong-win.png' });

  // Gameplay GIF: capture a sequence of frames
  // Instead of reload, go back to catalog and start again
  await page.goto('http://localhost:5173/src/games/pong/pong.html');
  await page.waitForSelector('canvas#gameCanvas');
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(80);
    await page.screenshot({ path: `screenshots/pong-demo-${String(i).padStart(2, '0')}.png` });
  }
});
