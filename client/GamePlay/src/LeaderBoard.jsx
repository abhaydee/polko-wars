import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment-timezone';
import Bgleader from "./Assests/bg_leader.jpeg";
import TrophyImage from "./Assests/winner.png";
import { ConnectButton, useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, getContract, defineChain } from "thirdweb";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client } from "./client";
import { NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS } from './constants/addresses';

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

const myChain = defineChain({
  id: 1287,
  rpc: "https://1287.rpc.thirdweb.com/",
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
  background-image: url(${Bgleader});
  background-size: cover;
  color: #d87f7f;
  font-family: Arial, sans-serif;
`;

const ProfileContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #333;
  }

  button {
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    &:hover {
      background-color: #0056b3;
    }
  }
`;

const ClaimButton = styled.button`
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const NFTClaimButton = styled.button`
  background-color: #ff8c00;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  &:hover {
    background-color: #e07b00;
  }
`;

const LeaderboardSection = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;

  h1 {
    text-align: center;
    color: #333;
  }
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    color: #333;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #ddd;
  }
`;

const StyledConnectButton = styled(ConnectButton)`
  margin-bottom: 20px;
  .tw-connect-wallet {
    background-color: #065c63;
    color: #fff;
    &:hover {
      background-color: #043f4b;
    }
  }
`;

const CenteredImage = styled.img`
  display: block;
  margin: 20px auto;
  width: 200px; /* Adjust the width as needed */
  height: auto;
`;

const Timer = styled.div`
  font-size: 24px;
  color: #ff0000;
  text-align: center;
  margin-top: 20px;
`;

const LeaderBoard = () => {
  const location = useLocation();
  const { state } = location;
  const [leaderBoardData, setLeaderBoardData] = useState([]);
  const [isDataAdded, setDataAdded] = useState(false);
  const [winnerClaimed, setWinnerClaimed] = useState(true);
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { mutate: sendTransaction } = useSendTransaction();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: myChain,
    address: TOKEN_CONTRACT_ADDRESS,
  });

  const tokenContract = getContract({
    client,
    address: TOKEN_CONTRACT_ADDRESS,
    chain: myChain,
  });

  useEffect(() => {
    getLeaderboardDataFromLocalStorage();
    getTimerFromLocalStorage();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime <= 1 ? 24 * 60 * 60 : prevTime - 1;
        saveTimerToLocalStorage(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getLeaderboardDataFromLocalStorage = () => {
    const storedData = localStorage.getItem('leaderboard');
    if (storedData) {
      const leaderboardData = JSON.parse(storedData);
      leaderboardData.sort((a, b) => a.finishLineFrame - b.finishLineFrame);
      setLeaderBoardData(leaderboardData);
    }
  };

  const addDataToLocalStorage = (data) => {
    const storedData = localStorage.getItem('leaderboard');
    const leaderboardData = storedData ? JSON.parse(storedData) : [];
    leaderboardData.push(data);
    leaderboardData.sort((a, b) => a.finishLineFrame - b.finishLineFrame);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    setLeaderBoardData(leaderboardData);
  };

  const getTimerFromLocalStorage = () => {
    const storedTime = localStorage.getItem('timer');
    if (storedTime) {
      setTimeLeft(parseInt(storedTime, 10));
    }
  };

  const saveTimerToLocalStorage = (time) => {
    localStorage.setItem('timer', time.toString());
  };

  useEffect(() => {
    if (address && !isDataAdded) {
      if (leaderBoardData.find(entry => entry.Wallet_Address === address)) {
        return;
      }
      if (state && state.points && state.finishLineFrame) {
        const { points, finishLineFrame } = state;
        const seconds = ((finishLineFrame + 100) / 30).toFixed(2);
        const currentTime = moment().tz('America/New_York').format();
        const newEntry = {
          Wallet_Address: address,
          Coins: points,
          Time: seconds,
          finishLineFrame: finishLineFrame,
          winnerClaimed: true,
          Timestamp: currentTime,
        };
        addDataToLocalStorage(newEntry);
        setDataAdded(true);
      }
    }
  }, [address, isDataAdded, state, leaderBoardData]);

  const handleERC20 = async () => {
    const transaction = prepareContractCall({
      contract: tokenContract,
      method: "function mintTo(address to, uint256 amount)",
      params: [address, 10], // Adjust the amount as needed
    });
    sendTransaction(transaction, {
      onSuccess: (tx) => console.log("Transaction successful:", tx),
      onError: (error) => console.error("Transaction failed:", error),
    });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <Container>
      <StyledConnectButton
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
      <ProfileContainer>
        <ProfileHeader>
          <Link to="/" style={{ textDecoration: 'none', marginRight: '10px' }}><h2>Your Profile</h2></Link>
          <button onClick={() => setProfileOpen(!isProfileOpen)}>
            {isProfileOpen ? 'Close' : 'Open'}
          </button>
        </ProfileHeader>
        {isProfileOpen && (
          <>
            {address && (
              <>
                <ClaimButton onClick={handleERC20}>Claim</ClaimButton>
              </>
            )}
          </>
        )}
      </ProfileContainer>
      <LeaderboardSection>
        <h1>Leaderboard</h1>
        {winnerClaimed ? (
          <>
            <CenteredImage src={TrophyImage} alt="Trophy" />
            <Timer>{formatTime(timeLeft)}</Timer>
            <p>Winner Can Claim</p>
            {address && leaderBoardData.length > 0 && leaderBoardData[0].Wallet_Address === address && (
              <NFTClaimButton
                onClick={() => {
                  alert("NFT claimed");
                  setWinnerClaimed(false);
                }}
              >
                Claim NFT
              </NFTClaimButton>
            )}
          </>
        ) : (
          <h1 style={{ textAlign: 'center', width: '100%', margin: '0 auto !important' }}>Winner Claimed the NFT</h1>
        )}
        <LeaderboardTable>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Wallet Address</th>
              <th>Coins</th>
              <th>Time (Seconds)</th>
            </tr>
          </thead>
          <tbody>
            {leaderBoardData.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.Wallet_Address}</td>
                <td>{entry.Coins}</td>
                <td>{entry.Time}</td>
              </tr>
            ))}
          </tbody>
        </LeaderboardTable>
      </LeaderboardSection>
    </Container>
  );
};

export default LeaderBoard;
