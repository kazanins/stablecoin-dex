'use client';

import { useState, useEffect } from 'react';
import { formatPrice, formatAmount, tickToPrice } from '@/lib/dex-helpers';

interface OrderLevel {
  price: number;
  amount: string;
  total: string;
  tick: number;
}

interface OrderbookData {
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
}

export function Orderbook() {
  const [orderbook, setOrderbook] = useState<OrderbookData>({
    bids: [],
    asks: [],
    spread: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrderbook = async () => {
    try {
      const response = await fetch('/api/orderbook');
      if (response.ok) {
        const data = await response.json();
        setOrderbook(data);
      }
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderbook();
    // Poll for orderbook updates every 15 seconds (reduced to avoid rate limiting)
    const interval = setInterval(fetchOrderbook, 15000);
    return () => clearInterval(interval);
  }, []);

  const getMaxTotal = () => {
    const maxBid = orderbook.bids.length > 0
      ? Number(BigInt(orderbook.bids[0].total) / BigInt(10 ** 6))
      : 0;
    const maxAsk = orderbook.asks.length > 0
      ? Number(BigInt(orderbook.asks[0].total) / BigInt(10 ** 6))
      : 0;
    return Math.max(maxBid, maxAsk);
  };

  const maxTotal = getMaxTotal();

  if (isLoading) {
    return (
      <div className="border border-black p-6">
        <h2 className="text-xl font-bold mb-4">Orderbook</h2>
        <p className="text-gray-600">Loading orderbook...</p>
      </div>
    );
  }

  return (
    <div className="border border-black p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3">Orderbook</h2>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 mb-2 px-1">
        <div className="text-left">Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell orders) - in reverse order, lowest price at bottom */}
      <div className="mb-2">
        {orderbook.asks.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-2">No asks</div>
        ) : (
          [...orderbook.asks].reverse().slice(0, 8).map((level, index) => (
            <div
              key={`ask-${index}`}
              className="relative grid grid-cols-3 gap-2 text-xs py-0.5 px-1 hover:bg-red-50"
            >
              {/* Depth bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-red-100 -z-10"
                style={{
                  width: `${(Number(BigInt(level.total) / BigInt(10 ** 6)) / maxTotal) * 100}%`,
                }}
              />
              <div className="text-red-600 font-mono text-xs">{formatPrice(level.price)}</div>
              <div className="text-right font-mono text-xs">{formatAmount(BigInt(level.amount), 6)}</div>
              <div className="text-right font-mono text-xs">{formatAmount(BigInt(level.total), 6)}</div>
            </div>
          ))
        )}
      </div>

      {/* Spread */}
      <div className="border-y border-gray-300 py-1.5 px-1 mb-2">
        <div className="text-center text-xs">
          {orderbook.bids.length > 0 && orderbook.asks.length > 0 ? (
            <span className="text-gray-600">
              <span className="font-mono font-medium">{formatPrice(orderbook.spread)}</span>
              {' '}({((orderbook.spread / orderbook.bids[0].price) * 100).toFixed(3)}%)
            </span>
          ) : (
            <span className="text-gray-500">—</span>
          )}
        </div>
      </div>

      {/* Bids (Buy orders) - highest price at top */}
      <div className="flex-1 overflow-auto">
        {orderbook.bids.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-2">No bids</div>
        ) : (
          orderbook.bids.slice(0, 8).map((level, index) => (
            <div
              key={`bid-${index}`}
              className="relative grid grid-cols-3 gap-2 text-xs py-0.5 px-1 hover:bg-green-50"
            >
              {/* Depth bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-green-100 -z-10"
                style={{
                  width: `${(Number(BigInt(level.total) / BigInt(10 ** 6)) / maxTotal) * 100}%`,
                }}
              />
              <div className="text-green-600 font-mono text-xs">{formatPrice(level.price)}</div>
              <div className="text-right font-mono text-xs">{formatAmount(BigInt(level.amount), 6)}</div>
              <div className="text-right font-mono text-xs">{formatAmount(BigInt(level.total), 6)}</div>
            </div>
          ))
        )}
      </div>

      {orderbook.bids.length === 0 && orderbook.asks.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-xs mb-1">No orders</p>
          <p className="text-xs">Start bots or place an order</p>
        </div>
      )}
    </div>
  );
}
