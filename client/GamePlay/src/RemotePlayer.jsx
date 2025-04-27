import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Color } from "three";

export function RemotePlayer({ playerData }) {
  const carRef = useRef();
  const carModelRef = useRef();
  
  // Keep track of the target position for smooth movement
  const targetPosition = useRef({ x: -1, y: 0, z: -0.2 });
  
  // Load the car model
  const carModel = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "/models/car1.glb"
  );
  
  // Setup the model once it's loaded
  useEffect(() => {
    if (!carModel) return;
    
    // Create a new clone of the model
    carModelRef.current = carModel.scene.clone();
    carModelRef.current.scale.set(0.0012, 0.0012, 0.0012);
    
    if (carModelRef.current.children[0]) {
      carModelRef.current.children[0].position.set(-365, -18, -67);
    }
    
    console.log("Remote player car model prepared");
  }, [carModel]);
  
  // Apply car color when player data changes or model is loaded
  useEffect(() => {
    if (!carModelRef.current || !playerData) return;
    
    // Default color if not provided
    const carColor = playerData.carColor || '#ff0000';
    
    // Apply color to all meshes in the model
    carModelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Clone the material to avoid affecting other instances
        if (Array.isArray(child.material)) {
          child.material = child.material.map(mat => {
            const newMat = mat.clone();
            // Only update the main body parts, not windows, lights, etc.
            if (mat.name && mat.name.toLowerCase().includes('body')) {
              newMat.color = new Color(carColor);
            }
            return newMat;
          });
        } else {
          child.material = child.material.clone();
          // Only update the main body parts, not windows, lights, etc.
          if (child.material.name && child.material.name.toLowerCase().includes('body')) {
            child.material.color = new Color(carColor);
          }
        }
      }
    });
    
    // This is a fallback if the model doesn't have proper material names
    // Find the main body mesh and apply color
    const bodyParts = carModelRef.current.children.filter(child => 
      child.name.toLowerCase().includes('body') || 
      child.name.toLowerCase().includes('car') ||
      child.name.toLowerCase().includes('chassis')
    );
    
    bodyParts.forEach(part => {
      if (part.material) {
        if (Array.isArray(part.material)) {
          part.material.forEach(mat => {
            mat.color = new Color(carColor);
          });
        } else {
          part.material.color = new Color(carColor);
        }
      }
    });
    
  }, [carModelRef.current, playerData]);
  
  // Update the target position when playerData changes
  useEffect(() => {
    if (!playerData || !playerData.position) return;
    
    console.log("RemotePlayer: Received position update:", playerData.position);
    
    // Update the target position
    targetPosition.current = {
      x: playerData.position.x,
      y: playerData.position.y,
      z: playerData.position.z
    };
  }, [playerData]);
  
  // Use frame to update position and rotation immediately
  useFrame(() => {
    if (!carRef.current || !targetPosition.current) return;
    
    // Set position directly - no interpolation
    carRef.current.position.set(
      targetPosition.current.x,
      targetPosition.current.y,
      targetPosition.current.z
    );
    
    // Apply rotation if available
    if (playerData && playerData.rotation) {
      carRef.current.rotation.set(
        playerData.rotation.x,
        playerData.rotation.y,
        playerData.rotation.z
      );
    }
  });
  
  // Render just the car model
  return (
    <group ref={carRef}>
      {carModelRef.current && (
        <primitive 
          object={carModelRef.current} 
          rotation-y={Math.PI} 
          position={[0, 0, 0]} // Raised position to be above ground
        />
      )}
    </group>
  );
} 