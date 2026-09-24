import * as THREE from 'three';
import { sound } from './audio.js';
import {
  createBrickWallTexture,
  createCourtTexture,
  createBasketballTexture,
  createBackboardTexture,
  createNetTexture
} from './textures.js';
import { PhysicsWorld } from './physics.js';
import { GameManager } from './game.js';

// DOM Elements
const canvasContainer = document.getElementById('canvas-container');
const scorePlayerEl = document.getElementById('score-player');
const scoreBestEl = document.getElementById('score-best');
const comboBannerEl = document.getElementById('combo-banner');
const streakBadgeEl = document.getElementById('streak-badge');
const swipeHintEl = document.getElementById('swipe-hint');
const soundBtn = document.getElementById('btn-sound');
const restartBtn = document.getElementById('btn-restart');

// Sound state
let soundEnabled = true;
soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  soundEnabled = sound.toggle();
  soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
});

// Setup Game & Physics
const physics = new PhysicsWorld(sound);
const game = new GameManager(sound);

// Setup Three.js Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0c);

// Camera Setup: Tuned so the ball is ALWAYS prominent and visible at the bottom center
const camera = new THREE.PerspectiveCamera(
  72,
  canvasContainer.clientWidth / canvasContainer.clientHeight,
  0.1,
  100
);
camera.position.set(0, 1.25, 5.8);
camera.lookAt(0, 1.4, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasContainer.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

const mainSpot = new THREE.SpotLight(0xfff5ea, 1.5);
mainSpot.position.set(0, 7.5, 4.5);
mainSpot.angle = Math.PI / 3;
mainSpot.penumbra = 0.5;
mainSpot.castShadow = true;
scene.add(mainSpot);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
fillLight.position.set(0, 4, 6);
scene.add(fillLight);

// 1. Brick Wall Background
const brickTexture = createBrickWallTexture();
const wallGeo = new THREE.PlaneGeometry(16, 10);
const wallMat = new THREE.MeshStandardMaterial({
  map: brickTexture,
  roughness: 0.9,
  metalness: 0.05
});
const wallMesh = new THREE.Mesh(wallGeo, wallMat);
wallMesh.position.set(0, 4.5, -0.2);
scene.add(wallMesh);

// 2. Glossy Basketball Court Floor
const courtTexture = createCourtTexture();
const courtGeo = new THREE.PlaneGeometry(14, 16);
const courtMat = new THREE.MeshStandardMaterial({
  map: courtTexture,
  roughness: 0.35,
  metalness: 0.15
});
const courtMesh = new THREE.Mesh(courtGeo, courtMat);
courtMesh.rotation.x = -Math.PI / 2;
courtMesh.position.set(0, 0, 4);
courtMesh.receiveShadow = true;
scene.add(courtMesh);

// 3. Basketball Hoop Group
const hoopGroup = new THREE.Group();
scene.add(hoopGroup);

// Vertical Post / Pole
const poleGeo = new THREE.CylinderGeometry(0.065, 0.065, 3.8, 24);
const poleMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.2 });
const poleMesh = new THREE.Mesh(poleGeo, poleMat);
poleMesh.position.set(0, 1.6, -0.08);
poleMesh.castShadow = true;
hoopGroup.add(poleMesh);

// Circular base ring at court level
const baseRingGeo = new THREE.TorusGeometry(0.18, 0.03, 16, 32);
const baseRingMesh = new THREE.Mesh(baseRingGeo, poleMat);
baseRingMesh.rotation.x = Math.PI / 2;
baseRingMesh.position.set(0, 0.03, -0.08);
hoopGroup.add(baseRingMesh);

// Backboard
const bbTexture = createBackboardTexture();
const bbGeo = new THREE.BoxGeometry(2.3, 1.7, 0.04);
const bbFrontMat = new THREE.MeshStandardMaterial({
  map: bbTexture,
  transparent: true,
  roughness: 0.2,
  metalness: 0.1
});
const bbSidesMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });
const bbMaterials = [bbSidesMat, bbSidesMat, bbSidesMat, bbSidesMat, bbFrontMat, bbSidesMat];
const backboardMesh = new THREE.Mesh(bbGeo, bbMaterials);
backboardMesh.position.set(0, 3.3, 0);
backboardMesh.castShadow = true;
hoopGroup.add(backboardMesh);

