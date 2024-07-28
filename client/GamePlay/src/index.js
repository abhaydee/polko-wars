import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
   ThirdwebProvider,
   ConnectWallet,
   metamaskWallet,
   coinbaseWallet,
   walletConnect,
   embeddedWallet,
   smartWallet,
   paperWallet
 } from "@thirdweb-dev/react";
 import { MoonbaseAlpha } from "@thirdweb-dev/chains";
import App from './App';



const smartWalletOptions = {
   factoryAddress: "0x021dD2C12627f9Be8F02E590a4C15f4ED4ae0be0",
   gasless: true,
 };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
   <ThirdwebProvider 
      activeChain={MoonbaseAlpha}
      clientId="cea330060d59c6b9dc7a5f81615bbc25"
      supportedWallets={[
        smartWallet(embeddedWallet(), {
          factoryAddress: "0x021dD2C12627f9Be8F02E590a4C15f4ED4ae0be0",
          gasless: true,
        }),
        metamaskWallet()
          
      ]}
      
      
   >
      <BrowserRouter>
         <App />
         
      </BrowserRouter>
   </ThirdwebProvider>
    
 </React.StrictMode>
);