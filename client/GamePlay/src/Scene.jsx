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

export function Scene({ onFinishLinePickup, onPickup, setGameStarted, notify, carColor }) {
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
  const { remotePlayers, collectedCoins, collectCoin, socket } = useContext(SocketContext);
  const [userInputs, dispatch] = useReducer(userInputReducer, []);
  const frameCountRef = useRef(0);
  const [startLineVisible, setStartLineVisible] = useState(true);
  const [finishLineVisible, setFinishLineVisible] = useState(true);
  const [collectedCoinsLocal, setCollectedCoinsLocal] = useState([]);
  const [finishLineFrame, setFinishLineFrame] = useState(null);
  const navigate = useNavigate();

  // Update local state when server collectedCoins changes
  useEffect(() => {
    if (collectedCoins) {
      const collected = Object.keys(collectedCoins).map(Number);
      setCollectedCoinsLocal(collected);
      
      // Update points based on coins collected by this player
      if (socket) {
        let playerCoins = 0;
        Object.entries(collectedCoins).forEach(([index, data]) => {
          if (data.playerId === socket.id) {
            playerCoins++;
          }
        });
        setPoints(playerCoins);
        if (onPickup) onPickup(playerCoins);
      }
    }
  }, [collectedCoins, socket, onPickup]);

  const handlePickup = (index) => {
    // Don't do anything if this coin is already collected
    if (collectedCoinsLocal.includes(index)) {
      return;
    }
    
    // Send coin collection to server
    collectCoin(index);
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

  // Helper function to get coin color based on its collection status
  const getCoinPlayerColor = (index) => {
    if (!collectedCoins[index]) return null;
    
    // Generate color based on player ID for visual distinction
    const playerId = collectedCoins[index].playerId;
    
    // Simple hash function to generate a color from player ID
    let hash = 0;
    for (let i = 0; i < playerId.length; i++) {
      hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  };

  // Helper function to get player name who collected a coin
  const getCoinCollectorName = (index) => {
    if (!collectedCoins[index]) return null;
    const playerId = collectedCoins[index].playerId;
    return playerId === socket?.id ? 'You' : `Player ${playerId.substring(0, 6)}`;
  };

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
      <Car thirdPerson={thirdPerson} color={carColor} />
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
          </group>
        );
      })}
      
      {/* Render all coins, with special effects for collected ones */}
      {coins.map((position, index) => {
        const playerColor = getCoinPlayerColor(index);
        const isCollected = collectedCoins && collectedCoins[index];
        
        return (
          <group key={index}>
            {/* Always render the coin - it will hide itself if collected */}
            <Coin 
              position={position} 
              onPickup={() => handlePickup(index)} 
              index={index} 
            />
            
            {/* Only show collector indicator if the coin is collected */}
            {isCollected && playerColor && (
              <group>
                {/* Circle around the coin to show it's collected */}
                <mesh position={[position[0], position[1] + 0.05, position[2]]} rotation={[Math.PI/2, 0, 0]}>
                  <ringGeometry args={[0.15, 0.18, 32]} />
                  <meshBasicMaterial color={playerColor} transparent opacity={0.7} />
                </mesh>
                
                {/* Label with player name */}
                <Html position={[position[0], position[1] + 0.2, position[2]]}>
                  <div style={{ 
                    background: playerColor, 
                    color: 'white', 
                    padding: '2px 5px', 
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    transform: 'translate(-50%, -50%)'
                  }}>
                    {getCoinCollectorName(index)}
                  </div>
                </Html>
              </group>
            )}
          </group>
        );
      })}
      
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
      
      {/* Display coin collection stats */}
      <Html position={[5, 1, 0]}>
        <div style={{ 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px',
          fontFamily: 'Arial',
          width: '180px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
            Coin Collection
          </div>
          {Object.entries(collectedCoins).length === 0 ? (
            <div style={{ fontSize: '12px' }}>No coins collected yet</div>
          ) : (
            <div style={{ fontSize: '12px', textAlign: 'left' }}>
              {Object.entries(collectedCoins)
                .sort((a, b) => a[1].collectedAt - b[1].collectedAt)
                .map(([coinIndex, data], i) => (
                  <div key={coinIndex} style={{ 
                    margin: '3px 0',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Coin {parseInt(coinIndex) + 1}</span>
                    <span style={{ 
                      color: data.playerId === socket?.id ? '#aaffaa' : 'orange'
                    }}>
                      {data.playerId === socket?.id ? 'You' : `P${data.playerId.substring(0, 4)}`}
                    </span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </Html>
    </Suspense>
  );
}
