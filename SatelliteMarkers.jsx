import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as satellite from 'satellite.js'
import * as THREE from 'three'

// origianl data agr fail so fallback
const FALLBACK_TLES = `ISS (ZARYA)
1 25544U 98067A   23345.67890123  .00012345  00000-0  12345-3 0  9999
2 25544  51.6400 120.5000 0005000 300.0000 150.0000 15.50000000999999
TIANGONG
1 48274U 21035A   23345.50000000  .00020000  00000-0  20000-3 0  9998
2 48274  41.4700 200.0000 0001000 100.0000 250.0000 15.60000000999998
HST
1 20580U 90037B   23345.10000000  .00000500  00000-0  10000-4 0  9997
2 20580  28.4700 150.0000 0002000  50.0000 300.0000 15.10000000999997
STARLINK-1007
1 44713U 19074A   23345.20000000  .00001000  00000-0  15000-3 0  9996
2 44713  53.0000  90.0000 0001500 200.0000 160.0000 15.19000000999996
STARLINK-1020
1 44714U 19074B   23345.21000000  .00001100  00000-0  16000-3 0  9995
2 44714  53.0100  90.5000 0001600 201.0000 159.0000 15.19100000999995
STARLINK-1081
1 44715U 19074C   23345.22000000  .00001050  00000-0  15500-3 0  9994
2 44715  53.0050  91.0000 0001550 202.0000 158.0000 15.19050000999994
GPS BIIR-2
1 28474U 04045A   23345.30000000  .00000010  00000-0  00000-0 0  9993
2 28474  55.0000  30.0000 0010000  45.0000 315.0000  2.00000000999993
COSMOS 2251 DEB
1 34454U 93036RZ  23345.40000000  .00000200  00000-0  25000-4 0  9992
2 34454  74.0000 180.0000 0050000  90.0000 270.0000 14.50000000999992`

// classification of sats
function classifySatellite(name) {
    const upperName = name.toUpperCase()
    if (upperName.includes('STARLINK')) return { type: 'Starlink', color: '#FFFFFF' }
    if (upperName.includes('ISS') || upperName.includes('TIANGONG') || upperName.includes('HST')) {
        return { type: 'Station', color: '#00FFFF' }
    }
    if (upperName.includes('DEB') || upperName.includes('COSMOS') || upperName.includes('FENGYUN')) {
        return { type: 'Debris', color: '#FF0000' }
    }
    if (upperName.includes('GPS') || upperName.includes('NAVSTAR')) {
        return { type: 'GPS', color: '#FFD700' }
    }
    return { type: 'Other', color: '#AAAAAA' }
}

// TLE format 3 lines per satellite: name, line1, line2
function parseTLEs(tleString) {
    const lines = tleString.trim().split('\n').map(l => l.trim())
    const satellites = []

    for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 < lines.length) {
            const name = lines[i]
            const tle1 = lines[i + 1]
            const tle2 = lines[i + 2]

            try {
                const satrec = satellite.twoline2satrec(tle1, tle2)
                const classification = classifySatellite(name)

                satellites.push({
                    name,
                    tle1,
                    tle2,
                    satrec,
                    ...classification
                })
            } catch (e) {
                console.warn(`Failed to parse TLE for ${name}:`, e)
            }
        }
    }

    return satellites
}

