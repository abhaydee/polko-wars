import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { Physics } from "@react-three/cannon";
import Draw from "./Draw";
import { CarPositionProvider } from "./CarPositionContext";
import { Perf } from "r3f-perf";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
   width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
`;

const PointsDisplay = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  font-family: Arial, sans-serif;
`;

const PlayMe = ({ importedData }) => {
  const drawRef = useRef();
  const [points, setPoints] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);

  const handleFinishLinePickup = (exportCallback) => {
    drawRef.current = exportCallback;
  };

  const handlePickup = (newPoints) => {
    setPoints(newPoints/2);
  };

  useEffect(() => {
    if (gameStarted && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, timer]);

  return (
    <CarPositionProvider>
      <Container>
        <Canvas>
          <Physics broadphase="SAP" gravity={[0, -2.6, 0]}>
            <Scene
              onFinishLinePickup={() => drawRef.current()}
              onPickup={handlePickup}
              setGameStarted={setGameStarted}
            />
          </Physics>
        </Canvas>

        <div className="controls">
          <p>press w a s d to move</p>
          <p>press k to swap camera</p>
          <p>press r to reset</p>
          <p>press u to export User Inputs</p>
        </div>

        <Draw carArray={importedData} onFinishLinePickup={handleFinishLinePickup} />

        <Overlay>Time left: {timer}s</Overlay>
        <PointsDisplay>Coins: {points}</PointsDisplay>
      </Container>
    </CarPositionProvider>
  );
};

export default PlayMe;
