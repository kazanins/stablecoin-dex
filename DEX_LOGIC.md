# Tempo DEX Order Logic

## Understanding the DEX Contract

### Order Parameters
```solidity
place(address token, uint128 amount, bool isBid, int16 tick)
```

### Key Concepts

**Token Parameter**: Always the **BASE token** of the pair
- For AlphaUSD/pathUSD pair, token = AlphaUSD address
- For BetaUSD/pathUSD pair, token = BetaUSD address
- The token parameter identifies WHICH pair you're trading

**isBid Parameter**: Direction of trade
- `true` = BUY the base token (you're bidding to buy)
- `false` = SELL the base token (you're asking to sell)

**Amount**: How much of the base token you want to trade
- Always denominated in the base token
- Uses 6 decimals for Tempo stablecoins

## Trading Examples

### Example 1: Buy AlphaUSD with pathUSD

**Scenario**: You want to buy 1,000 AlphaUSD using pathUSD at price 1.001

```javascript
// Contract call
place(
  AlphaUSD_address,    // token = base token
  1000000000,          // amount = 1,000 AlphaUSD (6 decimals)
  true,                // isBid = true (buying)
  10                   // tick = +10 (price 1.001)
)

// What you need
- Balance: 1,000+ pathUSD (quote token)
- Approval: pathUSD approved to DEX

// What happens
- Your pathUSD is locked in the order
- When filled, you receive AlphaUSD
```

### Example 2: Sell AlphaUSD for pathUSD

**Scenario**: You want to sell 500 AlphaUSD to receive pathUSD at price 0.999

```javascript
// Contract call
place(
  AlphaUSD_address,    // token = base token
  500000000,           // amount = 500 AlphaUSD (6 decimals)
  false,               // isBid = false (selling)
  -10                  // tick = -10 (price 0.999)
)

// What you need
- Balance: 500+ AlphaUSD (base token)
- Approval: AlphaUSD approved to DEX

// What happens
- Your AlphaUSD is locked in the order
- When filled, you receive pathUSD
```

## UI to Contract Mapping

### Order Form Logic

```javascript
// User selects
pair.base = "AlphaUSD"
pair.quote = "pathUSD"
orderSide = "buy"      // or "sell"
amount = "1000"
price = "1.001"

// Convert to contract parameters
token = baseToken.address              // AlphaUSD (ALWAYS base)
amount = parseAmount("1000", 6)        // 1000000000
isBid = (orderSide === "buy")          // true for buy, false for sell
tick = priceToTick(1.001)              // 10

// Approval logic
tokenToApprove = isBid ? quoteToken.address : baseToken.address
// For buy: approve pathUSD
// For sell: approve AlphaUSD

// Balance check
tokenToCheck = isBid ? quoteToken : baseToken
// For buy: check pathUSD balance
// For sell: check AlphaUSD balance
```

## Common Mistakes

❌ **Wrong**: Using quote token as `token` parameter for buy orders
```javascript
place(pathUSD_address, amount, true, tick)  // WRONG!
```

✅ **Correct**: Always use base token as `token` parameter
```javascript
place(AlphaUSD_address, amount, true, tick)  // CORRECT
```

❌ **Wrong**: Approving the wrong token
```javascript
// For buy order, approving base token
approve(AlphaUSD_address, DEX_address, amount)  // WRONG!
```

✅ **Correct**: Approve the token you're spending
```javascript
// For buy order, approving quote token
approve(pathUSD_address, DEX_address, amount)  // CORRECT
```

## Pair Structure

All pairs on Tempo use pathUSD as the quote token:
- AlphaUSD/pathUSD
- BetaUSD/pathUSD
- ThetaUSD/pathUSD

This creates a "hub and spoke" model where pathUSD is the universal quote currency.
