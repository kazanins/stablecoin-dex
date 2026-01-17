import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { tempoModerato } from 'viem/chains';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Get RPC URL with Basic Auth
    const username = process.env.RPC_USERNAME || 'interesting-hodgkin';
    const password = process.env.RPC_PASSWORD || 'jolly-elgamal';
    const rpcUrl = `https://${username}:${password}@rpc.moderato.tempo.xyz`;

    // Create a client to call the Tempo RPC method
    const client = createPublicClient({
      chain: tempoModerato,
      transport: http(rpcUrl),
    });

    // Call tempo_fundAddress RPC method to fund the account
    // This will provide test tokens for the testnet
    const result = await client.request({
      method: 'tempo_fundAddress' as any,
      params: [address],
    });

    return NextResponse.json({
      success: true,
      address,
      result,
      message: 'Account funded with test tokens',
    });
  } catch (error: any) {
    console.error('Faucet error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fund account',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
