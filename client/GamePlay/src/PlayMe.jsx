import React, { useState, useRef, useEffect, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { Physics } from "@react-three/cannon";
import Draw from "./Draw";
import { CarPositionProvider } from "./CarPositionContext";
import { Perf } from "r3f-perf";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePolkadotWallet } from './PolkadotWalletContext';
import PolkadotConnectButton from './components/PolkadotConnectButton';
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from './SocketContext';

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
  const [timer, setTimer] = useState(60); // 1 minutes (default)
  const [gameStarted, setGameStarted] = useState(false);
  const { activeAccount } = usePolkadotWallet();
  const address = activeAccount?.address;
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [localTimerActive, setLocalTimerActive] = useState(false); // Track if local timer is active
  
  // Get car color from navigation state or use a default
  const carColor = location?.state?.carColor || localStorage.getItem('carColor') || '#ff0000';

  const handleFinishLinePickup = (exportCallback) => {
    drawRef.current = exportCallback;
  };

  const handlePickup = (newPoints) => {
    setPoints(newPoints / 2);
  };

  // Listen for server's game time updates
  useEffect(() => {
    if (socket) {
      socket.on('gameTimeUpdate', (data) => {
        console.log('Received game time update from server:', data);
        if (data.timeLeft !== undefined) {
          // Sync local timer with server
          setTimer(data.timeLeft);
          
          // Ensure game has started
          if (!gameStarted && data.isActive) {
            setGameStarted(true);
          }
        }
      });
      
      // Request current game time on connect
      socket.emit('joinGame');
      
      return () => {
        socket.off('gameTimeUpdate');
      };
    }
  }, [socket, gameStarted]);

  // Local timer for updates between server syncs
  useEffect(() => {
    if (gameStarted && timer > 0 && !localTimerActive) {
      setLocalTimerActive(true);
      const interval = setInterval(() => {
        setTimer((prevTimer) => Math.max(0, prevTimer - 1));
      }, 1000);

      return () => {
        clearInterval(interval);
        setLocalTimerActive(false);
      };
    }
  }, [gameStarted, timer, localTimerActive]);

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
      notify("Time's up! Redirecting to results...");
      setGameStarted(false);
      
      // Wait a brief moment to show the notification, then navigate to leaderboard
      setTimeout(() => {
        navigate('/leaderboard');
      }, 2000);
    }
  }, [timer, navigate]);

  useEffect(() => {
    // Listen for game end event
    if (socket) {
      socket.on('gameEnd', () => {
        console.log('Game ended, redirecting to leaderboard');
        navigate('/leaderboard');
      });
    }

    return () => {
      if (socket) {
        socket.off('gameEnd');
      }
    };
  }, [socket, navigate]);

  return (
    <CarPositionProvider>
      <Overlay>
        <PolkadotConnectButton btnTitle="Login" />
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
