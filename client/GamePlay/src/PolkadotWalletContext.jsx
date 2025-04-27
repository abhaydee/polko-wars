import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initPolkadotApi, 
  initWalletExtensions, 
  getWalletAccounts, 
  isTalismanInstalled,
  getTalismanAccounts,
  getAccountInjector,
  signAndSend
} from './utils/polkadot-wallet';
import { toast } from 'react-toastify';

// Create context
const PolkadotWalletContext = createContext(null);

// Provider component
export const PolkadotWalletProvider = ({ children }) => {
  const [api, setApi] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasTalisman, setHasTalisman] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize API
  useEffect(() => {
    const initApi = async () => {
      try {
        // Using Polkadot mainnet by default
        const api = await initPolkadotApi();
        setApi(api);

        // Check if Talisman extension is installed
        const talismanInstalled = await isTalismanInstalled();
        setHasTalisman(talismanInstalled);

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Polkadot API:', error);
        toast.error('Failed to connect to Polkadot network');
      }
    };

    initApi();

    // Cleanup
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!isInitialized) return;
    
    setIsConnecting(true);
    try {
      await initWalletExtensions();
      
      // Get all accounts 
      const allAccounts = await getWalletAccounts();
      setAccounts(allAccounts);

      // If we specifically want Talisman accounts
      const talismanAccounts = await getTalismanAccounts();
      
      if (talismanAccounts.length > 0) {
        // Use the first Talisman account as active by default
        setActiveAccount(talismanAccounts[0]);
        
        // Get balance of active account
        await fetchBalance(talismanAccounts[0].address);
      } else if (allAccounts.length > 0) {
        // Fall back to any available account
        setActiveAccount(allAccounts[0]);
        
        // Get balance of active account
        await fetchBalance(allAccounts[0].address);
      }
      
      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet: ' + error.message);
      setIsConnecting(false);
      return false;
    }
  };

  // Switch account
  const switchAccount = async (address) => {
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      setActiveAccount(account);
      await fetchBalance(address);
      return true;
    }
    return false;
  };

  // Fetch account balance
  const fetchBalance = async (address) => {
    if (!api || !address) return null;
    
    setIsLoading(true);
    try {
      const { data: balanceData } = await api.query.system.account(address);
      const free = balanceData.free.toString();
      const formatted = api.createType('Balance', free).toHuman();
      
      setBalance({
        address,
        free,
        formatted
      });
      
      setIsLoading(false);
      return formatted;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setIsLoading(false);
      return null;
    }
  };

  // Send transaction
  const sendTransaction = async (transaction) => {
    if (!api || !activeAccount) {
      toast.error('Wallet not connected');
      return null;
    }
    
    setIsLoading(true);
    try {
      const result = await signAndSend(api, activeAccount.address, transaction);
      setIsLoading(false);
      
      // Update balance after transaction
      await fetchBalance(activeAccount.address);
      
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed: ' + error.message);
      setIsLoading(false);
      return null;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setActiveAccount(null);
    setBalance(null);
  };

  return (
    <PolkadotWalletContext.Provider
      value={{
        api,
        isInitialized,
        isConnecting,
        hasTalisman,
        accounts,
        activeAccount,
        balance,
        isLoading,
        connectWallet,
        switchAccount,
        fetchBalance,
        sendTransaction,
        disconnectWallet
      }}
    >
      {children}
    </PolkadotWalletContext.Provider>
  );
};

// Hook to use the wallet context
export const usePolkadotWallet = () => {
  const context = useContext(PolkadotWalletContext);
  if (context === null) {
    throw new Error('usePolkadotWallet must be used within a PolkadotWalletProvider');
  }
  return context;
};

export default PolkadotWalletContext; 