import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/gito-pong/', // Set to your repo name for GitHub Pages
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pong: resolve(__dirname, 'src/games/pong/pong.html'),
        supermario: resolve(__dirname, 'src/games/supermario/supermario.html'),
        tictactoe: resolve(__dirname, 'src/games/tictactoe/tictactoe.html'),
        templerun: resolve(__dirname, 'src/games/templerun/templerun.html'),
      }
    }
  }
});
