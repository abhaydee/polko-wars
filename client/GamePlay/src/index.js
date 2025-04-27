import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PolkadotWalletProvider } from './PolkadotWalletContext';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <React.StrictMode>
   <PolkadotWalletProvider>
      <BrowserRouter>
         <App />
      </BrowserRouter>
   </PolkadotWalletProvider>
 </React.StrictMode>
);