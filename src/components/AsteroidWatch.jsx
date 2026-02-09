import React, { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Html, Line } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, AlertTriangle, Activity } from 'lucide-react'
import * as THREE from 'three'

//  safe display
const VISUAL_SCALE = 8

// Simple Earth component 
function Earth() {
    return (
        <Sphere args={[15, 64, 64]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#4169E1" />
        </Sphere>
    )
}

// Scanner Grid 
function ScannerGrid() {
    return (
        <Sphere args={[100, 64, 64]} position={[0, 0, 0]} scale={1.3}>
            <meshBasicMaterial
                wireframe={true}
                color="#00ffff"
                transparent={true}
                opacity={0.08}
            />
        </Sphere>
    )
}

// Asteroid component 
function Asteroid({ data, onClick, isSelected }) {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(false)

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01
            meshRef.current.rotation.y += 0.005
        }
    })

    const isPotentiallyHazardous = data.is_potentially_hazardous_asteroid
    const color = isPotentiallyHazardous ? '#FF3333' : '#00FF88'

    // Determine geometry based on size
    let geometry
    let scale = data.visualScale

    if (data.diameter_meters < 50) {
        geometry = <sphereGeometry args={[scale * 0.3, 8, 8]} />
    } else if (data.diameter_meters < 300) {
        geometry = <dodecahedronGeometry args={[scale * 0.5, 0]} />
    } else {
        geometry = <icosahedronGeometry args={[scale * 0.7, 0]} />
    }

    return (
        <group>
            <mesh
                ref={meshRef}
                position={data.position}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick(data)
                }}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {geometry}
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isSelected || hovered ? 0.8 : (isPotentiallyHazardous ? 0.3 : 0.1)}
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* real distance label for selected asteroid */}
            {isSelected && (
                <Html position={[data.position[0], data.position[1] + 5, data.position[2]]}>
                    <div
                        className="bg-cyan-500/90 text-black px-2 py-1 rounded text-xs font-bold"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                        DIST: {data.lunar_distances.toFixed(2)} LD
                    </div>
                </Html>
            )}
        </group>
    )
}

// Trajectory selected asteroid 
function TrajectoryPath({ asteroid }) {

    const asteroidPos = new THREE.Vector3(...asteroid.position)

    // earth se direction
    const directionFromEarth = asteroidPos.clone().normalize()


    const tangent = new THREE.Vector3(
        -directionFromEarth.z,
        0,
        directionFromEarth.x
    ).normalize()

    // asteroid se line to see path
    const lineLength = 200
    const startPoint = asteroidPos.clone().add(tangent.clone().multiplyScalar(lineLength))
    const endPoint = asteroidPos.clone().sub(tangent.clone().multiplyScalar(lineLength))

    const points = [startPoint, asteroidPos, endPoint]

    // arrow cal krne ke liye 
    const arrowRotation = new THREE.Euler(
        0,
        Math.atan2(tangent.x, tangent.z),
        0
    )

    return (
        <>
            <Line
                points={points}
                color="#00FFFF"
                lineWidth={2}
                dashed={true}
                dashScale={50}
                dashSize={3}
                gapSize={1}
            />


            <mesh position={endPoint} rotation={arrowRotation}>
                <coneGeometry args={[1, 3, 8]} />
                <meshBasicMaterial color="#00FFFF" />
            </mesh>
        </>
    )
}

