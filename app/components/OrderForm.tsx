'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { publicClient } from '@/lib/viem-client';
import { DEX_CONTRACT_ADDRESS, STABLECOINS } from '@/lib/constants';
import { DEX_ABI, TIP20_ABI } from '@/lib/dex-abi';
import {
  priceToTick,
  tickToPrice,
  validateTick,
  validateFlipTicks,
  parseAmount,
} from '@/lib/dex-helpers';
import { addActivity } from '@/lib/local-storage';
import confetti from 'canvas-confetti';

type OrderType = 'limit' | 'flip' | 'market';
type OrderSide = 'buy' | 'sell';

interface TokenPair {
  base: keyof typeof STABLECOINS;
  quote: keyof typeof STABLECOINS;
}

export function OrderForm() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Form state
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [pair, setPair] = useState<TokenPair>({ base: 'AlphaUSD', quote: 'pathUSD' });
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('1.0');
  const [flipPrice, setFlipPrice] = useState('1.001');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Orderbook state
  const [bestBid, setBestBid] = useState<number | null>(null);
  const [bestAsk, setBestAsk] = useState<number | null>(null);

  const tokenPairs: TokenPair[] = [
    { base: 'AlphaUSD', quote: 'pathUSD' },
    { base: 'BetaUSD', quote: 'pathUSD' },
    { base: 'ThetaUSD', quote: 'pathUSD' },
  ];

  // Fetch orderbook data for current pair
  const fetchOrderbook = async () => {
    try {
      const response = await fetch(`/api/orderbook?base=${pair.base}&quote=${pair.quote}`);
      if (response.ok) {
        const data = await response.json();
        if (data.bids.length > 0) {
          setBestBid(data.bids[0].price);
        } else {
          setBestBid(null);
        }
        if (data.asks.length > 0) {
          setBestAsk(data.asks[0].price);
        } else {
          setBestAsk(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
    }
  };

  // Fetch orderbook when pair changes
  useEffect(() => {
    fetchOrderbook();
    const interval = setInterval(fetchOrderbook, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [pair]);

  // Black & white confetti effect
  const celebrateOrder = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 45,
      spread: 360,
      ticks: 100,
      zIndex: 0,
      colors: ['#000000', '#FFFFFF', '#1d1d1d', '#f5f5f5']
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 100 * (timeLeft / duration);

      // Launch confetti from multiple points
      confetti({
        ...defaults,
        particleCount: particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount: particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 100);
  };

  const handleSubmitOrder = async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < 1) {
      setError('Minimum order amount is 1 token');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const baseToken = STABLECOINS[pair.base];
      const quoteToken = STABLECOINS[pair.quote];
      const amountBigInt = parseAmount(amount, baseToken.decimals);

      // Check if user has enough balance of the token they're spending
      // Buy order: need quote token (pathUSD)
      // Sell order: need base token (AlphaUSD, etc.)
      const tokenToSpend = orderSide === 'buy' ? quoteToken : baseToken;
      try {
        const balance = await publicClient.readContract({
          address: tokenToSpend.address,
          abi: TIP20_ABI,
          functionName: 'balanceOf',
          args: [address],
        });

        if ((balance as bigint) < amountBigInt) {
          setError(`Insufficient ${tokenToSpend.symbol} balance. You need ${amount} ${tokenToSpend.symbol}. Please claim test tokens first.`);
          setIsSubmitting(false);
          return;
        }
      } catch (balanceError: any) {
        console.warn('Balance check failed:', balanceError);
      }

      if (orderType === 'market') {
        // Execute market order (swap)
        const tokenIn = orderSide === 'buy' ? quoteToken.address : baseToken.address;
        const tokenOut = orderSide === 'buy' ? baseToken.address : quoteToken.address;

        // First, check existing allowance
        const existingAllowance = await publicClient.readContract({
          address: tokenIn,
          abi: TIP20_ABI,
          functionName: 'allowance',
          args: [address, DEX_CONTRACT_ADDRESS],
        });

        // Only approve if needed
        if ((existingAllowance as bigint) < amountBigInt) {
          // Approve a large amount to avoid frequent approvals
          const approveAmount = BigInt('100000000000000000000000'); // 100k tokens
          const approveTx = await walletClient.writeContract({
            address: tokenIn,
            abi: TIP20_ABI,
            functionName: 'approve',
            args: [DEX_CONTRACT_ADDRESS, approveAmount],
          });

          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        // Execute the swap
        const swapTx = await walletClient.writeContract({
          address: DEX_CONTRACT_ADDRESS,
          abi: DEX_ABI,
          functionName: 'swapExactAmountIn',
          args: [tokenIn, tokenOut, amountBigInt, BigInt(0)], // minAmountOut = 0 for demo
        });

        await publicClient.waitForTransactionReceipt({ hash: swapTx });

        celebrateOrder();
        setSuccess(`Market ${orderSide} order executed!`);
        addActivity({
          type: 'swap_executed',
          txHash: swapTx,
          details: {
            tokenIn: orderSide === 'buy' ? pair.quote : pair.base,
            tokenOut: orderSide === 'buy' ? pair.base : pair.quote,
            amountIn: amount,
          },
        });
      } else {
        // Place limit or flip order
        const tick = priceToTick(parseFloat(price));
        const validation = validateTick(tick);

        if (!validation.valid) {
          setError(validation.error || 'Invalid tick');
          return;
        }

        // For DEX orders, token parameter is always the BASE token
        // isBid determines if you're buying (true) or selling (false) the base token
        const token = baseToken.address; // Always use base token
        const isBid = orderSide === 'buy';

        // For approvals, we need to approve the token we're SPENDING
        // Buy order: spend quote token, receive base token
        // Sell order: spend base token, receive quote token
        const tokenToApprove = isBid ? quoteToken.address : baseToken.address;

        // Check existing allowance for the token we're spending
        const existingAllowance = await publicClient.readContract({
          address: tokenToApprove,
          abi: TIP20_ABI,
          functionName: 'allowance',
          args: [address, DEX_CONTRACT_ADDRESS],
        });

        // Only approve if needed
        if ((existingAllowance as bigint) < amountBigInt) {
          // Approve a large amount to avoid frequent approvals
          const approveAmount = BigInt('100000000000000'); // 100M tokens (with 6 decimals)
          const approveTx = await walletClient.writeContract({
            address: tokenToApprove,
            abi: TIP20_ABI,
            functionName: 'approve',
            args: [DEX_CONTRACT_ADDRESS, approveAmount],
          });

          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        if (orderType === 'flip') {
          const flipTick = priceToTick(parseFloat(flipPrice));
          const flipValidation = validateFlipTicks(isBid, tick, flipTick);

          if (!flipValidation.valid) {
            setError(flipValidation.error || 'Invalid flip ticks');
            return;
          }

          // Place flip order
          const flipTx = await walletClient.writeContract({
            address: DEX_CONTRACT_ADDRESS,
            abi: DEX_ABI,
            functionName: 'placeFlip',
            args: [token, amountBigInt, isBid, tick, flipTick],
          });

          await publicClient.waitForTransactionReceipt({ hash: flipTx });

          celebrateOrder();
          setSuccess(`Flip order placed!`);
          addActivity({
            type: 'order_placed',
            txHash: flipTx,
            details: {
              orderType: 'flip',
              tokenPair: `${pair.base}/${pair.quote}`,
              amount,
              price,
              side: orderSide,
            },
          });
        } else {
          // Place limit order
          const limitTx = await walletClient.writeContract({
            address: DEX_CONTRACT_ADDRESS,
            abi: DEX_ABI,
            functionName: 'place',
            args: [token, amountBigInt, isBid, tick],
          });

          await publicClient.waitForTransactionReceipt({ hash: limitTx });

          celebrateOrder();
          setSuccess(`Limit order placed!`);
          addActivity({
            type: 'order_placed',
            txHash: limitTx,
            details: {
              orderType: 'limit',
              tokenPair: `${pair.base}/${pair.quote}`,
              amount,
              price,
              side: orderSide,
            },
          });
        }
      }

      // Reset form
      setAmount('');
    } catch (err: any) {
      console.error('Order error:', err);

      // Better error messages
      let errorMessage = 'Failed to submit order';
      if (err.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance. Please claim test tokens first.';
      } else if (err.message?.includes('allowance')) {
        errorMessage = 'Token approval failed. Please try again.';
      } else if (err.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message?.includes('0xc1ab6dc1')) {
        errorMessage = 'Order rejected by DEX. Ensure you have claimed faucet tokens and have sufficient balance.';
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-black p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3">Place Order</h2>

      {/* Helper Notice */}
      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 text-xs">
        <div className="text-blue-800 space-y-1">
          <p>
            💡 {orderSide === 'buy'
              ? `BUY ${pair.base}: You need ${pair.quote}`
              : `SELL ${pair.base}: You need ${pair.base}`}
          </p>
          {bestBid !== null && bestAsk !== null && (
            <p className="font-mono">
              Best Bid: {bestBid.toFixed(6)} | Best Ask: {bestAsk.toFixed(6)}
            </p>
          )}
          {orderType === 'limit' && parseFloat(price) > 0 && (
            <p className="text-xs">
              {orderSide === 'buy'
                ? (bestAsk !== null && parseFloat(price) >= bestAsk
                    ? `✓ Will execute immediately at ${bestAsk.toFixed(6)} or better`
                    : `Order will wait at ${parseFloat(price).toFixed(6)}`)
                : (bestBid !== null && parseFloat(price) <= bestBid
                    ? `✓ Will execute immediately at ${bestBid.toFixed(6)} or better`
                    : `Order will wait at ${parseFloat(price).toFixed(6)}`)}
            </p>
          )}
        </div>
      </div>

      {/* Token Pair Selector */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-1">Pair</label>
        <select
          value={`${pair.base}/${pair.quote}`}
          onChange={(e) => {
            const [base, quote] = e.target.value.split('/');
            setPair({ base: base as keyof typeof STABLECOINS, quote: quote as keyof typeof STABLECOINS });
          }}
          className="w-full px-2 py-1.5 border border-black text-sm"
        >
          {tokenPairs.map((p) => (
            <option key={`${p.base}/${p.quote}`} value={`${p.base}/${p.quote}`}>
              {p.base}/{p.quote}
            </option>
          ))}
        </select>
      </div>

      {/* Order Type Tabs */}
      <div className="flex border-b border-black mb-3">
        {(['limit', 'flip', 'market'] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium ${
              orderType === type
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setOrderSide('buy')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            orderSide === 'buy'
              ? 'bg-green-600 text-white'
              : 'border border-green-600 text-green-600 hover:bg-green-50'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setOrderSide('sell')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            orderSide === 'sell'
              ? 'bg-red-600 text-white'
              : 'border border-red-600 text-red-600 hover:bg-red-50'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-1">
          Amount ({orderSide === 'buy' ? pair.quote : pair.base})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.00"
          className="w-full px-2 py-1.5 border border-black text-sm"
          step="1"
          min="1"
        />
        <p className="text-xs text-gray-500 mt-0.5">
          Min: 1 token
        </p>
      </div>

      {/* Price Input (for limit and flip) */}
      {orderType !== 'market' && (
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1.0"
            className="w-full px-2 py-1.5 border border-black text-sm"
            step="0.0001"
            min="0.98"
            max="1.02"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Tick: {priceToTick(parseFloat(price) || 1)}
          </p>
        </div>
      )}

      {/* Flip Price Input (for flip orders) */}
      {orderType === 'flip' && (
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1">Flip Price</label>
          <input
            type="number"
            value={flipPrice}
            onChange={(e) => setFlipPrice(e.target.value)}
            placeholder="1.001"
            className="w-full px-2 py-1.5 border border-black text-sm"
            step="0.0001"
            min="0.98"
            max="1.02"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Flip: {priceToTick(parseFloat(flipPrice) || 1.001)}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmitOrder}
        disabled={isSubmitting || !address}
        className="w-full px-3 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium text-sm"
      >
        {isSubmitting
          ? 'Submitting...'
          : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${pair.base}`}
      </button>

      {/* Messages */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 text-green-700 text-xs">
          {success}
        </div>
      )}
    </div>
  );
}
