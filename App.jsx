import React, { useRef, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Earth from './Earth'
import BackgroundGalaxy from './BackgroundGalaxy'
import SatelliteMarkers from './SatelliteMarkers'
import UIOverlay from './src/components/UIOverlay'
import LandingPage from './src/components/LandingPage'
import TelemetryDeck from './src/components/TelemetryDeck'
import SolarSystem from './src/components/SolarSystem'
import AsteroidWatch from './src/components/AsteroidWatch'
import LaunchCenter from './src/components/LaunchCenter'



// Real sun position based on current date and time
function RealSunLight() {
    const lightRef = useRef()

    useEffect(() => {
        const updateSunPosition = () => {
            if (!lightRef.current) return

            const now = new Date()
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)

            // Calculate solar declination (Earth's 23.5°)
            const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))
            const declinationRad = declination * Math.PI / 180

            // Position sun based on declination
            const sunDistance = 10
            const sunY = Math.sin(declinationRad) * sunDistance
            const sunZ = Math.cos(declinationRad) * sunDistance

            lightRef.current.position.set(0, sunY, sunZ)
        }

        updateSunPosition()
        const interval = setInterval(updateSunPosition, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [])

    return (
        <directionalLight
            ref={lightRef}
            intensity={2.5}
            color="#ffffff"
        />
    )
}

// Camera controller 
function CameraController({ cameraControlRef }) {
    const { camera } = useThree()
    const controlsRef = useRef()

    useEffect(() => {
        if (cameraControlRef) {
            cameraControlRef.current = {
                zoomIn: () => {
                    const newDistance = Math.max(camera.position.length() - 0.5, 3)
                    const direction = camera.position.clone().normalize()
                    camera.position.copy(direction.multiplyScalar(newDistance))
                },
                zoomOut: () => {
                    const newDistance = Math.min(camera.position.length() + 0.5, 10)
                    const direction = camera.position.clone().normalize()
                    camera.position.copy(direction.multiplyScalar(newDistance))
                }
            }
        }
    }, [camera, cameraControlRef])

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
        />
    )
}

// Tracking View 
function TrackingView() {
    const [satelliteData, setSatelliteData] = useState([])
    const [selectedSat, setSelectedSat] = useState(null)
    const [filters, setFilters] = useState({
        debris: true,
        station: true,
        starlink: true,
        gps: true
    })
    const cameraControlRef = useRef()

    return (
        <div className="w-screen bg-black">
            {/* 3D Canvas - Fixed at top */}
            <div className="h-screen relative">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 45 }}
                    gl={{ antialias: true }}
                    style={{ background: '#000000' }}
                >
                    {/* Lighting Setup */}
                    <ambientLight intensity={0.5} />

                    {/* Real Sun Position based on current date/time */}
                    <RealSunLight />

                    {/* Milky Way  */}
                    <BackgroundGalaxy />

                    {/* Deep Space Starfield  */}
                    <Stars
                        radius={300}
                        depth={60}
                        count={20000}
                        factor={4}
                        saturation={0}
                        fade={true}
                        speed={1}
                    />

                    {/* The Earth  */}
                    <Earth />

                    {/* Real-time Satellite Tracking  */}
                    <SatelliteMarkers
                        setSatelliteData={setSatelliteData}
                        selectedSat={selectedSat}
                        setSelectedSat={setSelectedSat}
                        filters={filters}
                    />

                    {/* Camera Controls */}
                    <CameraController cameraControlRef={cameraControlRef} />
                </Canvas>

                {/* Glassmorphic Overlay */}
                <UIOverlay
                    satelliteData={satelliteData}
                    selectedSat={selectedSat}
                    setSelectedSat={setSelectedSat}
                    filters={filters}
                    setFilters={setFilters}
                    cameraControlRef={cameraControlRef}
                />
            </div>

            {/* Telemetry Deck  */}
            {selectedSat ? (
                <TelemetryDeck satellite={selectedSat} />
            ) : (
                <div className="h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-white/20 mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            SELECT TARGET FOR TELEMETRY
                        </div>
                        <div className="text-xl text-white/30">
                            Choose a satellite from the catalog to view detailed analytics
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// future views
function ComingSoonView({ view }) {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center">
            <p className="text-white text-2xl">View: {view} - Coming Soon</p>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/tracking" element={<TrackingView />} />
                <Route path="/solar" element={<SolarSystem />} />
                <Route path="/asteroids" element={<AsteroidWatch />} />
                <Route path="/launch" element={<LaunchCenter />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
