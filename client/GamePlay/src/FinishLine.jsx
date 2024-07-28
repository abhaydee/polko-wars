import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3} from "three";
import { useCarPosition } from './CarPositionContext'

export function FinishLine(props) {
  const { nodes, materials } = useGLTF(
    "/models/finishLine.glb"
  );
  const finishLineRef = useRef();
  const { carPosition } = useCarPosition();

  useFrame(() => {
    if (!finishLineRef.current) return;
    

    const Line = finishLineRef.current;
    const finishLinePosition = new Vector3(-1,0.7,0);

    // Calculate the distance between the car and the coin using the context
    const distance = Math.sqrt(
      Math.pow(carPosition.x - finishLinePosition.x, 2) +
      Math.pow(carPosition.y - finishLinePosition.y, 2) +
      Math.pow(carPosition.z - finishLinePosition.z, 2)
    );
    

    const pickupThreshold = 0.4;

    if (distance < pickupThreshold) {
        // console.log("inside if loop")
        props.onPickup();
      Line.visible = false;
    }
  });



  return (
    <group ref={finishLineRef} onClick={props.onPickup} {...props} dispose={null}>
      <group scale={0.01}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.GPL_goal_02_Material006_0.geometry}
          material={materials["Material.006"]}
          scale={100}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/models/finishLine.glb")
