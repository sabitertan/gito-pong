// Simple Mario-like platformer (vanilla JS, Canvas)
// All logic in this file. Beginner-friendly, clear comments.

const canvas = document.getElementById('mario-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.6;
const JUMP_VELOCITY = -16; // Higher jump
const MOVE_SPEED = 2.2;
const GROUND_Y = canvas.height - 32;
const LEVEL_COUNT = 10;
let currentLevel = 1;
const LEVEL_WIDTH = canvas.width * 2;

// Level data: platforms and coins for each level
const levelData = Array.from({ length: LEVEL_COUNT }, (_, i) => ({
  platforms: [
    { x: 0, y: GROUND_Y, w: LEVEL_WIDTH, h: 32 },
    { x: 120 + i*30, y: GROUND_Y - 60 - i*8, w: 60, h: 12 },
    { x: 260 + i*40, y: GROUND_Y - 100 - i*10, w: 60, h: 12 },
    { x: 400 + i*50, y: GROUND_Y - 60 - i*12, w: 60, h: 12 },
    { x: 600 + i*60, y: GROUND_Y - 80 - i*14, w: 60, h: 12 },
  ],
  coins: [
    { x: 140 + i*30, y: GROUND_Y - 80 - i*8, collected: false },
    { x: 280 + i*40, y: GROUND_Y - 120 - i*10, collected: false },
    { x: 420 + i*50, y: GROUND_Y - 80 - i*12, collected: false },
    { x: 620 + i*60, y: GROUND_Y - 100 - i*14, collected: false },
  ]
}));

// Mario sprite (simple rectangle for demo)
const mario = {
  x: 40,
  y: GROUND_Y - 32,
  w: 24,
  h: 32,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1,
};

let platforms = JSON.parse(JSON.stringify(levelData[0].platforms));
let coins = JSON.parse(JSON.stringify(levelData[0].coins));

// Camera
let camX = 0;

// Input
const keys = {};
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// Game state
let win = false;

function update() {
  // Horizontal movement
  mario.vx = 0;
  if (keys['arrowleft']) { mario.vx = -MOVE_SPEED; mario.facing = -1; }
  if (keys['arrowright']) { mario.vx = MOVE_SPEED; mario.facing = 1; }

  // Jump
  if (keys['z'] && mario.onGround) {
    mario.vy = JUMP_VELOCITY;
    mario.onGround = false;
  }

  // Apply gravity
  mario.vy += GRAVITY;
  mario.x += mario.vx;
  mario.y += mario.vy;

  // Platform collision
  mario.onGround = false;
  for (const p of platforms) {
    // Simple AABB collision
    if (
      mario.x + mario.w > p.x && mario.x < p.x + p.w &&
      mario.y + mario.h > p.y && mario.y + mario.h - mario.vy <= p.y
    ) {
      // Land on platform
      mario.y = p.y - mario.h;
      mario.vy = 0;
      mario.onGround = true;
    }
  }

  // Prevent falling below ground
  if (mario.y + mario.h > canvas.height) {
    mario.y = canvas.height - mario.h;
    mario.vy = 0;
    mario.onGround = true;
  }

  // Camera follows Mario
  camX = Math.max(0, Math.min(mario.x - 100, LEVEL_WIDTH - canvas.width));

  // Coin collection
  for (const c of coins) {
    if (!c.collected && Math.abs(mario.x + mario.w/2 - c.x) < 18 && Math.abs(mario.y + mario.h/2 - c.y) < 18) {
      c.collected = true;
    }
  }

  // Win condition: reach far right and collect all coins
  if (mario.x > LEVEL_WIDTH - 60 && coins.every(c => c.collected)) {
    if (currentLevel < LEVEL_COUNT) {
      currentLevel++;
      loadLevel(currentLevel - 1);
    } else {
      win = true;
    }
  }
}

function loadLevel(levelIdx) {
  // Reset Mario
  mario.x = 40;
  mario.y = GROUND_Y - 32;
  mario.vx = 0;
  mario.vy = 0;
  // Load platforms and coins for this level
  platforms = JSON.parse(JSON.stringify(levelData[levelIdx].platforms));
  coins = JSON.parse(JSON.stringify(levelData[levelIdx].coins));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camX, 0);

  // Platforms
  for (const p of platforms) {
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }

  // Coins
  for (const c of coins) {
    if (!c.collected) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#fff700';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
  }

  // Mario
  ctx.save();
  ctx.translate(mario.x + mario.w/2, mario.y + mario.h/2);
  ctx.scale(mario.facing, 1);
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(-mario.w/2, -mario.h/2, mario.w, mario.h);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-mario.w/2 + 4, -mario.h/2 + 8, mario.w - 8, mario.h - 20); // face
  ctx.restore();

  ctx.restore();

  // HUD
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText('Level: ' + currentLevel + ' / ' + LEVEL_COUNT, 16, 20);
  ctx.fillText('Coins: ' + coins.filter(c => c.collected).length + '/' + coins.length, 16, 44);

  // Win prompt
  if (win) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.font = '32px "Press Start 2P", monospace';
    ctx.fillStyle = '#fff700';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width/2, canvas.height/2 - 20);
    ctx.font = '18px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Press R to Restart', canvas.width/2, canvas.height/2 + 24);
    ctx.restore();
  }
}

function gameLoop() {
  if (!win) update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (win && e.key.toLowerCase() === 'r') {
    // Reset game
    mario.x = 40;
    mario.y = GROUND_Y - 32;
    mario.vx = 0;
    mario.vy = 0;
    currentLevel = 1;
    loadLevel(0);
    win = false;
  }
});

gameLoop();
