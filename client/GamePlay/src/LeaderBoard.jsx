import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './leaderBoard.css';
import { Link } from 'react-router-dom';
import trophyImage from './Assests/winner.png';
import { collection, getDocs, addDoc } from "firebase/firestore";
import moment from 'moment-timezone';
import { db } from './config/firestore.js';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { prepareContractCall, getContract } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { client } from "./client";
import { createWallet, inAppWallet } from "thirdweb/wallets";
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

  const tokenContract = getContract({
    client,
    address: TOKEN_CONTRACT_ADDRESS,
    chainId: 1, // Replace with the appropriate chain ID
  });

  useEffect(() => {
    getLeaderboardDataFromFirestore();
  }, []);

  const getLeaderboardDataFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Leaderboard"));
      const leaderboardData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      leaderboardData.sort((a, b) => a.finishLineFrame - b.finishLineFrame);
      setLeaderBoardData(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard data from Firestore', error);
    }
  };

  const addDataToFirestore = async (data) => {
    try {
      const leaderboardCollection = collection(db, "Leaderboard");
      const docRef = await addDoc(leaderboardCollection, data);
      console.log("Document added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
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
        addDataToFirestore(newEntry);
        setDataAdded(true);
      }
    }
  }, [address, isDataAdded, state, leaderBoardData]);

  const handleERC20 = async () => {
    const transaction = prepareContractCall({
      contract: tokenContract,
      method: "mintTo",
      params: [address, 1000], // Adjust the amount as needed
    });
    sendTransaction(transaction);
  };

  return (
    <div className='leaderBoard-container'>
      <ConnectButton
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
      <div className='Profile'>
        <div className='profile-header'>
          <Link to="/" style={{ textDecoration: 'none', marginRight: '10px' }}><h2>Your Profile</h2></Link>
          <button onClick={() => setProfileOpen(!isProfileOpen)}>
            {isProfileOpen ? 'Close' : 'Open'}
          </button>
        </div>
        {isProfileOpen && (
          <>
            {address && (
              <>
                
                <button onClick={handleERC20}>Claim</button>
              </>
            )}
          </>
        )}
      </div>
      <div className='leaderboard-section'>
        <h1>Leaderboard</h1>
        {winnerClaimed ? (
          <>
            <p>Winner Can Claim</p>
            {address && leaderBoardData.length > 0 && leaderBoardData[0].Wallet_Address === address && (
              <button
                contractAddress={NFT_CONTRACT_ADDRESS}
                action={(contract) => contract.erc721.claim(1)}
                onSuccess={() => {
                  alert("NFT claimed");
                  setWinnerClaimed(false);
                }}
              >
                Claim NFT
              </button>
            )}
          </>
        ) : (
          <h1 style={{ textAlign: 'center', width: '100%', margin: '0 auto !important' }}>Winner Claimed the NFT</h1>
        )}
        <table className="leaderboard-table">
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
        </table>
      </div>
    </div>
  );
};

export default LeaderBoard;