function AsteroidWatch() {
    const navigate = useNavigate()
    const [allAsteroids, setAllAsteroids] = useState([])
    const [todaysAsteroids, setTodaysAsteroids] = useState([])
    const [selectedAsteroid, setSelectedAsteroid] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchAsteroids()
    }, [])

    const fetchAsteroids = async () => {
        try {
            setLoading(true)

            const today = new Date()
            const endDate = new Date(today)
            endDate.setDate(endDate.getDate() + 7)

            const startDateStr = today.toISOString().split('T')[0]
            const endDateStr = endDate.toISOString().split('T')[0]
            const todayStr = today.toISOString().split('T')[0]

            const response = await fetch(
                `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDateStr}&end_date=${endDateStr}&api_key=DEMO_KEY`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch asteroid data')
            }

            const data = await response.json()

            const allParsed = []
            const todaysParsed = []

            Object.keys(data.near_earth_objects).forEach((date, dateIndex) => {
                const neos = data.near_earth_objects[date]
                const isToday = date === todayStr

                neos.forEach((neo, index) => {
                    const closeApproach = neo.close_approach_data[0]
                    const missDistanceKm = parseFloat(closeApproach.miss_distance.kilometers)
                    const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_hour)
                    const velocityKmS = velocity / 3600
                    const diameterMeters = neo.estimated_diameter.meters.estimated_diameter_max
                    const absoluteMagnitude = neo.absolute_magnitude_h

                    const lunarDistances = missDistanceKm / 384400
                    const scaledDistance = (Math.log(lunarDistances + 1) * 12 + 20) * VISUAL_SCALE


                    let visualScale
                    if (diameterMeters < 50) {
                        visualScale = 0.5 + Math.log(diameterMeters + 1) * 0.1
                    } else if (diameterMeters < 300) {
                        visualScale = 1.5 + Math.log(diameterMeters) * 0.15
                    } else {
                        visualScale = 3 + Math.log(diameterMeters) * 0.2
                    }

                    // randomangle
                    const angle = ((dateIndex * neos.length + index) / (Object.keys(data.near_earth_objects).length * 10)) * Math.PI * 2
                    const x = scaledDistance * Math.cos(angle)
                    const z = scaledDistance * Math.sin(angle)
                    const y = (Math.random() - 0.5) * 20

                    // KE kinetic energy calcute 
                    const mass = (4 / 3) * Math.PI * Math.pow(diameterMeters / 2, 3) * 3000
                    const kineticEnergy = 0.5 * mass * Math.pow(velocityKmS * 1000, 2)
                    const megatons = kineticEnergy / (4.184 * Math.pow(10, 15))

                    const asteroidData = {
                        id: neo.id,
                        name: neo.name,
                        is_potentially_hazardous_asteroid: neo.is_potentially_hazardous_asteroid,
                        diameter_meters: diameterMeters,
                        miss_distance_km: missDistanceKm,
                        lunar_distances: lunarDistances,
                        velocity_kmh: velocity,
                        velocity_kms: velocityKmS,
                        absolute_magnitude: absoluteMagnitude,
                        kinetic_megatons: megatons,
                        position: [x, y, z],
                        visualScale: visualScale,
                        distance: scaledDistance,
                        approach_date: closeApproach.close_approach_date
                    }

                    allParsed.push(asteroidData)

                    if (isToday) {
                        todaysParsed.push(asteroidData)
                    }
                })
            })

            todaysParsed.sort((a, b) => a.miss_distance_km - b.miss_distance_km)

            setAllAsteroids(allParsed)
            setTodaysAsteroids(todaysParsed)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching asteroids:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    const getSizeCategory = (meters) => {
        if (meters < 10) return 'Car Sized'
        if (meters < 25) return 'Bus Sized'
        if (meters < 100) return 'Building Sized'
        if (meters < 300) return 'City Block Sized'
        return 'Mountain Sized'
    }

    const getMachNumber = (velocityKmS) => {
        const speedOfSound = 0.343
        return (velocityKmS / speedOfSound).toFixed(1)
    }

    return (
        <div className="w-screen h-screen bg-black relative">
            {/* 3D area */}
            <Canvas camera={{ position: [0, 50, 150], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                {/* Scanner grid */}
                <ScannerGrid />

                {/* Earth at center  */}
                <Earth />

                {/* All asteroids */}
                {allAsteroids.map((asteroid) => (
                    <Asteroid
                        key={asteroid.id}
                        data={asteroid}
                        onClick={setSelectedAsteroid}
                        isSelected={selectedAsteroid?.id === asteroid.id}
                    />
                ))}

                {/* Trajectory for selected asteroid */}
                {selectedAsteroid && (
                    <TrajectoryPath asteroid={selectedAsteroid} />
                )}

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    maxDistance={300}
                    minDistance={20}
                />
            </Canvas>

            {/* Dashboard Navigation Button */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-2 hover:bg-cyan-500/20 transition-all shadow-xl"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                    <ChevronLeft className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-medium tracking-wide text-white">DASHBOARD</span>
                </button>
            </div>

            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <h1
                    className="text-3xl font-bold text-white tracking-wider"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                    NEAR-EARTH OBJECT MONITOR
                </h1>
            </div>

            {/* next 24H Approaches */}
            <div className="absolute top-24 right-6 w-96 max-h-[calc(100vh-12rem)] overflow-y-auto z-10">
                <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4">
                    <h2
                        className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                        <Activity className="w-5 h-5" />
                        NEXT 24H APPROACHES
                    </h2>

                    {loading && (
                        <p className="text-white/60 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Loading orbital data...
                        </p>
                    )}

                    {error && (
                        <p className="text-red-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            Error: {error}
                        </p>
                    )}

                    <div className="space-y-3">
                        {todaysAsteroids.map((asteroid) => (
                            <div
                                key={asteroid.id}
                                onClick={() => setSelectedAsteroid(asteroid)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedAsteroid?.id === asteroid.id
                                    ? 'border-cyan-400 bg-cyan-500/20'
                                    : asteroid.is_potentially_hazardous_asteroid
                                        ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
                                        : 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20'
                                    }`}
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-white font-bold text-sm">
                                        {asteroid.name}
                                    </h3>
                                    {asteroid.is_potentially_hazardous_asteroid && (
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                    )}
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Miss Distance:</span>
                                        <span className="text-cyan-400 font-bold">
                                            {asteroid.lunar_distances.toFixed(2)} LD
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Diameter:</span>
                                        <span className="text-white">
                                            ~{Math.round(asteroid.diameter_meters)}m
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Velocity:</span>
                                        <span className="text-white">
                                            Mach {getMachNumber(asteroid.velocity_kms)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* physics left panel */}
            {selectedAsteroid && (
                <div className="absolute top-24 left-6 w-96 z-20 animate-slide-in-left">
                    <div className="bg-black/90 backdrop-blur-md border border-cyan-400 rounded-lg p-4 shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3
                                className="text-xl font-bold text-cyan-400 flex items-center gap-2"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                <Activity className="w-5 h-5" />
                                OBJECT DOSSIER
                            </h3>
                            <button
                                onClick={() => setSelectedAsteroid(null)}
                                className="text-white/60 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {/* Identification */}
                            <div className="border-b border-white/10 pb-3">
                                <h4 className="text-cyan-400 font-bold mb-2">IDENTIFICATION</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Designation:</span>
                                        <span className="text-white font-bold text-xs">
                                            {selectedAsteroid.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">NEO ID:</span>
                                        <span className="text-white text-xs">
                                            {selectedAsteroid.id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Abs. Magnitude:</span>
                                        <span className="text-white">
                                            H = {selectedAsteroid.absolute_magnitude.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Physical Properties */}
                            <div className="border-b border-white/10 pb-3">
                                <h4 className="text-cyan-400 font-bold mb-2">PHYSICAL PROPERTIES</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Diameter (Est.):</span>
                                        <span className="text-white">
                                            ~{Math.round(selectedAsteroid.diameter_meters)} meters
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Classification:</span>
                                        <span className="text-white">
                                            {getSizeCategory(selectedAsteroid.diameter_meters)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* oribt ki dynamics  */}
                            <div className="border-b border-white/10 pb-3">
                                <h4 className="text-cyan-400 font-bold mb-2">ORBITAL DYNAMICS</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Velocity:</span>
                                        <span className="text-white">
                                            {selectedAsteroid.velocity_kms.toFixed(2)} km/s
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Mach Number:</span>
                                        <span className="text-white">
                                            Mach {getMachNumber(selectedAsteroid.velocity_kms)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Miss Distance:</span>
                                        <span className="text-cyan-400 font-bold">
                                            {selectedAsteroid.lunar_distances.toFixed(3)} LD
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60"></span>
                                        <span className="text-white/60 text-xs">
                                            ({Math.round(selectedAsteroid.miss_distance_km).toLocaleString()} km)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Threat finder */}
                            <div className="border-b border-white/10 pb-3">
                                <h4 className="text-cyan-400 font-bold mb-2">THREAT ASSESSMENT</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60">Status:</span>
                                        <span className={`font-bold text-xs ${selectedAsteroid.is_potentially_hazardous_asteroid
                                            ? 'text-red-400'
                                            : 'text-cyan-400'
                                            }`}>
                                            {selectedAsteroid.is_potentially_hazardous_asteroid
                                                ? 'POTENTIALLY HAZARDOUS'
                                                : 'INERT'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Kinetic Potential:</span>
                                        <span className="text-white">
                                            ~{selectedAsteroid.kinetic_megatons.toFixed(1)} MT
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-white/60 text-xs">Threat Level:</span>
                                        <div className="mt-1 flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-2 flex-1 rounded ${selectedAsteroid.is_potentially_hazardous_asteroid && level <= 3
                                                        ? 'bg-red-500'
                                                        : level === 1
                                                            ? 'bg-green-500'
                                                            : 'bg-white/10'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* predicted date */}
                            <div>
                                <h4 className="text-cyan-400 font-bold mb-2">CLOSE APPROACH</h4>
                                <div className="flex justify-between">
                                    <span className="text-white/60">Date:</span>
                                    <span className="text-white">
                                        {selectedAsteroid.approach_date}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats footer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-lg px-4 py-2">
                    <p
                        className="text-xs text-cyan-400 tracking-wide"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                        TRACKING {allAsteroids.length} OBJECTS // {todaysAsteroids.length} WITHIN 24H
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AsteroidWatch