// Rim (Steel Red Ring)
const rimRadius = 0.45;
const rimTubeRadius = 0.024;
const rimGeo = new THREE.TorusGeometry(rimRadius, rimTubeRadius, 16, 48);
const rimMat = new THREE.MeshStandardMaterial({
  color: 0xc8221b,
  roughness: 0.3,
  metalness: 0.7
});
const rimMesh = new THREE.Mesh(rimGeo, rimMat);
rimMesh.rotation.x = Math.PI / 2;
rimMesh.position.set(0, 3.2, 0.45);
rimMesh.castShadow = true;
hoopGroup.add(rimMesh);

// Rim Support Bracket
const bracketGeo = new THREE.BoxGeometry(0.16, 0.06, 0.44);
const bracketMesh = new THREE.Mesh(bracketGeo, rimMat);
bracketMesh.position.set(0, 3.18, 0.22);
hoopGroup.add(bracketMesh);

// Net
const netTexture = createNetTexture();
const netGeo = new THREE.CylinderGeometry(0.44, 0.28, 0.65, 24, 8, true);
const netMat = new THREE.MeshStandardMaterial({
  map: netTexture,
  transparent: true,
  opacity: 0.95,
  side: THREE.DoubleSide,
  roughness: 0.7
});
const netMesh = new THREE.Mesh(netGeo, netMat);
netMesh.position.set(0, 2.86, 0.45);
hoopGroup.add(netMesh);

// 4. Basketball Setup: Large, visible ball at bottom center
const ballRadius = 0.30;
const ballTexture = createBasketballTexture();
const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
const ballMat = new THREE.MeshStandardMaterial({
  map: ballTexture,
  roughness: 0.55,
  metalness: 0.05
});

const ballMesh = new THREE.Mesh(ballGeo, ballMat);
ballMesh.castShadow = true;
scene.add(ballMesh);

