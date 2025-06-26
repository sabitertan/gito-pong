// Moved to src/games/pong/pong.js
// Please update your references.

console.log('Pong game script loaded');
window.addEventListener('error', function(e) {
  document.body.innerHTML = '<pre style="color:red;font-size:1.2em;">Script error: ' + e.message + '\n' + (e.filename || '') + ':' + (e.lineno || '') + '</pre>';
  console.error('Script error:', e);
});

// Pong Game Logic (moved from main.js)
// All game logic and rendering for Pong
import '../../style.css';

// Simple Pong Game: Play against the computer
// Beginner-friendly, clear comments

const app = document.querySelector('#app');

// Dynamically set canvas size to 50% of the window (max 1000x700 for safety)
const canvasWidth = Math.min(Math.floor(window.innerWidth * 0.5), 1000);
const canvasHeight = Math.min(Math.floor(window.innerHeight * 0.5), 700);
app.innerHTML = `
  <h1>Pong Game</h1>
  <div id="levelDisplay" style="font-size:18px; margin-bottom:2px; color:#555;">Level: <span id="levelNum">1</span> / 10</div>
  <div id="scoreboard" style="font-size:22px; margin-bottom:8px; color:#333;">
    <span id="playerScore">0</span> : <span id="aiScore">0</span>
  </div>
  <canvas id="gameCanvas" width="${canvasWidth}" height="${canvasHeight}" style="border:1px solid #333;"></canvas>
  <p>Use <b>Up</b> and <b>Down</b> arrow keys to move your paddle!</p>
`;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 22, paddleHeight = 160; // Bigger paddles
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;
const ballSize = 12; // 20% bigger than original 10
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let baseBallSpeed = 4.5; // 50% faster than original 3
let ballDX = baseBallSpeed, ballDY = baseBallSpeed; // Ball speed increases with level
let playerScore = 0, aiScore = 0;
let playerMove = 0; // -1 for up, 1 for down, 0 for still
let level = 1;
const maxLevel = 10;
let aiSpeed = 1.5; // Start with slow AI
let waitingForNextLevel = false;

// For AI paddle, keep a margin from the right wall
const aiPaddleMargin = 28;

// Music melodies for each level (8 notes per melody)
const melodies = [
  [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00], // Level 1
  [293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 220.00], // Level 2
  [329.63, 392.00, 493.88, 659.25, 493.88, 392.00, 329.63, 246.94], // Level 3
  [349.23, 415.30, 523.25, 698.46, 523.25, 415.30, 349.23, 261.63], // Level 4
  [392.00, 493.88, 587.33, 783.99, 587.33, 493.88, 392.00, 293.66], // Level 5
  [440.00, 554.37, 659.25, 880.00, 659.25, 554.37, 440.00, 329.63], // Level 6
  [493.88, 622.25, 783.99, 987.77, 783.99, 622.25, 493.88, 392.00], // Level 7
  [523.25, 659.25, 830.61, 1046.50, 830.61, 659.25, 523.25, 415.30], // Level 8
  [587.33, 739.99, 932.33, 1174.66, 932.33, 739.99, 587.33, 466.16], // Level 9
  [659.25, 830.61, 1046.50, 1318.51, 1046.50, 830.61, 659.25, 523.25] // Level 10
];
let musicPlaying = false;
let stopMusic = false;
let musicTimeout;

// Draw paddles, ball, and scores
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw walls (top, bottom, left, right)
  ctx.fillStyle = '#555';
  ctx.fillRect(0, 0, canvas.width, 8);
  ctx.fillRect(0, canvas.height - 8, canvas.width, 8);
  ctx.fillRect(0, 0, 8, canvas.height);
  ctx.fillRect(canvas.width - 8, 0, 8, canvas.height);
  // Draw player paddle as long oval
  ctx.save();
  ctx.translate(18 + paddleWidth / 2, playerY + paddleHeight / 2);
  ctx.scale(1, 3.2); // Keep vertical stretch for oval
  ctx.beginPath();
  ctx.arc(0, 0, paddleWidth / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#3498db';
  ctx.fill();
  ctx.restore();
  // Draw AI paddle as long oval, with margin from right wall
  ctx.save();
  ctx.translate(canvas.width - aiPaddleMargin - paddleWidth / 2, aiY + paddleHeight / 2);
  ctx.scale(1, 3.2);
  ctx.beginPath();
  ctx.arc(0, 0, paddleWidth / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#e67e22';
  ctx.fill();
  ctx.restore();
  // Ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fillStyle = '#2ecc40';
  ctx.fill();
  ctx.closePath();
  // Scores
  // Removed in-canvas score drawing
}

// Move AI paddle (simple tracking)
function moveAI() {
  const center = aiY + paddleHeight / 2;
  // AI gets faster and more accurate with higher levels
  let aiTarget = ballY;
  let error = (maxLevel - level + 1) * 8; // More error at lower levels
  aiTarget += (Math.random() - 0.5) * error;
  if (center < aiTarget - 10) aiY += aiSpeed;
  else if (center > aiTarget + 10) aiY -= aiSpeed;
  aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));
}

