import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Vector3} from "three";
import { useCarPosition } from './CarPositionContext'

export function StartLine(props) {
  const { nodes, materials } = useGLTF("/models/startingLine.glb");
  const startLineRef = useRef();
  const { carPosition } = useCarPosition();

  useFrame(() => {
    if (!startLineRef.current) return;
    

    const Line = startLineRef.current;
    const startLinePosition = new Vector3(-1,0,-1);

    // Calculate the distance between the car and the coin using the context
    const distance = Math.sqrt(
      Math.pow(carPosition.x - startLinePosition.x, 2) +
      Math.pow(carPosition.y - startLinePosition.y, 2) +
      Math.pow(carPosition.z - startLinePosition.z, 2)
    );
    

    const pickupThreshold = 0.2;

    if (distance < pickupThreshold) {
        // console.log("inside if loop")
        props.onPickup();
      Line.visible = false;
    }
  });


  return (
    <group ref={startLineRef} onClick={props.onPickup} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group position={[175.707, 0.958, -28.018]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Starting_Line_Starting_Sign_Mat_1_0.geometry}
            material={materials.Starting_Sign_Mat_1}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Starting_Line_Starting_Sign_Mat_2_0.geometry}
            material={materials.Starting_Sign_Mat_2}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Starting_Line_Starting_Sign_Mat_3_0.geometry}
            material={materials.Starting_Sign_Mat_3}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Starting_Line_Start_Texture_0.geometry}
            material={materials.Start_Texture}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Starting_Line_Ad_2_0.geometry}
            material={materials.Ad_2}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Starting_Line_Ad_1_0.geometry}
            material={materials.Ad_1}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/startingLine.glb");
