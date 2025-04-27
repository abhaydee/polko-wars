import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { SocketContext } from './SocketContext';
import { usePolkadotWallet } from './PolkadotWalletContext';
import { payoutWinner } from './utils/payout-winner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f5f5;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  
  /* Add smooth scrolling */
  scroll-behavior: smooth;
  
  /* Improve scrollbar appearance */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 1.2rem;
`;

const LeaderboardTable = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 70px minmax(200px, 1fr) 100px 100px;
  padding: 15px 20px;
  background-color: #333;
  color: white;
  font-weight: bold;
  align-items: center;
  
  @media (max-width: 600px) {
    grid-template-columns: 50px minmax(120px, 1fr) 80px 80px;
    padding: 12px 10px;
    font-size: 0.9rem;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 70px minmax(200px, 1fr) 100px 100px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  transition: background-color 0.2s;
  
  @media (max-width: 600px) {
    grid-template-columns: 50px minmax(120px, 1fr) 80px 80px;
    padding: 12px 10px;
    font-size: 0.9rem;
  }
  
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  ${props => props.isWinner && `
    background-color: #e8f5e9 !important;
    border-left: 5px solid #4caf50;
  `}
  
  ${props => props.isUser && `
    font-weight: bold;
    background-color: #e3f2fd !important;
    border-left: 5px solid #2196f3;
  `}
`;

const Rank = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: ${props => props.top3 ? '#ffa500' : '#333'};
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const CarIcon = styled.div`
  width: 40px;
  height: 30px;
  margin-right: 10px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const PlayerName = styled.div`
  font-weight: ${props => props.isUser ? 'bold' : 'normal'};
`;

const CoinCount = styled.div`
  font-weight: bold;
  color: #f0ad4e;
`;

const BetResult = styled.div`
  font-weight: bold;
  color: ${props => props.win ? '#4caf50' : props.lose ? '#f44336' : '#999'};
`;

const BettingResults = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
`;

const BetTitle = styled.h2`
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const TotalPool = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #673ab7;
  color: white;
  border-radius: 5px;
`;

const BetItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const BetAddress = styled.div`
  font-size: 0.9rem;
  color: #666;
  
  ${props => props.isUser && `
    font-weight: bold;
    color: #333;
  `}
`;

const BetAmount = styled.div`
  font-weight: bold;
  color: #f0ad4e;
`;

const WinnerHighlight = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const WinnerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const WinnerImage = styled.div`
  width: 60px;
  height: 45px;
  margin-right: 15px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const WinnerName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PlayAgainButton = styled(Button)`
  background-color: #4CAF50;
  color: white;
  
  &:hover {
    background-color: #45a049;
  }
`;

const GoHomeButton = styled(Button)`
  background-color: #333;
  color: white;
  
  &:hover {
    background-color: #444;
  }
`;

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

// New styled components for the winner payout section
const PayoutContainer = styled.div`
  background-color: #e8f5e9;
  border: 1px solid #66bb6a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PayoutTitle = styled.h3`
  color: #2e7d32;
  margin-bottom: 15px;
`;

const PayoutAmount = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
`;

const PayoutButton = styled(Button)`
  background-color: #4caf50;
  color: white;
  
  &:hover {
    background-color: #388e3c;
  }
  
  &:disabled {
    background-color: #a5d6a7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PayoutStatus = styled.div`
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  
  ${props => props.success && `
    background-color: #e8f5e9;
    color: #2e7d32;
  `}
  
  ${props => props.error && `
    background-color: #ffebee;
    color: #c62828;
  `}
  
  ${props => props.warning && `
    background-color: #fff8e1;
    color: #f57c00;
  `}
`;

// Add a FallbackMessage component for empty state
const FallbackMessage = styled.div`
  text-align: center;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 10px;
  margin: 20px 0;
  color: #666;
  width: 100%;
  max-width: 800px;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
