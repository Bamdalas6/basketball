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
const scoreOpponentEl = document.getElementById('score-opponent');
const timerEl = document.getElementById('timer-display');
const comboBannerEl = document.getElementById('combo-banner');
const streakBadgeEl = document.getElementById('streak-badge');
const soundBtn = document.getElementById('btn-sound');
const restartBtn = document.getElementById('btn-restart');
const pauseBtn = document.getElementById('btn-pause');
const startModal = document.getElementById('start-modal');
const gameOverModal = document.getElementById('game-over-modal');
const btnPlayNow = document.getElementById('btn-play-now');
const btnPlayAgain = document.getElementById('btn-play-again');
const finalScorePlayerEl = document.getElementById('final-score-player');
const finalScoreOpponentEl = document.getElementById('final-score-opponent');
const finalResultEl = document.getElementById('final-result-text');
const finalStatsEl = document.getElementById('final-stats');
const modeSelect = document.getElementById('game-mode-select');

// Sound state
let soundEnabled = true;
soundBtn.addEventListener('click', () => {
  soundEnabled = sound.toggle();
  soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
});

// Setup Game and Physics
const physics = new PhysicsWorld(sound);
const game = new GameManager(sound);

// Setup Three.js Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// Camera
const camera = new THREE.PerspectiveCamera(
  48,
  canvasContainer.clientWidth / canvasContainer.clientHeight,
  0.1,
  100
);
camera.position.set(0, 2.7, 7.8);
camera.lookAt(0, 3.2, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasContainer.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const mainSpot = new THREE.SpotLight(0xfff4e6, 1.4);
mainSpot.position.set(0, 8, 5);
mainSpot.angle = Math.PI / 3;
mainSpot.penumbra = 0.5;
mainSpot.castShadow = true;
mainSpot.shadow.mapSize.width = 1024;
mainSpot.shadow.mapSize.height = 1024;
scene.add(mainSpot);

const backLight = new THREE.DirectionalLight(0xffe8d6, 0.6);
backLight.position.set(0, 6, -3);
scene.add(backLight);

// 1. Brick Wall Background
const brickTexture = createBrickWallTexture();
const wallGeo = new THREE.PlaneGeometry(16, 12);
const wallMat = new THREE.MeshStandardMaterial({
  map: brickTexture,
  roughness: 0.9,
  metalness: 0.1
});
const wallMesh = new THREE.Mesh(wallGeo, wallMat);
wallMesh.position.set(0, 5, -0.2);
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

// 3. Basketball Hoop Group (Supports moving side-to-side)
const hoopGroup = new THREE.Group();
scene.add(hoopGroup);

// Vertical Post / Pole
const poleGeo = new THREE.CylinderGeometry(0.07, 0.07, 4.2, 24);
const poleMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.2 });
const poleMesh = new THREE.Mesh(poleGeo, poleMat);
poleMesh.position.set(0, 1.9, -0.08);
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
backboardMesh.position.set(0, 3.6, 0);
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
rimMesh.position.set(0, 3.5, 0.45);
rimMesh.castShadow = true;
hoopGroup.add(rimMesh);

// Rim Support Bracket to Backboard
const bracketGeo = new THREE.BoxGeometry(0.18, 0.06, 0.44);
const bracketMesh = new THREE.Mesh(bracketGeo, rimMat);
bracketMesh.position.set(0, 3.48, 0.22);
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
netMesh.position.set(0, 3.16, 0.45);
hoopGroup.add(netMesh);

// 4. Basketball Setup
const ballRadius = 0.24;
const ballTexture = createBasketballTexture();
const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
const ballMat = new THREE.MeshStandardMaterial({
  map: ballTexture,
  roughness: 0.6,
  metalness: 0.08
});

const ballMesh = new THREE.Mesh(ballGeo, ballMat);
ballMesh.castShadow = true;
scene.add(ballMesh);

// Ball physics state
const ballRestPosition = new THREE.Vector3(0, 0.55, 5.6);
const ball = {
  mesh: ballMesh,
  radius: ballRadius,
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  angularVelocity: new THREE.Vector3(),
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
  ball.velocity.set(0, 0, 0);
  ball.angularVelocity.set(0, 0, 0);
  ballMesh.position.copy(ballRestPosition);
  ballMesh.rotation.set(0.1, 0, 0);
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
  }, 400);
};

// Trajectory Aiming Line (Dots)
const maxDots = 14;
const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
const dotInstanced = new THREE.InstancedMesh(dotGeo, dotMat, maxDots);
dotInstanced.visible = false;
scene.add(dotInstanced);

// 5. Swipe Input Handling
let isPointerDown = false;
let pointerStart = { x: 0, y: 0, time: 0 };
let pointerCurrent = { x: 0, y: 0 };

function getPointerPos(e) {
  const rect = canvasContainer.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
    width: rect.width,
    height: rect.height
  };
}

function handlePointerDown(e) {
  if (!game.isPlaying || game.isPaused || ball.active) return;
  sound.init(); // unlock audio on user gesture

  const pos = getPointerPos(e);
  // Check if tap was in the lower half of screen
  if (pos.y < pos.height * 0.4) return;

  isPointerDown = true;
  pointerStart = { x: pos.x, y: pos.y, time: performance.now() };
  pointerCurrent = { x: pos.x, y: pos.y };
  dotInstanced.visible = true;
}

