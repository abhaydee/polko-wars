import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './leaderBoard.css';
import { Link } from 'react-router-dom';
import trophyImage from './Assests/winner.png';

import { collection, getDocs , addDoc, updateDoc} from "firebase/firestore";
import moment from 'moment-timezone';
import {db} from './config/firestore.js'



import {NFT_CONTRACT_ADDRESS,TOKEN_CONTRACT_ADDRESS} from './constants/addresses'

import { ConnectWallet, ThirdwebNftMedia,  Web3Button,  useAddress, useContract, useNFT, useOwnedNFTs, useTokenBalance, walletConnect } from '@thirdweb-dev/react';


const LeaderBoard = () => {
  
  const location = useLocation();
  const { state } = location;
  const [leaderBoardData,setLeaderBoardData] =  useState()
  console.log(leaderBoardData)
  const [isDataAdded, setDataAdded] = useState(false); // Track if data has been added
  const [userAddress, setUserAddress] = useState(null); // Store the user's address
  const [winnerClaimed, setWinnerClaimed] = useState(true); 
  const address = useAddress()
 
  // console.log(address)


  // FireBase
  
  

  // Fetch leaderboard data from Firebase
  const getLeaderboardDataFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Leaderboard"));
      const leaderboardData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort the leaderboard data in ascending order based on 'finishLineFrame'
      leaderboardData.sort((a, b) => a.finishLineFrame - b.finishLineFrame);
      
      setLeaderBoardData(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard data from Firestore', error);
    }
  };

  const addDataToFirestore = async (data) => {
    try {
      // Reference to the Firestore collection
      const leaderboardCollection = collection(db, "Leaderboard");
  
      // Add a new document with the data
      const docRef = await addDoc(leaderboardCollection, data);
  
      console.log("Document added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  

  useEffect(() => {
    getLeaderboardDataFromFirestore();
  }, []);


  const setAndStoreWinnerClaimed = async () => {
    // Check if the NFT has already been claimed
   

  };
  
  


  // ThirdWeb

  const [tokenBalanceDisplay, setTokenBalanceDisplay] = useState("0")
  const [isProfileOpen, setProfileOpen] = useState(false);
  
  

  const {contract: nftContract} = useContract(NFT_CONTRACT_ADDRESS)
  const {contract: tokenContract} = useContract(TOKEN_CONTRACT_ADDRESS)
  

  const {
    data: ownedNFTs,
    isLoading: isLoadingOwnedNFTs,
  } = useOwnedNFTs(nftContract, address)
  

  const {
    data: tokenBalance,
    isLoading: isLoadingTokenBalance
  } = useTokenBalance(tokenContract, address)

  const {
    data: nft,
    isLoading: isLoadingNFT
  } = useNFT(nftContract, 0)

  useEffect(() => {
    if(!address) return
    if(!tokenContract) return

    const interval = setInterval(async() => {
      const tokenBalance = await tokenContract.erc20.balanceOf(address)
      setTokenBalanceDisplay(tokenBalance.displayValue)
    }, 5000)

   


  },[address, nft])

  const truncateAddress = (address) => {
    return `${address.slice(0,6)}..${address.slice(-4)}`
  }

  useEffect(() => {
    if (address && !userAddress) {
      setUserAddress(address);
    }
  }, [address, userAddress]);

  // Set the desired timezone (e.g., 'America/New_York')
const desiredTimezone = 'America/New_York';


  useEffect(() => {
    if(!userAddress) return
    // Check if the user's data already exists in the leaderboard
  if (leaderBoardData) {
    const userEntry = leaderBoardData.find((entry) => entry.Wallet_Address === userAddress);

    if (userEntry) {
      // User's data already exists, no need to add it again
      return;
    }
  }
    if (isDataAdded) {
      return; // Data has already been added, do not proceed
    }

    if (state && state.points && state.finishLineFrame) {
      const { points, finishLineFrame } = state;
      const seconds = ((finishLineFrame +100 ) / 30).toFixed(2);
      // Get the current date and time in the desired timezone
      const currentTime = moment().tz(desiredTimezone).format();
      // const minutes = Math.floor(seconds / 60);
      // const remainingSeconds = (seconds % 60).toFixed(2); // Use toFixed to display two decimal places

      // // Format the time as "X min Y.YY sec" or "Y.YY sec" if there are no minutes
      // const time = minutes > 0 ? `${minutes} min ${remainingSeconds} sec` : `${remainingSeconds} sec`;
      

      const newEntry = {
        Wallet_Address: userAddress, // Set the wallet address if available
        Coins: points,
        Time: seconds,
        finishLineFrame: finishLineFrame,
        winnerClaimed: true,
        Timestamp: currentTime,
      };
      

     
        addDataToFirestore(newEntry);
        setDataAdded(true); // Mark data as added
      }
    
  }, [isDataAdded, state, userAddress,leaderBoardData]);

  async function handleERC20() {
    
  }



  return (
    <div className='leaderBoard-container' >
        
      <div className='Profile' >
       <div className='profile-header'>
          <Link to="/" style={{ textDecoration: 'none', marginRight: '10px' }} ><h2>Your Profile</h2></Link>
          
          <button onClick={() => setProfileOpen(!isProfileOpen)}>
            {isProfileOpen ? 'Close' : 'Open'}
          </button>
        </div>
        { isProfileOpen && (
          <>
            {address && (
            <>
            <h3 className='me'>Welcome Back :<span> { truncateAddress(address)}</span></h3>
              {!isLoadingTokenBalance && (
                <>
                <h1>APE Coins: {tokenBalanceDisplay}</h1>
                <button onClick={handleERC20} >Claim
                </button>
                </>
              )}
              
              
             
              {!isLoadingOwnedNFTs ? (
                ownedNFTs && ownedNFTs.length > 0 ? (
                  <ThirdwebNftMedia metadata={nft.metadata} />
                ): (
                  <p> You don't own any NFTs </p>
                )
   
              ): (
                <p>Loading...</p>
              ) }
             
            </>
          )}
          </>
        )}
      
      </div>

      <div className='leaderboard-section' >
      <h1>Leaderboard</h1>
      { winnerClaimed ? (
        <>
          <div>
          {!isLoadingTokenBalance && (<ThirdwebNftMedia metadata={nft.metadata} />)}
        </div>
        <p>Winner Can Claim</p>
        {address && leaderBoardData  && leaderBoardData.length > 0 && (
          <>
            {leaderBoardData[0].Wallet_Address === userAddress  && (
              <Web3Button
                contractAddress={NFT_CONTRACT_ADDRESS}
                action={(contract) => contract.erc721.claim(1)}
                onSuccess={() => {
                  alert("NFT claimed");
                  setAndStoreWinnerClaimed(false);
                }}
              >
                Claim NFT
              </Web3Button>
            )}
          </>
        )}

        </>
        
      ) : (
        <h1 style={{ textAlign: 'center', width: '100%', margin: '0 auto !important' }}> Winner Claimed the NFT</h1>
      )

      }
      
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Wallet Address</th>
            <th>Coins</th>
            <th>Time(Seconds)</th>
          </tr>
        </thead>
        <tbody>
          {leaderBoardData && leaderBoardData.map((entry, index) => (
            <tr key={index} > 
              <td>{index +1}</td>
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


