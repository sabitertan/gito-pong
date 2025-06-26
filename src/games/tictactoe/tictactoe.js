// Simple Tic Tac Toe game (vanilla JS, beginner-friendly)
// All logic in this file. No frameworks.

const boardEl = document.getElementById('ttt-board');
const statusEl = document.getElementById('ttt-status');
const restartBtn = document.getElementById('ttt-restart');
const modeSelect = document.getElementById('ttt-mode');

// Ensure the board is visible on load
boardEl.style.display = 'grid';
boardEl.style.gridTemplateColumns = 'repeat(3, 80px)';
boardEl.style.gridTemplateRows = 'repeat(3, 80px)';
boardEl.style.gap = '12px';
boardEl.style.justifyContent = 'center';
boardEl.style.margin = '40px auto';

let board, currentPlayer, gameOver, mode = 'ai';
let level = 1;
const maxLevel = 10;
let playerScore = 0;
let aiScore = 0;

function getBoardSize() {
  // Board size increases by 1 each level, min 3, max 10
  return Math.min(3 + level - 1, 10);
}

function initGame() {
  const size = getBoardSize();
  board = Array(size * size).fill('');
  currentPlayer = 'X';
  gameOver = false;
  statusEl.textContent = `Level ${level} / ${maxLevel} - Player X's turn`;
  restartBtn.style.display = 'none';
  renderBoard();
}

function renderBoard() {
  const size = getBoardSize();
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${size}, 80px)`;
  boardEl.style.gridTemplateRows = `repeat(${size}, 80px)`;
  for (let idx = 0; idx < size * size; idx++) {
    const cell = board[idx];
    const cellEl = document.createElement('div');
    cellEl.className = 'ttt-cell';
    cellEl.textContent = cell;
    cellEl.addEventListener('click', () => handleMove(idx));
    boardEl.appendChild(cellEl);
  }
}

modeSelect && (modeSelect.value = 'ai');
modeSelect && modeSelect.addEventListener('change', () => {
  mode = modeSelect.value;
  initGame();
});

function handleMove(idx) {
  if (gameOver || board[idx]) return;
  board[idx] = currentPlayer;
  renderBoard();
  if (checkWin(currentPlayer)) {
    if (mode === 'ai' && currentPlayer === 'X') playerScore++;
    if (mode === 'ai' && currentPlayer === 'O') aiScore++;
    statusEl.textContent = `Player ${currentPlayer} wins! 🎉`;
    gameOver = true;
    restartBtn.style.display = 'block';
    setTimeout(nextLevel, 1200);
  } else if (board.every(cell => cell)) {
    statusEl.textContent = "It's a draw!";
    gameOver = true;
    restartBtn.style.display = 'block';
    setTimeout(nextLevel, 1200);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusEl.textContent = `Level ${level} / ${maxLevel} - Player ${currentPlayer}'s turn`;
    if (mode === 'ai' && currentPlayer === 'O' && !gameOver) {
      setTimeout(aiMove, 400);
    }
  }
}

function nextLevel() {
  if (level < maxLevel) {
    level++;
    initGame();
  } else {
    statusEl.textContent = `Game Over! Final Score: You ${playerScore} - AI ${aiScore}`;
    restartBtn.style.display = 'block';
  }
}

function aiMove() {
  // AI gets smarter each level: random at level 1, blocks/wins at higher levels
  let idx;
  const size = getBoardSize();
  if (size > 3) {
    // Only basic AI for larger boards
    const empty = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
    idx = empty[Math.floor(Math.random() * empty.length)];
  } else if (level === 1) {
    // Level 1: random move
    const empty = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
    idx = empty[Math.floor(Math.random() * empty.length)];
  } else {
    // Level 2+: try to win, then block, else random
    idx = findBestMove(level);
  }
  if (idx === undefined) return;
  board[idx] = 'O';
  renderBoard();
  if (checkWin('O')) {
    statusEl.textContent = `Player O (AI) wins! 🤖`;
    gameOver = true;
    restartBtn.style.display = 'block';
    setTimeout(nextLevel, 1200);
  } else if (board.every(cell => cell)) {
    statusEl.textContent = "It's a draw!";
    gameOver = true;
    restartBtn.style.display = 'block';
    setTimeout(nextLevel, 1200);
  } else {
    currentPlayer = 'X';
    statusEl.textContent = `Level ${level} / ${maxLevel} - Player X's turn`;
  }
}

function checkWin(player) {
  const size = getBoardSize();
  // Check rows
  for (let r = 0; r < size; r++) {
    if (Array.from({length: size}, (_, c) => board[r*size + c]).every(v => v === player)) return true;
  }
  // Check cols
  for (let c = 0; c < size; c++) {
    if (Array.from({length: size}, (_, r) => board[r*size + c]).every(v => v === player)) return true;
  }
  // Check main diag
  if (Array.from({length: size}, (_, i) => board[i*size + i]).every(v => v === player)) return true;
  // Check anti-diag
  if (Array.from({length: size}, (_, i) => board[i*size + (size-1-i)]).every(v => v === player)) return true;
  return false;
}

function findBestMove(lvl) {
  const size = getBoardSize();
  // Only basic AI for larger boards
  if (size > 3) {
    const empty = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  }
  // 1. Try to win
  let winIdx = findWinOrBlock('O');
  if (lvl >= 3 && winIdx !== undefined) return winIdx;
  // 2. Try to block
  let blockIdx = findWinOrBlock('X');
  if (lvl >= 2 && blockIdx !== undefined) return blockIdx;
  // 3. Prefer center/corners
  if (lvl >= 5) {
    if (board[4] === '') return 4;
    const corners = [0,2,6,8].filter(i => board[i] === '');
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  }
  // 4. Minimax for level 8+
  if (lvl >= 8) {
    return minimaxMove();
  }
  // 5. Random
  const empty = board.map((v, i) => v === '' ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function findWinOrBlock(player) {
  const size = getBoardSize();
  if (size > 3) return undefined;
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const line of wins) {
    const vals = line.map(i => board[i]);
    if (vals.filter(v => v === player).length === 2 && vals.includes('')) {
      return line[vals.indexOf('')];
    }
  }
}

function minimaxMove() {
  const size = getBoardSize();
  if (size > 3) return findBestMove(level); // fallback to random for big boards
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(b, depth, isMax) {
  const size = getBoardSize();
  if (size > 3) return 0;
  if (checkWin('O')) return 10 - depth;
  if (checkWin('X')) return depth - 10;
  if (b.every(cell => cell)) return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === '') {
        b[i] = 'O';
        best = Math.max(best, minimax(b, depth+1, false));
        b[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === '') {
        b[i] = 'X';
        best = Math.min(best, minimax(b, depth+1, true));
        b[i] = '';
      }
    }
    return best;
  }
}

restartBtn.addEventListener('click', () => {
  level = 1;
  playerScore = 0;
  aiScore = 0;
  initGame();
});

initGame();
