import * as THREE from 'three';

// Generate procedural textures matching the reference game design
export function createBrickWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Mortar background
  ctx.fillStyle = '#6e5a4d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rows = 32;
  const cols = 8;
  const brickHeight = canvas.height / rows;
  const brickWidth = canvas.width / cols;
  const mortar = 4;

  const brickColors = [
    '#7f281e', '#8c3325', '#983c2c', '#6d2117',
    '#873023', '#5a1910', '#a44432', '#74271c'
  ];

  for (let r = 0; r < rows; r++) {
    const isOffset = r % 2 === 1;
    const startX = isOffset ? -brickWidth / 2 : 0;
    const y = r * brickHeight + mortar / 2;
    const h = brickHeight - mortar;

    for (let c = -1; c <= cols + 1; c++) {
      const x = startX + c * brickWidth + mortar / 2;
      const w = brickWidth - mortar;

      // Pick base color
      const baseCol = brickColors[Math.floor(Math.random() * brickColors.length)];
      ctx.fillStyle = baseCol;
      ctx.fillRect(x, y, w, h);

      // Add subtle noise/shading
      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, 'rgba(255,255,255,0.08)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);

      // Micro speckles for rough brick surface
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      for (let s = 0; s < 12; s++) {
        const sx = x + Math.random() * w;
        const sy = y + Math.random() * h;
        const sr = Math.random() * 2 + 1;
        ctx.fillRect(sx, sy, sr, sr);
      }
    }
  }

  // Vignette overlay
  const radial = ctx.createRadialGradient(512, 512, 200, 512, 512, 700);
  radial.addColorStop(0, 'rgba(0,0,0,0)');
  radial.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 2);
  return texture;
}

export function createCourtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Red glossy court finish like the screenshot
  const courtBase = '#a22d25';
  ctx.fillStyle = courtBase;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Parquet wood floor planks
  const plankHeight = 16;
  for (let y = 0; y < canvas.height; y += plankHeight) {
    const shade = (Math.random() - 0.5) * 14;
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(shade) / 100})`;
    ctx.fillRect(0, y, canvas.width, plankHeight);

    // Subtle grain lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(0, y, canvas.width, 1);
  }

  // Court Markings (White and faint grey lines matching the image)
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#dfddda';

  // Center / Key circle near the pole base
  ctx.beginPath();
  ctx.ellipse(512, 320, 120, 40, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Baseline through the pole
  ctx.beginPath();
  ctx.moveTo(340, 320);
  ctx.lineTo(684, 320);
  ctx.stroke();

  // Free throw arc / 3-point dashed arc
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.ellipse(512, 600, 420, 140, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Solid perimeter line
  ctx.beginPath();
  ctx.moveTo(100, 720);
  ctx.lineTo(924, 720);
  ctx.stroke();

  // Floor reflection sheen (glossy highlight)
  const sheen = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sheen.addColorStop(0, 'rgba(255,255,255,0.18)');
  sheen.addColorStop(0.3, 'rgba(255,255,255,0.08)');
  sheen.addColorStop(0.7, 'rgba(0,0,0,0.1)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createBasketballTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich basketball orange
  ctx.fillStyle = '#dc5815';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pebble grain stippling
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let i = 0; i < 28000; i++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    ctx.fillRect(px, py, 1.5, 1.5);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let i = 0; i < 18000; i++) {
    const px = Math.random() * canvas.width;
    const py = Math.random() * canvas.height;
    ctx.fillRect(px, py, 1.2, 1.2);
  }

  // Black seam ribs
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#181512';
  ctx.lineCap = 'round';

  // Equator horizontal seam
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Vertical seams (central meridians)
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.stroke();

  // Curved ribs (2 characteristic basketball arcs)
  const drawArcRib = (cx) => {
    ctx.beginPath();
    ctx.ellipse(cx, canvas.height / 2, canvas.width / 5, canvas.height * 0.44, 0, 0, Math.PI * 2);
    ctx.stroke();
  };
  drawArcRib(canvas.width * 0.25);
  drawArcRib(canvas.width * 0.75);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createBackboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Outer transparency / clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Distinctive shaped backboard with rounded upper corners like the screenshot
  const x = 50;
  const y = 50;
  const w = 924;
  const h = 668;
  const r = 80;

  ctx.save();
  ctx.beginPath();
  // Custom curved outline as in the screenshot
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w * 0.3, y);
  ctx.quadraticCurveTo(x + w * 0.35, y + 40, x + w * 0.5, y + 40);
  ctx.quadraticCurveTo(x + w * 0.65, y + 40, x + w * 0.7, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  // White base
  ctx.fillStyle = '#f5f5f5';
  ctx.fill();

  // Red outer border
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#c42823';
  ctx.stroke();

  // Inner subtle border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#e66560';
  ctx.stroke();

  // Red target rectangle (shooter's square)
  const sqW = 320;
  const sqH = 240;
  const sqX = (canvas.width - sqW) / 2;
  const sqY = canvas.height * 0.38;

  ctx.lineWidth = 16;
  ctx.strokeStyle = '#c42823';
  ctx.strokeRect(sqX, sqY, sqW, sqH);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createNetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;

  const step = 32;
  for (let i = -canvas.width; i < canvas.width * 2; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + canvas.height, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, canvas.height);
    ctx.lineTo(i + canvas.height, 0);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 4);
  return texture;
}