// Rest position: clearly visible at bottom center
const ballRestPosition = new THREE.Vector3(0, 0.38, 4.25);
const ball = {
  mesh: ballMesh,
  radius: ballRadius,
  position: new THREE.Vector3().copy(ballRestPosition),
  rotation: new THREE.Euler(0.1, 0, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  angularVelocity: new THREE.Vector3(0, 0, 0),
  active: false,
  hasScored: false,
  touchedRim: false,
  touchedBackboard: false,
  settleTimer: 0,
  onScore: null,
  onSettle: null
};

function resetBall() {
  ball.position.copy(ballRestPosition);
  ball.rotation.set(0.1, 0, 0);
  ball.velocity.set(0, 0, 0);
  ball.angularVelocity.set(0, 0, 0);
  ballMesh.position.copy(ballRestPosition);
  ballMesh.rotation.copy(ball.rotation);
  ball.active = false;
  ball.hasScored = false;
  ball.touchedRim = false;
  ball.touchedBackboard = false;
  ball.settleTimer = 0;
}

resetBall();

ball.onScore = (isSwish) => {
  game.recordScore(isSwish);
};

ball.onSettle = () => {
  if (!ball.hasScored) {
    game.recordMiss();
  }
  setTimeout(() => {
    resetBall();
  }, 350);
};

// Trajectory Prediction Dots
const maxDots = 14;
const dotGeo = new THREE.SphereGeometry(0.035, 8, 8);
const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
const dotInstanced = new THREE.InstancedMesh(dotGeo, dotMat, maxDots);
dotInstanced.visible = false;
scene.add(dotInstanced);

// 5. Unified Pointer Events (Mouse, Touch, Stylus)
let isPointerDown = false;
let pointerStart = { x: 0, y: 0, time: 0 };
let pointerCurrent = { x: 0, y: 0 };

function launchBall(vx, vy, vz) {
  if (ball.active) return;
  game.recordShotStart();

  ball.position.copy(ballRestPosition);
  ball.velocity.set(vx, vy, vz);
  ball.angularVelocity.set(-14.0, (Math.random() - 0.5) * 2.0, vx * 1.5);
  ball.active = true;

  sound.playWhoosh();

  if (swipeHintEl) {
    swipeHintEl.style.display = 'none';
  }
}

function handlePointerDown(e) {
  if (ball.active) return;
  sound.init(); // unlock audio on user gesture

  isPointerDown = true;
  pointerStart = { x: e.clientX, y: e.clientY, time: performance.now() };
  pointerCurrent = { x: e.clientX, y: e.clientY };

  try {
    canvasContainer.setPointerCapture(e.pointerId);
  } catch (err) {
    // Ignore pointer capture if not supported
  }
}

function handlePointerMove(e) {
  if (!isPointerDown || ball.active) return;
  pointerCurrent = { x: e.clientX, y: e.clientY };

  const dx = pointerStart.x - pointerCurrent.x;
  const dy = pointerStart.y - pointerCurrent.y; // upward drag
  const rect = canvasContainer.getBoundingClientRect();

  if (dy > 12) {
    dotInstanced.visible = true;
    const simVx = -(dx / rect.width) * 4.6;
    const simVy = Math.min(12.6, Math.max(9.2, (dy / rect.height) * 11.5 + 6.8));
    const simVz = -Math.min(6.8, Math.max(4.6, (dy / rect.height) * 6.5 + 3.6));

    const dummy = new THREE.Object3D();
    const dt = 0.05;
    let px = ballRestPosition.x;
    let py = ballRestPosition.y;
    let pz = ballRestPosition.z;
    let vy = simVy;

    for (let i = 0; i < maxDots; i++) {
      px += simVx * dt;
      py += vy * dt;
      pz += simVz * dt;
      vy += physics.gravity * dt;

      dummy.position.set(px, py, pz);
      const scale = (1 - i / maxDots) * 0.8 + 0.3;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      dotInstanced.setMatrixAt(i, dummy.matrix);
    }
    dotInstanced.instanceMatrix.needsUpdate = true;
  } else {
    dotInstanced.visible = false;
  }
}

function handlePointerUp(e) {
  if (!isPointerDown) return;
  isPointerDown = false;
  dotInstanced.visible = false;

  try {
    canvasContainer.releasePointerCapture(e.pointerId);
  } catch (err) {
    // Ignore
  }

  const now = performance.now();
  const dt = Math.max(40, now - pointerStart.time);
  const dx = pointerStart.x - e.clientX;
  const dy = pointerStart.y - e.clientY;
  const rect = canvasContainer.getBoundingClientRect();

  if (dy > 18) {
    // User swiped/flicked upward
    const speedRatio = Math.min(2.0, Math.max(0.7, 240 / dt));
    const vx = -(dx / rect.width) * 5.2;
    const vy = Math.min(12.8, Math.max(9.4, (dy / rect.height) * 11.2 + 5.8 * speedRatio));
    const vz = -Math.min(7.0, Math.max(4.8, (dy / rect.height) * 6.2 + 3.2 * speedRatio));
    launchBall(vx, vy, vz);
  } else if (dt < 400 && Math.abs(dx) < 30 && Math.abs(dy) < 30) {
    // Tap or quick click to shoot! Aim towards current hoop position
    const targetX = game.hoopPositionX * 0.45;
    const vx = targetX + (Math.random() - 0.5) * 0.25;
    const vy = 10.75 + (Math.random() - 0.5) * 0.3;
    const vz = -5.38 + (Math.random() - 0.5) * 0.2;
    launchBall(vx, vy, vz);
  }
}

function handlePointerCancel(e) {
  isPointerDown = false;
  dotInstanced.visible = false;
}

// Attach Unified Pointer Listeners
canvasContainer.addEventListener('pointerdown', handlePointerDown);
canvasContainer.addEventListener('pointermove', handlePointerMove);
canvasContainer.addEventListener('pointerup', handlePointerUp);
canvasContainer.addEventListener('pointercancel', handlePointerCancel);

// Game Manager UI Handlers
game.onStateChange = (state) => {
  scorePlayerEl.textContent = state.score.toString();
  scoreBestEl.textContent = state.bestScore.toString();

  if (state.streak >= 2) {
    streakBadgeEl.textContent = `STREAK x${state.streak} 🔥`;
    streakBadgeEl.classList.add('visible');
  } else {
    streakBadgeEl.classList.remove('visible');
  }
};

game.onComboEvent = (text, color) => {
  comboBannerEl.textContent = text;
  comboBannerEl.style.color = color || '#10b981';
  comboBannerEl.classList.remove('animate');
  void comboBannerEl.offsetWidth; // trigger reflow
  comboBannerEl.classList.add('animate');
};

restartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  resetBall();
  game.reset();
});

// Window Resize handling
window.addEventListener('resize', () => {
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// Start game
game.start();

// Main Animation & Physics Loop
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  // Update Game Logic
  game.update(dt);

  // Sync Moving Hoop position
  hoopGroup.position.x = game.hoopPositionX;
  physics.setHoopX(game.hoopPositionX);

  // Physics simulation
  if (ball.active) {
    physics.step(ball, dt);
    ballMesh.position.copy(ball.position);
    ballMesh.rotation.copy(ball.rotation);
  } else {
    // Idle gentle hover/breathing animation
    const idleY = ballRestPosition.y + Math.sin(now * 0.004) * 0.012;
    ballMesh.position.y = idleY;
  }

  // Net wobble
  physics.updateNet(netMesh, dt);

  renderer.render(scene, camera);
}

animate();
