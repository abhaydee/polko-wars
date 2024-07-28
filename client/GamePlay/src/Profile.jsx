import React from 'react'
import Home from './Home'
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ConnectWallet, ThirdwebNftMedia,  Web3Button,  useAddress, useContract, useNFT, useOwnedNFTs, useTokenBalance } from '@thirdweb-dev/react';


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
const Profile = () => {
    const address = useAddress()
    console.log(address)
  return (
    <div>
      <ConnectWallet/>
      {address && (
            <Button > <Link to="/" style={{ textDecoration: 'none'}} >Back</Link> </Button>
          )}
    </div>
  )
}

export default Profile
