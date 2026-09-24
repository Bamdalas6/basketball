# 🏀 Arcade Basketball Shootout

A high-performance, mobile-first 3D arcade basketball game built with **Three.js**, **Web Audio API**, and **Vite**, designed to match the classic Messenger / GamePigeon shootout experience.

Ready for zero-config static deployment on **Cloudflare Pages**.

![Arcade Basketball Preview](public/favicon.svg)

---

## ✨ Features

- **Realistic 3D Physics Simulation:**
  - Parabolic trajectories with gravity, velocity scaling, and backspin.
  - Multi-point rim collision detection (metallic ring bounce) with restitution.
  - Composite backboard rebound physics.
  - Hardwood floor bouncing with kinetic friction and damping.
  - Dynamic responsive net wobble and swish deformation.
- **Intuitive Swipe & Flick Controls:**
  - Touch & mouse gesture tracking with angle, power, and release speed calculation.
  - Visual trajectory guidance indicator while aiming.
- **Visual Design & Atmosphere:**
  - Rustic red exposed-brick wall background.
  - Polished red hardwood basketball court with glossy specular sheen and court markings.
  - Official styled backboard with red shooter's square and metallic red steel rim.
  - Digital LED scoreboard with 7-segment red score counters and amber countdown timer.
  - Player and Opponent cartoon avatar headers.
- **Competitive Game Modes:**
  - **1v1 vs Rival (60s Shootout):** Race against an AI opponent who takes real-time shots.
  - **Streak Mode:** Endless play until you accumulate 3 missed shots.
  - **Free Throw Practice:** Relaxed, untimed shooting with accuracy statistics.
- **Dynamic Challenge & Combos:**
  - **Moving Hoop:** Once you reach 10+ points, the hoop sways side-to-side for an authentic arcade challenge.
  - **Clean Swishes:** +3 Points and green confetti bursts.
  - **Hot Streaks:** "ON FIRE! 🔥" and "UNSTOPPABLE! ⚡" multipliers with particle celebrations.
- **100% Procedural Audio & Assets:**
  - Zero external MP3 / image dependencies — all sound effects (bounces, rim clanks, net swishes, whistles, buzzers) are synthesized via the **Web Audio API**.
  - All textures (bricks, wood grain, leather basketball seams, backboard) are generated procedurally on HTML5 Canvas.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Bamdalas6/basketball.git

# Enter project directory
cd basketball

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## ⚡ Deployment to Cloudflare Pages

This application compiles to a static bundle (`dist/`), making it directly compatible with **Cloudflare Pages**.

### Option A: Automatic Git Integration (Recommended)
1. Go to your **[Cloudflare Dashboard](https://dash.cloudflare.com/)** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository: `Bamdalas6/basketball`.
3. Set the build configuration:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. Cloudflare Pages will automatically deploy every push to `main`!

### Option B: Cloudflare Wrangler CLI
```bash
# Build the project
npm run build

# Deploy with Wrangler
npx wrangler pages deploy dist --project-name=basketball-shootout
```

---

## 🛠️ Tech Stack

- **Three.js:** 3D rendering, lighting, camera perspective, and materials.
- **Web Audio API:** Real-time sound synthesis (no external audio files needed).
- **Vite:** Next-generation frontend tooling and bundler.
- **Canvas Confetti:** Victory and combo celebratory particle effects.
- **Cloudflare Pages:** Optimized global CDN hosting with automated SSL and edge caching.

---

## 📄 License

MIT License. Open-source for personal and commercial game development.
