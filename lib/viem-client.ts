import { createPublicClient, createWalletClient, http, type Account } from 'viem';
import { tempoModerato } from 'viem/chains';
import { tempoActions } from 'viem/tempo';

// Get RPC URL with Basic Auth credentials
function getRpcUrl(): string {
  const username = process.env.NEXT_PUBLIC_RPC_USERNAME || process.env.RPC_USERNAME || 'interesting-hodgkin';
  const password = process.env.NEXT_PUBLIC_RPC_PASSWORD || process.env.RPC_PASSWORD || 'jolly-elgamal';

  // Format: https://username:password@rpc.moderato.tempo.xyz
  return `https://${username}:${password}@rpc.moderato.tempo.xyz`;
}

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: tempoModerato,
  transport: http(getRpcUrl()),
}).extend(tempoActions());

// Create a wallet client with an account
export function createTempoWalletClient(account: Account) {
  return createWalletClient({
    account,
    chain: tempoModerato,
    transport: http(getRpcUrl()),
  }).extend(tempoActions());
}
