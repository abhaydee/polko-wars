import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { Physics } from "@react-three/cannon";
import Draw from "./Draw";
import { CarPositionProvider } from "./CarPositionContext";
import { Perf } from "r3f-perf";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { client } from "./client";
import { ConnectButton, useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, getContract, defineChain } from "thirdweb";
import { ConnectEmbed } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { useLocation } from "react-router-dom";

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "email",
        "google",
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"),
];


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
  const [timer, setTimer] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const location = useLocation();
  
  // Get car color from navigation state or use a default
  const carColor = location?.state?.carColor || localStorage.getItem('carColor') || '#ff0000';

  const handleFinishLinePickup = (exportCallback) => {
    drawRef.current = exportCallback;
  };

  const handlePickup = (newPoints) => {
    setPoints(newPoints / 2);
  };

  useEffect(() => {
    if (gameStarted && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameStarted, timer]);

  const notify = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  useEffect(() => {
    if (timer === 0) {
      notify("Time's up! The game will restart.");
      setGameStarted(false);
      setTimeout(() => {
        setTimer(60);
        setPoints(0);
        setGameStarted(true);
      }, 5000);
    }
  }, [timer]);

  return (
    <CarPositionProvider>
      <Overlay><ConnectButton
            theme={"light"}
            btnTitle={"Login"}
            modalTitle={"Select a Wallet"}
            modalSize={"compact"}
            modalTitleIconUrl={""}
            dropdownPosition={{
              side: "left",
              align: "end",
            }}
            client={client}
            wallets={wallets}
          />
      </Overlay>
      <Container>
      
        <Canvas>
          <Physics broadphase="SAP" gravity={[0, -2.6, 0]}>
            <Scene
              onFinishLinePickup={() => drawRef.current()}
              onPickup={handlePickup}
              setGameStarted={setGameStarted}
              notify={notify}
              carColor={carColor}
            />
          </Physics>
        </Canvas>

        <div className="controls">
          <p>press w a s d to move</p>
          <p>press k to swap camera</p>
          <p>press r to reset</p>
          <p>press q for Nitro Boost</p>
          <p>press u to export User Inputs</p>
        </div>

        <Draw carArray={importedData} onFinishLinePickup={handleFinishLinePickup} />

        <Overlay>Time left: {timer}s</Overlay>
        <PointsDisplay>Coins: {points}</PointsDisplay>
        <ToastContainer />
      </Container>
    </CarPositionProvider>
  );
};

export default PlayMe;
