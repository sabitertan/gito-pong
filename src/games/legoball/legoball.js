// Lego Ball WebGL Demo
// Simple WebGL game: Ball hits a Lego building, bricks fall apart
// No external libraries, beginner-friendly, all logic in this file

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

const canvas = document.getElementById('legoball-canvas');
const overlay = document.getElementById('legoball-overlay');

if (!canvas) {
  overlay.innerHTML = '<div>Canvas element not found!</div>';
  overlay.style.display = 'flex';
  throw new Error('Canvas element not found');
}

// --- Minimal three.js + cannon-es setup for a 3D ball and blocks ---
// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181c2f);
const camera = new THREE.PerspectiveCamera(60, 640/480, 0.1, 100);
camera.position.set(0, 5, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(640, 480);

// Physics world
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

// Ball (physics)
const ballBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.6), position: new CANNON.Vec3(0, 4, 0) });
world.addBody(ballBody);
// Ball (visual)
const ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
const ballMat = new THREE.MeshStandardMaterial({ color: 0x00ffe7 });
const ballMesh = new THREE.Mesh(ballGeo, ballMat);
scene.add(ballMesh);

// Floor (physics)
const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), position: new CANNON.Vec3(0, 0, 0) });
groundBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
world.addBody(groundBody);
// Floor (visual)
const groundGeo = new THREE.PlaneGeometry(20, 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x222233 });
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.rotation.x = -Math.PI/2;
scene.add(groundMesh);

// Add a bright ambient light to lighten the whole scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Soft white
scene.add(ambientLight);

// Add a much brighter yellow point light above the scene
const yellowLight = new THREE.PointLight(0xffee88, 2.5, 80);
yellowLight.position.set(0, 12, 0);
scene.add(yellowLight);

// Add a soft white directional light for even illumination
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(0, 10, 10);
scene.add(dirLight);

// --- Brick wall setup ---
const blocks = [];
function createBrick(x, y, z, color) {
  // Use a rainbow of colors for bricks
  if (!color) {
    const rainbow = [0xff5555, 0xffa500, 0xfffa00, 0x00ff00, 0x00cfff, 0x0055ff, 0xaa00ff, 0xff00aa];
    color = rainbow[(Math.abs(Math.round(x + y)) + y) % rainbow.length];
  }
  const body = new CANNON.Body({ mass: 0.5, shape: new CANNON.Box(new CANNON.Vec3(0.5,0.25,0.25)), position: new CANNON.Vec3(x, y, z) });
  world.addBody(body);
  // Lego brick geometry: base + studs
  const baseGeo = new THREE.BoxGeometry(1,0.5,0.5);
  const baseMat = new THREE.MeshStandardMaterial({ color });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  // Add 2x2 studs on top
  const studs = [];
  for (let sx = -0.25; sx <= 0.25; sx += 0.5) {
    for (let sz = -0.125; sz <= 0.125; sz += 0.25) {
      const studGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.13, 20);
      // Make the stud color match the brick color
      const studMat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.3 });
      const stud = new THREE.Mesh(studGeo, studMat);
      stud.position.set(sx, 0.29, sz);
      baseMesh.add(stud);
      studs.push(stud);
    }
  }
  scene.add(baseMesh);
  return { body, mesh: baseMesh };
}

// --- Level animal shapes ---
const animalLevels = [
  // Each array is a 2D grid (rows x cols), 1=brick, 0=empty
  // Level 1: Simple rectangle (starter)
  [
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
  ],
  // Level 2: Cat face
  [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
  ],
  // Level 3: Dog face
  [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [1,1,0,1,1,0,1,1],
    [0,1,1,1,1,1,1,0],
  ],
  // Level 4: Fish
  [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
  ],
  // Level 5: Bird
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
  ],
  // Level 6: Bunny
  [
    [0,1,0,0,0,0,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
  ],
  // Level 7: Elephant
  [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,0,1,1,0,1,1],
    [0,1,1,0,0,1,1,0],
  ],
  // Level 8: Duck
  [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
  ],
  // Level 9: Frog
  [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [1,1,0,1,1,0,1,1],
    [0,1,1,1,1,1,1,0],
  ],
  // Level 10: Lion
  [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
  ],
];
let currentLevel = 0;

function buildWall(levelIdx) {
  // Remove old blocks
  for (const b of blocks) {
    scene.remove(b.mesh);
    world.removeBody(b.body);
  }
  blocks.length = 0;
  const shape = animalLevels[levelIdx];
  const rows = shape.length, cols = shape[0].length;
  // Use a rainbow palette for each row for more color
  const rainbow = [0xff5555, 0xffa500, 0xfffa00, 0x00ff00, 0x00cfff, 0x0055ff, 0xaa00ff, 0xff00aa];
  for (let y = 0; y < rows; ++y) {
    for (let x = 0; x < cols; ++x) {
      if (shape[y][x]) {
        const bx = (x - cols/2 + 0.5) * 1.05;
        const by = 0.25 + y * 0.52;
        // Assign a color from the rainbow palette based on x and y for variety
        const color = rainbow[(x + y) % rainbow.length];
        blocks.push(createBrick(bx, by, -6, color));
      }
    }
  }
}

