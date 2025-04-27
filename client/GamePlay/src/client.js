// src/client.js
import { ApiPromise, WsProvider } from '@polkadot/api';

// Function to initialize the Polkadot API client
export const initPolkadotClient = async (network = 'wss://rpc.polkadot.io') => {
  const wsProvider = new WsProvider(network);
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  return api;
};

// Export client for backward compatibility with existing components
export const client = {
  polkadot: {
    api: null,
    init: initPolkadotClient
  }
};

// Default export for backward compatibility
export default { initPolkadotClient, client };

