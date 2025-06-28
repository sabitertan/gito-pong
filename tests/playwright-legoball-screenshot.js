// This script uses Playwright to take a screenshot of the LegoBall game.
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Use the correct base path for Vite dev server
  await page.goto('http://localhost:5173/gito-pong/src/games/legoball/legoball.html');
  await page.waitForTimeout(1000); // Wait for game to load/animate
  await page.screenshot({
    path: path.resolve(__dirname, '../screenshots/legoball-demo.png'),
    fullPage: false
  });
  await browser.close();
})();
