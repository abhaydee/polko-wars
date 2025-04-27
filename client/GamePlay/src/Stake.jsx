import React, { useState } from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePolkadotWallet } from './PolkadotWalletContext';
import PolkadotConnectButton from './components/PolkadotConnectButton';
import { TOKEN_CONTRACT_ADDRESS } from './constants/addresses';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
`;

const ProfileSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 600px;
`;

const StakeSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 600px;
`;

const Button = styled.button`
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const Input = styled.input`
  margin-top: 10px;
  padding: 10px;
  width: calc(100% - 20px);
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Stake = () => {
  const { activeAccount, balance, api, sendTransaction, isLoading } = usePolkadotWallet();
  const address = activeAccount?.address;
  const [stakeAmount, setStakeAmount] = useState('');

  const handleStake = async () => {
    if (!stakeAmount || isNaN(stakeAmount)) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (!api) {
      toast.error('Polkadot API not initialized.');
      return;
    }

    if (!activeAccount) {
      toast.error('Please connect your wallet first.');
      return;
    }

    // Create a DOT transfer transaction
    try {
      toast.info('Preparing transaction...');
      
      // Create a transfer transaction to the token contract (staking)
      const transaction = api.tx.balances.transfer(
        TOKEN_CONTRACT_ADDRESS,  // Recipient address (contract)
        api.createType('Balance', stakeAmount * 1_000_000_000) // Convert to proper format (DOT has 10 decimals)
      );
      
      // Send the transaction
      const result = await sendTransaction(transaction);
      
      if (result) {
        toast.success('Stake successful!');
        window.open("http://localhost:3001/play-me");
      } else {
        toast.error('Staking failed');
      }
    } catch (error) {
      console.error('Staking error:', error);
      toast.error(`Staking failed: ${error.message}`);
    }
  };

  return (
    <Container>
      <ToastContainer />
      <div style={{ marginBottom: '20px' }}>
        <PolkadotConnectButton btnTitle="Connect Wallet" />
      </div>
      
      {address && (
        <ProfileSection>
          <h2>Profile</h2>
          <p>Wallet address: {address}</p>
          <p>
            Wallet balance: {isLoading ? 'Loading...' : (balance ? balance.formatted : 'Unknown')}
          </p>
        </ProfileSection>
      )}
      
      {address && (
        <StakeSection>
          <h2>Stake to Create Your Own Track</h2>
          <p>Stake tokens to create your own track with coin placements of your choice.</p>
          <h2>Stake minimum of 1000 $POKO</h2>
          <Input
            type="text"
            placeholder="Enter amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <Button onClick={handleStake} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Stake'}
          </Button>
        </StakeSection>
      )}
    </Container>
  );
}

export default Stake;
