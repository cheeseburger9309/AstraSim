import React from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

function BackgroundGalaxy() {
    // Load the Milky Way skybox texture
    const milkyWayTexture = useLoader(
        TextureLoader,
        '/textures/8k_stars_milky_way.jpg'
    )

    return (
        <mesh>
            {/* sphere enclosing the entire scene */}
            <sphereGeometry args={[1000, 64, 64]} />
            {/* 
        Inverted on xaxisdoesn't react to scene lighting
      */}
            <meshBasicMaterial
                map={milkyWayTexture}
                side={2} // 3 Double Slide for visibility
                scale={[-1, 1, 1]}
            />
        </mesh>
    )
}

export default BackgroundGalaxy
