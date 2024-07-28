import React, { useState } from 'react';
import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useControls } from "./useControls";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";
import { useCarPosition } from "./CarPositionContext";


export function Car({ thirdPerson}) {
  const { updateCarPosition } = useCarPosition()
  
 
 
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

  useControls(vehicleApi, chassisApi);

  // const carPositionRef = useRef({ x: position[0], y: position[1], z: position[2] }); // Store car position
  

  useFrame((state) => {
    if(!thirdPerson) return;

    let position = new Vector3(0,0,0);
    position.setFromMatrixPosition(chassisBody.current.matrixWorld);
    // console.log("position",position)

    let quaternion = new Quaternion(0, 0, 0, 0);
    quaternion.setFromRotationMatrix(chassisBody.current.matrixWorld);
    // console.log("quat",quaternion)

    let wDir = new Vector3(0,0,1);
    wDir.applyQuaternion(quaternion);
    wDir.normalize();

    let cameraPosition = position.clone().add(wDir.clone().multiplyScalar(1).add(new Vector3(0, 0.3, 0)));
    
    wDir.add(new Vector3(0, 0.2, 0));
    state.camera.position.copy(cameraPosition);
    state.camera.lookAt(position);
    // Calculate the car's new position
    const newPosition = {
      x: position.x,
      y: position.y,
      z: position.z,
    };
    // console.log(newPosition)

    // // Update the car's position ref with the calculated values
    // carPositionRef.current = newPosition;

  // Update the car's position in the context with the calculated values
  updateCarPosition(newPosition);

  
  
  },);

  useEffect(() => {
    if (!result) return;

    let mesh = result;
    mesh.scale.set(0.0012, 0.0012, 0.0012);

    mesh.children[0].position.set(-365, -18, -67);
  }, [result]);


  //scale={0.2}
  return (
    <group ref={vehicle} name="vehicle">
      <group  ref={chassisBody} name="chassisBody"> 
        <primitive  object={result} rotation-y={Math.PI} position={[0, -0.09, 0]}/>

      </group>

      
      {/* <mesh ref={chassisBody}>
        <meshBasicMaterial transparent={true} opacity={0.3} />
        <boxGeometry args={chassisBodyArgs} />
      </mesh> */}

      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />

    </group>
  );
}
