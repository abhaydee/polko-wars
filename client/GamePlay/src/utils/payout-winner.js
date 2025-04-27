/* global BigInt */
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

// Westend AssetHub WebSocket endpoint
const assetHubWs = 'wss://westend-asset-hub-rpc.polkadot.io';

// Escrow Wallet settings
const ESCROW_MNEMONIC ="avocado play drop until learn waste member battle helmet coffee shaft flip"; // Single mnemonic (no direct private key needed)
const DERIVATION_PATH = '//0'; // IMPORTANT: To select "test escrow" account
const ESCROW_ADDRESS = '5FTbDyHJ2rte4FhgUPYD1NQnZGhezENt13Cb4bUMt9Ev6Zb2'; // Your escrow account address

// Create a callable function for use in components
export const payoutWinner = async (winnerAddress, betAmount) => {
  try {
    // Validate the winner address
    if (!winnerAddress || typeof winnerAddress !== 'string' || winnerAddress.length < 10) {
      console.error('❌ INVALID WINNER ADDRESS:', winnerAddress);
      return { success: false, error: `Invalid winner address: ${winnerAddress}` };
    }

    console.log('');
    console.log('----------------------------------------');
    console.log('🎯 PAYOUT TO WINNER STARTED');
    console.log('----------------------------------------');
    console.log(`Winner address: ${winnerAddress}`);
    console.log(`Amount to pay: ${betAmount} WND`);
    console.log('----------------------------------------');
    console.log('');

    const wsProvider = new WsProvider(assetHubWs);
    const api = await ApiPromise.create({ provider: wsProvider });

    const keyring = new Keyring({ type: 'sr25519' });

    // Load escrow signer from mnemonic + derivation path
    const escrow = keyring.addFromUri(ESCROW_MNEMONIC + DERIVATION_PATH);

    console.log(`🎯 Escrow Wallet loaded: ${escrow.address}`);

    if (escrow.address !== ESCROW_ADDRESS) {
      console.error('❌ Escrow loaded address does not match configured ESCROW_ADDRESS! Check mnemonic or derivation.');
      return { success: false, error: 'Escrow address mismatch' };
    }

    // Calculate amount in plancks (1 WND = 10^12 plancks)
    const amountPlancks = BigInt(Math.round(betAmount * 1_000_000_000_000));

    console.log(`🚀 TRANSACTION DETAILS:`);
    console.log(`- From: ${ESCROW_ADDRESS}`);
    console.log(`- To: ${winnerAddress}`);
    console.log(`- Amount: ${betAmount} WND (${amountPlancks} plancks)`);

    // Create transaction
    const transferTx = api.tx.balances.transferKeepAlive(
      winnerAddress,
      amountPlancks
    );

    // Return a promise
    return new Promise((resolve, reject) => {
      transferTx.signAndSend(escrow, ({ status, events }) => {
        if (status.isInBlock) {
          console.log('');
          console.log(`✅ Transaction included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          let transferEvent = false;
          let transferAmount = 0;
          let transferRecipient = '';

          console.log('');
          console.log('----------------------------------------');
          console.log(`🎉 TRANSACTION FINALIZED in block: ${status.asFinalized}`);
          console.log('----------------------------------------');
          
          events.forEach(({ event }) => {
            const { method, section, data } = event;
            console.log(`📢 [${section}.${method}]`);
            
            // Look for the specific transfer event
            if (section === 'balances' && method === 'Transfer') {
              transferEvent = true;
              transferAmount = data[2].toString();
              transferRecipient = data[1].toString();
              console.log(`💸 TRANSFER CONFIRMED: ${transferAmount} plancks to ${transferRecipient}`);
            }
          });
          
          console.log('----------------------------------------');
          
          if (transferEvent && transferRecipient === winnerAddress) {
            console.log('✅ PAYOUT SUCCESSFUL! Winner received funds.');
          } else {
            console.log('⚠️ PAYOUT INCOMPLETE: Could not verify transfer event.');
          }
          
          resolve({ 
            success: true, 
            blockHash: status.asFinalized.toString(),
            events: events.map(e => ({
              method: e.event.method,
              section: e.event.section,
              data: e.event.data.toString()
            })),
            transferConfirmed: transferEvent && transferRecipient === winnerAddress
          });
        }
      }).catch(error => {
        console.error('❌ Error in payoutWinner transaction:', error);
        reject({ success: false, error: error.message });
      });
    });
  } catch (error) {
    console.error('❌ Error in payoutWinner:', error);
    return { success: false, error: error.message };
  }
};

// Example usage for testing directly
async function main() {
  const WINNER_ADDRESS = ''; // Set winner address here for testing
  const BET_AMOUNT_WND = 1; 
  
  try {
    const result = await payoutWinner(WINNER_ADDRESS, BET_AMOUNT_WND);
    console.log('Payout result:', result);
  } catch (error) {
    console.error('Failed to execute payout:', error);
  }
}

// Only run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error in main:', error);
    process.exit(1);
  });
}