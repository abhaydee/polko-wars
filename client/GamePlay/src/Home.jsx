import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { NFT_CONTRACT_ADDRESS, TOKEN_CONTRACT_ADDRESS } from './constants/addresses';
import backgroundImage from './Assests/fbg.jpeg';
import LeaderBoard from './LeaderBoard';
import { client } from "./client";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { ConnectEmbed } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

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
  margin: 1rem;
`;

const Home = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address
  console.log(address)


  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    if (activeAccount?.address) {
      console.log("Active account address:", activeAccount.address);
    }
  }, [activeAccount]);

  return (
    <HomeContainer>
      <CardContainer>
        <Card>
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
          <Button onClick={openModal}>Rules</Button>
          {/* {address && (
            <Button>
            <Link to="/leaderBoard" style={{ textDecoration: 'none', color: '#fff' }}>LeaderBoard</Link>
          </Button>
         
          )} */}

          {/* {address && (
          <Button>
            <Link to="/profile" style={{ textDecoration: 'none', color: '#fff' }}>Profile</Link>
          </Button>
          )} */}
          
          {address && (
          <Button>
            <Link to="/marketplace" style={{ textDecoration: 'none', color: '#fff' }}>Marketplace</Link>
          </Button>
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
            <h2 style={{ marginBottom: '20px', fontFamily: 'cursive', color: '#333', textAlign: 'center' }}>Game Rules</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
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
            <Button onClick={closeModal} style={{ marginTop: '20px', marginLeft: '150px' }}>I'm Ready</Button>
          </Modal>
        </Card>
      </CardContainer>
    </HomeContainer>
  );
};

export default Home;
