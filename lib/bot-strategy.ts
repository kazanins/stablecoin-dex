import { createWalletClient, http, type PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { tempoModerato } from 'viem/chains';
import { tempoActions } from 'viem/tempo';
import { DEX_CONTRACT_ADDRESS, STABLECOINS } from './constants';
import { DEX_ABI, TIP20_ABI } from './dex-abi';
import { getMarketMakerTicks, parseAmount } from './dex-helpers';
import { publicClient } from './viem-client';

export interface BotConfig {
  privateKey: `0x${string}`;
  baseToken: keyof typeof STABLECOINS;
  quoteToken: keyof typeof STABLECOINS;
}

export interface BotState {
  id: string;
  address: string;
  pair: string;
  isActive: boolean;
  orderCount: number;
  lastActivity: number;
}

export class MarketMakerBot {
  private client;
  private account: PrivateKeyAccount;
  private config: BotConfig;
  private state: BotState;
  private orderIds: bigint[] = [];

  constructor(id: string, config: BotConfig) {
    this.account = privateKeyToAccount(config.privateKey);
    this.config = config;

    // Get RPC URL with Basic Auth
    const username = process.env.RPC_USERNAME || 'interesting-hodgkin';
    const password = process.env.RPC_PASSWORD || 'jolly-elgamal';
    const rpcUrl = `https://${username}:${password}@rpc.moderato.tempo.xyz`;

    this.client = createWalletClient({
      account: this.account,
      chain: tempoModerato,
      transport: http(rpcUrl),
    }).extend(tempoActions());

    this.state = {
      id,
      address: this.account.address,
      pair: `${config.baseToken}/${config.quoteToken}`,
      isActive: false,
      orderCount: 0,
      lastActivity: Date.now(),
    };
  }

  async initialize() {
    try {
      // Approve tokens for DEX
      const baseToken = STABLECOINS[this.config.baseToken];
      const quoteToken = STABLECOINS[this.config.quoteToken];
      const maxApproval = BigInt('0xffffffffffffffffffffffffffffffff'); // Max uint128

      await this.client.writeContract({
        address: baseToken.address,
        abi: TIP20_ABI,
        functionName: 'approve',
        args: [DEX_CONTRACT_ADDRESS, maxApproval],
      });

      await this.client.writeContract({
        address: quoteToken.address,
        abi: TIP20_ABI,
        functionName: 'approve',
        args: [DEX_CONTRACT_ADDRESS, maxApproval],
      });

      console.log(`Bot ${this.state.id} initialized for ${this.state.pair}`);
    } catch (error) {
      console.error(`Bot ${this.state.id} initialization error:`, error);
      throw error;
    }
  }

  async placeOrders() {
    try {
      const { bidTicks, askTicks } = getMarketMakerTicks();
      const baseToken = STABLECOINS[this.config.baseToken];
      const quoteToken = STABLECOINS[this.config.quoteToken];

      // Place bid orders (buying base with quote)
      for (const tick of bidTicks) {
        try {
          const amount = this.getRandomAmount();
          const amountBigInt = parseAmount(amount.toString(), baseToken.decimals);

          const orderId = await this.client.writeContract({
            address: DEX_CONTRACT_ADDRESS,
            abi: DEX_ABI,
            functionName: 'place',
            args: [baseToken.address, amountBigInt, true, tick],
          });

          this.orderIds.push(orderId as unknown as bigint);
          this.state.orderCount++;
        } catch (error) {
          console.error(`Failed to place bid at tick ${tick}:`, error);
        }
      }

      // Place ask orders (selling base for quote)
      for (const tick of askTicks) {
        try {
          const amount = this.getRandomAmount();
          const amountBigInt = parseAmount(amount.toString(), baseToken.decimals);

          const orderId = await this.client.writeContract({
            address: DEX_CONTRACT_ADDRESS,
            abi: DEX_ABI,
            functionName: 'place',
            args: [baseToken.address, amountBigInt, false, tick],
          });

          this.orderIds.push(orderId as unknown as bigint);
          this.state.orderCount++;
        } catch (error) {
          console.error(`Failed to place ask at tick ${tick}:`, error);
        }
      }

      this.state.lastActivity = Date.now();
      console.log(`Bot ${this.state.id} placed ${bidTicks.length + askTicks.length} orders`);
    } catch (error) {
      console.error(`Bot ${this.state.id} order placement error:`, error);
    }
  }

  private getRandomAmount(): number {
    // Random amount between 100 and 500 (reduced to prevent running out of funds)
    return Math.floor(Math.random() * 400) + 100;
  }

  async start() {
    this.state.isActive = true;
    await this.initialize();
    await this.placeOrders();
  }

  async stop() {
    this.state.isActive = false;
    // In a real implementation, you might want to cancel all orders
  }

  getState(): BotState {
    return { ...this.state };
  }
}

// Bot manager to handle multiple bots
export class BotManager {
  private bots: Map<string, MarketMakerBot> = new Map();

  async createBot(id: string, config: BotConfig): Promise<MarketMakerBot> {
    const bot = new MarketMakerBot(id, config);
    this.bots.set(id, bot);
    return bot;
  }

  async startAll() {
    const startPromises = Array.from(this.bots.values()).map(bot => bot.start());
    await Promise.allSettled(startPromises);
  }

  async stopAll() {
    const stopPromises = Array.from(this.bots.values()).map(bot => bot.stop());
    await Promise.allSettled(stopPromises);
  }

  getAllStates(): BotState[] {
    return Array.from(this.bots.values()).map(bot => bot.getState());
  }

  getBot(id: string): MarketMakerBot | undefined {
    return this.bots.get(id);
  }
}
