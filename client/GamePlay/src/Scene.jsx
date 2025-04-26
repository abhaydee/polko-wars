import {
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useReducer, useContext } from "react";
import { Car } from "./Car";
import { Ground } from "./Ground";
import { Track } from "./Track";
import { Coin } from "./Coin";
import "./index.css";
import { Perf } from "r3f-perf";
import { useNavigate } from "react-router-dom";
import Billboards from "./Billboards";
import { FinishLine } from "./FinishLine";
import { StartLine } from "./StartLine";
import { SocketContext } from "./SocketContext";
import { RemotePlayer } from "./RemotePlayer";

// Reducer function to handle user inputs
const userInputReducer = (state, action) => {
  switch (action.type) {
    case "KEY_DOWN":
    case "KEY_UP":
      return [...state, action.input];
    default:
      return state;
  }
};

export function Scene({ onFinishLinePickup, onPickup, setGameStarted, notify }) {
  const [thirdPerson, setThirdPerson] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([-6, 3.9, 6.21]);
  const [points, setPoints] = useState(0);
  const [coins, setCoins] = useState([
    [0.5, 0.09, -0.1],
    [0.5, 0.09, -0.1],
    [-4.5, 0.09, 0],
    [-4.5, 0.09, 0],
    [-5.3, 0.09, 1],
    [-5.3, 0.09, 1],
    [-4.5, 0.09, 1.5],
    [-4.5, 0.09, 1.5],
    [-1.5, 0.09, 1.9],
    [-1.5, 0.09, 1.9],
    [-1, 0.6, 0],
    [-1, 0.6, 0],
    [-5.5, 0.09, 3],
    [-5.5, 0.09, 3],
    [-2.5, 0.09, -4],
    [-2.5, 0.09, -4],
    [2.5, 0.09, -4],
    [2.5, 0.09, -4],
    [-6.5, 0.09, -4],
    [-6.5, 0.09, -4],
  ]);
  const { remotePlayers } = useContext(SocketContext);
  const [userInputs, dispatch] = useReducer(userInputReducer, []);
  const frameCountRef = useRef(0);
  const [startLineVisible, setStartLineVisible] = useState(true);
  const [finishLineVisible, setFinishLineVisible] = useState(true);
  const [currentCoinIndex, setCurrentCoinIndex] = useState(0);
  const [finishLineFrame, setFinishLineFrame] = useState(null);
  const navigate = useNavigate();

  const handlePickup = (index) => {
    if (index === currentCoinIndex) {
      setPoints((prevPoints) => {
        const newPoints = prevPoints + 1;
        onPickup(newPoints);
        return newPoints;
      });
      const updatedCoins = [...coins];
      updatedCoins.splice(index, 1);
      setCoins(updatedCoins);
      setCurrentCoinIndex(currentCoinIndex + 1);
    }
  };

  const handleStartLinePickup = () => {
    setStartLineVisible(false);
    setGameStarted(true);
  };

  const handleFinishLinePickupInternal = () => {
    setFinishLineVisible(false);
    setFinishLineFrame(frameCountRef.current);
    navigate("/leaderBoard", {
      state: {
        points: points,
        finishLineFrame: frameCountRef.current,
      },
    });
    if (onFinishLinePickup) {
      onFinishLinePickup();
    }
  };

  useEffect(() => {
    function keydownHandler(e) {
      if (e.key === "k") {
        if (thirdPerson) {
          setCameraPosition([-6, 4.9, 6.21 + Math.random() * 0.01]);
        }
        setThirdPerson(!thirdPerson);
      }
    }

    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [thirdPerson]);

  useEffect(() => {
    function keydownHandler(e) {
      if (e.key === "q") {
        notify("Nitro boost activated!");
      }
    }

    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [notify]);

  const targetFrameRate = 30;
  let previousTimestamp = 0;

  function animate(timestamp) {
    const deltaTime = timestamp - previousTimestamp;
    const targetFrameInterval = 1000 / targetFrameRate;

    if (deltaTime >= targetFrameInterval) {
      previousTimestamp = timestamp;
      frameCountRef.current += 1;
    }

    requestAnimationFrame(animate);
  }

  useEffect(() => {
    const startAnimation = () => {
      requestAnimationFrame(animate);
    };
    startAnimation();
  }, []);

  // Debug display for connected players
  const connectedPlayers = Object.keys(remotePlayers).length;

  return (
    <Suspense fallback={null}>
      <Environment files={process.env.PUBLIC_URL + "/textures/stadium.hdr"} background={"both"} />
      <PerspectiveCamera makeDefault position={cameraPosition} fov={40} />
      {!thirdPerson && <OrbitControls target={[-2.64, -0.71, 0.03]} />}
      <Ground />
      <Track />
      {!startLineVisible && points >= 3 && (
        <FinishLine scale={0.1} position={[-1, 0.7, 0]} rotation-y={Math.PI} onPickup={handleFinishLinePickupInternal} />
      )}
      <StartLine scale={0.003} position={[-1, 0, -1]} onPickup={handleStartLinePickup} />
      <Car thirdPerson={thirdPerson} />
      <Billboards />
      
      {/* Render remote players with position markers */}
      {Object.values(remotePlayers).map((player) => {
        // Skip players with invalid positions
        if (!player.position || typeof player.position.x !== 'number') {
          return null;
        }
        
        return (
          <group key={player.id}>
            <RemotePlayer playerData={player} />
            
            {/* Visual marker above the car for easier visibility */}
            <mesh 
              position={[
                player.position.x, 
                player.position.y + 0.4, 
                player.position.z
              ]}
              key={`marker-${player.id}`}
            >
              <boxGeometry args={[0.05, 0.2, 0.05]} />
              <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
            </mesh>
            
            {/* Small flag for identification */}
            <mesh 
              position={[
                player.position.x, 
                player.position.y + 0.55, 
                player.position.z
              ]}
              key={`flag-${player.id}`}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      })}
      
      {coins.map((position, index) => (
        <Coin key={index} position={position} onPickup={() => handlePickup(index)} index={index} currentCoinIndex={currentCoinIndex} />
      ))}
      
      {/* Display connected players count with more details */}
      {connectedPlayers > 0 && (
        <Html position={[0, 2, 0]}>
          <div style={{ 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            fontFamily: 'Arial',
            width: '250px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {connectedPlayers} other player{connectedPlayers !== 1 ? 's' : ''} connected
            </div>
            <div style={{ fontSize: '12px', marginTop: '5px', textAlign: 'left' }}>
              {Object.values(remotePlayers).map(player => (
                <div key={player.id} style={{ margin: '5px 0' }}>
                  Player {player.id.slice(0, 6)}...
                  <div style={{ marginLeft: '10px', color: '#aaffaa' }}>
                    Position: [{player.position.x.toFixed(1)}, {player.position.y.toFixed(1)}, {player.position.z.toFixed(1)}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Html>
      )}
    </Suspense>
  );
}
