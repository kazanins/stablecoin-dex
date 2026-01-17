// Tempo Stablecoin DEX Contract ABI
export const DEX_ABI = [
  // Order placement functions
  {
    name: 'place',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint128' },
      { name: 'isBid', type: 'bool' },
      { name: 'tick', type: 'int16' },
    ],
    outputs: [{ name: 'orderId', type: 'uint128' }],
  },
  {
    name: 'placeFlip',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint128' },
      { name: 'isBid', type: 'bool' },
      { name: 'tick', type: 'int16' },
      { name: 'flipTick', type: 'int16' },
    ],
    outputs: [{ name: 'orderId', type: 'uint128' }],
  },
  {
    name: 'cancel',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'orderId', type: 'uint128' }],
    outputs: [],
  },
  // Swap functions (Market orders)
  {
    name: 'swapExactAmountIn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint128' },
      { name: 'minAmountOut', type: 'uint128' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint128' }],
  },
  {
    name: 'swapExactAmountOut',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountOut', type: 'uint128' },
      { name: 'maxAmountIn', type: 'uint128' },
    ],
    outputs: [{ name: 'amountIn', type: 'uint128' }],
  },
  // Quote functions (simulation)
  {
    name: 'quoteSwapExactAmountIn',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint128' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint128' }],
  },
  {
    name: 'quoteSwapExactAmountOut',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountOut', type: 'uint128' },
    ],
    outputs: [{ name: 'amountIn', type: 'uint128' }],
  },
  // Balance and withdrawal
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ name: 'balance', type: 'uint128' }],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint128' },
    ],
    outputs: [],
  },
  // Orderbook query functions
  {
    name: 'pairKey',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
    ],
    outputs: [{ name: 'key', type: 'bytes32' }],
  },
  {
    name: 'books',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'pairKey', type: 'bytes32' }],
    outputs: [
      { name: 'base', type: 'address' },
      { name: 'quote', type: 'address' },
      { name: 'bestBidTick', type: 'int16' },
      { name: 'bestAskTick', type: 'int16' },
    ],
  },
  {
    name: 'getTickLevel',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'base', type: 'address' },
      { name: 'tick', type: 'int16' },
      { name: 'isBid', type: 'bool' },
    ],
    outputs: [
      { name: 'head', type: 'uint128' },
      { name: 'tail', type: 'uint128' },
      { name: 'totalLiquidity', type: 'uint128' },
    ],
  },
  {
    name: 'tickToPrice',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'tick', type: 'int16' }],
    outputs: [{ name: 'price', type: 'uint32' }],
  },
] as const;

// TIP-20 Token ABI (for approvals and transfers)
export const TIP20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'remaining', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;
