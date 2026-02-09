# 🌌 AstraSim: Orbital Situational Awareness Platform

![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square) ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![Three.js](https://img.shields.io/badge/Three.js-Fiber-white?style=flat-square&logo=three.js) ![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)

> **Submission for Student HackPad 2026**  
> **Theme:** ORBIT (Building tech beyond Earth)

**AstraSim** is an Open-Source Intelligence (OSINT) dashboard designed to aggregate and visualize critical space domain data. It integrates real-time telemetry from multiple aerospace APIs to provide a unified interface for monitoring satellite constellations, Near-Earth Object (NEO) trajectories, and global launch manifests.

![AstraSim Banner](https://img.shields.io/badge/Space-Tracking-blueviolet?style=for-the-badge)

---

## 📋 Table of Contents

- [Features](#-features)
- [Live Demo](#-live-demo)
- [Tech Stack](#️-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Core Modules](#-core-modules)
- [Technical Implementation](#-technical-implementation--physics)
- [Data Sources](#-data-sources)
- [API Integration](#-api-integration)
- [Development](#-development)
- [Performance](#-performance)
- [AI Usage Statement](#-ai-usage-statement)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🛰️ Real-Time Satellite Tracking

- **14,000+ Active Objects:** Track satellites, debris, space stations, and GPS constellations
- **Live Orbital Propagation:** SGP4 algorithm implementation for accurate position calculation
- **3D Visualization:** Interactive Earth globe with real-time satellite markers
- **Ground Track Mapping:** 2D Leaflet maps showing orbital paths
- **Filter System:** Toggle between debris, stations, Starlink, and GPS satellites
- **Detailed Telemetry:** View velocity, altitude, inclination, and orbital parameters

### ☄️ Near-Earth Object (NEO) Monitoring

- **NASA Integration:** Real-time data from NASA's NeoWs API
- **Risk Assessment:** Color-coded visualization based on PHA (Potentially Hazardous Asteroid) classification
- **Interactive 3D Scene:** Asteroids plotted at relative distances from Earth
- **Kinetic Calculations:** Theoretical energy estimates and Mach number calculations
- **Trajectory Visualization:** Orbital paths for selected asteroids
- **Size Categorization:** Logarithmic scaling for visibility

### 🚀 Global Launch Schedule

- **Live Countdowns:** T-0 synchronization with Launch Library 2 API
- **3D Launch Site Markers:** HTML overlays on interactive Earth globe
- **Mission Details:** Launch vehicle, payload, and mission status
- **Time Zone Conversion:** Automatic UTC to IST conversion
- **Upcoming Missions:** Real-time data on orbital launches worldwide

### ☀️ Solar System Explorer

- **Interactive Heliocentric Model:** Embedded Solar System Scope visualization
- **Planetary Positions:** Accurate ephemeris data
- **Real-Time Alignment:** Current planetary configuration

### 🎨 Premium UI/UX

- **Glassmorphic Design:** Modern, translucent interface elements
- **Smooth Animations:** Framer Motion transitions and effects
- **Responsive Layout:** Works on desktop and tablet devices
- **Dark Theme:** Space-themed aesthetic with cyan accents
- **Custom Scrollbars:** Styled scrollbars matching the theme

---

## 🌐 Live Demo

🔗 **Demo Link:** [https://nebula-ledger.vercel.app](https://nebula-ledger.vercel.app)

---

## 🛠️ Tech Stack

### Core Framework

- **React** 18.2.0 - Component-based UI library
- **Vite** 5.0.8 - Next-generation frontend build tool
- **React Router** 7.11.0 - Client-side routing

### 3D Graphics

- **Three.js** 0.160.0 - WebGL 3D graphics library
- **@react-three/fiber** 8.15.12 - React renderer for Three.js
- **@react-three/drei** 9.92.7 - Helper components (OrbitControls, Stars, Sphere, Html)

### Styling & Animation

- **Tailwind CSS** 3.4.0 - Utility-first CSS framework
- **Framer Motion** 10.16.16 - Production-ready animation library
- **PostCSS** 8.4.32 - CSS transformation tool
- **Autoprefixer** 10.4.16 - Vendor prefix automation

### Mapping & Geospatial

- **Leaflet** 1.9.4 - Interactive 2D maps
- **React Leaflet** 4.2.1 - React components for Leaflet

### Orbital Mechanics

- **satellite.js** 6.0.1 - SGP4/SDP4 orbit propagation library

### UI Components

- **lucide-react** 0.562.0 - Beautiful icon library

---

## 📦 Installation

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher (or yarn/pnpm)
- Modern browser with WebGL support

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/nebula-ledger.git
   cd nebula-ledger
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Download Earth textures:**

   The project requires high-resolution Earth textures (already included in `public/textures/`):
   - `8k_earth_daymap.jpg` (4.5 MB)
   - `8k_earth_clouds.jpg` (11.6 MB)
   - `8k_stars_milky_way.jpg` (1.9 MB)

   If missing, download from [Solar System Scope](https://www.solarsystemscope.com/textures/)

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

---

## 🚀 Usage

### Navigation

The application has **5 main routes:**

#### 1. **Landing Page** (`/`)

- Homepage with mission overview
- Navigation cards to all modules
- Live UTC clock
- 3D rotating Earth visualization

#### 2. **Satellite Tracking** (`/tracking`)

- Real-time 3D satellite positions
- Filter controls (debris, station, Starlink, GPS)
- Search functionality
- Click satellites to view telemetry
- 2D ground track visualization

#### 3. **Asteroid Monitor** (`/asteroids`)

- 3D NEO visualization
- Color-coded risk assessment
- Click asteroids for detailed data
- Trajectory path rendering

#### 4. **Launch Center** (`/launch`)

- 3D Earth with launch site markers
- Real-time countdowns
- Mission details panel
- UTC/IST time conversion

#### 5. **Solar System** (`/solar`)

- Interactive heliocentric model
- Embedded Solar System Scope

### Keyboard Shortcuts

- **Mouse Drag:** Rotate camera view
- **Scroll:** Zoom in/out (on some views)
- **Click:** Select objects for details

---

## 📁 Project Structure

```
nebula-ledger/
├── public/
│   └── textures/              # High-resolution space textures
│       ├── 8k_earth_daymap.jpg
│       ├── 8k_earth_clouds.jpg
│       └── 8k_stars_milky_way.jpg
│
├── src/
│   ├── components/            # React components
│   │   ├── LandingPage.jsx    # Homepage
│   │   ├── UIOverlay.jsx      # Satellite tracking UI
│   │   ├── TelemetryDeck.jsx  # Satellite data display
│   │   ├── SolarSystem.jsx    # Solar system view
│   │   ├── AsteroidWatch.jsx  # NEO tracking
│   │   └── LaunchCenter.jsx   # Launch schedule
│   └── data/
│       └── satelliteData.js   # Fallback TLE data
│
├── Root Components/
│   ├── App.jsx                # Main router & tracking view
│   ├── main.jsx               # Entry point
│   ├── Earth.jsx              # 3D Earth component
│   ├── BackgroundGalaxy.jsx   # Milky Way skybox
│   └── SatelliteMarkers.jsx   # Satellite rendering
│
├── Configuration/
│   ├── index.html             # HTML template
│   ├── index.css              # Global styles + Tailwind
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind setup
│   ├── postcss.config.js      # PostCSS config
│   └── package.json           # Dependencies
│
└── Documentation/
    ├── README.md              # This file
    └── SETUP.md               # Detailed setup guide
```

---

## 🚀 Core Modules

### 1. 🛰️ Satellite Telemetry (LEO/MEO/GEO)

**Purpose:** Real-time visualization and tracking of active satellites in Low Earth Orbit (LEO), Medium Earth Orbit (MEO), and Geostationary Orbit (GEO).

**Features:**

- **Physics Propagation:** Implements the SGP4 algorithm to calculate real-time coordinates from TLE (Two-Line Element) sets
- **Ground Track:** Renders the predicted orbital path relative to Earth's surface using Leaflet maps
- **State Vectors:** Displays live velocity (km/s), altitude (km), and position data (lat/lon)
- **Classification System:** Automatically categorizes satellites (🛰️ Station, 🛰️ Starlink, 📡 GPS, 🔩 Debris)
- **Update Frequency:** Position recalculation every 5 seconds

**Technical Implementation:**

- **Data Source:** CelesTrak API (live TLEs) with fallback to embedded data
- **Propagation:** satellite.js library for SGP4/SDP4 calculations
- **Coordinate Conversion:** ECI → Geodetic → 3D Cartesian for Three.js rendering
- **Performance:** Handles 14,000+ objects with instanced rendering

---

### 2. ☄️ Asteroid Monitor (NEO Tracking)

**Purpose:** 3D visualization and risk assessment of Near-Earth Objects from NASA's NeoWs API.

**Features:**

- **Relative Scaling:** Visualizes NEO proximity relative to Earth and Moon using logarithmic scaling
- **Risk Assessment:** Color-coded markers based on NASA's "Potentially Hazardous Asteroid" (PHA) classification
  - 🔴 Red: PHA (Potentially Hazardous)
  - 🟡 Yellow: Close approach
  - 🟢 Green: Safe distance
- **Kinetic Estimates:** Calculates theoretical kinetic energy and Mach numbers based on velocity and diameter data
- **Trajectory Rendering:** Displays predicted orbital paths for selected asteroids

**Scaling Formula:**

```
S_visual = C_base + ln(D_meters) × k
```

Where small objects are made visible while retaining accurate numerical values in UI.

---

### 3. 🚀 Global Launch Manifest

**Purpose:** Consolidated dashboard for tracking orbital launch activity worldwide.

**Features:**

- **Hybrid Visualization:** HTML/CSS overlays on 3D globe (avoids WebGL overhead)
- **T-0 Synchronization:** Real-time countdowns synchronized to Launch Library 2 API
- **Time Conversion:** Automated UTC → IST conversion for mission planning
- **Mission Details:** Launch vehicle, payload, mission name, status
- **Next Launch Highlight:** Special styling for upcoming launch

**Coordinate Mapping:**

```javascript
x = -R · sin(φ) · cos(θ)
y = R · cos(φ)
z = R · sin(φ) · sin(θ)
```

---

### 4. ☀️ Solaris (Heliocentric Model)

**Purpose:** Interactive reference model of the Solar System.

**Implementation:**

- **Embedded Visualizer:** Solar System Scope iframe integration
- **Accurate Ephemeris:** Real planetary positions and alignments
- **Professional Quality:** Leverages existing specialized tool instead of custom renderer

---

## 📐 Technical Implementation & Physics

### A. Satellite Orbit Propagation

**Algorithm:** SGP4 (Simplified General Perturbations-4)

**Input Format - Two-Line Element (TLE):**

```
ISS (ZARYA)
1 25544U 98067A   23345.50000000  .00012345  00000-0  12345-4 0  9999
2 25544  51.6400 123.4560 0001234  45.6789 314.5678 15.54123456123456
```

**Data Flow:**

1. **Fetch TLEs:** CelesTrak API → Parse 3-line format
2. **Propagate:** satellite.js (SGP4) → ECI coordinates (x, y, z)
3. **Convert:** ECI → Geodetic (lat, lon, alt)
4. **Render:** Geodetic → 3D Cartesian for Three.js scene

**Update Cycle:** Position recalculation every 5 seconds

---

### B. Real-Time Earth Rotation

**Solar Declination Calculation:**

```javascript
const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
const declination = -23.44 * Math.cos((2π / 365) * (dayOfYear + 10))
```

**Greenwich Hour Angle (GHA):**

```javascript
const fractionalHour = hours + minutes/60 + seconds/3600
const gha = -(fractionalHour / 24) * 2π + ROTATION_OFFSET
```

This ensures the Prime Meridian faces the sun at 12:00 UTC, accounting for Earth's 23.5° axial tilt.

**Auto-Return Mechanism:**

- Detects user interaction (camera movement)
- After 5 seconds of inactivity, smoothly returns to real-time rotation
- Uses lerp animation (speed: 0.02) for smooth transitions

---

### C. Coordinate Transformations

**Geodetic to 3D Cartesian:**

```javascript
const latRad = latitude * (Math.PI / 180);
const lonRad = longitude * (Math.PI / 180);

const x = -R * Math.sin(latRad) * Math.cos(lonRad);
const y = R * Math.cos(latRad);
const z = R * Math.sin(latRad) * Math.sin(lonRad);
```

Where:

- `R` = Visual Earth radius (1.0 in Three.js units)
- `latitude`, `longitude` = Geodetic coordinates in degrees

---

### D. Logarithmic Asteroid Scaling

To ensure small asteroids are visible without distorting large ones:

```javascript
const visualSize = BASE_SIZE + Math.log(diameterMeters) * SCALE_FACTOR;
```

Actual measurements displayed in UI panels remain accurate.

---

## 📡 Data Sources

### 1. NASA NeoWs API

- **Purpose:** Near-Earth Object data
- **Endpoint:** `https://api.nasa.gov/neo/rest/v1/feed`
- **Data:** Asteroid diameter, velocity, miss distance, PHA classification
- **Rate Limit:** 1,000 requests/hour (demo key)
- **Documentation:** [NASA API Portal](https://api.nasa.gov/)

### 2. CelesTrak

- **Purpose:** Satellite TLE (Two-Line Element) catalogs
- **Endpoint:** `https://celestrak.org/NORAD/elements/gp.php`
- **Data:** Active satellites, debris, GPS, Starlink constellation
- **Update Frequency:** Daily
- **Documentation:** [CelesTrak](https://celestrak.org/)

### 3. The Space Devs - Launch Library 2

- **Purpose:** Global launch schedule
- **Endpoint:** `https://ll.thespacedevs.com/2.2.0/launch/upcoming`
- **Data:** Launch time, mission name, rocket, pad location, status
- **Update Frequency:** Real-time
- **Documentation:** [LL2 API Docs](https://ll.thespacedevs.com/docs/)

### 4. Solar System Scope

- **Purpose:** Interactive heliocentric visualization
- **Endpoint:** `https://www.solarsystemscope.com/iframe`
- **Data:** Planetary positions, ephemeris data
- **Documentation:** [Solar System Scope](https://www.solarsystemscope.com/)

---

## 🔌 API Integration

### Error Handling Strategy

All API calls implement fallback mechanisms:

```javascript
// Example: Satellite data fetching
try {
  const response = await fetch("https://celestrak.org/NORAD/elements/...");
  const data = await response.text();
  // Process TLEs
} catch (error) {
  console.warn("Live TLE fetch failed, using fallback data");
  // Use embedded satelliteData.js
}
```

### Rate Limiting

- NASA API: 1,000 req/hour (consider caching for production)
- CelesTrak: No explicit limit (respectful usage recommended)
- Launch Library 2: No explicit limit

---

## 🧑‍💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

- **Port:** 5173 (Vite default)
- **HMR:** Hot Module Replacement enabled
- **React Fast Refresh:** Preserves component state during edits

### Production Build

- **Output:** `dist/` directory
- **Optimization:** Code splitting, minification, treeshaking
- **Assets:** Compressed and hashed for caching

### Environment Variables

Create `.env` file (optional):

```env
VITE_NASA_API_KEY=your_nasa_api_key_here
```

---

## ⚡ Performance

### Optimizations Implemented

1. **Lazy Loading:** Routes loaded on demand
2. **Texture Compression:** 8K textures optimized for web
3. **Instance Rendering:** Efficient satellite marker rendering
4. **Update Throttling:** Position updates limited to 5-second intervals
5. **Memoization:** React.memo for expensive components
6. **Asset Cleanup:** Removed 75 MB of unused textures

### Performance Metrics

- **Initial Load:** ~2 seconds (with textures)
- **3D Scene FPS:** 60 FPS (on modern hardware)
- **Memory Usage:** ~150 MB (after optimization)
- **Bundle Size:** ~500 KB (gzipped)

---

## 🤖 AI Usage Statement

### Manual Implementation

- ✅ Application architecture and component hierarchy
- ✅ Orbital mechanics calculations (SGP4, coordinate transformations)
- ✅ State management and data flow
- ✅ 3D scene setup and rendering logic
- ✅ API integration and error handling

### AI-Assisted Tasks

- 🤖 **UI/CSS Generation:** Accelerated creation of Tailwind CSS layouts
- 🤖 **Error Resolution:** Identified specific React rendering cycles and WebGL context errors
- 🤖 **Data Sourcing:** Located and verified public aerospace APIs (NASA, CelesTrak, LL2)
- 🤖 **Code Refactoring:** Suggested optimizations for component structure

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/AmazingFeature`
3. **Commit changes:** `git commit -m 'Add AmazingFeature'`
4. **Push to branch:** `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Code Style

- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic
- Update README for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Data Providers

- **NASA** - NeoWs API for asteroid data
- **CelesTrak** - TLE satellite catalog
- **The Space Devs** - Launch Library 2 API
- **Solar System Scope** - Interactive heliocentric model

### Libraries & Tools

- **Three.js** - 3D graphics rendering
- **React Three Fiber** - Declarative Three.js in React
- **satellite.js** - SGP4/SDP4 implementation
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling

### Inspiration

- NASA's Eyes on the Solar System
- SpaceX ISS Docking Simulator
- Celestia (space simulation software)

---

## 📞 Contact

**Project Maintainer:** Aditya Verma
**Email:** adityaverma9777@gmail.com

**Hackathon Submission:** Student HackPad 2026  
**Theme:** ORBIT (Building tech beyond Earth)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

**Built with ❤️ for space exploration enthusiasts**

🌌 **AstraSim** - Tracking the cosmos, one orbit at a time.
