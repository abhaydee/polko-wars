import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { usePolkadotWallet } from './PolkadotWalletContext';
import PolkadotConnectButton from './components/PolkadotConnectButton';
import { mintNFT, getCarInfo, getUserNFTs, generateUniqueItemId, getCarInfoById } from './utils/nft-minting';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  max-height: 100vh;
  overflow-y: auto;
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

const MintButton = styled.button`
  background-color: #f0ad4e;
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
    background-color: #ec971f;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

// Available car colors with corresponding images
const CAR_OPTIONS = [
  { color: '#ff0000', name: 'Red', image: '/cars/car red.png' },
  { color: '#ff8800', name: 'Orange', image: '/cars/car orange.png' },
  { color: '#00ff00', name: 'Green', image: '/cars/car green.png' },
  { color: '#ffff00', name: 'Yellow', image: '/cars/car yellow.png' }
];

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  margin-top: 20px;
`;

const NFTCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  }
`;

const NFTImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: contain;
  margin-bottom: 10px;
  border-radius: 4px;
`;

const NFTTitle = styled.h4`
  margin: 5px 0;
  color: #333;
`;

const NFTInfo = styled.p`
  margin: 5px 0;
  color: #666;
  font-size: 14px;
`;

const EmptyState = styled.div`
  margin-top: 20px;
  padding: 30px;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #666;
`;

const LobbyPage = () => {
  const navigate = useNavigate();
  const { activeAccount } = usePolkadotWallet();
  const address = activeAccount?.address;
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // Default: red
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mintedCars, setMintedCars] = useState([]);

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

  // Fetch user's NFTs when wallet is connected
  useEffect(() => {
    if (address) {
      fetchUserNFTs();
    } else {
      setMintedCars([]);
    }
  }, [address]);

  const fetchUserNFTs = async () => {
    if (!address) return;
    
    try {
      setIsLoading(true);
      const nfts = await getUserNFTs(address);
      setMintedCars(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error(`Failed to fetch NFTs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleF2P = () => {
    // Navigate to waiting-arena with the selected color as state
    // Include fromLobby=true to indicate this is a participant
    navigate('/waiting-arena', { 
      state: { 
        carColor: selectedColor,
        fromLobby: true 
      }
    });
  };

  const handleBet = () => {
    // Navigate to waiting-arena as a spectator/bettor
    navigate('/waiting-arena', { 
      state: { 
        fromLobby: false 
      }
    });
  };

  // const handleP2E = () => {
  //   navigate('/stake', { state: { carColor: selectedColor } });
  // };

  const handleMintCar = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsMinting(true);
      toast.info('Preparing to mint your race car NFT...');

      // Get car info for the selected color
      const carInfo = getCarInfo(selectedColor);
      
      if (!carInfo) {
        toast.error(`Invalid car color selected: ${selectedColor}`);
        return;
      }
      
      // Use the predefined item ID if available, otherwise generate a random one
      const itemId = carInfo.itemId || generateUniqueItemId();
      
      // Mint the NFT with the item ID
      const result = await mintNFT(address, itemId, carInfo.ipfsLink);
      
      if (result.success) {
        toast.success(`Successfully minted your ${carInfo.name} NFT with ID: ${itemId}!`);
        // Fetch updated NFTs after minting
        await fetchUserNFTs();
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error(`Failed to mint NFT: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  // Check if the currently selected car color has already been minted
  const isMinted = mintedCars.some(car => car.color === selectedColor);

  // Helper function to get car image by color or ID
  const getCarImageByColorOrId = (color, id) => {
    // First try to get car info from the known ID mapping
    const knownCar = getCarInfoById(id);
    if (knownCar) {
      // Find the car option for this color
      const carOption = CAR_OPTIONS.find(car => car.color === knownCar.color);
      if (carOption) {
        return carOption.image;
      }
    }
    
    // If we have a color but no known ID mapping, use the color
    if (color) {
      const car = CAR_OPTIONS.find(car => car.color === color);
      if (car) return car.image;
    }
    
    // Fallback to unknown car
    return '/cars/car unknown.png';
  };

  return (
    <Container>
      <ToastContainer />
      <h1>Polko Wars Lobby</h1>
      
      <WalletSection>
        <PolkadotConnectButton btnTitle="Login" />
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
              <CarImage src={car.image} alt={`${car.name} car`} />
            </CarOption>
          ))}
        </CarSelector>
        
        <p>Selected car: {CAR_OPTIONS.find(car => car.color === selectedColor)?.name}</p>
        
        <ButtonRow>
          <MintButton 
            onClick={handleMintCar} 
            disabled={!address || isMinting || isMinted}
          >
            {isMinting ? 'Minting...' : isMinted ? 'Already Minted' : 'Mint Race Car NFT'}
          </MintButton>
          {address && (
            <MintButton 
              onClick={fetchUserNFTs} 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh NFTs'}
            </MintButton>
          )}
        </ButtonRow>
        
        {isLoading ? (
          <div style={{ marginTop: '20px' }}>Loading your NFTs...</div>
        ) : mintedCars.length > 0 ? (
          <div style={{ marginTop: '20px', width: '100%' }}>
            <h3>Your NFT Race Cars</h3>
            <NFTGrid>
              {mintedCars.map(car => (
                <NFTCard key={car.id}>
                  <NFTImage 
                    src={getCarImageByColorOrId(car.color, car.id)} 
                    alt={car.name} 
                  />
                  <NFTTitle>{car.name}</NFTTitle>
                  <NFTInfo>Item ID: {car.id}</NFTInfo>
                  <NFTInfo>Collection: {car.collectionId}</NFTInfo>
                  {car.color && (
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: car.color,
                        borderRadius: '50%',
                        margin: '5px auto',
                        border: '1px solid #ccc'
                      }}
                    />
                  )}
                </NFTCard>
              ))}
            </NFTGrid>
          </div>
        ) : address ? (
          <EmptyState>
            <h3>No NFTs Found</h3>
            <p>You don't have any minted race cars yet. Mint one to get started!</p>
          </EmptyState>
        ) : null}
      </CustomizationSection>

      <CardContainer>
        <Card onClick={handleF2P}>
          <Title>Register Car</Title>
          <Description>Register your car to the waiting arena</Description>
          <StartButton disabled={!address}>{address ? 'Register Car' : 'Connect Wallet to Play'}</StartButton>
        </Card>

        {/* display only if the user has not registered a car */}
        {mintedCars.length === 0 && (
          <Card onClick={handleBet}> 
            <Title>Bet</Title>
            <Description>Bet on a car to win</Description>
            <StartButton disabled={!address}>{address ? 'Bet' : 'Connect Wallet to Bet'}</StartButton>
          </Card>
        )}
      </CardContainer>
    </Container>
  );
};

export default LobbyPage;