// Update player paddle position smoothly
function updatePlayer() {
  playerY += playerMove * 5; // Adjust speed as needed
  // Clamp player paddle
  playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));
}

// Game update loop
function update() {
  if (waitingForNextLevel) return; // Pause game loop between levels
  // Move ball
  ballX += ballDX;
  ballY += ballDY;

  // Ball collision with top/bottom (walls)
  if (ballY - ballSize < 8 || ballY + ballSize > canvas.height - 8) {
    ballDY = -ballDY;
  }

  // Ball collision with player paddle (shifted for wall)
  if (
    ballX - ballSize < 18 + paddleWidth &&
    ballY > playerY &&
    ballY < playerY + paddleHeight
  ) {
    ballDX = -ballDX;
    ballX = 18 + paddleWidth + ballSize; // Prevent sticking
    playBlip();
  }

  // Ball collision with AI paddle (shifted for wall)
  if (
    ballX + ballSize > canvas.width - aiPaddleMargin &&
    ballY > aiY &&
    ballY < aiY + paddleHeight
  ) {
    ballDX = -ballDX;
    ballX = canvas.width - aiPaddleMargin - ballSize; // Prevent sticking
    playBlip();
  }

  // Score for AI
  if (ballX - ballSize < 8) {
    aiScore++;
    updateScoreboard();
    if (aiScore >= 3) {
      showGameOverOverlay();
      return;
    }
    resetBall();
  }
  // Score for player
  if (ballX + ballSize > canvas.width - 8) {
    playerScore++;
    updateScoreboard();
    checkLevelUp();
    resetBall();
  }

  updatePlayer();
  moveAI();
  draw();
  // Remove glowing border from main screen
  canvas.style.boxShadow = '';
  requestAnimationFrame(update);
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  // Ball speed increases with level
  const speed = baseBallSpeed + (level - 1) * 0.7;
  ballDX = (Math.random() > 0.5 ? speed : -speed);
  ballDY = (Math.random() > 0.5 ? speed : -speed);
}

// Player controls (smooth movement)
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    playerMove = -1;
  } else if (e.key === 'ArrowDown') {
    playerMove = 1;
  }
});
window.addEventListener('keyup', (e) => {
  if ((e.key === 'ArrowUp' && playerMove === -1) || (e.key === 'ArrowDown' && playerMove === 1)) {
    playerMove = 0;
  }
});

// 80s Atari-style background music using Web Audio API
let audioCtx;

function playAtariMusic() {
  if (musicPlaying || waitingForNextLevel) return;
  musicPlaying = true;
  stopMusic = false;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = melodies[level - 1];
  let noteIndex = 0;
  function playNote() {
    if (stopMusic) { musicPlaying = false; return; }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = notes[noteIndex % notes.length];
    gain.gain.value = 0.08;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
    osc.onended = () => {
      noteIndex++;
      musicTimeout = setTimeout(playNote, 80);
    };
  }
  playNote();
}
function stopAtariMusic() {
  stopMusic = true;
  if (audioCtx) audioCtx.close();
  clearTimeout(musicTimeout);
  musicPlaying = false;
}

// Start music on first user interaction or when game starts
function startMusicOnGameStart() {
  if (!musicPlaying && !waitingForNextLevel) {
    playAtariMusic();
  }
}
window.addEventListener('keydown', startMusicOnGameStart);
window.addEventListener('mousedown', startMusicOnGameStart);
window.addEventListener('touchstart', startMusicOnGameStart);

// Play a short blip sound for paddle hits
function playBlip() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = 520;
  gain.gain.value = 0.18;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.07);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.07);
}

// Update HTML scoreboard after scoring
function updateScoreboard() {
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('aiScore').textContent = aiScore;
}

function updateLevelDisplay() {
  document.getElementById('levelNum').textContent = level;
}

// Play triumph sound and show overlay between levels
function playTriumph() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(1320, audioCtx.currentTime + 0.18);
  gain.gain.value = 0.22;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.22);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.22);
}

function showNextLevelOverlay() {
  waitingForNextLevel = true;
  stopAtariMusic();
  const overlay = document.createElement('div');
  overlay.id = 'nextLevelOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#fff 60%,#e0eafc 100%);padding:40px 60px;border-radius:24px;box-shadow:0 4px 32px #0006;text-align:center;">
      <h2 style="color:#ff9800;text-shadow:0 0 12px #fff700,0 0 24px #ff9800;">🎉 Level ${level - 1} Complete! 🎉</h2>
      <p style="font-size:20px;color:#3498db;">You rocked Level ${level - 1}!<br>Get ready for <span style="color:#e67e22;">Level ${level}</span>!</p>
      <button id="continueBtn" style="font-size:22px;padding:14px 40px;margin-top:24px;cursor:pointer;background:linear-gradient(90deg,#ff9800,#ffe082);border:none;border-radius:12px;box-shadow:0 0 16px #fff700;font-weight:bold;">Continue 🚀</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('continueBtn').onclick = () => {
    overlay.remove();
    waitingForNextLevel = false;
    setTimeout(() => {
      playAtariMusic();
      resetBall();
      update();
    }, 200);
  };
}

