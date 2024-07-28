import React, { useState } from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ConnectButton, useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { client } from "./client";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { prepareContractCall, getContract, defineChain } from "thirdweb";
import { TOKEN_CONTRACT_ADDRESS } from './constants/addresses';

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

const myChain = defineChain({
  id: 1287,
  rpc: "https://1287.rpc.thirdweb.com/",
});

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
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: myChain,
    address,
  });
  const { mutate: sendTransaction } = useSendTransaction();
  const [stakeAmount, setStakeAmount] = useState('');

  const tokenContract = getContract({
    client,
    address: TOKEN_CONTRACT_ADDRESS,
    chain: myChain,
  });

  const handleStake = async () => {
    if (!stakeAmount || isNaN(stakeAmount)) {
      toast.error('Please enter a valid amount.');
      return;
    }

    toast.info('Staking in progress...');

    const transaction = prepareContractCall({
      contract: tokenContract,
      method: "function transfer(address to, uint256 amount)",
      params: [address, parseFloat(stakeAmount)], // Adjust the amount as needed
    });

    sendTransaction(transaction, {
      onSuccess: (tx) => {
        console.log("Transaction successful:", tx);
        toast.info('Staking in progress...');
      },
      onError: (error) => {
        console.error("Transaction failed:", error);
        toast.error('Transaction failed. Please try again.');
      },
    });
  };

  return (
    <Container>
      <ToastContainer />
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
        <ProfileSection>
          <h2>Profile</h2>
          <p>Wallet address: {address}</p>
          <p>
            Wallet balance: {isLoading ? 'Loading...' : `${balance?.displayValue} ${balance?.symbol}`}
          </p>
        </ProfileSection>
      )}
      {address && (
        <StakeSection>
          <h2>Stake to Create Your Own Track</h2>
          <p>Stake tokens to create your own track with coin placements of your choice.</p>
          <h2>Stake minimu of 1000 $POKO</h2>
          <Input
            type="text"
            placeholder="Enter amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <Button onClick={handleStake}>Stake</Button>
        </StakeSection>
      )}
    </Container>
  );
}

export default Stake;
