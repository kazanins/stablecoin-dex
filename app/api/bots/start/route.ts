import { NextResponse } from 'next/server';
import { generatePrivateKey } from 'viem/accounts';
import { BotManager, type BotConfig } from '@/lib/bot-strategy';
import { createPublicClient, http } from 'viem';
import { tempoModerato } from 'viem/chains';

// Global bot manager (in a real app, this would be in a database or Redis)
let botManager: BotManager | null = null;
let isInitialized = false;

export async function POST() {
  try {
    if (isInitialized && botManager) {
      return NextResponse.json({
        success: true,
        message: 'Bots are already running',
        bots: botManager.getAllStates(),
      });
    }

    // Initialize bot manager
    botManager = new BotManager();

    // Generate private keys for 3 bots (in production, these should be stored securely)
    const bot1Key = (process.env.BOT1_PRIVATE_KEY || generatePrivateKey()) as `0x${string}`;
    const bot2Key = (process.env.BOT2_PRIVATE_KEY || generatePrivateKey()) as `0x${string}`;
    const bot3Key = (process.env.BOT3_PRIVATE_KEY || generatePrivateKey()) as `0x${string}`;

    // Create bots for different pairs
    const botConfigs: Array<{ id: string; config: BotConfig }> = [
      {
        id: 'bot-alpha',
        config: {
          privateKey: bot1Key,
          baseToken: 'AlphaUSD',
          quoteToken: 'pathUSD',
        },
      },
      {
        id: 'bot-beta',
        config: {
          privateKey: bot2Key,
          baseToken: 'BetaUSD',
          quoteToken: 'pathUSD',
        },
      },
      {
        id: 'bot-theta',
        config: {
          privateKey: bot3Key,
          baseToken: 'ThetaUSD',
          quoteToken: 'pathUSD',
        },
      },
    ];

    // Create all bots
    for (const { id, config } of botConfigs) {
      await botManager.createBot(id, config);
    }

    // Get RPC URL with Basic Auth
    const username = process.env.RPC_USERNAME || 'interesting-hodgkin';
    const password = process.env.RPC_PASSWORD || 'jolly-elgamal';
    const rpcUrl = `https://${username}:${password}@rpc.moderato.tempo.xyz`;

    // Fund bots with faucet
    const client = createPublicClient({
      chain: tempoModerato,
      transport: http(rpcUrl),
    });

    for (const { id } of botConfigs) {
      const bot = botManager.getBot(id);
      if (bot) {
        const state = bot.getState();
        try {
          await client.request({
            method: 'tempo_fundAddress' as any,
            params: [state.address as `0x${string}`],
          });
          console.log(`Funded bot ${id} at ${state.address}`);
        } catch (error) {
          console.error(`Failed to fund bot ${id}:`, error);
        }
      }
    }

    // Wait a bit for funding to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start all bots
    await botManager.startAll();
    isInitialized = true;

    return NextResponse.json({
      success: true,
      message: 'Bots started successfully',
      bots: botManager.getAllStates(),
    });
  } catch (error: any) {
    console.error('Bot start error:', error);
    return NextResponse.json(
      {
        error: 'Failed to start bots',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