function handlePointerMove(e) {
  if (!isPointerDown) return;
  const pos = getPointerPos(e);
  pointerCurrent = { x: pos.x, y: pos.y };

  // Calculate shot prediction for trajectory dots
  const dx = pointerStart.x - pointerCurrent.x;
  const dy = pointerStart.y - pointerCurrent.y; // drag upwards

  if (dy > 20) {
    dotInstanced.visible = true;
    const simVx = -(dx / pos.width) * 6.5;
    const simVy = Math.min(13.8, Math.max(8.5, (dy / pos.height) * 16.5 + 4.5));
    const simVz = -Math.min(14.0, Math.max(9.0, (dy / pos.height) * 16.0 + 5.0));

    const dummy = new THREE.Object3D();
    const dt = 0.055;
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
      const scale = (1 - i / maxDots) * 0.9 + 0.3;
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

  const now = performance.now();
  const dt = Math.max(50, now - pointerStart.time);
  const dx = pointerStart.x - pointerCurrent.x;
  const dy = pointerStart.y - pointerCurrent.y;
  const rect = canvasContainer.getBoundingClientRect();

  // Minimum upward flick threshold
  if (dy > 30) {
    game.recordShotStart();

    // Map gesture delta to 3D shot velocity
    const speedRatio = Math.min(2.5, Math.max(0.6, 260 / dt));
    const vx = -(dx / rect.width) * 7.2;
    const vy = Math.min(14.0, Math.max(9.0, (dy / rect.height) * 15.5 + 4.2 * speedRatio));
    const vz = -Math.min(13.8, Math.max(8.8, (dy / rect.height) * 15.0 + 4.5 * speedRatio));

    ball.velocity.set(vx, vy, vz);
    ball.angularVelocity.set(-14.0, (Math.random() - 0.5) * 2.0, (dx / rect.width) * 8.0);
    ball.active = true;

    sound.playWhoosh();
  }
}

// Add event listeners to container
canvasContainer.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

canvasContainer.addEventListener('touchstart', handlePointerDown, { passive: true });
window.addEventListener('touchmove', handlePointerMove, { passive: true });
window.addEventListener('touchend', handlePointerUp, { passive: true });

// Game Manager UI Handlers
game.onStateChange = (state) => {
  scorePlayerEl.textContent = state.playerScore.toString().padStart(2, '0');
  scoreOpponentEl.textContent = state.opponentScore.toString().padStart(2, '0');

  if (state.mode === 'PRACTICE') {
    timerEl.textContent = 'FREE';
  } else {
    const min = Math.floor(state.timeLeft / 60);
    const sec = state.timeLeft % 60;
    timerEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  if (state.streak >= 2) {
    streakBadgeEl.textContent = `STREAK x${state.streak} 🔥`;
    streakBadgeEl.classList.add('visible');
  } else {
    streakBadgeEl.classList.remove('visible');
  }

  pauseBtn.textContent = state.isPaused ? '▶️' : '⏸️';
};

game.onComboEvent = (text, color) => {
  comboBannerEl.textContent = text;
  comboBannerEl.style.color = color || '#f59e0b';
  comboBannerEl.classList.remove('animate');
  void comboBannerEl.offsetWidth; // trigger reflow
  comboBannerEl.classList.add('animate');
};

game.onGameOver = (results) => {
  finalScorePlayerEl.textContent = results.playerScore;
  finalScoreOpponentEl.textContent = results.opponentScore;

  if (results.isWinner) {
    finalResultEl.textContent = '🏆 VICTORY!';
    finalResultEl.style.color = '#10b981';
  } else {
    finalResultEl.textContent = 'GAME OVER';
    finalResultEl.style.color = '#ef4444';
  }

  finalStatsEl.innerHTML = `
    <div>Accuracy: <strong>${results.accuracy}%</strong></div>
    <div>Clean Swishes: <strong>${results.swishes}</strong></div>
    <div>Best Streak: <strong>${results.bestStreak}</strong></div>
  `;

  gameOverModal.classList.remove('hidden');
};

// UI Control buttons
btnPlayNow.addEventListener('click', () => {
  startModal.classList.add('hidden');
  game.start(modeSelect.value);
});

btnPlayAgain.addEventListener('click', () => {
  gameOverModal.classList.add('hidden');
  resetBall();
  game.start(modeSelect.value);
});

restartBtn.addEventListener('click', () => {
  resetBall();
  game.start(modeSelect.value);
});

pauseBtn.addEventListener('click', () => {
  game.pause();
});

// Window Resize handling
window.addEventListener('resize', () => {
  const w = canvasContainer.clientWidth;
  const h = canvasContainer.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

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
  } else {
    // Idle gentle hover/breathing animation
    const idleY = ballRestPosition.y + Math.sin(now * 0.004) * 0.025;
    ballMesh.position.y = idleY;
  }

  // Net wobble
  physics.updateNet(netMesh, dt);

  renderer.render(scene, camera);
}

animate();
