import React, { useState, useContext } from 'react';
import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Vector3, Euler } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useControls } from "./useControls";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";
import { useCarPosition } from "./CarPositionContext";
import { toast } from "react-toastify";
import { SocketContext } from './SocketContext';

export function Car({ thirdPerson }) {
  const { updateCarPosition } = useCarPosition();
  const { socket } = useContext(SocketContext);
  
  let result = useLoader(
    GLTFLoader,
    process.env.PUBLIC_URL + "/models/car.glb"
  ).scene;

  const position = [-1, 0, -0.2];  //[-1.5, 0.5, 3]
  const width = 0.15;
  const height = 0.07;
  const front = 0.15;
  const wheelRadius = 0.05;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: chassisBodyArgs,
      mass: 150,
      position,
    }),
    useRef(null),
  );

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos,
      wheels,
    }),
    useRef(null),
  );

  const [nitroActive, setNitroActive] = useState(false);
  const [controls, setCurrentControls] = useState({});
  
  // For tracking position updates
  const lastPosition = useRef(position);
  const lastVelocity = useRef([0, 0, 0]);
  const updateCount = useRef(0);
  const lastUpdateTime = useRef(Date.now());

  useControls(vehicleApi, chassisApi, setNitroActive, setCurrentControls);

  // Debug position updates with direct chassis API subscription
  useEffect(() => {
    if (!chassisApi) return;
    
    // Subscribe to position changes
    const unsubscribePosition = chassisApi.position.subscribe((pos) => {
      console.log("PHYSICS POSITION UPDATE:", pos);
    });
    
    // Subscribe to velocity changes
    const unsubscribeVelocity = chassisApi.velocity.subscribe((vel) => {
      lastVelocity.current = vel;
    });
    
    return () => {
      unsubscribePosition();
      unsubscribeVelocity();
    };
  }, [chassisApi]);

  // Use frame for everything - position tracking and camera updates
  useFrame((state) => {
    if (!chassisBody.current) return;

    // Get position and rotation directly from the Three.js matrix
    const position = new Vector3();
    position.setFromMatrixPosition(chassisBody.current.matrixWorld);

    const quaternion = new Quaternion();
    quaternion.setFromRotationMatrix(chassisBody.current.matrixWorld);

    // Create rotation using Euler angles
    const euler = new Euler().setFromQuaternion(quaternion);
    
    // Check if position has changed significantly
    const hasMoved = 
      Math.abs(position.x - lastPosition.current[0]) > 0.01 ||
      Math.abs(position.y - lastPosition.current[1]) > 0.01 ||
      Math.abs(position.z - lastPosition.current[2]) > 0.01;
    
    // Throttle updates (send at most every 100ms)
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    const shouldSendUpdate = hasMoved && timeSinceLastUpdate > 50;
    
    // Always increment frame counter for debugging
    updateCount.current += 1;
    
    // Send position to server when there's significant movement or on interval
    if (shouldSendUpdate || updateCount.current % 15 === 0) {
      // Update position tracking
      lastPosition.current = [position.x, position.y, position.z];
      lastUpdateTime.current = now;
      
      if (socket && socket.connected) {
        const positionData = {
          x: position.x,
          y: position.y,
          z: position.z
        };
        
        const rotationData = {
          x: euler.x,
          y: euler.y,
          z: euler.z
        };
        
        const velocityData = {
          x: lastVelocity.current[0],
          y: lastVelocity.current[1],
          z: lastVelocity.current[2]
        };
        
        // Send more complete data to help with client-side prediction
        socket.emit('playerMovement', {
          position: positionData,
          rotation: rotationData,
          velocity: velocityData,
          controls: controls,
          timestamp: Date.now()
        });
        
        // Log position updates for debugging
        console.log(`SENT POSITION UPDATE (frame ${updateCount.current}):`, {
          position: positionData,
          hasMoved,
          timeSinceLastUpdate
        });
        
        // Update local position context
        updateCarPosition(positionData);
      }
    }

    // Third person camera
    if (thirdPerson) {
      let wDir = new Vector3(0, 0, 1);
      wDir.applyQuaternion(quaternion);
      wDir.normalize();

      let cameraPosition = position.clone().add(wDir.clone().multiplyScalar(1).add(new Vector3(0, 0.3, 0)));
      
      wDir.add(new Vector3(0, 0.2, 0));
      state.camera.position.copy(cameraPosition);
      state.camera.lookAt(position);
    }
  });

  useEffect(() => {
    if (!result) return;

    let mesh = result;
    mesh.scale.set(0.0012, 0.0012, 0.0012);
    mesh.children[0].position.set(-365, -18, -67);
  }, [result]);

  useEffect(() => {
    if (nitroActive) {
      toast.info("Nitro boost activated!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        setNitroActive(false);
      }, 5000);
    }
  }, [nitroActive]);
  
  // Check if socket is connected on mount and reconnect attempts
  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      return () => {
        socket.off('connect');
        socket.off('disconnect');
      };
    }
  }, [socket]);

  return (
    <group ref={vehicle} name="vehicle">
      <group ref={chassisBody} name="chassisBody">
        <primitive object={result} rotation-y={Math.PI} position={[0, -0.09, 0]} />
      </group>
      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
    </group>
  );
}
