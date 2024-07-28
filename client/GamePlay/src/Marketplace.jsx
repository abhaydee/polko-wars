import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
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
  max-width: 1200px;
  width: 100%;
  padding: 20px;
  gap: 20px;
`;

const Card = styled.div`
  background-color: #eeeee4;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 30%;
  cursor: pointer;
`;

const CarImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
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

const Marketplace = () => {
    const address = useAddress();
    const navigate = useNavigate();
    console.log(address);

    const handleCardClick = () => {
        navigate('/lobby');
    };

    return (
        <Container>
            <ConnectWallet />
            {address && (
                <Button>
                    <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>Back</Link>
                </Button>
            )}
            <CardContainer>
                <Card onClick={handleCardClick}>
                    <CarImage src="/car1.webp" alt="Car 1" />
                    <h3>Car 1</h3>
                    <p>Description of Car 1.</p>
                </Card>
                <Card onClick={handleCardClick}>
                    <CarImage src="/car2.webp" alt="Car 2" />
                    <h3>Car 2</h3>
                    <p>Description of Car 2.</p>
                </Card>
                <Card onClick={handleCardClick}>
                    <CarImage src="/car3.webp" alt="Car 3" />
                    <h3>Car 3</h3>
                    <p>Description of Car 3.</p>
                </Card>
            </CardContainer>
        </Container>
    );
}

export default Marketplace;
