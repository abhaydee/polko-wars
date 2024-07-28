import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ConnectWallet, useAddress } from '@thirdweb-dev/react';

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

const LobbyPage = () => {
    const navigate = useNavigate();
    const address = useAddress()

    const handleF2P = () => {
        navigate('/play-me');
    };
  return (
    <Container>
    <ConnectWallet/>
      <h2>Lobby</h2>
      <CardContainer>
        <Card onClick={handleF2P}>
          <Title>FREE TO PLAY</Title>
          <p>Join and play for free!</p>
        </Card>
        <Card>
          <Title>PLAY TO EARN</Title>
          <p>Participate and earn rewards!</p>
        </Card>
      </CardContainer>
    </Container>
  );
}

export default LobbyPage;
