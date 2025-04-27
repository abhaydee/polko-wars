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
 * @returns {number} - A unique numeric ID for the NFT
 */
export const generateUniqueItemId = () => {
  // Create a numeric ID using timestamp and random number
  // We'll use the last 5 digits of timestamp + 5 random digits
  // Starting with 20000 to avoid conflicts with our predefined IDs (10001-10004)
  const timestamp = Date.now() % 100000; // Last 5 digits of timestamp
  const random = Math.floor(Math.random() * 10000); // 4 random digits
  
  // Combine them to make a unique ID that fits within safe number range
  // Using a high base number to ensure it doesn't conflict with predefined IDs
  return 20000 + timestamp + random;
};

/**
 * Get metadata links and info for different car types
 * @param {string} carColor - The color of the car
 * @returns {object} - IPFS link, item ID and name for the corresponding car color
 */
export const getCarInfo = (carColor) => {
  // Map of car colors to their IPFS metadata links
  const carData = {
    '#ff0000': { 
      ipfsLink: 'ipfs://bafkreie3dbi5kv6jt3bvfxezgo64tcpdmy54ayhzmxwg5s56jh43d3hnlu',
      itemId: 10001, // Red car - using higher IDs to avoid collisions
      name: 'Red Race Car'
    },
    '#ff8800': { 
      ipfsLink: 'ipfs://bafybeigaow4y26bexx7btnoirx7wvr5i47ku2xll2mts3pycy5wxj4nmum',
      itemId: 10002, // Orange car
      name: 'Orange Race Car'
    },
    '#00ff00': { 
      ipfsLink: 'ipfs://bafkreihe6263abseujllsit4z7svy2hzvfthidcqnzkw3unr72pde6duca',
      itemId: 10003, // Green car
      name: 'Green Race Car'
    },
    '#ffff00': { 
      ipfsLink: 'ipfs://bafkreihwdorgi6h6yblklobp6iy45l6lh75whwftasi4ec7ftu3me57omy',
      itemId: 10004, // Yellow car
      name: 'Yellow Race Car'
    }
  };
  
  // Return the car data for the given color with no default fallback
  return carData[carColor];
};

/**
 * Get the car info for a specific NFT by its ID
 * This is useful for identifying previously minted NFTs
 * @param {number} itemId - The NFT's item ID
 * @returns {object|null} Car info or null if not found
 */
export const getCarInfoById = (itemId) => {
  // Map of specific item IDs to car colors
  const specificIdMap = {
    // Previously minted specific IDs
    1245: { color: '#ff0000', name: 'Red Race Car' },
    81768: { color: '#00ff00', name: 'Green Race Car' },
    3: { color: '#00ff00', name: 'Green Race Car' },
    
    // Our predefined car IDs
    10001: { color: '#ff0000', name: 'Red Race Car' },
    10002: { color: '#ff8800', name: 'Orange Race Car' },
    10003: { color: '#00ff00', name: 'Green Race Car' },
    10004: { color: '#ffff00', name: 'Yellow Race Car' }
    
    // Add more mappings as users mint more NFTs
  };
  
  return specificIdMap[itemId] || null;
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
    const carColorMap = getCarColorsMap();
    
    for (const [key, _] of accountItems) {
      // Extract the itemId from the key
      const [_, __, itemId] = key.args;
      const numericItemId = itemId.toNumber();
      
      // Get metadata for this item
      const metadata = await api.query.uniques.instanceMetadataOf(collectionId, itemId);
      let metadataStr = '';
      
      if (metadata.isSome) {
        metadataStr = metadata.unwrap().data.toString();
      }
      
      // Try to match car color by both item ID and IPFS link
      let carColor = null;
      let carName = null;
      
      // First check if it's a known item ID
      const knownCar = getCarInfoById(numericItemId);
      if (knownCar) {
        carColor = knownCar.color;
        carName = knownCar.name;
      } else {
        // If not a known ID, try to match by IPFS link
        for (const [color, data] of Object.entries(carColorMap)) {
          if (data.ipfsLink === metadataStr) {
            carColor = color;
            carName = data.name;
            break;
          }
        }
      }
      
      // If still no match, log it but include it with unknown type
      if (!carColor) {
        console.log(`⚠️ Could not identify car type for item ID ${numericItemId} with metadata ${metadataStr}`);
        ownedNFTs.push({
          id: numericItemId,
          color: null,
          name: `Unknown Car (ID: ${numericItemId})`,
          ipfsLink: metadataStr,
          collectionId: collectionId
        });
      } else {
        // Add the identified car
        ownedNFTs.push({
          id: numericItemId,
          color: carColor,
          name: carName,
          ipfsLink: metadataStr,
          collectionId: collectionId
        });
      }
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
      itemId: 10001, // Red car
      name: 'Red Race Car'
    },
    '#ff8800': { 
      ipfsLink: 'ipfs://bafybeigaow4y26bexx7btnoirx7wvr5i47ku2xll2mts3pycy5wxj4nmum',
      itemId: 10002, // Orange car
      name: 'Orange Race Car'
    },
    '#00ff00': { 
      ipfsLink: 'ipfs://bafkreihe6263abseujllsit4z7svy2hzvfthidcqnzkw3unr72pde6duca',
      itemId: 10003, // Green car
      name: 'Green Race Car'
    },
    '#ffff00': { 
      ipfsLink: 'ipfs://bafkreihwdorgi6h6yblklobp6iy45l6lh75whwftasi4ec7ftu3me57omy',
      itemId: 10004, // Yellow car
      name: 'Yellow Race Car'
    }
  };
  
  return carData;
}; 