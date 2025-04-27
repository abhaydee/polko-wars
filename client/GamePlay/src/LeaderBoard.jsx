import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { SocketContext } from './SocketContext';
import { usePolkadotWallet } from './PolkadotWalletContext';

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
  grid-template-columns: 70px 1fr 120px 120px;
  padding: 15px 20px;
  background-color: #333;
  color: white;
  font-weight: bold;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr 120px 120px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.isWinner && `
    background-color: #eaf7ea !important;
    border-left: 5px solid #4caf50;
  `}
  
  ${props => props.isUser && `
    font-weight: bold;
    background-color: #e6f7ff !important;
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

const Leaderboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, carColor } = useContext(SocketContext);
  const { activeAccount } = usePolkadotWallet();
  const address = activeAccount?.address;
  
  const [results, setResults] = useState([]);
  const [winners, setWinners] = useState([]);
  const [bets, setBets] = useState([]);
  const [totalPool, setTotalPool] = useState(0);
  const [userBets, setUserBets] = useState([]);
  const [winnings, setWinnings] = useState(0);
  
  // Ask for game results when component mounts
  useEffect(() => {
    if (socket) {
      // Listen for game results
      socket.on('gameResults', (data) => {
        console.log('Received game results:', data);
        setResults(data.results || []);
        setWinners(data.winners || []);
        setBets(data.bets || []);
        setTotalPool(data.totalPool || 0);
        
        // Calculate user's bets and potential winnings
        if (address && data.bets) {
          const userBetsList = data.bets.filter(bet => bet.betterAddress === address);
          setUserBets(userBetsList);
          
          // Determine if any user bets won
          if (data.winners && data.winners.length > 0) {
            const winningIds = data.winners.map(w => w.id);
            let userWinAmount = 0;
            
            userBetsList.forEach(bet => {
              if (winningIds.includes(bet.targetPlayerId)) {
                // Simple payout model: 
                // If you bet on the winner, you get your bet back plus a proportional share of the pool
                const winnerBets = data.bets.filter(b => winningIds.includes(b.targetPlayerId));
                const totalWinnerBetsAmount = winnerBets.reduce((total, b) => total + b.amount, 0);
                
                if (totalWinnerBetsAmount > 0) {
                  // Simplified model - you get your bet back plus proportional share of losing bets
                  const shareOfPool = (bet.amount / totalWinnerBetsAmount) * (data.totalPool - totalWinnerBetsAmount);
                  userWinAmount += bet.amount + shareOfPool;
                }
              }
            });
            
            setWinnings(userWinAmount);
          }
        }
      });
      
      // Request game results
      socket.emit('joinGame');
      
      return () => {
        socket.off('gameResults');
      };
    }
  }, [socket, address]);
  
  // Handle play again
  const handlePlayAgain = () => {
    navigate('/lobby');
  };
  
  // Handle go home
  const handleGoHome = () => {
    navigate('/');
  };
  
  const winner = winners.length > 0 ? winners[0] : null;
  
  return (
    <Container>
      <Header>
        <Title>Race Results</Title>
        <Subtitle>Race completed! Here are the final standings:</Subtitle>
      </Header>
      
      {winner && (
        <WinnerHighlight>
          <WinnerInfo>
            <WinnerImage>
              <img src={getCarImage(winner.carColor)} alt="Winner car" />
            </WinnerImage>
            <div>
              <WinnerName>{winner.name}</WinnerName>
              <div>{winner.coinCount} coins collected</div>
            </div>
          </WinnerInfo>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffa500' }}>1st Place</div>
          </div>
        </WinnerHighlight>
      )}
      
      <LeaderboardTable>
        <TableHeader>
          <div>Rank</div>
          <div>Player</div>
          <div>Coins</div>
          <div>Bet Result</div>
        </TableHeader>
        
        {results.map((player, index) => {
          const isWinner = index < 3;
          const isUser = player.id === socket?.id;
          const userBetOnThisPlayer = userBets.some(bet => bet.targetPlayerId === player.id);
          
          return (
            <TableRow key={player.id} isWinner={isWinner} isUser={isUser}>
              <Rank top3={index < 3}>{index + 1}</Rank>
              <PlayerInfo>
                <CarIcon>
                  <img src={getCarImage(player.carColor)} alt="Car" />
                </CarIcon>
                <PlayerName isUser={isUser}>
                  {isUser ? 'You' : player.name}
                </PlayerName>
              </PlayerInfo>
              <CoinCount>{player.coinCount}</CoinCount>
              <BetResult 
                win={userBetOnThisPlayer && isWinner} 
                lose={userBetOnThisPlayer && !isWinner}
              >
                {userBetOnThisPlayer && isWinner && 'Win!'}
                {userBetOnThisPlayer && !isWinner && 'Loss'}
                {!userBetOnThisPlayer && '-'}
              </BetResult>
            </TableRow>
          );
        })}
      </LeaderboardTable>
      
      {bets.length > 0 && (
        <BettingResults>
          <BetTitle>Betting Results</BetTitle>
          <TotalPool>Total Pool: {formatWND(totalPool)}</TotalPool>
          
          {winnings > 0 && address && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#eaf7ea', 
              borderRadius: '5px', 
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#4caf50'
            }}>
              You won {formatWND(winnings)}!
            </div>
          )}
          
          <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>Your Bets:</div>
          
          {address && userBets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
              You didn't place any bets on this race.
            </div>
          )}
          
          {address && userBets.map((bet, index) => {
            const targetPlayer = results.find(p => p.id === bet.targetPlayerId);
            const playerRank = results.findIndex(p => p.id === bet.targetPlayerId) + 1;
            const isWinner = playerRank <= 3;
            
            return (
              <BetItem key={index}>
                <div>
                  <div>Bet on: {targetPlayer ? targetPlayer.name : `Player ${bet.targetPlayerId.substring(0, 6)}`}</div>
                  <div style={{ fontSize: '0.8rem', color: isWinner ? '#4caf50' : '#f44336' }}>
                    {isWinner ? `Winner (${playerRank}${playerRank === 1 ? 'st' : playerRank === 2 ? 'nd' : 'rd'} place)` : `Lost (${playerRank}th place)`}
                  </div>
                </div>
                <BetAmount>{formatWND(bet.amount)}</BetAmount>
              </BetItem>
            );
          })}
          
          {/* Only show other bets if there are any */}
          {bets.length > (userBets.length) && (
            <>
              <div style={{ margin: '20px 0 15px', fontWeight: 'bold' }}>All Bets:</div>
              
              {bets.slice(0, 5).map((bet, index) => {
                const isUserBet = bet.betterAddress === address;
                const targetPlayer = results.find(p => p.id === bet.targetPlayerId);
                const playerRank = results.findIndex(p => p.id === bet.targetPlayerId) + 1;
                const isWinner = playerRank <= 3;
                
                return (
                  <BetItem key={index}>
                    <div>
                      <BetAddress isUser={isUserBet}>
                        {isUserBet ? 'You' : `${bet.betterAddress.substring(0, 6)}...${bet.betterAddress.substring(bet.betterAddress.length - 4)}`}
                      </BetAddress>
                      <div style={{ fontSize: '0.8rem' }}>
                        Bet on: {targetPlayer ? targetPlayer.name : `Player ${bet.targetPlayerId.substring(0, 6)}`}
                      </div>
                    </div>
                    <div>
                      <BetAmount>{formatWND(bet.amount)}</BetAmount>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: isWinner ? '#4caf50' : '#f44336',
                        textAlign: 'right' 
                      }}>
                        {isWinner ? 'Win' : 'Loss'}
                      </div>
                    </div>
                  </BetItem>
                );
              })}
              
              {bets.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
                  + {bets.length - 5} more bets
                </div>
              )}
            </>
          )}
        </BettingResults>
      )}
      
      <ButtonGroup>
        <PlayAgainButton onClick={handlePlayAgain}>Play Again</PlayAgainButton>
        <GoHomeButton onClick={handleGoHome}>Go Home</GoHomeButton>
      </ButtonGroup>
    </Container>
  );
};

export default Leaderboard;
