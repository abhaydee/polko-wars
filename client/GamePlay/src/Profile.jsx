import React from 'react'
import Home from './Home'
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
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address
  console.log(address)
  return (
    <div>
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
            <Button > <Link to="/" style={{ textDecoration: 'none'}} >Back</Link> </Button>
          )}
    </div>
  )
}

export default Profile
