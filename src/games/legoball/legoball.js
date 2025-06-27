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
function throwBall() {
  const ballBody = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.6), position: new CANNON.Vec3(0, 2, 6) });
  ballBody.velocity.set((Math.random()-0.5)*2, 0.5+Math.random(), -16);
  world.addBody(ballBody);
  const ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, metalness: 0.8, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.5 });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  // Add glow using a point light
  const glow = new THREE.PointLight(0xffffff, 1, 6);
  ballMesh.add(glow);
  scene.add(ballMesh);
  balls.push({ body: ballBody, mesh: ballMesh });
}

window.addEventListener('click', throwBall);

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
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
// --- END minimal three.js + cannon-es setup ---
