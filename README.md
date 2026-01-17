# Tempo Stablecoin DEX Demo

A full-stack demo application showcasing Tempo's enshrined Stablecoin DEX with support for Limit Orders, Flip Orders, and Market Orders.

## Features

- **Passkey Authentication**: Sign up and sign in using WebAuthn passkeys (no passwords needed)
- **Faucet Integration**: Get test tokens for all 4 stablecoins (pathUSD, AlphaUSD, BetaUSD, ThetaUSD)
- **Order Types**:
  - **Limit Orders**: Place orders at specific price levels
  - **Flip Orders**: Auto-reversing orders that flip to the opposite side when filled
  - **Market Orders**: Execute immediately at the best available price
- **Real-time Orderbook**: Live visualization of bids and asks with depth bars
- **Market Maker Bots**: Automated bots providing liquidity across all pairs
- **Activity Log**: Track all transactions and order fills
- **Real Testnet**: All transactions execute on Tempo Moderato testnet

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Blockchain**: Viem 2.43+, Wagmi 3+ with Tempo support
- **Authentication**: WebAuthn (passkeys)
- **Styling**: Tailwind CSS with black/white theme
- **State**: React hooks + localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- Modern browser with WebAuthn support (Chrome, Safari, Firefox, Edge)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd stablecoin-dex
```

2. Install dependencies
```bash
npm install
```

3. (Optional) Configure RPC credentials

   The app uses Basic Auth credentials for the Tempo RPC endpoint. Default credentials are already configured, but you can override them by creating a `.env.local` file:

   ```bash
   RPC_USERNAME=your-username
   RPC_PASSWORD=your-password
   ```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Sign Up with Passkey

- Click "Sign Up" to create a new Tempo account using passkeys
- Your browser will prompt you to create a passkey (biometric or security key)
- Your account address will be displayed after successful sign-up

### 2. Get Test Tokens

- Click "Get Test Tokens" in the Balances section
- This will fund your account with 1M of each stablecoin on Moderato testnet
- Balances update automatically every 10 seconds

### 3. Place Orders

**Limit Order:**
- Select token pair (e.g., AlphaUSD/pathUSD)
- Click "Limit" tab
- Choose Buy or Sell
- Enter amount and price
- Click "Place Limit Buy/Sell"

**Flip Order:**
- Click "Flip" tab
- Enter amount, price, and flip price
- Flip orders automatically reverse when filled

**Market Order:**
- Click "Market" tab
- Enter amount
- Choose Buy or Sell
- Order executes immediately

### 4. Start Market Maker Bots

- Click "Start Bots" in the Market Maker Bots section
- Bots will fund themselves and place orders on both sides of the orderbook
- Watch the orderbook populate with bot orders

### 5. Monitor Activity

- All transactions appear in the Activity Log
- Click transaction links to view on block explorer
- Activity persists in localStorage across sessions

## Architecture

### Smart Contracts

- **DEX Contract**: `0xdec0000000000000000000000000000000000000`
- **pathUSD**: `0x20c0000000000000000000000000000000000000`
- **AlphaUSD**: `0x20c0000000000000000000000000000000000001`
- **BetaUSD**: `0x20c0000000000000000000000000000000000002`
- **ThetaUSD**: `0x20c0000000000000000000000000000000000003`

### Testnet Details

- **Network**: Tempo Moderato
- **RPC**: https://rpc.moderato.tempo.xyz
- **Chain ID**: 42431
- **Explorer**: https://explore.tempo.xyz

### Pricing Model

- Price = PRICE_SCALE + tick
- PRICE_SCALE = 100,000
- Each tick = 0.001% (1 basis point / 10)
- Valid range: ±2000 ticks (±2%)
- Tick spacing: 10 (1 basis point)

## Project Structure

```
stablecoin-dex/
├── app/
│   ├── api/
│   │   ├── faucet/          # Faucet API endpoint
│   │   ├── orderbook/       # Orderbook data endpoint
│   │   └── bots/            # Bot management endpoints
│   ├── components/
│   │   ├── AuthButton.tsx   # Passkey authentication
│   │   ├── Faucet.tsx       # Token faucet UI
│   │   ├── OrderForm.tsx    # Order placement form
│   │   ├── Orderbook.tsx    # Orderbook visualization
│   │   ├── ActivityLog.tsx  # Transaction history
│   │   └── BotMonitor.tsx   # Bot status dashboard
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main trading page
│   └── providers.tsx        # Wagmi providers
├── lib/
│   ├── constants.ts         # Contract addresses, chain config
│   ├── dex-abi.ts          # DEX and token ABIs
│   ├── dex-helpers.ts      # Price/tick utilities
│   ├── wagmi.config.ts     # Wagmi configuration
│   ├── viem-client.ts      # Viem client setup
│   ├── bot-strategy.ts     # Market maker logic
│   └── local-storage.ts    # Activity persistence
└── package.json
```

## Development Notes

### Token Approvals

Orders require token approvals before placement. The app automatically:
1. Approves the DEX contract to spend tokens
2. Waits for approval confirmation
3. Places the order

### Bot Strategy

Market maker bots place orders at specific ticks around the peg:
- **Bids**: -50, -30, -20, -10, -5 (0.95-0.995% below peg)
- **Asks**: +5, +10, +20, +30, +50 (1.005-1.05% above peg)

Each order is between 1,000-10,000 tokens (randomized).

### Real-time Updates

- Balances: Poll every 10 seconds
- Orderbook: Poll every 5 seconds
- Activity Log: Poll every 2 seconds
- Bot Status: Poll every 5 seconds

## Resources

- [Tempo Documentation](https://docs.tempo.xyz)
- [DEX Specification](https://docs.tempo.xyz/protocol/exchange/spec)
- [Viem Tempo Integration](https://viem.sh/tempo)
- [Block Explorer](https://explore.tempo.xyz)

## Deployment

### Deploy to Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Railway deployment instructions.

**Quick Deploy**:
1. Push your code to GitHub
2. Create new Railway project from GitHub repo
3. Add environment variables:
   ```
   RPC_USERNAME=interesting-hodgkin
   RPC_PASSWORD=jolly-elgamal
   ```
4. Railway auto-deploys!

### Environment Variables

Required for production:
- `RPC_USERNAME` - Tempo RPC Basic Auth username
- `RPC_PASSWORD` - Tempo RPC Basic Auth password

Optional:
- `BOT1_PRIVATE_KEY` - Persistent bot identity
- `BOT2_PRIVATE_KEY` - Persistent bot identity
- `BOT3_PRIVATE_KEY` - Persistent bot identity

## Recent Updates

- ✅ **Real Orderbook**: Now queries actual on-chain data from DEX contract
- ✅ **Best Bid/Ask Display**: Shows live market prices in order form
- ✅ **Execution Prediction**: Tells you if order will execute immediately
- ✅ **Confetti Animation**: Black & white celebration on order placement
- ✅ **Reduced Bot Sizes**: Bots use 100-500 tokens to maintain longer liquidity
- ✅ **Improved Orderbook Query**: Scans all ticks (-200 to +200) for orders

## License

MIT