`;

// Add a LoadingSpinner component
const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 50px auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Leaderboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useContext(SocketContext);
  const { activeAccount } = usePolkadotWallet();
  const address = activeAccount?.address;
  
  const [results, setResults] = useState([]);
  const [winners, setWinners] = useState([]);
  const [bets, setBets] = useState([]);
  const [totalPool, setTotalPool] = useState(0);
  const [userBets, setUserBets] = useState([]);
  const [userWonBet, setUserWonBet] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for payout
  const [isPaying, setIsPaying] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  
  // Use localStorage to track if the prize was already claimed
  useEffect(() => {
    const claimed = localStorage.getItem('betPrizeClaimed');
    if (claimed === 'true') {
      setHasClaimed(true);
    }
  }, []);

  // Load data from socket
  useEffect(() => {
    if (socket) {
      setIsLoading(true);
      console.log('Leaderboard mounted, requesting game results');
      
      // First try to request game results
      socket.emit('requestGameResults');
      
      // Also join game to make sure we get any existing results
      socket.emit('joinGame');
      
      // Add timeout to show loading state for at least 1 second
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      // Handle receiving game results
      socket.on('gameResults', (data) => {
        console.log('Received game results:', data);
        
        if (data.results && data.results.length > 0) {
          setResults(data.results);
          
          // Set winners if present
          if (data.winners && data.winners.length > 0) {
            setWinners(data.winners);
          } else {
            // If no winners specified, assume top 3 from results
            setWinners(data.results.slice(0, Math.min(3, data.results.length)));
          }
          
          // Set betting data
          if (data.bets) setBets(data.bets);
          if (data.totalPool) setTotalPool(data.totalPool);
          
          // Process user's bets if they're logged in
          if (address && data.bets) {
            // Find all bets placed by the current user
            const myBets = data.bets.filter(bet => bet.betterAddress === address);
            setUserBets(myBets);
            
            // Check if any of the user's bets were on winners
            if (myBets.length > 0 && data.results.length > 0) {
              const winningPlayerId = data.results[0].id; // First place winner
              
              // Find if user bet on the winner
              const winningBet = myBets.find(bet => bet.targetPlayerId === winningPlayerId);
              
              if (winningBet) {
                // Calculate winnings (simple version - just double the bet)
                // In a real implementation, you might use a more complex formula
                const winningAmount = winningBet.amount * 2;
                
                setUserWonBet(true);
                setWinAmount(winningAmount);
                console.log(`User won bet! Amount: ${winningAmount}`);
              }
            }
          }
          
          setIsLoading(false);
        } else {
          console.log('No results data in response:', data);
        }
      });
      
      // Set up a retry mechanism if no data received within 2 seconds
      const retryTimer = setTimeout(() => {
        if (results.length === 0) {
          console.log('No results received yet, retrying...');
          socket.emit('requestGameResults');
          socket.emit('joinGame');
        }
      }, 2000);
      
      return () => {
        socket.off('gameResults');
        clearTimeout(retryTimer);
        clearTimeout(loadingTimer);
      };
    }
  }, [socket, address]);

  // Add effect to check for results in location state (passed from game component)
  useEffect(() => {
    if (location.state?.results) {
      console.log('Found results in location state:', location.state.results);
      setResults(location.state.results);
      
      if (location.state.winners) {
        setWinners(location.state.winners);
      } else if (location.state.results.length > 0) {
        // If no winners specified, assume top 3
        setWinners(location.state.results.slice(0, Math.min(3, location.state.results.length)));
      }
      
      if (location.state.bets) setBets(location.state.bets);
      if (location.state.totalPool) setTotalPool(location.state.totalPool);
      
      setIsLoading(false);
    }
  }, [location.state]);

  // Handle navigation
  const handlePlayAgain = () => {
    navigate('/lobby');
  };

  const handleGoHome = () => {
    navigate('/');
  };
  
  // Handle claiming the bet prize
  const handleClaimPrize = async () => {
    if (!address || !userWonBet || winAmount <= 0 || hasClaimed) return;
    
    try {
      setIsPaying(true);
      setPayoutStatus(null);
      
      // Log the payout attempt
      console.log(`Attempting to pay ${winAmount} WND to address: ${address}`);
      
      // Call the payout function
      const result = await payoutWinner(address, winAmount);
      console.log('Payout result:', result);
      
      if (result.success) {
        // Check if transfer was actually confirmed
        if (result.transferConfirmed) {
          setPayoutStatus({
            success: true,
            message: `Successfully claimed ${winAmount} WND! Your wallet has been credited.`
          });
          toast.success(`Successfully claimed ${winAmount} WND!`);
          
          // Mark as claimed in localStorage
          localStorage.setItem('betPrizeClaimed', 'true');
          setHasClaimed(true);
        } else {
          // Transaction was successful but transfer event not confirmed
          setPayoutStatus({
            warning: true,
            message: `Transaction processed but transfer not confirmed. Please check your wallet balance.`
          });
          toast.warning(`Transaction processed, please check your wallet balance.`);
        }
      } else {
        setPayoutStatus({
          error: true,
          message: `Failed to claim: ${result.error}`
        });
        toast.error(`Failed to claim: ${result.error}`);
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      setPayoutStatus({
        error: true,
        message: `Error: ${error.message || 'Unknown error'}`
      });
      toast.error(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header>
        <Title>Race Results</Title>
        <Subtitle>Final standings and rewards</Subtitle>
      </Header>
      
      {isLoading ? (
        <FallbackMessage>
          <LoadingSpinner />
          <p>Loading race results...</p>
        </FallbackMessage>
      ) : (
        <>
          {/* Winners section */}
          {winners.length > 0 && (
            <WinnerHighlight>
              <WinnerInfo>
                <WinnerImage>
                  <img src={getCarImage(winners[0].carColor)} alt="Winner car" />
                </WinnerImage>
                <WinnerName>Winner: {winners[0].name}</WinnerName>
              </WinnerInfo>
              <CoinCount>{winners[0].coinCount} coins</CoinCount>
            </WinnerHighlight>
          )}
          
          {/* Leaderboard table or empty message */}
          {results.length > 0 ? (
            <LeaderboardTable>
              <TableHeader>
                <div>Rank</div>
                <div>Player</div>
                <div>Coins</div>
                <div>Bet Result</div>
              </TableHeader>
              
              {results.map((player, index) => {
                const isCurrentUser = player.address === address;
                const isWinner = index === 0;
                const userBetOnThisPlayer = userBets.some(bet => bet.targetPlayerId === player.id);
                const betResult = userBetOnThisPlayer ? (isWinner ? 'Won' : 'Lost') : '';
                
                return (
                  <TableRow key={player.id} isWinner={isWinner} isUser={isCurrentUser}>
                    <Rank top3={index < 3}>{index + 1}</Rank>
                    <PlayerInfo>
                      <CarIcon>
                        <img src={getCarImage(player.carColor)} alt="Player car" />
                      </CarIcon>
                      <PlayerName isUser={isCurrentUser}>
                        {player.name} {isCurrentUser && '(You)'}
                      </PlayerName>
                    </PlayerInfo>
                    <CoinCount>{player.coinCount}</CoinCount>
                    <BetResult win={betResult === 'Won'} lose={betResult === 'Lost'}>
                      {betResult}
                    </BetResult>
                  </TableRow>
                );
              })}
            </LeaderboardTable>
          ) : (
            <FallbackMessage>
              <h3>No Race Results</h3>
              <p>There are no results to display yet. The race may still be in progress.</p>
            </FallbackMessage>
          )}
          
          {/* Betting results */}
          {bets.length > 0 && (
            <BettingResults>
              <BetTitle>Betting Results</BetTitle>
              <TotalPool>Total Betting Pool: {formatWND(totalPool)}</TotalPool>
              
              {bets.map((bet, index) => {
                const isCurrentUser = bet.betterAddress === address;
                const betOnWinner = winners.length > 0 && bet.targetPlayerId === winners[0].id;
                
                return (
                  <BetItem key={`${bet.id || index}`}>
                    <BetAddress isUser={isCurrentUser}>
                      {isCurrentUser ? 'You' : `${bet.betterAddress.substring(0, 8)}...${bet.betterAddress.substring(bet.betterAddress.length - 4)}`}
                      {' -> '}
                      {results.find(p => p.id === bet.targetPlayerId)?.name || bet.targetPlayerId.substring(0, 6)}
                      {betOnWinner && ' ✓'}
                    </BetAddress>
                    <BetAmount>{formatWND(bet.amount)}</BetAmount>
                  </BetItem>
                );
              })}
            </BettingResults>
          )}
          
          {/* Winner payout section - only show for the user who won a bet */}
          {userWonBet && address && (
            <PayoutContainer>
              <PayoutTitle>You won your bet!</PayoutTitle>
              <PayoutAmount>{formatWND(winAmount)}</PayoutAmount>
              
              <PayoutButton 
                onClick={handleClaimPrize} 
                disabled={isPaying || hasClaimed}
              >
                {isPaying ? 'Processing...' : hasClaimed ? 'Prize Claimed' : 'Claim Prize'}
              </PayoutButton>
              
              {payoutStatus && (
                <PayoutStatus success={payoutStatus.success} error={payoutStatus.error} warning={payoutStatus.warning}>
                  {payoutStatus.message}
                </PayoutStatus>
              )}
            </PayoutContainer>
          )}
        </>
      )}
      
      <ButtonGroup>
        <Button onClick={handlePlayAgain} style={{ backgroundColor: '#4CAF50', color: 'white' }}>
          Play Again
        </Button>
        <Button onClick={handleGoHome} style={{ backgroundColor: '#2196F3', color: 'white' }}>
          Back to Home
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default Leaderboard;