function SatelliteMarkers({ setSatelliteData, selectedSat, setSelectedSat, filters }) {
    const meshRef = useRef()
    const { camera, gl } = useThree()
    const raycaster = useMemo(() => new THREE.Raycaster(), [])
    const mouse = useMemo(() => new THREE.Vector2(), [])

    const [satellites, setSatellites] = useState([])

    // Constants coordinate conversion ke liuye 
    const EARTH_RADIUS_KM = 6371
    const EARTH_RADIUS_THREEJS = 1
    const SCALE_FACTOR = EARTH_RADIUS_THREEJS / EARTH_RADIUS_KM

    // tle data fetch ke liye fallback added 
    useEffect(() => {
        const fetchLiveTLEs = async () => {
            try {
                console.log('Attempting to fetch live TLE data from CelesTrak...')
                const response = await fetch(
                    'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
                    { mode: 'cors' }
                )

                if (!response.ok) throw new Error(`HTTP ${response.status}`)

                const tleData = await response.text()
                const parsedSatellites = parseTLEs(tleData)

                console.log(`✅ Successfully loaded ${parsedSatellites.length} satellites from CelesTrak`)
                setSatellites(parsedSatellites)
                setSatelliteData(parsedSatellites) //data to App for UI
            } catch (error) {
                console.warn('⚠️ Failed to fetch live TLE data:', error)
                console.log('📦 Using fallback TLE data for unbreakable demo')

                // Use fallback data
                const fallbackSatellites = parseTLEs(FALLBACK_TLES)
                setSatellites(fallbackSatellites)
                setSatelliteData(fallbackSatellites) // lift data to App
            }
        }

        fetchLiveTLEs()
    }, [setSatelliteData])

    // mesh geometry and material 
    const geometry = useMemo(() => new THREE.SphereGeometry(0.005, 8, 8), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial(), [])

    // optimization ke liye
    useEffect(() => {
        if (satellites.length === 0 || !meshRef.current) return

        const updatePositions = () => {
            const now = new Date()
            const matrix = new THREE.Matrix4()
            const position = new THREE.Vector3()
            const rotation = new THREE.Quaternion()
            const scale = new THREE.Vector3(1, 1, 1) // Default scale
            const color = new THREE.Color()

            satellites.forEach((sat, index) => {
                const positionAndVelocity = satellite.propagate(sat.satrec, now)

                if (positionAndVelocity &&
                    positionAndVelocity.position &&
                    typeof positionAndVelocity.position === 'object' &&
                    typeof positionAndVelocity.position !== 'boolean') {

                    const positionEci = positionAndVelocity.position

                    if (positionEci.x !== undefined &&
                        positionEci.y !== undefined &&
                        positionEci.z !== undefined) {

                        // apply same coordinate conversion as before
                        const x = positionEci.x * SCALE_FACTOR
                        const y = positionEci.z * SCALE_FACTOR
                        const z = -positionEci.y * SCALE_FACTOR


                        position.set(x, y, z)
                        rotation.set(0, 0, 0, 1)

                        // sat check 
                        const isSelected = selectedSat && selectedSat.name === sat.name

                        // check if ye sat show ya nai 
                        let isVisible = true
                        if (filters) {
                            // Map satellite types 
                            if (sat.type === 'Debris' && !filters.debris) isVisible = false
                            else if (sat.type === 'Station' && !filters.station) isVisible = false
                            else if (sat.type === 'Starlink' && !filters.starlink) isVisible = false
                            else if (sat.type === 'GPS' && !filters.gps) isVisible = false
                        }

                        // Set scale
                        if (!isVisible) {
                            scale.set(0, 0, 0)
                        } else {
                            scale.set(
                                isSelected ? 2 : 1,
                                isSelected ? 2 : 1,
                                isSelected ? 2 : 1
                            )
                        }

                        //  matrix from position, rotation, scale
                        matrix.compose(position, rotation, scale)
                        meshRef.current.setMatrixAt(index, matrix)


                        if (isSelected) {
                            color.set('#00FFFF')
                        } else {
                            color.set(sat.color)
                        }
                        meshRef.current.setColorAt(index, color)
                    }
                }
            });

            meshRef.current.instanceMatrix.needsUpdate = true
            if (meshRef.current.instanceColor) {
                meshRef.current.instanceColor.needsUpdate = true
            }
        }

        // Initial update
        updatePositions()

        // 1000ms me ek update
        const interval = setInterval(updatePositions, 1000)

        return () => clearInterval(interval)
    }, [satellites, selectedSat, filters, SCALE_FACTOR])

    // Click selection system
    const handleClick = (event) => {
        if (!meshRef.current) return

        // Calculate mouse position in normalized device coordinates
        const rect = gl.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // cast to find clicked satellite
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(meshRef.current)

        if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId
            const clickedSatellite = satellites[instanceId]

            if (clickedSatellite) {
                setSelectedSat(clickedSatellite === selectedSat ? null : clickedSatellite)
                console.log('Selected satellite:', clickedSatellite.name)
            }
        } else {
            // deselect empty area clkick
            setSelectedSat(null)
        }
    }

    useEffect(() => {
        gl.domElement.addEventListener('click', handleClick)
        return () => gl.domElement.removeEventListener('click', handleClick)
    }, [satellites, selectedSat, camera, gl, setSelectedSat])

    // don't render until we have satellites
    if (satellites.length === 0) return null

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[geometry, material, satellites.length]}
            >
                <sphereGeometry args={[0.005, 8, 8]} />
                <meshBasicMaterial />
            </instancedMesh>


            {selectedSat && (
                <SelectedSatellitePath satellite={selectedSat} />
            )}
        </group>
    )
}

// Component to render path for selected satellite
function SelectedSatellitePath({ satellite: sat }) {
    const points = useMemo(() => {
        const EARTH_RADIUS_KM = 6371
        const EARTH_RADIUS_THREEJS = 1
        const SCALE_FACTOR = EARTH_RADIUS_THREEJS / EARTH_RADIUS_KM

        const pts = []
        const periodMinutes = (2 * Math.PI) / sat.satrec.no
        const totalMinutes = periodMinutes * 1.1
        const intervalMinutes = periodMinutes / 400
        const startTime = new Date()

        for (let i = 0; i <= totalMinutes; i += intervalMinutes) {
            const time = new Date(startTime.getTime() + i * 60 * 1000)
            const positionAndVelocity = satellite.propagate(sat.satrec, time)

            if (positionAndVelocity &&
                positionAndVelocity.position &&
                typeof positionAndVelocity.position === 'object' &&
                typeof positionAndVelocity.position !== 'boolean') {

                const positionEci = positionAndVelocity.position

                if (positionEci.x !== undefined &&
                    positionEci.y !== undefined &&
                    positionEci.z !== undefined) {

                    const x = positionEci.x * SCALE_FACTOR
                    const y = positionEci.z * SCALE_FACTOR
                    const z = -positionEci.y * SCALE_FACTOR

                    pts.push(new THREE.Vector3(x, y, z))
                }
            }
        }

        return pts
    }, [sat])

    if (points.length < 2) return null

    return (
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color={satellite.color} opacity={0.6} transparent depthTest={false} />
        </line>
    )
}

export default SatelliteMarkers