function showWinOverlay() {
  console.log('showWinOverlay called, level:', level);
  waitingForNextLevel = true;
  stopAtariMusic();
  const overlay = document.createElement('div');
  overlay.id = 'winOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#fff 60%,#e0eafc 100%);padding:40px 60px;border-radius:24px;box-shadow:0 4px 32px #0006;text-align:center;">
      <h2 style="color:#4caf50;text-shadow:0 0 12px #fff,0 0 24px #4caf50;">🏆 You Win! 🏆</h2>
      <p style="font-size:20px;color:#3498db;">Congratulations!<br>You completed all levels!</p>
      <button id="restartBtn" style="font-size:22px;padding:14px 40px;margin-top:24px;cursor:pointer;background:linear-gradient(90deg,#4caf50,#b2ff59);border:none;border-radius:12px;box-shadow:0 0 16px #4caf50;font-weight:bold;">Restart Game 🔄</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('restartBtn').onclick = () => {
    overlay.remove();
    restartGame();
  };
}

function restartGame() {
  level = 1;
  aiSpeed = 1.5;
  playerScore = 0;
  aiScore = 0;
  updateScoreboard();
  updateLevelDisplay();
  waitingForNextLevel = false;
  setTimeout(() => {
    playAtariMusic();
    resetBall();
    update();
  }, 200);
}

// Level up every time player score reaches 3, up to maxLevel
function checkLevelUp() {
  console.log('checkLevelUp called, level:', level, 'maxLevel:', maxLevel, 'playerScore:', playerScore);
  if (playerScore > 0 && playerScore % 3 === 0) {
    level++;
    aiSpeed = 1.5 + (level - 1) * 0.7;
    updateLevelDisplay();
    const speed = baseBallSpeed + (level - 1) * 0.7;
    ballDX = ballDX > 0 ? speed : -speed;
    ballDY = ballDY > 0 ? speed : -speed;
    playTriumph();
    playerScore = 0;
    aiScore = 0;
    updateScoreboard();
    if (level > maxLevel) {
      showWinOverlay();
    } else {
      showNextLevelOverlay();
    }
  }
}

// Show Game Over overlay when player loses
function showGameOverOverlay() {
  waitingForNextLevel = true;
  stopAtariMusic();
  const overlay = document.createElement('div');
  overlay.id = 'gameOverOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#fff 60%,#e0eafc 100%);padding:40px 60px;border-radius:24px;box-shadow:0 4px 32px #0006;text-align:center;">
      <h2 style="color:#ff1744;text-shadow:0 0 12px #fff,0 0 24px #ff1744;">💀 Game Over!</h2>
      <p style="font-size:20px;color:#3498db;">The computer reached 3 points.<br>Try again!</p>
      <button id="restartBtn" style="font-size:22px;padding:14px 40px;margin-top:24px;cursor:pointer;background:linear-gradient(90deg,#ff1744,#ff8a65);border:none;border-radius:12px;box-shadow:0 0 16px #ff1744;font-weight:bold;">Restart Game 🔄</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('restartBtn').onclick = () => {
    overlay.remove();
    restartGame();
  };
}

// Ensure test hooks are always available for E2E
window.getGameState = function() {
  return {
    ballX, ballY, ballDX, ballDY, playerScore, aiScore, level, waitingForNextLevel
  };
};
window.setGameState = function(state) {
  if (typeof state.ballX === 'number') ballX = state.ballX;
  if (typeof state.ballY === 'number') ballY = state.ballY;
  if (typeof state.ballDX === 'number') ballDX = state.ballDX;
  if (typeof state.ballDY === 'number') ballDY = state.ballDY;
  if (typeof state.playerScore === 'number') playerScore = state.playerScore;
  if (typeof state.aiScore === 'number') aiScore = state.aiScore;
  if (typeof state.level === 'number') level = state.level;
  if (typeof state.waitingForNextLevel === 'boolean') waitingForNextLevel = state.waitingForNextLevel;
  updateScoreboard();
  updateLevelDisplay();
};
window.forceLevelUp = function() {
  checkLevelUp();
};

// Initialize displays on load
updateScoreboard();
updateLevelDisplay();

draw();
update();

// Glowing border effect (removed from main canvas)
// canvas.style.boxShadow = `0 0 32px 8px #ff9800, 0 0 64px 16px #fff700`;
