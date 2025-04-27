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
  position: relative;

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

// Bet button on each car card
const BetButton = styled.button`
  background-color: #f0ad4e;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 0.9rem;
  border-radius: 6px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ec971f;
  }
`;

// Bet counter badge
const BetCounterBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f44336;
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
`;

// Total pool display
const BetPoolDisplay = styled.div`
  background-color: #673ab7;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  margin: 20px 0;
  font-weight: bold;
  text-align: center;
  width: 80%;
  max-width: 600px;
`;

// Modal backdrop
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// Modal content
const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

// Modal title
const ModalTitle = styled.h2`
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.5rem;
`;

// Form group
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// Label
const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
`;

// Input
const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

// Car selection container
const CarSelection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const CarOption = styled.div`
  padding: 10px;
  border: 2px solid ${props => props.selected ? '#4caf50' : '#ddd'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(50% - 10px);
  transition: all 0.2s;

  &:hover {
    border-color: #4caf50;
    transform: translateY(-2px);
  }
`;

const SmallCarImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 8px;
`;

const CarName = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const ModalButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  flex: 1;
  transition: background-color 0.3s;
`;

const SubmitButton = styled(ModalButton)`
  background-color: #4caf50;
  color: white;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(ModalButton)`
  background-color: #f44336;
  color: white;

  &:hover {
    background-color: #d32f2f;
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

// Format WND token amount
const formatWND = (amount) => {
  return `${amount.toLocaleString()} WND`;
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
  const [isParticipant, setIsParticipant] = useState(false); // Whether the user is a race participant
  
  // Betting system state
  const [showBetModal, setShowBetModal] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [bets, setBets] = useState([]); // Array of bet objects
  const [totalPool, setTotalPool] = useState(0);
  const [betsByPlayer, setBetsByPlayer] = useState({}); // Organized by player ID
  const [betsByAddress, setBetsByAddress] = useState({}); // User's bets

  // Register with the server on component mount
  useEffect(() => {
    if (socket) {
      // Extract selected car color from location state
      const selectedCarColor = location.state?.carColor || carColor;
      
      // Check if the user is a participant (has car and is from lobby) or just a bettor
      const isComeFromLobby = location.state?.fromLobby === true;
      const hasNFTCar = playerNFTs.length > 0;
      
      // Set participation status - only registered if coming from lobby and having a car
      setIsParticipant(isComeFromLobby || hasNFTCar);
      
      // Register player in waiting room only if they're a participant
      if (isComeFromLobby || hasNFTCar) {
        socket.emit('registerWaitingArena', { 
          carColor: selectedCarColor,
          address: address || 'anonymous',
          isParticipant: true
        });
        
        setIsRegistered(true);
      } else {
        // Just join as spectator/bettor
        socket.emit('joinAsSpectator', {
          address: address || 'anonymous'
        });
      }
      
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
      
      // Listen for bet updates
      socket.on('betUpdate', (data) => {
        if (data.bets) {
          setBets(data.bets);
          setTotalPool(data.totalPool || 0);
          
          // Group bets by player ID
          const byPlayer = {};
          data.bets.forEach(bet => {
            if (!byPlayer[bet.targetPlayerId]) {
              byPlayer[bet.targetPlayerId] = 0;
            }
            byPlayer[bet.targetPlayerId] += bet.amount;
          });
          setBetsByPlayer(byPlayer);
          
          // Filter user's own bets
          if (address) {
            const userBets = data.bets.filter(bet => bet.betterAddress === address);
            const byAddress = {};
            userBets.forEach(bet => {
              if (!byAddress[bet.targetPlayerId]) {
                byAddress[bet.targetPlayerId] = 0;
              }
              byAddress[bet.targetPlayerId] += bet.amount;
            });
            setBetsByAddress(byAddress);
          }
        }
      });
      
      // Listen for the start game event
      socket.on('startGame', () => {
        navigate('/play-me', { state: { carColor: selectedCarColor } });
      });
      
      // Cleanup listeners
      return () => {
        socket.off('waitingRoomUpdate');
        socket.off('betUpdate');
        socket.off('startGame');
        socket.emit('leaveWaitingArena');
      };
    }
  }, [socket, navigate, location.state, carColor, address, playerNFTs]);

  // Fetch player's NFTs
  useEffect(() => {
    if (address) {
      getUserNFTs(address)
        .then(nfts => {
          setPlayerNFTs(nfts);
          
          // Update participant status based on NFT ownership
          if (nfts.length > 0) {
            setIsParticipant(true);
            
            // If they have NFTs but weren't registered yet, register them
            if (socket && !isRegistered) {
              socket.emit('registerWaitingArena', { 
                carColor: carColor,
                address: address,
                isParticipant: true
              });
              setIsRegistered(true);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching NFTs:', error);
        });
    }
  }, [address, socket, carColor, isRegistered]);

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
  
  // Handle opening bet modal for a specific car
  const handleOpenBetModal = (playerId) => {
    setSelectedCar(playerId);
    setShowBetModal(true);
  };
  
  // Handle canceling a bet
  const handleCancelBet = () => {
    setShowBetModal(false);
    setSelectedCar(null);
    setBetAmount('');
  };
  
  // Handle placing a bet
  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || !selectedCar || !address) {
      return;
    }
    
    // Send bet to server
    if (socket) {
      socket.emit('placeBet', {
        amount,
        targetPlayerId: selectedCar,
        betterAddress: address
      });
    }
    
    // Close modal
    setShowBetModal(false);
    setSelectedCar(null);
    setBetAmount('');
  };

  // Generate a list of all players to display (avoiding duplicates)
  const combinedPlayers = (() => {
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
    return Array.from(playersMap.values());
  })();

  return (
    <Container>
      <Header>
        <Title>Waiting Arena</Title>
        <Subtitle>Race starts in:</Subtitle>
        <Timer>{formatTime(timeLeft)}</Timer>
      </Header>
      
      {totalPool > 0 && (
        <BetPoolDisplay>
          Total Betting Pool: {formatWND(totalPool)}
        </BetPoolDisplay>
      )}
      
      {gameStarting && (
        <div>
          <h2>Game starting soon!</h2>
          <p>Preparing race track...</p>
        </div>
      )}
      
      <PlayersContainer>
        {/* Current player card - only show if they're a participant */}
        {isParticipant ? (
          <PlayerCard>
            <CarImage src={getCarImage(carColor)} alt="Your car" />
            <PlayerName>You{playerNFTs.length > 0 ? ` (${playerNFTs[0].name})` : ''}</PlayerName>
            <StatusBadge isReady={true}>Ready</StatusBadge>
            
            {betsByPlayer[socket?.id] && (
              <BetCounterBadge>{formatWND(betsByPlayer[socket?.id])}</BetCounterBadge>
            )}
            
            {address && betsByAddress[socket?.id] && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
                Your bet: {formatWND(betsByAddress[socket?.id])}
              </div>
            )}
          </PlayerCard>
        ) : (
          <PlayerCard style={{ backgroundColor: '#f8f9fa', border: '2px dashed #ccc' }}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3>Betting Mode</h3>
              <p>You're in betting mode since you haven't minted a car.</p>
              <p>Place bets on cars you think will win the race!</p>
              {!address && (
                <div style={{ marginTop: '15px', color: '#d32f2f' }}>
                  Connect your wallet to place bets
                </div>
              )}
            </div>
          </PlayerCard>
        )}
        
        {/* Combined remote players list - avoiding duplicates */}
        {combinedPlayers.map(player => (
          <PlayerCard key={player.id}>
            <CarImage src={getCarImage(player.carColor)} alt="Player car" />
            <PlayerName>
              {player.name || `Player ${player.id.substring(0, 6)}`}
            </PlayerName>
            <StatusBadge isReady={player.ready}>
              {player.ready ? 'Ready' : 'Waiting'}
            </StatusBadge>
            
            {betsByPlayer[player.id] && (
              <BetCounterBadge>{formatWND(betsByPlayer[player.id])}</BetCounterBadge>
            )}
            
            {address && (
              <BetButton onClick={() => handleOpenBetModal(player.id)}>
                Place Bet
              </BetButton>
            )}
            
            {address && betsByAddress[player.id] && (
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
                Your bet: {formatWND(betsByAddress[player.id])}
              </div>
            )}
          </PlayerCard>
        ))}
      </PlayersContainer>
      
      {/* Admin button for testing - remove in production */}
      {process.env.NODE_ENV === 'development' && isParticipant && (
        <ButtonStart onClick={handleStartGame}>
          Force Start Game (Dev Only)
        </ButtonStart>
      )}
      
      {/* Betting Modal */}
      {showBetModal && (
        <ModalBackdrop>
          <ModalContent>
            <ModalTitle>Place Your Bet</ModalTitle>
            
            <FormGroup>
              <Label>Select Car:</Label>
              <CarSelection>
                {combinedPlayers.map(player => (
                  <CarOption 
                    key={player.id} 
                    selected={selectedCar === player.id}
                    onClick={() => setSelectedCar(player.id)}
                  >
                    <SmallCarImage src={getCarImage(player.carColor)} alt="Car" />
                    <CarName>{player.name || `Player ${player.id.substring(0, 6)}`}</CarName>
                  </CarOption>
                ))}
              </CarSelection>
            </FormGroup>
            
            <FormGroup>
              <Label>Bet Amount (WND):</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount in WND tokens"
              />
            </FormGroup>
            
            <ModalButtonsContainer>
              <CancelButton onClick={handleCancelBet}>Cancel</CancelButton>
              <SubmitButton 
                onClick={handlePlaceBet}
                disabled={!betAmount || parseFloat(betAmount) <= 0 || !selectedCar}
              >
                Place Bet
              </SubmitButton>
            </ModalButtonsContainer>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

export default WaitingArena;
