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
      <div className="terminal-panel p-4">
        <div className="terminal-header">ORDERBOOK</div>
        <p className="text-[#8E8E93] text-xs mt-4">LOADING DATA...</p>
      </div>
    );
  }

  return (
    <div className="terminal-panel h-full flex flex-col">
      <div className="terminal-header">ORDERBOOK • ALPHAУSD/PATHUSD</div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-[#FF9500] px-2 py-2 border-b border-[#333333]">
        <div className="text-left">PRICE</div>
        <div className="text-right">SIZE</div>
        <div className="text-right">TOTAL</div>
      </div>

      {/* Asks (Sell orders) - in reverse order, lowest price at bottom */}
      <div className="flex-1 overflow-auto">
        {orderbook.asks.length === 0 ? (
          <div className="text-[10px] text-[#8E8E93] text-center py-2">NO ASKS</div>
        ) : (
          [...orderbook.asks].reverse().slice(0, 10).map((level, index) => (
            <div
              key={`ask-${index}`}
              className="relative grid grid-cols-3 gap-2 text-[10px] py-1 px-2 hover:bg-[#333333]/30 transition-colors"
            >
              {/* Depth bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#FF3B30]/20 -z-10"
                style={{
                  width: `${(Number(BigInt(level.total) / BigInt(10 ** 6)) / maxTotal) * 100}%`,
                }}
              />
              <div className="text-[#FF3B30] font-mono terminal-value">{formatPrice(level.price)}</div>
              <div className="text-right font-mono text-[#E5E5EA] terminal-value">{formatAmount(BigInt(level.amount), 6)}</div>
              <div className="text-right font-mono text-[#8E8E93] terminal-value">{formatAmount(BigInt(level.total), 6)}</div>
            </div>
          ))
        )}
      </div>

      {/* Spread */}
      <div className="border-y border-[#FF9500] py-2 px-2 bg-[#000000]">
        <div className="text-center text-[10px]">
          {orderbook.bids.length > 0 && orderbook.asks.length > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-[#8E8E93]">SPREAD:</span>
              <span className="font-mono font-bold text-[#FFD60A] terminal-value">{formatPrice(orderbook.spread)}</span>
              <span className="text-[#00E5FF]">({((orderbook.spread / orderbook.bids[0].price) * 100).toFixed(3)}%)</span>
            </div>
          ) : (
            <span className="text-[#8E8E93]">—</span>
          )}
        </div>
      </div>

      {/* Bids (Buy orders) - highest price at top */}
      <div className="flex-1 overflow-auto">
        {orderbook.bids.length === 0 ? (
          <div className="text-[10px] text-[#8E8E93] text-center py-2">NO BIDS</div>
        ) : (
          orderbook.bids.slice(0, 10).map((level, index) => (
            <div
              key={`bid-${index}`}
              className="relative grid grid-cols-3 gap-2 text-[10px] py-1 px-2 hover:bg-[#333333]/30 transition-colors"
            >
              {/* Depth bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#00FF41]/20 -z-10"
                style={{
                  width: `${(Number(BigInt(level.total) / BigInt(10 ** 6)) / maxTotal) * 100}%`,
                }}
              />
              <div className="text-[#00FF41] font-mono terminal-value">{formatPrice(level.price)}</div>
              <div className="text-right font-mono text-[#E5E5EA] terminal-value">{formatAmount(BigInt(level.amount), 6)}</div>
              <div className="text-right font-mono text-[#8E8E93] terminal-value">{formatAmount(BigInt(level.total), 6)}</div>
            </div>
          ))
        )}
      </div>

      {orderbook.bids.length === 0 && orderbook.asks.length === 0 && (
        <div className="text-center text-[#8E8E93] py-4">
          <p className="text-[10px] mb-1">NO ORDERS</p>
          <p className="text-[10px]">START BOTS OR PLACE ORDER</p>
        </div>
      )}
    </div>
  );
}
