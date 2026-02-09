import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, OrbitControls, Sparkles } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as THREE from "three";

// earth, cloud texture
function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();

  const [dayMap, cloudsMap] = useTexture([
    "/textures/8k_earth_daymap.jpg",
    "/textures/8k_earth_clouds.jpg",
  ]);

  // auto-rotate
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0022;
    }
  });

  return (
    <group position={[3.5, 0, 0]}>
      {/* Earth Surface */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial map={dayMap} roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef} scale={1.01}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// star bg
function Starfield() {
  const texture = useTexture("/textures/8k_stars_milky_way.jpg");

  return (
    <mesh>
      <sphereGeometry args={[200, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// component card
function ModuleCard({ title, description, onClick, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, borderColor: "rgb(6, 182, 212)" }}
      onClick={onClick}
      className="pointer-events-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:bg-white/10"
    >
      <h3
        className="text-xl font-bold text-white mb-2 tracking-wide"
        style={{ fontFamily: "Rajdhani, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // time update per sec
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUTC = (date) => {
    return date.toISOString().replace("T", " ").substring(0, 19) + " UTC";
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={2} />

        {/* Fixed Background */}
        <React.Suspense fallback={null}>
          <Starfield />
        </React.Suspense>

        {/* Twinkling Stars */}
        <Sparkles
          count={2000}
          scale={100}
          size={2}
          speed={0.4}
          opacity={0.6}
          color="#ffffff"
        />

        {/* Earth*/}
        <React.Suspense fallback={null}>
          <Earth />
        </React.Suspense>

        {/* OrbitControls*/}
        <OrbitControls
          target={[3.5, 0, 0]}
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* UI Overlay*/}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-3">
        {/* LEFT COLUMN*/}
        <div className="flex flex-col justify-center pl-12 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at left center, rgba(0, 0, 0, 0.6) 0%, transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <h1
              className="text-7xl font-bold text-white mb-3 tracking-tight"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              AstraSim
            </h1>
            <p
              className="text-xl text-white/80 mb-6 font-light"
              style={{ fontFamily: "Inter, Roboto, sans-serif" }}
            >
              Real-Time Space Situational Awareness
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-sm text-white/50 font-mono tracking-wide"
            >
              SYSTEM ONLINE | TRACKED OBJECTS: 14,009 | {formatUTC(currentTime)}
            </motion.div>
          </motion.div>
        </div>

        {/* CENTER COLUMN*/}
        <div className="flex items-center justify-center"></div>

        {/* RIGHT COLUMN*/}
        <div className="flex items-center justify-end pr-12 relative z-10">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at right center, rgba(0, 0, 0, 0.6) 0%, transparent 70%)",
            }}
          />

          <div className="w-[400px] space-y-4 relative z-10">
            <ModuleCard
              title="LIVE SATELLITE TRACKING"
              description="Real-time monitoring of active satellites, debris, and orbital stations."
              onClick={() => navigate("/tracking")}
              delay={0.4}
            />
            <ModuleCard
              title="SOLAR SYSTEM MAP"
              description="Planetary positions, major moons, and interplanetary relays."
              onClick={() => navigate("/solar")}
              delay={0.5}
            />
            <ModuleCard
              title="NEAR-EARTH OBJECTS"
              description="Tracking potentially hazardous asteroids (PHAs) and comets."
              onClick={() => navigate("/asteroids")}
              delay={0.6}
            />
            <ModuleCard
              title="LAUNCH SCHEDULE"
              description="Upcoming mission countdowns and trajectory planning."
              onClick={() => navigate("/launch")}
              delay={0.7}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
