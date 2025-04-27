import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

// Environment variables with fallbacks for development
const getEnvVar = (key, fallback) => {
  // In a browser environment, we could use process.env in a Node environment
  // or import.meta.env in Vite, but for this example we'll make a mock approach
  const envVars = {
    NFT_RPC_URL: 'wss://westend-asset-hub-rpc.polkadot.io',
    NFT_COLLECTION_ID: '5615',
    NFT_SIGNER_MNEMONIC: 'avocado play drop until learn waste member battle helmet coffee shaft flip', // NEVER include real mnemonics in production code
  };
  
  return envVars[key] || fallback;
};

/**
 * Mint an NFT using Polkadot.js API
 * @param {string} recipientAddress - The address to mint the NFT to
 * @param {number} itemId - The item ID within the collection (must be a number)
 * @param {string} ipfsLink - The IPFS link to the metadata
 * @param {object} options - Additional options (collectionId, rpcUrl, etc.)
 * @returns {Promise<object>} - The minting result
 */
export const mintNFT = async (recipientAddress, itemId, ipfsLink, options = {}) => {
  try {
    // Ensure itemId is a number
    const numericItemId = parseInt(itemId, 10);
    
    if (isNaN(numericItemId)) {
      throw new Error('Item ID must be a valid number');
    }
    
    // Get configuration from environment or passed options
    const rpcUrl = options.rpcUrl || getEnvVar('NFT_RPC_URL');
    const collectionId = options.collectionId || getEnvVar('NFT_COLLECTION_ID');
    const signerMnemonic = options.signerMnemonic || getEnvVar('NFT_SIGNER_MNEMONIC');

    // Connect to blockchain
    const wsProvider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider: wsProvider });

    // Create a signer account
    const keyring = new Keyring({ type: 'sr25519' });
    const signer = keyring.addFromUri(signerMnemonic);

    console.log(`🚀 Minting NFT to address: ${recipientAddress}`);
    console.log(`Collection ID: ${collectionId}, Item ID: ${numericItemId}`);

    // Build mint transaction
    const mintTx = api.tx.uniques.mint(
      collectionId,
      numericItemId,
      recipientAddress
    );

    // Build setMetadata transaction
    const metadataTx = api.tx.uniques.setMetadata(
      collectionId,
      numericItemId,
      ipfsLink,
      false // isFrozen = false (allows updating metadata later if needed)
    );

    // Batch the transactions (mint + metadata in one atomic call)
    const batchTx = api.tx.utility.batchAll([mintTx, metadataTx]);

    // Return a promise that resolves when the transaction is finalized
    return new Promise((resolve, reject) => {
      batchTx.signAndSend(signer, ({ status, events }) => {
        console.log(`📦 Current Status: ${status.type}`);

        if (status.isInBlock) {
          console.log(`✅ Included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          console.log(`🎯 Finalized at blockHash: ${status.asFinalized}`);
          
          // Loop through events
          const eventData = events.map(({ event: { data, method, section } }) => ({
            section,
            method,
            data: data.toString()
          }));
          
          // Disconnect after sending
          api.disconnect();
          
          // Resolve the promise with transaction data
          resolve({
            success: true,
            blockHash: status.asFinalized.toString(),
            events: eventData
          });
        }
      }).catch(error => {
        api.disconnect();
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
};

/**
 * Generate a unique item ID based on timestamp and random values
 * @returns {string} - A unique ID for the NFT
 */
export const generateUniqueItemId = () => {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

/**
 * Get metadata links and item IDs for different car types
 * @param {string} carColor - The color of the car
 * @returns {object} - IPFS link and item ID for the corresponding car color
 */
export const getCarInfo = (carColor) => {
  // Map of car colors to their IPFS metadata links and item IDs
  const carData = {
    '#ff0000': { 
      ipfsLink: 'ipfs://bafkreie3dbi5kv6jt3bvfxezgo64tcpdmy54ayhzmxwg5s56jh43d3hnlu',
      itemId: 1, // Red car
      name: 'Red Race Car'
    },
    '#ff8800': { 
      ipfsLink: 'ipfs://bafybeigaow4y26bexx7btnoirx7wvr5i47ku2xll2mts3pycy5wxj4nmum',
      itemId: 2, // Orange car
      name: 'Orange Race Car'
    },
    '#00ff00': { 
      ipfsLink: 'ipfs://bafkreihe6263abseujllsit4z7svy2hzvfthidcqnzkw3unr72pde6duca',
      itemId: 3, // Green car
      name: 'Green Race Car'
    },
    '#ffff00': { 
      ipfsLink: 'ipfs://bafkreihwdorgi6h6yblklobp6iy45l6lh75whwftasi4ec7ftu3me57omy',
      itemId: 4, // Yellow car
      name: 'Yellow Race Car'
    }
  };
  
  return carData[carColor] || carData['#ff0000']; // Default to red car
};

/**
 * Get NFTs owned by a specific address
 * @param {string} ownerAddress - The wallet address to check
 * @param {object} options - Additional options (collectionId, rpcUrl, etc.)
 * @returns {Promise<Array>} - Array of owned NFTs with metadata
 */
export const getUserNFTs = async (ownerAddress, options = {}) => {
  try {
    // Get configuration from environment or passed options
    const rpcUrl = options.rpcUrl || getEnvVar('NFT_RPC_URL');
    const collectionId = options.collectionId || getEnvVar('NFT_COLLECTION_ID');
    
    // Connect to blockchain
    const wsProvider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider: wsProvider });
    
    console.log(`🔍 Fetching NFTs for address: ${ownerAddress}`);
    console.log(`Collection ID: ${collectionId}`);
    
    // Query owned items for the specific collection
    const accountItems = await api.query.uniques.account.entries(ownerAddress, collectionId);
    
    // Process the results
    const ownedNFTs = [];
    
    for (const [key, _] of accountItems) {
      // Extract the itemId from the key
      const [_, __, itemId] = key.args;
      
      // Get metadata for this item
      const metadata = await api.query.uniques.instanceMetadataOf(collectionId, itemId);
      let metadataStr = '';
      
      if (metadata.isSome) {
        metadataStr = metadata.unwrap().data.toString();
      }
      
      // Find the car color based on the item ID
      let carColor = '#ff0000'; // Default
      
      // Find car color by matching item ID with known car data
      Object.entries(getCarColorsMap()).forEach(([color, data]) => {
        if (data.itemId === itemId.toNumber()) {
          carColor = color;
        }
      });
      
      // Get car info for matching the name
      const carInfo = getCarInfo(carColor);
      
      ownedNFTs.push({
        id: itemId.toNumber(),
        color: carColor,
        name: carInfo.name,
        ipfsLink: metadataStr,
        collectionId: collectionId
      });
    }
    
    // Disconnect from the API
    api.disconnect();
    
    return ownedNFTs;
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    throw error;
  }
};

/**
 * Get mapping of car colors to their data for internal use
 * @returns {object} - Mapping of colors to car data
 */
const getCarColorsMap = () => {
  const carData = {
    '#ff0000': { 
      ipfsLink: 'ipfs://bafkreie3dbi5kv6jt3bvfxezgo64tcpdmy54ayhzmxwg5s56jh43d3hnlu',
      itemId: 1,
      name: 'Red Race Car'
    },
    '#ff8800': { 
      ipfsLink: 'ipfs://bafybeigaow4y26bexx7btnoirx7wvr5i47ku2xll2mts3pycy5wxj4nmum',
      itemId: 2,
      name: 'Orange Race Car'
    },
    '#00ff00': { 
      ipfsLink: 'ipfs://bafkreihe6263abseujllsit4z7svy2hzvfthidcqnzkw3unr72pde6duca',
      itemId: 3,
      name: 'Green Race Car'
    },
    '#ffff00': { 
      ipfsLink: 'ipfs://bafkreihwdorgi6h6yblklobp6iy45l6lh75whwftasi4ec7ftu3me57omy',
      itemId: 4,
      name: 'Yellow Race Car'
    }
  };
  
  return carData;
}; 