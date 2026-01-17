import { NextResponse } from 'next/server';
import { publicClient } from '@/lib/viem-client';
import { DEX_CONTRACT_ADDRESS, STABLECOINS } from '@/lib/constants';
import { DEX_ABI } from '@/lib/dex-abi';
import { tickToPrice } from '@/lib/dex-helpers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const baseSymbol = searchParams.get('base') || 'AlphaUSD';
    const quoteSymbol = searchParams.get('quote') || 'pathUSD';

    const baseToken = STABLECOINS[baseSymbol as keyof typeof STABLECOINS];
    const quoteToken = STABLECOINS[quoteSymbol as keyof typeof STABLECOINS];

    if (!baseToken || !quoteToken) {
      return NextResponse.json(
        { error: 'Invalid token pair' },
        { status: 400 }
      );
    }

    // Get pair key
    const pairKeyResult = await publicClient.readContract({
      address: DEX_CONTRACT_ADDRESS,
      abi: DEX_ABI,
      functionName: 'pairKey',
      args: [baseToken.address, quoteToken.address],
    });

    // Get book state (best bid and ask ticks)
    const bookData = await publicClient.readContract({
      address: DEX_CONTRACT_ADDRESS,
      abi: DEX_ABI,
      functionName: 'books',
      args: [pairKeyResult as `0x${string}`],
    });

    const [base, quote, bestBidTick, bestAskTick] = bookData as [string, string, number, number];

    // Query tick levels at common price points
    const bids: Array<{ price: number; amount: string; total: string; tick: number }> = [];
    const asks: Array<{ price: number; amount: string; total: string; tick: number }> = [];

    let totalBid = 0n;
    let totalAsk = 0n;

    // Query common bid ticks (where bots typically place orders)
    // Check ticks from -200 to -5 in steps of 5
    const bidTicksToCheck = [];
    for (let tick = -200; tick <= -5; tick += 5) {
      bidTicksToCheck.push(tick);
    }

    for (const tick of bidTicksToCheck) {
      try {
        const tickData = await publicClient.readContract({
          address: DEX_CONTRACT_ADDRESS,
          abi: DEX_ABI,
          functionName: 'getTickLevel',
          args: [baseToken.address, tick, true],
        });

        const [head, tail, totalLiquidity] = tickData as [bigint, bigint, bigint];

        if (totalLiquidity > 0n) {
          totalBid += totalLiquidity;
          bids.push({
            price: tickToPrice(tick),
            amount: totalLiquidity.toString(),
            total: totalBid.toString(),
            tick,
          });
        }
      } catch (error) {
        // Silently skip ticks with no data
      }
    }

    // Query common ask ticks (where bots typically place orders)
    // Check ticks from +5 to +200 in steps of 5
    const askTicksToCheck = [];
    for (let tick = 5; tick <= 200; tick += 5) {
      askTicksToCheck.push(tick);
    }

    for (const tick of askTicksToCheck) {
      try {
        const tickData = await publicClient.readContract({
          address: DEX_CONTRACT_ADDRESS,
          abi: DEX_ABI,
          functionName: 'getTickLevel',
          args: [baseToken.address, tick, false],
        });

        const [head, tail, totalLiquidity] = tickData as [bigint, bigint, bigint];

        if (totalLiquidity > 0n) {
          totalAsk += totalLiquidity;
          asks.push({
            price: tickToPrice(tick),
            amount: totalLiquidity.toString(),
            total: totalAsk.toString(),
            tick,
          });
        }
      } catch (error) {
        // Silently skip ticks with no data
      }
    }

    // Sort bids descending (highest price first) and asks ascending (lowest price first)
    bids.sort((a, b) => b.price - a.price);
    asks.sort((a, b) => a.price - b.price);

    const spread = asks.length > 0 && bids.length > 0
      ? asks[0].price - bids[0].price
      : 0;

    return NextResponse.json({
      bids,
      asks,
      spread,
      bestBidTick,
      bestAskTick,
    });
  } catch (error: any) {
    console.error('Orderbook error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orderbook', details: error.message },
      { status: 500 }
    );
  }
}
