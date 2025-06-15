// playwright-screenshots.spec.js
// Run with: npx playwright test tests/playwright-screenshots.spec.js
import { test, expect } from '@playwright/test';

test('Capture Pong Screenshots and Demo GIF Frames', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Main menu (start screen)
  await page.screenshot({ path: 'screenshots/pong-main.png' });

  // Gameplay: simulate a few frames
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
        await page.screenshot({ path: `screenshots/pong-levelup-step${i + 1}.png` });
        await page.click('#continueBtn');
        overlayFound = true;
        break;
      } else if (await page.$('#winOverlay')) {
        overlayFound = true;
        break;
      }
      await page.waitForTimeout(400);
    }
    if (!overlayFound) throw new Error('Overlay not found after level up');
  }
  await page.waitForSelector('#winOverlay', { timeout: 3000 });
  await page.screenshot({ path: 'screenshots/pong-win.png' });

  // Gameplay GIF: capture a sequence of frames
  await page.reload();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(80);
    await page.screenshot({ path: `screenshots/pong-demo-${String(i).padStart(2, '0')}.png` });
  }
});
