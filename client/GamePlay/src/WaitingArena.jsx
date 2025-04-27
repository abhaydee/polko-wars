import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { SocketContext } from './SocketContext';
import { usePolkadotWallet } from './PolkadotWalletContext';
import { getUserNFTs } from './utils/nft-minting';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  max-height: 100vh;
  overflow-y: auto;
  background-color: #f5f5f5;
`;

const Header = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.h2`
  color: #666;
  font-size: 1.2rem;
  font-weight: normal;
`;

const Timer = styled.div`
  background-color: #333;
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 20px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const PlayersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin-top: 30px;
`;

const PlayerCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CarImage = styled.img`
  width: 150px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 15px;
`;

const PlayerName = styled.h3`
  margin: 10px 0;
  color: #333;
`;

const StatusBadge = styled.div`
  background-color: ${props => props.isReady ? '#4caf50' : '#ff9800'};
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const ButtonStart = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1.2rem;
  border-radius: 8px;
  margin-top: 30px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Format time in MM:SS format
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get car image based on color
const getCarImage = (color) => {
  const carImages = {
    '#ff0000': '/cars/car red.png',
    '#ff8800': '/cars/car orange.png',
    '#00ff00': '/cars/car green.png',
    '#ffff00': '/cars/car yellow.png'
  };
  return carImages[color] || '/cars/car red.png';
};

const WaitingArena = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, remotePlayers, carColor } = useContext(SocketContext);
  const { activeAccount } = usePolkadotWallet();
  const address = activeAccount?.address;
  
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [gameStarting, setGameStarting] = useState(false);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [playerNFTs, setPlayerNFTs] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  // Register with the server on component mount
  useEffect(() => {
    if (socket) {
      // Extract selected car color from location state
      const selectedCarColor = location.state?.carColor || carColor;
      
      // Register player in waiting room
      socket.emit('registerWaitingArena', { 
        carColor: selectedCarColor,
        address: address || 'anonymous'
      });
      
      setIsRegistered(true);
      
      // Listen for updates to the waiting room
      socket.on('waitingRoomUpdate', (data) => {
        setRegisteredPlayers(data.players);
        
        // If server sent a new timer value, sync to it
        if (data.timeLeft !== undefined) {
          setTimeLeft(data.timeLeft);
        }
        
        // If server indicates game is starting, prepare for transition
        if (data.gameStarting) {
          setGameStarting(true);
        }
      });
      
      // Listen for the start game event
      socket.on('startGame', () => {
        navigate('/play-me', { state: { carColor: selectedCarColor } });
      });
      
      // Cleanup listeners
      return () => {
        socket.off('waitingRoomUpdate');
        socket.off('startGame');
        socket.emit('leaveWaitingArena');
      };
    }
  }, [socket, navigate, location.state, carColor, address]);

  // Fetch player's NFTs
  useEffect(() => {
    if (address) {
      getUserNFTs(address)
        .then(nfts => {
          setPlayerNFTs(nfts);
        })
        .catch(error => {
          console.error('Error fetching NFTs:', error);
        });
    }
  }, [address]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      // Time's up, navigate to game
      if (!gameStarting) {
        setGameStarting(true);
        if (socket) {
          socket.emit('readyToStart');
        }
      }
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, gameStarting, socket]);

  // Handle manual start game (for testing)
  const handleStartGame = () => {
    if (socket) {
      socket.emit('forceStartGame');
    }
  };

  return (
    <Container>
      <Header>
        <Title>Waiting Arena</Title>
        <Subtitle>Race starts in:</Subtitle>
        <Timer>{formatTime(timeLeft)}</Timer>
      </Header>
      
      {gameStarting && (
        <div>
          <h2>Game starting soon!</h2>
          <p>Preparing race track...</p>
        </div>
      )}
      
      <PlayersContainer>
        {/* Current player card */}
        <PlayerCard>
          <CarImage src={getCarImage(carColor)} alt="Your car" />
          <PlayerName>You{playerNFTs.length > 0 ? ` (${playerNFTs[0].name})` : ''}</PlayerName>
          <StatusBadge isReady={true}>Ready</StatusBadge>
        </PlayerCard>
        
        {/* Combined remote players list - avoiding duplicates */}
        {(() => {
          // Create a map of player IDs to avoid duplicates
          const playersMap = new Map();
          
          // First add registered players from waiting room
          registeredPlayers.forEach(player => {
            if (player.id !== socket?.id) { // Skip self
              playersMap.set(player.id, {
                ...player,
                source: 'waiting-room'
              });
            }
          });
          
          // Then add remote players, overriding waiting room data if exists
          Object.values(remotePlayers).forEach(player => {
            playersMap.set(player.id, {
              ...player,
              source: 'remote',
              ready: true // Remote players are considered ready
            });
          });
          
          // Convert map back to array
          return Array.from(playersMap.values()).map(player => (
            <PlayerCard key={player.id}>
              <CarImage src={getCarImage(player.carColor)} alt="Player car" />
              <PlayerName>
                {player.name || `Player ${player.id.substring(0, 6)}`}
              </PlayerName>
              <StatusBadge isReady={player.ready}>
                {player.ready ? 'Ready' : 'Waiting'}
              </StatusBadge>
            </PlayerCard>
          ));
        })()}
      </PlayersContainer>
      
      {/* Admin button for testing - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <ButtonStart onClick={handleStartGame}>
          Force Start Game (Dev Only)
        </ButtonStart>
      )}
    </Container>
  );
};

export default WaitingArena;
