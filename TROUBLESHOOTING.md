# Troubleshooting Guide

## Common Issues

### Contract Revert Error (0xc1ab6dc1)

**Error**: "The contract function 'place' reverted with signature 0xc1ab6dc1"

**Causes & Solutions**:

1. **Haven't claimed test tokens**
   - Click "Get Test Tokens" in the sidebar
   - Wait for the transaction to complete
   - Refresh balances to verify tokens were received

2. **Insufficient balance**
   - Check your token balances in the sidebar
   - For buy orders: You need the quote token (pathUSD)
   - For sell orders: You need the base token (AlphaUSD, BetaUSD, or ThetaUSD)

3. **Order amount too small**
   - Minimum order size is 1 token
   - Try increasing your order amount

4. **Token not approved**
   - The app automatically approves tokens
   - If approval fails, try again
   - Check the error message for details

### Order Types Explained

**Limit Orders**:
- Buy: You provide pathUSD, receive the base token at your specified price
- Sell: You provide the base token, receive pathUSD at your specified price
- Orders stay in the orderbook until filled or cancelled

**Flip Orders**:
- Same as limit orders but automatically reverse when filled
- When your buy order fills, it creates a sell order at the flip price
- When your sell order fills, it creates a buy order at the flip price
- Great for market making

**Market Orders**:
- Execute immediately at the best available price
- Buy: Swap pathUSD for base token
- Sell: Swap base token for pathUSD

### Token Requirements by Order Type

| Order Type | Action | Token Needed | Amount |
|------------|--------|--------------|--------|
| Limit Buy | Buy AlphaUSD | pathUSD | Order amount |
| Limit Sell | Sell AlphaUSD | AlphaUSD | Order amount |
| Market Buy | Buy AlphaUSD | pathUSD | Order amount |
| Market Sell | Sell AlphaUSD | AlphaUSD | Order amount |

### Rate Limiting (429 Errors)

The app now uses authenticated RPC access, but if you still see rate limits:

1. **Reduce manual refreshes** - The app auto-refreshes periodically
2. **Wait between actions** - Give transactions time to complete
3. **Check console** - Look for specific error messages

### Passkey Issues

**Can't create passkey**:
- Use a supported browser (Chrome, Safari, Firefox, Edge)
- Enable biometric authentication on your device
- Try using a security key instead

**Lost passkey**:
- Passkeys are device-specific
- If you lose access, you'll need to create a new account
- This is a demo on testnet, so it's safe to start over

### Balance Not Updating

1. Click the "Refresh" button in the Token Balances section
2. Wait 30 seconds for automatic refresh
3. Check the transaction on [Block Explorer](https://explore.tempo.xyz)
4. Verify you're connected with the correct account

### Bots Not Starting

**Issue**: Bots fail to start or don't place orders

**Solutions**:
1. Check console for error messages
2. Bots need to be funded - this happens automatically
3. Wait 3-5 seconds after clicking "Start Bots"
4. Refresh the page and try again

### Orderbook Not Loading

**Issue**: Orderbook shows "Loading" or no data

**Solutions**:
1. Currently showing mock data for demo purposes
2. Real orderbook integration requires querying active orders from the DEX
3. Bots will populate the orderbook when implemented

## Getting Help

If you're still having issues:

1. **Check the console** - Press F12 in your browser
2. **Look for error messages** - They often contain helpful details
3. **Verify network** - Make sure you're on Tempo Moderato testnet
4. **Check explorer** - Visit https://explore.tempo.xyz to see if transactions are confirming

## Technical Details

**DEX Contract**: `0xdec0000000000000000000000000000000000000`

**Stablecoin Addresses**:
- pathUSD: `0x20c0000000000000000000000000000000000000`
- AlphaUSD: `0x20c0000000000000000000000000000000000001`
- BetaUSD: `0x20c0000000000000000000000000000000000002`
- ThetaUSD: `0x20c0000000000000000000000000000000000003`

**Network**: Tempo Moderato Testnet (Chain ID: 42431)

**RPC**: https://rpc.moderato.tempo.xyz (authenticated)
