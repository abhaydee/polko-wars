/* global BigInt */
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

// Constants
const assetHubWs = 'wss://westend-asset-hub-rpc.polkadot.io';
const ASSET_ID = 50000235; // your custom asset ID

/**
 * Transfers game tokens to a participant based on their in-game performance
 * @param {string} recipientAddress - The wallet address of the participant
 * @param {number} coinsCollected - Number of coins collected during the race
 * @returns {Promise<Object>} - Result of the transaction
 */
export const disburseTokensToParticipant = async (recipientAddress, coinsCollected) => {
  // API connection variables
  let api = null;
  let wsProvider = null;

  try {
    // Validate input parameters
    if (!recipientAddress || typeof recipientAddress !== 'string' || recipientAddress.length < 10) {
      console.error('❌ INVALID RECIPIENT ADDRESS:', recipientAddress);
      return { success: false, error: `Invalid recipient address: ${recipientAddress}` };
    }

    if (typeof coinsCollected !== 'number' || coinsCollected <= 0) {
      console.error('❌ INVALID COINS COLLECTED COUNT:', coinsCollected);
      return { success: false, error: 'Invalid coins collected amount' };
    }

    console.log('');
    console.log('----------------------------------------');
    console.log('🎮 GAME TOKEN DISBURSEMENT STARTED');
    console.log('----------------------------------------');
    console.log(`Recipient address: ${recipientAddress}`);
    console.log(`Coins collected: ${coinsCollected}`);
    console.log('----------------------------------------');
    console.log('');

    // Connect to Westend Asset Hub
    wsProvider = new WsProvider(assetHubWs);
    api = await ApiPromise.create({ 
      provider: wsProvider,
      noInitWarn: true 
    });

    // Check if API is connected
    if (!api.isConnected) {
      await api.connect();
      if (!api.isConnected) {
        throw new Error('Failed to connect to the network');
      }
    }

    const keyring = new Keyring({ type: 'sr25519' });

    // Load the signer from mnemonic
    const signer = keyring.addFromUri('avocado play drop until learn waste member battle helmet coffee shaft flip');

    // Calculate token amount based on coins collected (base of 10 tokens plus 1 per coin)
    const baseAmount = 10_000_000_000_000; // 10 tokens base reward
    const perCoinAmount = 1_000_000_000_000; // 1 token per coin
    const TRANSFER_AMOUNT = BigInt(baseAmount + (perCoinAmount * coinsCollected));

    console.log(`🚀 TRANSACTION DETAILS:`);
    console.log(`- Asset ID: ${ASSET_ID}`);
    console.log(`- From: ${signer.address}`);
    console.log(`- To: ${recipientAddress}`);
    console.log(`- Amount: ${Number(TRANSFER_AMOUNT) / 1_000_000_000_000} tokens (${TRANSFER_AMOUNT} plancks)`);

    // Check asset balance of signer first (for debugging)
    try {
      const balance = await api.query.assets.account(ASSET_ID, signer.address);
      console.log(`🧠 Asset balance for signer:`, balance.toHuman() || 'No balance found (new account)');
    } catch (error) {
      console.log('Unable to check signer balance:', error.message);
    }

    // Create the transfer transaction
    const transferTx = api.tx.assets.transfer(
      ASSET_ID,              // asset id
      recipientAddress,      // destination
      TRANSFER_AMOUNT        // amount based on coins collected
    );

    // Return a promise
    return new Promise((resolve, reject) => {
      transferTx.signAndSend(signer, { nonce: -1 }, ({ status, events, dispatchError }) => {
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section and method
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { docs, name, section } = decoded;
            console.error(`❌ Error: ${section}.${name}: ${docs.join(' ')}`);
            reject({ success: false, error: `${section}.${name}: ${docs.join(' ')}` });
          } else {
            // Other errors
            console.error(`❌ Error:`, dispatchError.toString());
            reject({ success: false, error: dispatchError.toString() });
          }
          return;
        }

        if (status.isInBlock) {
          console.log(`✅ Transaction included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          console.log('');
          console.log('----------------------------------------');
          console.log(`🎉 TRANSACTION FINALIZED in block: ${status.asFinalized}`);
          console.log('----------------------------------------');
          
          let transferSuccess = false;
          let transferAmount = 0;
          
          events.forEach(({ event }) => {
            const { method, section, data } = event;
            console.log(`📢 [${section}.${method}]`);
            
            // Check for the specific asset transfer event
            if (section === 'assets' && method === 'Transferred') {
              transferSuccess = true;
              try {
                transferAmount = data[3].toString();
                console.log(`💸 TOKENS TRANSFERRED: ${Number(transferAmount) / 1_000_000_000_000} tokens to ${recipientAddress}`);
              } catch (e) {
                console.log(`💸 TOKENS TRANSFERRED: amount parsing error`, data.toString());
              }
            }
          });
          
          console.log('----------------------------------------');
          
          if (transferSuccess) {
            console.log('✅ TOKEN TRANSFER SUCCESSFUL! Participant received game tokens.');
            resolve({ 
              success: true, 
              blockHash: status.asFinalized.toString(),
              transferAmount: Number(transferAmount) / 1_000_000_000_000,
              coinsCollected
            });
          } else {
            console.log('⚠️ TRANSFER EVENT NOT FOUND. Transaction was finalized but transfer may not have succeeded.');
            resolve({ 
              success: true, 
              blockHash: status.asFinalized.toString(),
              warning: 'Transfer event not found in transaction'
            });
          }

          // Disconnect from the provider after transaction is complete
          if (wsProvider) {
            wsProvider.disconnect();
          }
        }
      }).catch(error => {
        console.error('❌ Error in token transfer transaction:', error);
        reject({ success: false, error: error.message });
        
        // Disconnect from the provider on error
        if (wsProvider) {
          wsProvider.disconnect();
        }
      });
    });
  } catch (error) {
    console.error('❌ Error in disburseTokens:', error);
    
    // Disconnect from the provider on error
    if (wsProvider) {
      wsProvider.disconnect();
    }
    
    return { success: false, error: error.message };
  }
};

// Example function for testing directly
async function main() {
  const RECIPIENT_ADDRESS = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'; // Example address 
  const COINS_COLLECTED = 5; // Example coins collected
  
  try {
    const result = await disburseTokensToParticipant(RECIPIENT_ADDRESS, COINS_COLLECTED);
    console.log('Token disbursement result:', result);
  } catch (error) {
    console.error('Failed to execute token transfer:', error);
  }
}

// Only run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error in main:', error);
    process.exit(1);
  });
}