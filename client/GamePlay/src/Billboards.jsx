import React from 'react'
import { useLoader } from '@react-three/fiber'; // Import useLoader for loading textures
import { DoubleSide, TextureLoader } from 'three'; 


const Billboards = () => {
    const texture1 = useLoader(TextureLoader, './textures/polygon.png');
    const texture2 = useLoader(TextureLoader, './textures/mantle.jpeg');
    const zkTexture = useLoader(TextureLoader, './textures/zkevm.png' )
    const apeTexture = useLoader(TextureLoader, './textures/ape.png' )
    const scrollTexture = useLoader(TextureLoader, './textures/scroll.png' )
  return (
    <>
    <group position={[0,0,3]} scale={0.2} >

        <mesh position={[0,1,0]} rotation={[0, Math.PI *4, 0]} >
            <planeGeometry/>
            <meshBasicMaterial map={texture1} side={DoubleSide} />
        </mesh>

        <mesh position={[-0,0.2,0]}  >
            <cylinderGeometry args={[0.05,0.05,0.6,8]} />
            <meshBasicMaterial color="brown" />
        </mesh>

        
    </group>

    <group position={[0,0,-5]} scale={0.2} >

        <mesh position={[0,1,0]} rotation={[0, Math.PI *4, 0]} >
                <planeGeometry/>
                <meshBasicMaterial map={texture2} side={DoubleSide} />
            </mesh>

            <mesh position={[-0,0.2,0]}  >
                <cylinderGeometry args={[0.05,0.05,0.6,8]} />
                <meshBasicMaterial color="brown" />
            </mesh>

            
    </group>

    <group position={[-5,0,3]} scale={0.2} >

        <mesh position={[0,1,0]} rotation={[0, Math.PI *4, 0]} >
                <planeGeometry/>
                <meshBasicMaterial map={zkTexture} side={DoubleSide} />
            </mesh>

            <mesh position={[-0,0.2,0]}  >
                <cylinderGeometry args={[0.05,0.05,0.6,8]} />
                <meshBasicMaterial color="brown" />
            </mesh>

            
    </group>

    <group position={[-7,0,-3]} scale={0.2} >

        <mesh position={[0,1,0]} rotation={[0, Math.PI *4, 0]} >
                <planeGeometry/>
                <meshBasicMaterial map={apeTexture} side={DoubleSide} />
            </mesh>

            <mesh position={[-0,0.2,0]}  >
                <cylinderGeometry args={[0.05,0.05,0.6,8]} />
                <meshBasicMaterial color="brown" />
            </mesh>

            
    </group>

    <group position={[-5,0,-5]} scale={0.2} >

        <mesh position={[0,1,0]} rotation={[0, Math.PI *4, 0]} >
                <planeGeometry/>
                <meshBasicMaterial map={scrollTexture} side={DoubleSide} />
            </mesh>

            <mesh position={[-0,0.2,0]}  >
                <cylinderGeometry args={[0.05,0.05,0.6,8]} />
                <meshBasicMaterial color="brown" />
            </mesh>

            
    </group>

        
    </>
    
  )
}

export default Billboards
