import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
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
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { Unique } from '@unique-network/sdk';

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
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address
  console.log(address)
  const navigate = useNavigate();
  

    const handleCardClick = () => {
        navigate('/lobby');
    };

    const mintNFT = async (tokenId) => {
        const wsProvider = new WsProvider('wss://rpc-opal.unique.network');
        const api = await ApiPromise.create({ provider: wsProvider });

        const unique = new Unique({ api });

        const keyring = new Keyring({ type: 'sr25519' });
        const account = keyring.addFromUri('5f64db08c92bc1f082e699255099ad0310469b7a7ee5381ade2d04dbac665c72');

        const collectionId = 3286;
        const newOwnerAddress = '0x037cC98C6570E252Ac0cf3880c5208e8035AA634';

        // Transfer the NFT ownership
        const transfer = await unique.transferToken({
            address: account.address,
            collectionId,
            tokenId,
            to: newOwnerAddress,
        });

        console.log(`NFT with ID ${tokenId} from collection ${collectionId} transferred to ${newOwnerAddress}`);

        await api.disconnect();
    };

    return (
        <Container>
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
                    <Button onClick={() => mintNFT(1)}>Mint Car 1</Button>
                </Card>
                <Card onClick={handleCardClick}>
                    <CarImage src="/car2.webp" alt="Car 2" />
                    <h3>Car 2</h3>
                    <p>Description of Car 2.</p>
                    <Button onClick={() => mintNFT(2)}>Mint Car 2</Button>
                </Card>
                <Card onClick={handleCardClick}>
                    <CarImage src="/car3.webp" alt="Car 3" />
                    <h3>Car 3</h3>
                    <p>Description of Car 3.</p>
                    <Button onClick={() => mintNFT(3)}>Mint Car 3</Button>
                </Card>
            </CardContainer>
        </Container>
    );
};

export default Marketplace;
