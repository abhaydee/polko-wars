import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Modal from 'react-modal'; // Import the Modal component
import {NFT_CONTRACT_ADDRESS,TOKEN_CONTRACT_ADDRESS} from './constants/addresses'

// Import background image
import backgroundImage from './Assests/fbg.jpeg'; // Replace with your image file
import { ConnectWallet, ThirdwebNftMedia,  Web3Button,  useAddress, useContract, useNFT, useOwnedNFTs, useTokenBalance } from '@thirdweb-dev/react';
import LeaderBoard from './LeaderBoard'


// Styled components for styling
const HomeContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  max-width: 800px;
  width: 100%;
  padding: 10px;
`;

const Card = styled.div`
  background-color: #eeeee4;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 30%;
`;

const Button = styled.button`
  background-color: #0ed1e0;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 1rem
`;

const Home = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const [tokenBalanceDisplay, setTokenBalanceDisplay] = useState("0")
  const [ userLoggedIn, setUserLoggedIn] = useState(false)
  
  const address = useAddress()
  console.log(address)

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

    setUserLoggedIn(true)
    


  },[address, userLoggedIn])

  

  

  return (
    <HomeContainer>
      <CardContainer>
        <Card>

        <ConnectWallet 
            theme={"light"}
            btnTitle={"Login"}
            modalTitle={"Select a Wallet"}
            modalSize={"compact"}
            modalTitleIconUrl={""} 
            dropdownPosition={{
              side: "left", //  "top" | "bottom" | "left" | "right";
              align: "end", // "start" | "center" | "end";
            }}
          />

        
            
          
            
          
          

          
         
          
          <Button onClick={openModal}>Rules</Button>
          {address && (
            <Button > <Link to="/leaderBoard" style={{ textDecoration: 'none'}} >LeaderBoard</Link> </Button>
          )}
          {address && (
            <Button > <Link to="/profile" style={{ textDecoration: 'none'}} >Profile</Link> </Button>
          )}
          {address && (
            <Button > <Link to="/marketplace" style={{ textDecoration: 'none'}} >Marketplace</Link> </Button>
          )}
          
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Game Rules"
            style={{
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
              content: {
                background: '#eab676',
                borderRadius: '8px',
                padding: '20px',
                border: 'none',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px',
                margin: 'auto',
                textAlign: 'left',
              },
            }}
          >
          <h2 style={{ marginBottom: '20px', fontFamily: 'cursive', color: '#333', textAlign:'center' }}>Game Rules</h2>
            <ul style={{ listStyle: 'none', padding: 0  }}>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> Use WASD keys for controlling the car
              </li>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> Use UP, DOWN, LEFT, RIGHT arrows for applying angular velocity
              </li>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> Press K to swap the camera
              </li>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> Press R to restart the game
              </li>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> As soon as you enter the track, the game begins
              </li>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> Collect as many coins as possible
              </li>
              <li style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>-</span> Finish line is unlocked only if you collect a certain number of coins
              </li>
              <li>
                <span style={{ fontWeight: 'bold' }}>-</span> 3, 2, 1, Race...
              </li>
            </ul>
            <Button onClick={closeModal} style={{ marginTop: '20px', marginLeft:'150px'}}>I'm Ready</Button>
          </Modal>

        </Card>
      </CardContainer>
    </HomeContainer>
  );
};

export default Home;
