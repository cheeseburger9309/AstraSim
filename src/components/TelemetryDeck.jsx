import React, { useMemo, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import * as satellite from 'satellite.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Activity, MapPin, Orbit, Clock } from 'lucide-react'

//  satellite icon
const satelliteIcon = L.divIcon({
    className: 'custom-satellite-marker',
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="13" width="12" height="6" fill="#00FFFF" />
        <rect x="2" y="14" width="8" height="4" fill="#00FFFF" opacity="0.7" />
        <rect x="22" y="14" width="8" height="4" fill="#00FFFF" opacity="0.7" />
        <circle cx="16" cy="16" r="10" fill="none" stroke="#00FFFF" stroke-width="1" opacity="0.3" />
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
})

// map centre auto uopdate
function MapUpdater({ center }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom())
        }
    }, [center, map])
    return null
}

function TelemetryDeck({ satellite: sat }) {
    const [userLocation, setUserLocation] = useState({ lat: 0, lon: 0 })
    const [refreshKey, setRefreshKey] = useState(0)

    // user loc
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    })
                },
                () => {
                    // equator if loc !true
                    setUserLocation({ lat: 0, lon: 0 })
                }
            )
        }
    }, [])

    //  refresh 5 sec timer 
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey(prev => prev + 1)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // orbital path def 90 minfir testing
    const orbitalPath = useMemo(() => {
        if (!sat || !sat.satrec) return []

        const points = []
        const now = new Date()
        const startTime = new Date(now.getTime() - 90 * 60 * 1000) // 90 min ago
        const endTime = new Date(now.getTime() + 90 * 60 * 1000) // 90 min future

        for (let time = startTime; time <= endTime; time = new Date(time.getTime() + 60 * 1000)) {
            const positionAndVelocity = satellite.propagate(sat.satrec, time)

            if (positionAndVelocity && positionAndVelocity.position && typeof positionAndVelocity.position === 'object') {
                const positionEci = positionAndVelocity.position
                const gmst = satellite.gstime(time)
                const positionGd = satellite.eciToGeodetic(positionEci, gmst)

                const lat = satellite.degreesLat(positionGd.latitude)
                const lon = satellite.degreesLong(positionGd.longitude)

                points.push([lat, lon])
            }
        }

        return points
    }, [sat])

    // Current position - refresh instant
    const currentPosition = useMemo(() => {
        if (!sat || !sat.satrec) return null

        const now = new Date()
        const positionAndVelocity = satellite.propagate(sat.satrec, now)

        if (positionAndVelocity && positionAndVelocity.position && typeof positionAndVelocity.position === 'object') {
            const positionEci = positionAndVelocity.position
            const gmst = satellite.gstime(now)
            const positionGd = satellite.eciToGeodetic(positionEci, gmst)

            return {
                lat: satellite.degreesLat(positionGd.latitude),
                lon: satellite.degreesLong(positionGd.longitude),
                alt: positionGd.height
            }
        }

        return null
    }, [sat, refreshKey])

    // calculations test (claude) 
    const technicalData = useMemo(() => {
        if (!sat || !sat.satrec) return null

        const now = new Date()
        const positionAndVelocity = satellite.propagate(sat.satrec, now)

        if (positionAndVelocity && positionAndVelocity.position && positionAndVelocity.velocity) {
            const positionEci = positionAndVelocity.position
            const velocityEci = positionAndVelocity.velocity

            // Altitude
            const gmst = satellite.gstime(now)
            const positionGd = satellite.eciToGeodetic(positionEci, gmst)
            const altitude = positionGd.height

            // Velocity (speed in km/s)
            const vx = velocityEci.x
            const vy = velocityEci.y
            const vz = velocityEci.z
            const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz)

            // Period (minutes)
            const period = (2 * Math.PI) / sat.satrec.no

            // Inclination (degrees)
            const inclination = (sat.satrec.inclo * 180) / Math.PI

            // International Designator from TLE
            const intlDesignator = sat.tle1 ? sat.tle1.substring(9, 17).trim() : 'N/A'

            // Launch Year from international designator
            const launchYear = intlDesignator !== 'N/A' ? '20' + intlDesignator.substring(0, 2) : 'N/A'

            return {
                altitude: altitude.toFixed(2),
                velocity: velocity.toFixed(2),
                period: period.toFixed(1),
                inclination: inclination.toFixed(2),
                intlDesignator,
                launchYear
            }
        }

        return null
    }, [sat])

    // next 24 hr sat loc prediction
    const passPredictions = useMemo(() => {
        if (!sat || !sat.satrec || !userLocation) return []

        const passes = []
        const now = new Date()
        const observerGd = {
            latitude: (userLocation.lat * Math.PI) / 180,
            longitude: (userLocation.lon * Math.PI) / 180,
            height: 0 // Altitude in km (sea level)
        }


        for (let i = 0; i < 24 * 60; i++) {
            const time = new Date(now.getTime() + i * 60 * 1000)
            const positionAndVelocity = satellite.propagate(sat.satrec, time)

            if (positionAndVelocity && positionAndVelocity.position) {
                const positionEci = positionAndVelocity.position
                const gmst = satellite.gstime(time)

                // azimuth, elevation, range
                const positionEcf = satellite.eciToEcf(positionEci, gmst)
                const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf)

                const elevation = (lookAngles.elevation * 180) / Math.PI

                // If elevation > 10 degrees, this is a visible pass
                if (elevation > 10) {
                    // Check if this is a new pass or continuation
                    if (passes.length === 0 || passes[passes.length - 1].setTime) {
                        // New pass
                        passes.push({
                            riseTime: time,
                            maxElevation: elevation,
                            maxTime: time
                        })
                    } else {
                        // Update current pass
                        const currentPass = passes[passes.length - 1]
                        if (elevation > currentPass.maxElevation) {
                            currentPass.maxElevation = elevation
                            currentPass.maxTime = time
                        }
                    }
                } else if (passes.length > 0 && !passes[passes.length - 1].setTime) {

                    passes[passes.length - 1].setTime = time
                }
            }
        }

        return passes.slice(0, 10)
    }, [sat, userLocation])

    if (!sat) return null

    return (
        <div className="w-full bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        TELEMETRY DASHBOARD
                    </h2>
                    <p className="text-xl text-cyan-400">{sat.name}</p>
                    <div className="h-1 w-32 bg-cyan-500 mt-4"></div>
                </div>

                {/* Section 1 2D Ground Track Map */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            GROUND TRACK
                        </h3>
                    </div>
                    {currentPosition && orbitalPath.length > 0 ? (
                        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl" style={{ height: '500px' }}>
                            <MapContainer
                                center={[currentPosition.lat, currentPosition.lon]}
                                zoom={3}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={true}
                            >
                                <MapUpdater center={[currentPosition.lat, currentPosition.lon]} />
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                <Polyline
                                    positions={orbitalPath}
                                    pathOptions={{ color: 'cyan', weight: 2, opacity: 0.8 }}
                                />
                                <Marker
                                    position={[currentPosition.lat, currentPosition.lon]}
                                    icon={satelliteIcon}
                                >
                                    <Popup>
                                        <div className="text-black">
                                            <strong>{sat.name}</strong><br />
                                            Lat: {currentPosition.lat.toFixed(4)}°<br />
                                            Lon: {currentPosition.lon.toFixed(4)}°<br />
                                            Alt: {currentPosition.alt.toFixed(2)} km
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    ) : (
                        <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center" style={{ height: '500px' }}>
                            <div className="text-white/50 text-center">
                                <div className="text-xl mb-2">Calculating orbital path...</div>
                                <div className="text-sm">Please wait while position data is being computed</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 2 Technical Grid */}
                {technicalData && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                                ORBITAL PARAMETERS
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                                <div className="text-sm text-cyan-400 font-medium mb-2">ALTITUDE</div>
                                <div className="text-3xl font-bold text-white">{technicalData.altitude} <span className="text-lg text-white/50">km</span></div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                                <div className="text-sm text-cyan-400 font-medium mb-2">VELOCITY</div>
                                <div className="text-3xl font-bold text-white">{technicalData.velocity} <span className="text-lg text-white/50">km/s</span></div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                                <div className="text-sm text-cyan-400 font-medium mb-2">PERIOD</div>
                                <div className="text-3xl font-bold text-white">{technicalData.period} <span className="text-lg text-white/50">min</span></div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                                <div className="text-sm text-cyan-400 font-medium mb-2">INCLINATION</div>
                                <div className="text-3xl font-bold text-white">{technicalData.inclination}°</div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                                <div className="text-sm text-cyan-400 font-medium mb-2">INT'L DESIGNATOR</div>
                                <div className="text-3xl font-bold text-white font-mono">{technicalData.intlDesignator}</div>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                                <div className="text-sm text-cyan-400 font-medium mb-2">LAUNCH YEAR</div>
                                <div className="text-3xl font-bold text-white">{technicalData.launchYear}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section 3 Pass Predictions */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                            UPCOMING PASSES
                        </h3>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-xl p-6">
                        <div className="text-sm text-white/50 mb-4">
                            Observer Location: {userLocation.lat.toFixed(4)}°N, {userLocation.lon.toFixed(4)}°E
                        </div>
                        {passPredictions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-cyan-500/30">
                                            <th className="text-left py-3 px-4 text-cyan-400 font-medium">DATE</th>
                                            <th className="text-left py-3 px-4 text-cyan-400 font-medium">RISE TIME</th>
                                            <th className="text-left py-3 px-4 text-cyan-400 font-medium">MAX ELEVATION</th>
                                            <th className="text-left py-3 px-4 text-cyan-400 font-medium">SET TIME</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {passPredictions.map((pass, index) => (
                                            <tr key={index} className="border-b border-white/10 hover:bg-cyan-500/10 transition-colors">
                                                <td className="py-3 px-4 text-white">
                                                    {pass.riseTime.toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-white font-mono">
                                                    {pass.riseTime.toLocaleTimeString()}
                                                </td>
                                                <td className="py-3 px-4 text-white">
                                                    {pass.maxElevation.toFixed(1)}°
                                                </td>
                                                <td className="py-3 px-4 text-white font-mono">
                                                    {pass.setTime ? pass.setTime.toLocaleTimeString() : 'In Progress'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-white/50">
                                No passes above 10° elevation in the next 24 hours
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TelemetryDeck
