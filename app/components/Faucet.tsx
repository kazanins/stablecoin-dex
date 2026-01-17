'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { publicClient } from '@/lib/viem-client';
import { STABLECOINS } from '@/lib/constants';
import { TIP20_ABI } from '@/lib/dex-abi';
import { formatAmount } from '@/lib/dex-helpers';
import { addActivity } from '@/lib/local-storage';

interface TokenBalance {
  symbol: string;
  balance: bigint;
  address: string;
}

export function Faucet() {
  const { address } = useAccount();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!address) return;

    try {
      const results: TokenBalance[] = [];

      // Fetch balances sequentially to avoid rate limiting
      for (const token of Object.values(STABLECOINS)) {
        try {
          const balance = await publicClient.readContract({
            address: token.address,
            abi: TIP20_ABI,
            functionName: 'balanceOf',
            args: [address],
          });

          results.push({
            symbol: token.symbol,
            balance: balance as bigint,
            address: token.address,
          });

          // Small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err: any) {
          // If rate limited, skip this token and use previous balance
          console.warn(`Failed to fetch balance for ${token.symbol}:`, err.message);
          const existing = balances.find(b => b.symbol === token.symbol);
          if (existing) {
            results.push(existing);
          } else {
            results.push({
              symbol: token.symbol,
              balance: BigInt(0),
              address: token.address,
            });
          }
        }
      }

      setBalances(results);
    } catch (err: any) {
      console.error('Failed to fetch balances:', err);
    }
  };

  useEffect(() => {
    fetchBalances();
    // Poll for balance updates every 30 seconds (reduced from 10)
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [address]);

  const handleClaimTokens = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim tokens');
      }

      setSuccess('Test tokens claimed successfully!');
      addActivity({
        type: 'faucet_claim',
        details: { address },
      });

      // Refresh balances after a short delay
      setTimeout(fetchBalances, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-black p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold">Balances</h2>
        <button
          onClick={fetchBalances}
          className="text-xs text-gray-600 hover:text-black"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* Balances */}
      <div className="space-y-2 mb-3">
        {balances.length === 0 ? (
          <p className="text-xs text-gray-600">Loading...</p>
        ) : (
          balances.map((token) => (
            <div
              key={token.symbol}
              className="flex justify-between items-center py-1 border-b border-gray-200"
            >
              <span className="font-medium text-xs">{token.symbol}</span>
              <span className="font-mono text-xs">
                {formatAmount(token.balance, 6)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Faucet Button */}
      <button
        onClick={handleClaimTokens}
        disabled={isLoading || !address}
        className="w-full px-3 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-xs font-medium"
      >
        {isLoading ? 'Claiming...' : 'Get Test Tokens'}
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
