import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "./client";
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-around;
  max-width: 800px;
  width: 100%;
  padding: 20px;
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 45%;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.h3`
  margin-bottom: 10px;
  color: #333;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 15px;
`;

const WalletSection = styled.div`
  margin-bottom: 20px;
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: flex-end;
`;

const CustomizationSection = styled.div`
  margin-top: 30px;
  background-color: #f1f1f1;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
`;

const CarSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  justify-content: center;
`;

const CarOption = styled.div`
  width: 150px;
  height: 100px;
  cursor: pointer;
  border: ${(props) => props.selected ? '4px solid #333' : '4px solid transparent'};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  }
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const StartButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  margin: 20px 0;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

// Available car colors with corresponding images
const CAR_OPTIONS = [
  { color: '#ff0000', name: 'Red', image: '/cars/car red.png' },
  { color: '#ff8800', name: 'Orange', image: '/cars/car orange.png' },
  { color: '#00ff00', name: 'Green', image: '/cars/car green.png' },
  { color: '#ffff00', name: 'Yellow', image: '/cars/car yellow.png' }
];

const LobbyPage = () => {
  const navigate = useNavigate();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // Default: red

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Save the color to localStorage for persistence
    localStorage.setItem('carColor', color);
  };

  // Load the saved color from localStorage on component mount
  useEffect(() => {
    const savedColor = localStorage.getItem('carColor');
    if (savedColor) {
      setSelectedColor(savedColor);
    }
  }, []);

  const handleF2P = () => {
    // Navigate to play-me with the selected color as state
    navigate('/play-me', { state: { carColor: selectedColor } });
  };

  const handleP2E = () => {
    navigate('/stake', { state: { carColor: selectedColor } });
  };

  return (
    <Container>
      <h1>Polko Wars Lobby</h1>
      
      <WalletSection>
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
      </WalletSection>

      <CustomizationSection>
        <h2>Choose Your Car</h2>
        <p>Select your favorite car for the race:</p>
        
        <CarSelector>
          {CAR_OPTIONS.map((car) => (
            <CarOption 
              key={car.color} 
              selected={selectedColor === car.color} 
              onClick={() => handleColorSelect(car.color)}
            >
              <CarImage 
                src={process.env.PUBLIC_URL + car.image} 
                alt={`${car.name} car`} 
              />
            </CarOption>
          ))}
        </CarSelector>
      </CustomizationSection>

      <CardContainer>
        <Card onClick={handleF2P}>
          <Title>Free to Play</Title>
          <Description>Join a multiplayer race with your selected car!</Description>
          <StartButton>Start Racing</StartButton>
        </Card>
        
        <Card onClick={handleP2E}>
          <Title>Play to Earn</Title>
          <Description>Stake tokens and earn rewards while racing</Description>
          <StartButton>Stake & Play</StartButton>
        </Card>
      </CardContainer>
    </Container>
  );
};

export default LobbyPage;
