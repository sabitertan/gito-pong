<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Vite JavaScript browser game project. The main game is a multi-level Pong clone with:
- Modern, clean, and beginner-friendly JavaScript (no frameworks)
- Dynamic play area (50% of screen)
- Oval paddles, animated ball, and visible walls
- 10 levels with increasing AI difficulty and ball speed
- 80s-style chiptune music (changes each level) and sound effects
- Fun, glowing prompts between levels and on win, with a restart option
- All UI and game logic in `src/main.js`, styles in `src/style.css`
- Playwright E2E tests in `tests/`
- Screenshots and GIFs for the README in `screenshots/`
- GitHub Actions workflow for auto-deploy to GitHub Pages after each push
- Vite config (`vite.config.js`) with correct `base` for GitHub Pages

When generating code:
- Use simple, readable JavaScript and clear comments
- Prefer vanilla DOM and Canvas API
- Keep all game logic in `main.js` unless otherwise specified
- Use beginner-friendly patterns and avoid complex abstractions
- Add comments for any non-obvious logic or math
- Use playful, colorful UI elements for prompts and overlays
- Do not use external libraries unless requested (except for Playwright and gh-pages for testing/deploy)
- Ensure all features work smoothly in a browser
- Follow the structure and conventions of the current codebase
