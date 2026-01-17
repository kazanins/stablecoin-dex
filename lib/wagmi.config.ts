'use client';

import { createConfig, http } from 'wagmi';
import { tempoModerato } from 'viem/chains';
import { KeyManager, webAuthn } from 'wagmi/tempo';

// Get RPC URL with Basic Auth credentials
function getRpcUrl(): string {
  // Use hardcoded credentials as fallback (safe for testnet)
  const username = 'interesting-hodgkin';
  const password = 'jolly-elgamal';

  // Format: https://username:password@rpc.moderato.tempo.xyz
  return `https://${username}:${password}@rpc.moderato.tempo.xyz`;
}

export const config = createConfig({
  chains: [tempoModerato],
  connectors: [
    webAuthn({
      keyManager: KeyManager.localStorage(),
    }),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempoModerato.id]: http(getRpcUrl()),
  },
});
