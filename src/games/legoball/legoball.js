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
  const geo = new THREE.BoxGeometry(1,0.5,0.5);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  return { body, mesh };
}

// Remove old blocks
for (const b of blocks) {
  scene.remove(b.mesh);
  world.removeBody(b.body);
}
blocks.length = 0;

// Build a wall at z = -6
const wallRows = 6, wallCols = 8;
for (let y = 0; y < wallRows; ++y) {
  for (let x = 0; x < wallCols; ++x) {
    const bx = (x - wallCols/2 + 0.5) * 1.05;
    const by = 0.25 + y * 0.52;
    const color = (y % 2 === 0) ? 0xffa500 : 0xffe066;
    blocks.push(createBrick(bx, by, -6, color));
  }
}

// --- Add lights over the brick wall ---
const wallLight = new THREE.PointLight(0xffffff, 1.2, 20);
wallLight.position.set(0, 5, -6);
scene.add(wallLight);

const wallLight2 = new THREE.PointLight(0xffa500, 0.7, 12);
wallLight2.position.set(-4, 4, -5);
scene.add(wallLight2);

const wallLight3 = new THREE.PointLight(0x00cfff, 0.7, 12);
wallLight3.position.set(4, 4, -7);
scene.add(wallLight3);

// --- Ball throwing logic ---
const balls = [];
let ballsLeft = 20;
let gameOver = false;

// UI: Show balls left
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '32px';
infoDiv.style.right = '48px';
infoDiv.style.fontSize = '2em';
infoDiv.style.color = '#00ffe7';
infoDiv.style.textShadow = '0 0 8px #0ff, 0 0 16px #fff';
infoDiv.innerText = `Balls left: ${ballsLeft}`;
document.body.appendChild(infoDiv);

function updateBallsLeft() {
  infoDiv.innerText = `Balls left: ${ballsLeft}`;
}

function showEndOverlay(win) {
  overlay.innerHTML = `<div>${win ? 'You Win! 🎉' : 'Game Over!'}<br><br><button class='legoball-btn'>Restart</button></div>`;
  overlay.style.display = 'flex';
  overlay.querySelector('button').onclick = () => { window.location.reload(); };
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