function nextLevel() {
  // Remove all balls from previous level
  for (const b of balls) {
    scene.remove(b.mesh);
    world.removeBody(b.body);
  }
  balls.length = 0;
  currentLevel++;
  if (currentLevel >= animalLevels.length) {
    overlay.innerHTML = `<div>You completed all levels! 🎉<br><br><button class='legoball-btn'>Restart</button></div>`;
    overlay.style.display = 'flex';
    overlay.querySelector('button').onclick = () => { window.location.reload(); };
    return;
  }
  ballsLeft = 20;
  updateBallsLeft();
  buildWall(currentLevel);
  gameOver = false;
  overlay.style.display = 'none';
}

// Replace wall build on start
buildWall(currentLevel);

// --- UI and game logic ---
const balls = [];
let ballsLeft = 20;
let gameOver = false;

// UI: Show balls left and current level
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '32px';
infoDiv.style.right = '48px';
infoDiv.style.fontSize = '2em';
infoDiv.style.color = '#00ffe7';
infoDiv.style.textShadow = '0 0 8px #0ff, 0 0 16px #fff';
infoDiv.innerText = `Balls left: ${ballsLeft}\nLevel: ${currentLevel + 1}`;
document.body.appendChild(infoDiv);

function updateBallsLeft() {
  infoDiv.innerText = `Balls left: ${ballsLeft}\nLevel: ${currentLevel + 1}`;
}

function showEndOverlay(win) {
  if (win) {
    overlay.innerHTML = `<div>Level Complete!<br><br><button class='legoball-btn'>Next Level</button></div>`;
    overlay.style.display = 'flex';
    overlay.querySelector('button').onclick = nextLevel;
  } else {
    overlay.innerHTML = `<div>Game Over!<br><br><button class='legoball-btn'>Restart</button></div>`;
    overlay.style.display = 'flex';
    overlay.querySelector('button').onclick = () => { window.location.reload(); };
  }
}

function allBricksDown() {
  // Only check bricks not in the bottom row (y > 0.5)
  return blocks.filter(b => b.body.position.y > 0.5)
    .every(b => b.body.position.y < 0.5 + 0.52); // 0.52 is row height
}

function throwBall(event) {
  if (gameOver || ballsLeft <= 0) return;
  ballsLeft--;
  updateBallsLeft();
  // Calculate target direction from camera to mouse pointer in world space
  let mouseX = 0, mouseY = 0;
  if (event && event.clientX !== undefined) {
    const rect = renderer.domElement.getBoundingClientRect();
    // Convert mouse to normalized device coordinates (-1 to 1)
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  // Project mouse to a point on the wall's z plane
  const zTarget = -6;
  const vector = new THREE.Vector3(mouseX, mouseY, 0.5); // z=0.5 for perspective
  vector.unproject(camera);
  // Direction from camera to target
  const dir = vector.sub(camera.position).normalize();
  // Find intersection with z=zTarget plane
  const t = (zTarget - camera.position.z) / dir.z;
  const target = camera.position.clone().add(dir.multiplyScalar(t));
  // Ball starts at (0,2,6), aim toward target
  const start = new CANNON.Vec3(0, 2, 6);
  const velocity = new CANNON.Vec3(target.x - start.x, target.y - start.y, target.z - start.z).unit().scale(16);
  const ballBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.6), position: start.clone() });
  ballBody.velocity.set(velocity.x, velocity.y, velocity.z);
  world.addBody(ballBody);
  const ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, metalness: 0.8, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.5 });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  const glow = new THREE.PointLight(0xffffff, 1, 6);
  ballMesh.add(glow);
  scene.add(ballMesh);
  balls.push({ body: ballBody, mesh: ballMesh });
  if (ballsLeft === 0) {
    setTimeout(() => {
      gameOver = true;
      if (allBricksDown()) showEndOverlay(true);
      else showEndOverlay(false);
    }, 1200);
  }
}

renderer.domElement.addEventListener('click', throwBall);

// Remove the original single ball
scene.remove(ballMesh);
world.removeBody(ballBody);

// --- Animation loop update ---
function animate() {
  world.step(1/60);
  // Sync all balls
  for (const b of balls) {
    b.mesh.position.copy(b.body.position);
    b.mesh.quaternion.copy(b.body.quaternion);
  }
  // Sync blocks
  for (const b of blocks) {
    b.mesh.position.copy(b.body.position);
    b.mesh.quaternion.copy(b.body.quaternion);
  }
  // Check win condition
  if (!gameOver && allBricksDown()) {
    gameOver = true;
    showEndOverlay(true);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
// --- END minimal three.js + cannon-es setup ---

// --- Responsive resize ---
function resizeGame() {
  const aspect = 4/3;
  let w = window.innerWidth * 0.8;
  let h = window.innerHeight * 0.7;
  if (w/h > aspect) w = h * aspect; else h = w / aspect;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = w;
  canvas.height = h;
  // Move infoDiv to top right of canvas
  const rect = renderer.domElement.getBoundingClientRect();
  infoDiv.style.left = (rect.right - 220) + 'px';
  infoDiv.style.top = (rect.top + 32) + 'px';
}
window.addEventListener('resize', resizeGame);
resizeGame();
