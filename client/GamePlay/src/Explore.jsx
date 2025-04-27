import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { usePolkadotWallet } from './PolkadotWalletContext';
import PolkadotConnectButton from './components/PolkadotConnectButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-around;
  max-width: 800px;
  width: 100%;
  padding: 20px;
  gap: 20px;
`;

const Card = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 45%;
  cursor: pointer;
`;

const Title = styled.h3`
  margin-bottom: 10px;
  color: #333;
`;

const Explore = () => {
    const navigate = useNavigate();
    const { activeAccount } = usePolkadotWallet();
  
    const handleNavigation = (path) => {
      navigate(path);
    };
  
    return (
      <Container>
        <h1>Explore Polko Wars</h1>
        <div style={{ marginBottom: '20px' }}>
          <PolkadotConnectButton />
        </div>
  
        <CardContainer>
          <Card onClick={() => handleNavigation('/lobby')}>
            <Title>FREE TO PLAY</Title>
            <p>Join and play for free!</p>
          </Card>
          
          <Card onClick={() => handleNavigation('/stake')}>
            <Title>PLAY TO EARN</Title>
            <p>Participate and earn rewards!</p>
          </Card>
        </CardContainer>
      </Container>
    );
};

export default Explore;
