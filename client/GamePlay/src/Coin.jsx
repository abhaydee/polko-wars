import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";

import { Vector3, TextureLoader} from "three";

import { useCarPosition } from './CarPositionContext'

export function Coin({ position, onPickup, index }) {
  const coinRef = useRef();
  const { carPosition } = useCarPosition();

// Load the coin texture using a TextureLoader
const coinTexture = useLoader(TextureLoader, './textures/polko1.png');


useFrame((state,delta) => {
    if (!coinRef.current) return;
    
    const coin = coinRef.current;
    // coin.rotation.x += 0.5 * delta; // Rotate around the X-axis
    coin.rotation.y += 0.1 * delta; // Rotate around the Y-axis
    coin.rotation.z += 0.1 * delta; // Rotate around the Z-axis
    const coinPosition = new Vector3(position[0], position[1], position[2]);
    
    // Calculate the distance between the car and the coin using the context
    const distance = Math.sqrt(
      Math.pow(carPosition.x - coinPosition.x, 2) +
      Math.pow(carPosition.y - coinPosition.y, 2) +
      Math.pow(carPosition.z - coinPosition.z, 2)
    );
    
    const pickupThreshold = 0.3;

    // Check if the car is close enough to collect the coin
    if (distance < pickupThreshold) {
      onPickup();
      coin.visible = false;
    }
  });

  return (
    <mesh ref={coinRef} position={position} onClick={onPickup}>
      <cylinderGeometry args={[0.1, 0.1, 0.02, 25]} />
      <meshBasicMaterial map={coinTexture} />
    </mesh>
  );
}
