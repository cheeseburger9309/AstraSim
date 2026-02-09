# AstraSim - Setup Instructions

## Phase 1: Photorealistic 3D Earth Environment

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

#### 1. Install Dependencies

```bash
npm install
```

This will install:

- **React** (^18.2.0) - UI framework
- **Vite** (^5.0.8) - Build tool
- **@react-three/fiber** (^8.15.12) - React renderer for Three.js
- **@react-three/drei** (^9.92.7) - Useful Three.js helpers
- **three** (^0.160.0) - 3D graphics library
- **framer-motion** (^10.16.16) - Animation library
- **Tailwind CSS** (^3.4.0) - Utility-first CSS framework

#### 2. Download Earth Textures

> [!IMPORTANT]
> You MUST download high-resolution Earth textures for the photorealistic effect.

Create a `public/textures/` folder and download these textures:

1. **8k_earth_daymap.jpg** - Earth surface texture
   - Source: https://www.solarsystemscope.com/textures/
   - Or: NASA Visible Earth

2. **8k_earth_clouds.jpg** - Cloud layer texture
   - Source: https://www.solarsystemscope.com/textures/

Place both files in: `public/textures/`

Your folder structure should look like:

```
nebula-ledger/
├── public/
│   └── textures/
│       ├── 8k_earth_daymap.jpg
│       └── 8k_earth_clouds.jpg
├── main.jsx
├── App.jsx
├── Earth.jsx
├── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

#### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Features Implemented

✅ **Cinematic 3D Scene**

- Full-screen R3F Canvas with black background
- Camera positioned at [0, 0, 5] for optimal viewing

✅ **Photorealistic Lighting**

- Ambient light (intensity 0.5) for base illumination
- Directional sunlight (intensity 2.5) at [5, 3, 5] creating day/night terminator

✅ **Deep Space Environment**

- 20,000 stars with 300-unit radius
- 60-unit depth for immersive parallax

✅ **High-Fidelity Earth**

- 8K texture-mapped surface sphere
- Separate cloud layer with transparency (40% opacity)
- Differential rotation: Earth rotates slowly, clouds slightly faster
- Realistic material properties (roughness 0.7, metalness 0.1)

✅ **Interactive Controls**

- Orbit controls for camera manipulation
- Zoom limits: 3-10 units
- Pan disabled for focused experience

### Tech Stack

- **React** - Component architecture
- **Vite** - Lightning-fast HMR
- **Tailwind CSS** - UI overlay styling
- **@react-three/fiber** - Declarative Three.js
- **@react-three/drei** - OrbitControls, Stars
- **framer-motion** - Future UI animations

### Next Steps (Phase 2+)

- Add satellite tracking
- Implement traffic control UI overlay
- Real-time data visualization
- Flight path rendering
- Mission control dashboard

---

**Visual Quality Note:** The output is designed to be cinematic and high-fidelity, not cartoonish. The combination of 8K textures, proper lighting, and cloud transparency creates a photorealistic Earth visualization suitable for a hackathon-winning project.
