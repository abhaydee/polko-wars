import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { JsonRpcProvider, Wallet, Contract, parseEther } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// 1. Polkadot/AssetHub side
const assetHubWs = 'wss://westend-asset-hub-rpc.polkadot.io';
const ESCROW_ADDRESS = '5FTbDyHJ2rte4FhgUPYD1NQnZGhezENt13Cb4bUMt9Ev6Zb2'; // Your Escrow Wallet Address

// 2. Moonbeam side
const moonbeamRpc = 'https://rpc.api.moonbase.moonbeam.network';
const moonbeamProvider = new JsonRpcProvider(moonbeamRpc);
const contractAddress = '0x4c8Dc4C116EE9b65bfB584e7Ed94576280F2371B'; // Deployed smart contract
const privateKey = '0xc07e2a781379aa7c1180de0ab43377a81c99e5d36dc6fd4be8c4eced56af1aec'; // Make sure 0x is added
const wallet = new Wallet(privateKey, moonbeamProvider);

// 3. Smart Contract ABI
const contractAbi = [
    "function registerBet(uint256 itemId) payable",
];

const contract = new Contract(contractAddress, contractAbi, wallet);

// 4. BET TRACKER
const bets = new Map(); // itemId -> { bettorAddress, betAmountPlanck }

async function main() {
    const wsProvider = new WsProvider(assetHubWs);
    const api = await ApiPromise.create({ provider: wsProvider });

    console.log('🎯 Watching Escrow Wallet on Westend AssetHub...');

    api.query.system.events((events) => {
        events.forEach(async ({ event }) => {
            if (event.section.toString() === 'balances' && event.method.toString() === 'Transfer') {
                const [from, to, value] = event.data;

                if (to.toString() === ESCROW_ADDRESS) {
                    console.log(`🚀 New Bet Detected! From: ${from.toString()}, Amount: ${value.toString()} Plancks`);

                    // Convert Plancks -> WND
                    const betAmountInWnd = 0.01; // Plancks to WND

                    // Simulate unique Item ID (use better logic later!)
                    const randomItemId = 3;

                    // Save the bet information
                    bets.set(randomItemId, {
                        bettorAddress: from.toString(),
                        betAmountPlanck: value.toString()
                    });

                    console.log(`🎯 Registering bet on Moonbeam: ItemID ${randomItemId}, WND: ${betAmountInWnd}, Bettor: ${from.toString()}`);

                    const tx = await contract.registerBet(randomItemId, {
                        value: parseEther(betAmountInWnd.toString())
                    });
                    await tx.wait();

                    console.log(`✅ Bet Registered! TX Hash: ${tx.hash}`);
                }
            }
        });
    });
}

main().catch(console.error);