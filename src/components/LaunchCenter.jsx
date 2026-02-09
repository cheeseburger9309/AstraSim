import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Html, Stars } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Rocket, MapPin, Clock, Target, Info } from 'lucide-react'

// Earth component
function Earth() {
    return (
        <Sphere args={[15, 64, 64]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#4169E1" />
        </Sphere>
    )
}

// Scanner
function ScannerGrid() {
    return (
        <Sphere args={[15, 64, 64]} position={[0, 0, 0]} scale={1.01}>
            <meshBasicMaterial
                wireframe={true}
                color="#00ffff"
                transparent={true}
                opacity={0.12}
            />
        </Sphere>
    )
}

// html marker testing crash proof
function HtmlMarker({ position, isNext, padName, onClick }) {
    return (
        <Html position={position} center>
            <div
                onClick={onClick}
                className="relative cursor-pointer group"
                style={{ width: '40px', height: '40px' }}
            >
                {isNext ? (
                    <>
                        {/*  ping animation */}
                        <div className="absolute inset-0 flex items-center justify-center">

                            <div className="absolute w-8 h-8 border-2 border-cyan-400 rounded-full"></div>

                            <div className="absolute w-8 h-8 bg-cyan-400/30 rounded-full animate-ping"></div>

                            <div className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Target className="w-10 h-10 text-cyan-400 opacity-60" strokeWidth={1.5} />
                        </div>
                    </>
                ) : (

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white/50 rounded-full group-hover:w-3 group-hover:h-3 group-hover:bg-white/80 transition-all"></div>
                    </div>
                )}

                {/* hover label */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-sm text-cyan-400 px-3 py-1 rounded-md text-xs font-bold border border-cyan-400/30 shadow-lg">
                        {padName}
                    </div>
                </div>
            </div>
        </Html>
    )
}

// latitude longitude se 3d vector
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = (radius * Math.sin(phi) * Math.sin(theta))
    const y = (radius * Math.cos(phi))
    return [x, y, z]
}

function LaunchCenter() {
    const navigate = useNavigate()
    const [launches, setLaunches] = useState([])
    const [selectedLaunch, setSelectedLaunch] = useState(null)
    const [countdown, setCountdown] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // launch lib se launch data fetch 
    useEffect(() => {
        fetchLaunches()
    }, [])

    // Update countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            if (launches.length > 0) {
                const nextLaunch = launches[0]
                const now = new Date().getTime()
                const launchTime = new Date(nextLaunch.net).getTime()
                const diff = launchTime - now

                if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

                    setCountdown(
                        `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                    )
                } else {
                    setCountdown('LIFTOFF')
                }
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [launches])

    const fetchLaunches = async () => {
        try {
            setLoading(true)
            const response = await fetch(
                'https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=10'
            )

            if (!response.ok) {
                throw new Error('Failed to fetch launch data')
            }

            const data = await response.json()

            const parsedLaunches = data.results.map((launch) => ({
                id: launch.id,
                name: launch.name,
                net: launch.net,
                status: launch.status.name,
                rocket: launch.rocket?.configuration?.name || 'Unknown Vehicle',
                pad: {
                    name: launch.pad?.name || 'Unknown Pad',
                    latitude: launch.pad?.latitude || 0,
                    longitude: launch.pad?.longitude || 0,
                    location: launch.pad?.location?.name || 'Unknown Location'
                },
                mission: {
                    description: launch.mission?.description || 'Mission details not available',
                    type: launch.mission?.type || 'Unknown'
                },
                image: launch.image || null
            }))

            setLaunches(parsedLaunches)
            if (parsedLaunches.length > 0) {
                setSelectedLaunch(parsedLaunches[0])
            }
            setLoading(false)
        } catch (err) {
            console.error('Error fetching launches:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="w-screen h-screen bg-black relative overflow-hidden">

            <Canvas camera={{ position: [30, 8, 30], fov: 60 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[50, 50, 50]} intensity={1.8} />
                <pointLight position={[-50, -50, -50]} intensity={0.5} />


                <Stars radius={300} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

                <ScannerGrid />
                <Earth />


                {launches.map((launch, index) => {
                    if (launch.pad.latitude && launch.pad.longitude) {
                        const position = latLongToVector3(
                            parseFloat(launch.pad.latitude),
                            parseFloat(launch.pad.longitude),
                            15.3
                        )
                        return (
                            <HtmlMarker
                                key={launch.id}
                                position={position}
                                isNext={index === 0}
                                padName={launch.pad.name}
                                onClick={() => setSelectedLaunch(launch)}
                            />
                        )
                    }
                    return null
                })}

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    maxDistance={80}
                    minDistance={20}
                    autoRotate={true}
                    autoRotateSpeed={0.3}
                />
            </Canvas>

            {/* Navigation Button */}
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

            {/* T-MINUS Countdown left top */}
            {launches.length > 0 && (
                <div className="absolute top-24 left-6 z-10">
                    <div className="bg-black/60 backdrop-blur-xl border border-cyan-400/40 rounded-2xl p-6 shadow-2xl">
                        <div className="text-xs text-cyan-400 mb-2 tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            NEXT LAUNCH
                        </div>
                        <div
                            className="text-7xl font-bold text-cyan-400 tracking-wider font-mono leading-none"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        >
                            T-{countdown || '00:00:00:00'}
                        </div>
                        <div className="text-xs text-white/60 mt-3 tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {launches[0]?.name}
                        </div>
                    </div>
                </div>
            )}

            {/* detail right hand side */}
            {selectedLaunch && (
                <div className="absolute top-24 right-6 w-96 z-10">
                    <div className="bg-black/70 backdrop-blur-xl border border-cyan-400/40 rounded-2xl p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-400/30">
                            <Info className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-lg font-bold text-cyan-400 tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                MISSION DETAILS
                            </h3>
                        </div>

                        {/* Mission Name */}
                        <div className="mb-4">
                            <div className="text-xs text-cyan-400 mb-1 tracking-widest" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                MISSION
                            </div>
                            <h2 className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {selectedLaunch.name}
                            </h2>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-3 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            {/* Vehicle */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Rocket className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 text-xs tracking-wide">VEHICLE</span>
                                </div>
                                <p className="text-white pl-6">{selectedLaunch.rocket}</p>
                            </div>

                            {/* Launch Site */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 text-xs tracking-wide">LAUNCH SITE</span>
                                </div>
                                <p className="text-white pl-6">{selectedLaunch.pad.name}</p>
                                <p className="text-white/60 text-xs pl-6">{selectedLaunch.pad.location}</p>
                            </div>

                            {/* Launch Time */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-cyan-400" />
                                    <span className="text-cyan-400 text-xs tracking-wide">LAUNCH TIME</span>
                                </div>
                                <div className="pl-6 space-y-1">
                                    <div>
                                        <span className="text-white/60 text-xs">UTC:</span>
                                        <p className="text-white text-xs">{new Date(selectedLaunch.net).toUTCString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-white/60 text-xs">IST:</span>
                                        <p className="text-white text-xs">
                                            {new Date(selectedLaunch.net).toLocaleString('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <div className="text-cyan-400 text-xs tracking-wide mb-1">STATUS</div>
                                <span className={`text-xs px-3 py-1 rounded-full ${selectedLaunch.status === 'Go for Launch'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                    }`}>
                                    {selectedLaunch.status}
                                </span>
                            </div>

                            {/* Mission Description */}
                            <div>
                                <div className="text-cyan-400 text-xs tracking-wide mb-1">MISSION</div>
                                <p className="text-white/80 text-xs leading-relaxed line-clamp-4">
                                    {selectedLaunch.mission.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <h1
                    className="text-4xl font-bold text-white tracking-widest"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                >
                    Launch Schedule
                </h1>
            </div>

            {/* neche carousel scrollable*/}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="bg-black/80 backdrop-blur-xl border-t border-cyan-400/30 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Rocket className="w-5 h-5 text-cyan-400" />
                            <h2
                                className="text-lg font-bold text-cyan-400 tracking-wide"
                                style={{ fontFamily: 'Rajdhani, sans-serif' }}
                            >
                                UPCOMING MISSIONS
                            </h2>
                            <div className="ml-auto text-xs text-white/60" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                {launches.length} SCHEDULED
                            </div>
                        </div>

                        {loading && (
                            <p className="text-white/60 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Loading launch manifest...
                            </p>
                        )}

                        {error && (
                            <p className="text-red-400 text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                Error: {error}
                            </p>
                        )}

                        {/* Horizontal scrollable launch cards */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
                            {launches.slice(0, 8).map((launch, index) => (
                                <div
                                    key={launch.id}
                                    onClick={() => setSelectedLaunch(launch)}
                                    className={`flex-shrink-0 w-80 p-4 rounded-lg border cursor-pointer transition-all ${selectedLaunch?.id === launch.id
                                        ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30'
                                        : index === 0
                                            ? 'border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20'
                                            : 'border-white/30 bg-white/5 hover:bg-white/10'
                                        }`}
                                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                                >
                                    <div className="flex items-start gap-3">

                                        <div className="flex-shrink-0 mt-1">
                                            {index === 0 ? (
                                                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                                            ) : (
                                                <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Mission name */}
                                            <h3 className="text-white font-bold text-sm mb-2 truncate">
                                                {launch.name}
                                            </h3>

                                            {/* Details grid */}
                                            <div className="space-y-1.5 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-white/60">T-0:</span>
                                                    <span className="text-white">{formatDate(launch.net)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Rocket className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-white/60">Vehicle:</span>
                                                    <span className="text-white truncate">{launch.rocket}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-cyan-400" />
                                                    <span className="text-white/60">Site:</span>
                                                    <span className="text-white truncate">{launch.pad.location}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${launch.status === 'Go for Launch'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                                        }`}>
                                                        {launch.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LaunchCenter