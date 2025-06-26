// Temple Run 4-Lane Game
// Simple, beginner-friendly, colorful, and fun!
// Uses Canvas API, no frameworks

const canvas = document.getElementById('templerun-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('templerun-overlay');

// Game constants
const LANES = 4;
const LANE_WIDTH = canvas.width / LANES;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;
const OBSTACLE_WIDTH = 48;
const OBSTACLE_HEIGHT = 48;
const JUMP_HEIGHT = 80;
const GAME_SPEED_START = 4;
const GAME_SPEED_INC = 0.2;
const OBSTACLE_FREQ = 80; // frames
const WIN_DISTANCE = 2000; // pixels

// Game state
let playerLane = 1;
let playerY = canvas.height - PLAYER_HEIGHT - 16;
let jumping = false;
let jumpY = 0;
let jumpFrame = 0;
let obstacles = [];
let gameSpeed = GAME_SPEED_START;
let frame = 0;
let distance = 0;
let running = false;
let gameOver = false;
let win = false;

function resetGame() {
  playerLane = 1;
  playerY = canvas.height - PLAYER_HEIGHT - 16;
  jumping = false;
  jumpY = 0;
  jumpFrame = 0;
  obstacles = [];
  gameSpeed = GAME_SPEED_START;
  frame = 0;
  distance = 0;
  running = true;
  gameOver = false;
  win = false;
  overlay.style.display = 'none';
  requestAnimationFrame(gameLoop);
}

function showOverlay(text, btnText, btnAction) {
  overlay.innerHTML = `<div>${text}</div><button class="templerun-btn">${btnText}</button>`;
  overlay.style.display = 'flex';
  overlay.querySelector('button').onclick = btnAction;
}

function drawLanes() {
  for (let i = 1; i < LANES; i++) {
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(i * LANE_WIDTH, 0);
    ctx.lineTo(i * LANE_WIDTH, canvas.height);
    ctx.stroke();
  }
}

function drawPlayer() {
  // Player is a colorful rectangle with a glowing effect
  ctx.save();
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#ff0';
  const x = playerLane * LANE_WIDTH + (LANE_WIDTH - PLAYER_WIDTH) / 2;
  const y = playerY - jumpY;
  ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
  ctx.restore();
  // Face
  ctx.beginPath();
  ctx.arc(x + PLAYER_WIDTH/2, y + 24, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();
}

function drawObstacles() {
  for (const obs of obstacles) {
    ctx.save();
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#f40';
    ctx.fillRect(obs.lane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_WIDTH) / 2, obs.y, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
    ctx.restore();
    // Add a fun icon (triangle)
    ctx.beginPath();
    ctx.moveTo(obs.lane * LANE_WIDTH + LANE_WIDTH/2, obs.y + 8);
    ctx.lineTo(obs.lane * LANE_WIDTH + LANE_WIDTH/2 - 16, obs.y + OBSTACLE_HEIGHT - 8);
    ctx.lineTo(obs.lane * LANE_WIDTH + LANE_WIDTH/2 + 16, obs.y + OBSTACLE_HEIGHT - 8);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

function drawHUD() {
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText(`Distance: ${distance}`, 16, 32);
}

function gameLoop() {
  if (!running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLanes();
  drawPlayer();
  drawObstacles();
  drawHUD();

  // Move obstacles
  for (const obs of obstacles) {
    obs.y += gameSpeed;
  }
  // Remove off-screen obstacles
  obstacles = obstacles.filter(obs => obs.y < canvas.height);

  // Add new obstacles
  if (frame % Math.max(OBSTACLE_FREQ - Math.floor(distance/200), 40) === 0) {
    const lane = Math.floor(Math.random() * LANES);
    obstacles.push({ lane, y: -OBSTACLE_HEIGHT });
  }

  // Handle jump
  if (jumping) {
    jumpFrame++;
    if (jumpFrame < 10) jumpY += JUMP_HEIGHT / 10;
    else if (jumpFrame < 20) jumpY -= JUMP_HEIGHT / 10;
    else { jumping = false; jumpY = 0; jumpFrame = 0; }
  }

  // Collision detection
  for (const obs of obstacles) {
    if (
      obs.lane === playerLane &&
      obs.y + OBSTACLE_HEIGHT > playerY - jumpY &&
      obs.y < playerY - jumpY + PLAYER_HEIGHT &&
      !jumping
    ) {
      running = false;
      gameOver = true;
      showOverlay('Game Over!<br>Distance: ' + distance, 'Restart', resetGame);
      return;
    }
  }

  // Win condition
  distance += Math.floor(gameSpeed);
  if (distance >= WIN_DISTANCE) {
    running = false;
    win = true;
    showOverlay('You Win!<br>Distance: ' + distance, 'Play Again', resetGame);
    return;
  }

  // Increase speed
  gameSpeed += GAME_SPEED_INC / 60;
  frame++;
  requestAnimationFrame(gameLoop);
}

function handleKey(e) {
  if (!running) return;
  if (e.key === 'ArrowLeft' && playerLane > 0) playerLane--;
  if (e.key === 'ArrowRight' && playerLane < LANES - 1) playerLane++;
  if (e.key === 'ArrowUp' && !jumping) jumping = true;
}

document.addEventListener('keydown', handleKey);

// Show start overlay
showOverlay('Temple Run 4-Lane<br>Use ← → to move, ↑ to jump!<br>Reach the finish!', 'Start', resetGame);
