import React, { useState } from 'react';
import styled from 'styled-components';
import { usePolkadotWallet } from '../PolkadotWalletContext';
import { toast } from 'react-toastify';

const Button = styled.button`
  background-color: ${props => props.connected ? '#28a745' : '#0ed1e0'};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.connected ? '#218838' : '#0bacb9'};
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 250px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  text-align: left;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

const AccountInfo = styled.div`
  padding: 12px 16px;
  background-color: #f1f1f1;
  border-bottom: 1px solid #ddd;
`;

const AccountName = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const AccountAddress = styled.div`
  font-size: 0.8rem;
  color: #666;
  word-break: break-all;
`;

const AccountBalance = styled.div`
  margin-top: 4px;
  font-weight: bold;
  color: #28a745;
`;

const LoadingSpinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PolkadotConnectButton = ({ theme = 'light', btnTitle = 'Connect Wallet' }) => {
  const { 
    isInitialized,
    isConnecting,
    hasTalisman,
    activeAccount,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet
  } = usePolkadotWallet();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    if (activeAccount) {
      setShowDropdown(!showDropdown);
      return;
    }
    
    if (!isInitialized) {
      toast.error('Wallet system not initialized yet. Please try again later.');
      return;
    }
    
    if (!hasTalisman) {
      toast.error('Talisman wallet extension not detected. Please install it and reload the page.');
      window.open('https://talisman.xyz/', '_blank');
      return;
    }
    
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <DropdownContainer>
      <Button 
        connected={!!activeAccount} 
        onClick={handleConnect} 
        disabled={isConnecting || isLoading}
      >
        {isConnecting || isLoading ? (
          <>
            <LoadingSpinner /> 
            Loading...
          </>
        ) : (
          activeAccount ? formatAddress(activeAccount.address) : btnTitle
        )}
      </Button>
      
      <DropdownContent show={showDropdown && !!activeAccount}>
        <AccountInfo>
          <AccountName>{activeAccount?.name || 'Wallet'}</AccountName>
          <AccountAddress>{activeAccount?.address}</AccountAddress>
          {balance && (
            <AccountBalance>
              {balance.formatted}
            </AccountBalance>
          )}
        </AccountInfo>
        
        <DropdownItem onClick={handleDisconnect}>
          Disconnect
        </DropdownItem>
      </DropdownContent>
    </DropdownContainer>
  );
};

export default PolkadotConnectButton; 