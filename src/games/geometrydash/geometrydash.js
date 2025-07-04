// Geometry Dash Clone - Simple endless runner
// All logic in this file, beginner-friendly, colorful, and commented

const canvas = document.getElementById('gdCanvas');
const ctx = canvas.getContext('2d');
const promptDiv = document.getElementById('gdPrompt');

// Game constants
const GRAVITY = 0.7;
const JUMP = -15; // Increased jump by 25%
const PLAYER_SIZE = 40;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_GAP = 220;
const OBSTACLE_MIN_HEIGHT = 40;
const OBSTACLE_MAX_HEIGHT = 120;
const SPEED = 6;

// Game state
let player, obstacles, isRunning, score, bestScore;
let groundY = canvas.height - 60;
let jumpsLeft = 2; // Allow double jump
let obstacleTimer = 0;
const OBSTACLE_SPAWN_INTERVAL = 80; // Higher value = farther apart

function getGroundY() {
  return canvas.height - 60;
}

function resetGame() {
  groundY = getGroundY();
  player = { x: 100, y: groundY - PLAYER_SIZE, vy: 0, size: PLAYER_SIZE, color: '#0ff', alive: true };
  obstacles = [];
  isRunning = false;
  score = 0;
  jumpsLeft = 2;
  promptDiv.innerHTML = '<b>Geometry Dash Clone!</b><br>Press <span style="color:#0ff">Space</span> or <span style="color:#0ff">Tap</span> to jump!';
}

function startGame() {
  isRunning = true;
  promptDiv.innerHTML = '';
  window.requestAnimationFrame(gameLoop);
}

function jump() {
  if (!isRunning) { startGame(); return; }
  if (player.alive && jumpsLeft > 0) {
    player.vy = JUMP;
    jumpsLeft--;
    playJump();
  }
}

function gameLoop() {
  if (!isRunning) return;
  update();
  draw();
  if (player.alive) {
    window.requestAnimationFrame(gameLoop);
  } else {
    endGame();
  }
}

function update() {
  groundY = getGroundY();
  // Player physics
  if (!player.alive) return; // Stop all movement if dead
  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y > groundY - PLAYER_SIZE) {
    player.y = groundY - PLAYER_SIZE;
    player.vy = 0;
    jumpsLeft = 2; // Reset jumps when on ground
  }

  // Obstacles
  obstacleTimer++;
  if (obstacleTimer >= OBSTACLE_SPAWN_INTERVAL) {
    const multiBar = Math.random() < 0.5; // 50% chance for multi-bar
    if (multiBar) {
      // 2-3 bars side by side
      const barCount = 2 + Math.floor(Math.random() * 2); // 2 or 3
      const gap = 40 + Math.random() * 30; // horizontal gap between bars
      const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
      for (let i = 0; i < barCount; i++) {
        const x = canvas.width + i * (OBSTACLE_WIDTH + gap);
        obstacles.push({ x, y: groundY - height, w: OBSTACLE_WIDTH, h: height, color: '#f0f' });
      }
    } else {
      const height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
      obstacles.push({ x: canvas.width, y: groundY - height, w: OBSTACLE_WIDTH, h: height, color: '#f0f' });
    }
    obstacleTimer = 0;
  }
  for (let obs of obstacles) {
    obs.x -= SPEED;
  }
  // Remove off-screen
  obstacles = obstacles.filter(obs => obs.x + obs.w > 0);

  // Collision
  for (let obs of obstacles) {
    if (
      player.x + player.size > obs.x &&
      player.x < obs.x + obs.w &&
      player.y + player.size > obs.y &&
      player.y < obs.y + obs.h
    ) {
      player.alive = false;
      playDie();
    }
  }

  // Score
  for (let obs of obstacles) {
    if (!obs.passed && obs.x + obs.w < player.x) {
      obs.passed = true;
      score++;
    }
  }
}

function draw() {
  groundY = getGroundY();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Ground
  ctx.fillStyle = '#333';
  ctx.fillRect(0, groundY, canvas.width, 60);
  // Player (glowing square)
  ctx.save();
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 24;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.restore();
  // Obstacles
  for (let obs of obstacles) {
    ctx.save();
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 16;
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.restore();
  }
  // Score
  ctx.font = 'bold 32px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 24, 48);
  if (bestScore)
    ctx.fillText('Best: ' + bestScore, 24, 88);
}

function endGame() {
  isRunning = false;
  bestScore = Math.max(score, bestScore || 0);
  promptDiv.innerHTML = `<b style="color:#f0f">You Died!</b><br>Score: <span style="color:#0ff">${score}</span><br><span style="color:#fff">Press <b>Restart</b> to try again.</span><br><button class="gd-btn" onclick="window.location.reload()">Restart</button>`;
}

// Sound (simple synth, no external files)
function playJump() {
  if (!window.AudioContext) return;
  const ctx = new window.AudioContext();
  const o = ctx.createOscillator();
  o.type = 'square';
  o.frequency.value = 880;
  const g = ctx.createGain();
  g.gain.value = 0.1;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.15);
  o.stop(ctx.currentTime + 0.18);
  o.onended = () => ctx.close();
}
function playDie() {
  if (!window.AudioContext) return;
  const ctx = new window.AudioContext();
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = 220;
  const g = ctx.createGain();
  g.gain.value = 0.15;
  o.connect(g).connect(ctx.destination);
  o.start();
  o.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
  o.stop(ctx.currentTime + 0.32);
  o.onended = () => ctx.close();
}

// Input
window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.key === 'ArrowUp') jump();
});
canvas.addEventListener('pointerdown', jump);

// Responsive canvas
function resizeCanvas() {
  const w = Math.min(window.innerWidth * 0.9, 900);
  const h = Math.max(Math.min(window.innerHeight * 0.5, 500), 320);
  canvas.width = w;
  canvas.height = h;
  groundY = getGroundY();
  if (player) {
    // Keep player on ground after resize
    if (player.y > groundY - PLAYER_SIZE) {
      player.y = groundY - PLAYER_SIZE;
      player.vy = 0;
    }
  }
  // Move obstacles to new ground
  if (obstacles) {
    for (let obs of obstacles) {
      obs.y = groundY - obs.h;
    }
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

resetGame();
