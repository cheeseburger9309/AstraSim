import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

function Earth() {
    const earthRef = useRef()
    const cloudsRef = useRef()

    // auto-return animation
    const [targetRotation, setTargetRotation] = useState(0)
    const [isReturning, setIsReturning] = useState(false)
    const lastInteractionTime = useRef(Date.now())

    // textures
    const [dayMap, cloudsMap] = useTexture([
        '/textures/8k_earth_daymap.jpg',
        '/textures/8k_earth_clouds.jpg'
    ])

    //Calculate realtime Earth rotation 
    const calculateRealTimeRotation = () => {
        const now = new Date()
        const hours = now.getUTCHours()
        const minutes = now.getUTCMinutes()
        const seconds = now.getUTCSeconds()

        // Calculate fractional hour
        const fractionalHour = hours + minutes / 60 + seconds / 3600


        const ROTATION_OFFSET = Math.PI // Adjust this, dekne ke baad visually confirm


        // At 12:00 UTC, Prime Meridian should face the sun
        const gha = -(fractionalHour / 24) * Math.PI * 2 + ROTATION_OFFSET

        return gha
    }

    // Update  every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTargetRotation(calculateRealTimeRotation())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // Animation loop
    useFrame((state) => {
        if (!earthRef.current || !cloudsRef.current) return

        // Track user interaction 
        const controls = state.controls
        if (controls && controls.target) {
            // Simple heuristic
            const now = Date.now()
            if (Math.abs(state.camera.rotation.x) > 0.01 || Math.abs(state.camera.rotation.y) > 0.01) {
                lastInteractionTime.current = now
                setIsReturning(false)
            }
        }

        // AUTORETURN
        const timeSinceInteraction = Date.now() - lastInteractionTime.current
        const RETURN_DELAY = 5000 // 5 seconds

        if (timeSinceInteraction > RETURN_DELAY && !isReturning) {
            setIsReturning(true)
        }

        if (isReturning) {
            //  lerp animation 
            const currentRotation = earthRef.current.rotation.y
            const diff = targetRotation - currentRotation

            // difference normalise sabse short path ke liye [-π, π] 
            let normalizedDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI

            // slow animation speed
            const lerpSpeed = 0.02
            earthRef.current.rotation.y += normalizedDiff * lerpSpeed
            cloudsRef.current.rotation.y = earthRef.current.rotation.y

            // Stop  when close
            if (Math.abs(normalizedDiff) < 0.001) {
                setIsReturning(false)
            }
        } else {
            // use usercontrolled rotation or sync to target
            earthRef.current.rotation.y = targetRotation
            // Clouds faster 
            cloudsRef.current.rotation.y += 0.0001
        }

        // rotate on X 
        earthRef.current.rotation.x += 0.0001
    })

    return (
        <group>
            {/* Earth Surface */}
            <mesh ref={earthRef} scale={1}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={dayMap}
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Cloud Layer */}
            <mesh ref={cloudsRef} scale={1.01}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    map={cloudsMap}
                    transparent={true}
                    opacity={0.4}
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}

export default Earth
