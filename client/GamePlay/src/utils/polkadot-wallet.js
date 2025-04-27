import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

// Initialize the API for Polkadot/Substrate connection
export const initPolkadotApi = async (network = 'wss://rpc.polkadot.io') => {
  const wsProvider = new WsProvider(network);
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  return api;
};

// Initialize wallet extensions and request access
export const initWalletExtensions = async (dappName = 'PolkoWars') => {
  // This call enables all extensions including Talisman, PolkadotJS, SubWallet, etc.
  const extensions = await web3Enable(dappName);
  
  if (extensions.length === 0) {
    throw new Error('No extension found. Please install Talisman or Polkadot.js extension.');
  }
  
  return extensions;
};

// Get all accounts from connected extensions
export const getWalletAccounts = async () => {
  // Get all accounts from extensions
  const allAccounts = await web3Accounts();
  return allAccounts.map(account => ({
    address: account.address,
    name: account.meta.name || '',
    source: account.meta.source || ''
  }));
};

// Check if Talisman wallet is installed
export const isTalismanInstalled = async () => {
  const extensions = await web3Enable('PolkoWars');
  return extensions.some(extension => extension.name === 'talisman');
};

// Get Talisman accounts specifically
export const getTalismanAccounts = async () => {
  const allAccounts = await web3Accounts();
  return allAccounts.filter(account => account.meta.source === 'talisman');
};

// Get account injector for sending transactions
export const getAccountInjector = async (address) => {
  const allAccounts = await web3Accounts();
  const account = allAccounts.find(acc => acc.address === address);
  
  if (!account) {
    throw new Error('Account not found');
  }
  
  const injector = await web3FromSource(account.meta.source);
  return { account, injector };
};

// Sign and send a transaction
export const signAndSend = async (api, address, transaction) => {
  const { account, injector } = await getAccountInjector(address);
  
  return new Promise((resolve, reject) => {
    transaction
      .signAndSend(
        address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              let errorInfo;
              
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                errorInfo = `${decoded.section}.${decoded.method}: ${decoded.docs.join(' ')}`;
              } else {
                errorInfo = dispatchError.toString();
              }
              
              reject(new Error(errorInfo));
            } else {
              resolve({ 
                status: status.toString(), 
                blockHash: status.isFinalized ? status.asFinalized.toString() : status.asInBlock.toString(),
                events 
              });
            }
          }
        }
      )
      .catch(error => {
        reject(error);
      });
  });
}; 