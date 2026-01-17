// Tempo Moderato Testnet Configuration
export const TEMPO_MODERATO = {
  id: 42431,
  name: 'Tempo Testnet (Moderato)',
  rpcUrl: 'https://rpc.moderato.tempo.xyz',
  wsUrl: 'wss://rpc.moderato.tempo.xyz',
  explorer: 'https://explore.tempo.xyz',
  currency: 'USD',
} as const;

// DEX Contract Address
export const DEX_CONTRACT_ADDRESS = '0xdec0000000000000000000000000000000000000' as const;

// Stablecoin Addresses
// Note: Tempo stablecoins use 6 decimals (like USDC), not 18
export const STABLECOINS = {
  pathUSD: {
    address: '0x20c0000000000000000000000000000000000000' as const,
    symbol: 'pathUSD',
    decimals: 6,
  },
  AlphaUSD: {
    address: '0x20c0000000000000000000000000000000000001' as const,
    symbol: 'AlphaUSD',
    decimals: 6,
  },
  BetaUSD: {
    address: '0x20c0000000000000000000000000000000000002' as const,
    symbol: 'BetaUSD',
    decimals: 6,
  },
  ThetaUSD: {
    address: '0x20c0000000000000000000000000000000000003' as const,
    symbol: 'ThetaUSD',
    decimals: 6,
  },
} as const;

// Price and Tick Constants
export const PRICE_SCALE = 100_000;
export const MIN_TICK = -2000;
export const MAX_TICK = 2000;
export const TICK_SPACING = 10;

// DEX Constants
export const FAUCET_AMOUNT = 1_000_000; // 1M tokens per stablecoin
