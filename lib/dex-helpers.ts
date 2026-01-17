import { PRICE_SCALE, MIN_TICK, MAX_TICK, TICK_SPACING } from './constants';

/**
 * Convert tick to price
 * Formula: price = PRICE_SCALE + tick
 * Each tick = 0.001% (1 basis point / 10)
 */
export function tickToPrice(tick: number): number {
  return (PRICE_SCALE + tick) / PRICE_SCALE;
}

/**
 * Convert price to tick
 * Formula: tick = (price * PRICE_SCALE) - PRICE_SCALE
 * Rounds to nearest valid tick (divisible by 10)
 */
export function priceToTick(price: number): number {
  const rawTick = Math.round(price * PRICE_SCALE - PRICE_SCALE);
  // Round to nearest tick spacing
  const tick = Math.round(rawTick / TICK_SPACING) * TICK_SPACING;
  // Clamp to valid range
  return Math.max(MIN_TICK, Math.min(MAX_TICK, tick));
}

/**
 * Validate tick is within allowed range and spacing
 */
export function validateTick(tick: number): { valid: boolean; error?: string } {
  if (tick < MIN_TICK || tick > MAX_TICK) {
    return {
      valid: false,
      error: `Tick must be between ${MIN_TICK} and ${MAX_TICK}`,
    };
  }
  if (tick % TICK_SPACING !== 0) {
    return {
      valid: false,
      error: `Tick must be divisible by ${TICK_SPACING}`,
    };
  }
  return { valid: true };
}

/**
 * Validate flip order ticks
 * For bids: flipTick > tick
 * For asks: flipTick < tick
 */
export function validateFlipTicks(
  isBid: boolean,
  tick: number,
  flipTick: number
): { valid: boolean; error?: string } {
  // Validate individual ticks first
  const tickValidation = validateTick(tick);
  if (!tickValidation.valid) return tickValidation;

  const flipTickValidation = validateTick(flipTick);
  if (!flipTickValidation.valid) return flipTickValidation;

  // Validate flip direction
  if (isBid && flipTick <= tick) {
    return {
      valid: false,
      error: 'For bid orders, flip tick must be greater than tick',
    };
  }
  if (!isBid && flipTick >= tick) {
    return {
      valid: false,
      error: 'For ask orders, flip tick must be less than tick',
    };
  }

  return { valid: true };
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return price.toFixed(6);
}

/**
 * Format amount for display with commas
 */
export function formatAmount(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  const fractionStr = remainder.toString().padStart(decimals, '0');
  const trimmedFraction = fractionStr.replace(/0+$/, '');

  // Add commas to whole number
  const wholeWithCommas = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (trimmedFraction === '') {
    return wholeWithCommas;
  }

  // Limit decimal places for display
  const displayFraction = trimmedFraction.slice(0, 2);
  return `${wholeWithCommas}.${displayFraction}`;
}

/**
 * Parse amount from string to bigint
 */
export function parseAmount(amount: string, decimals: number = 6): bigint {
  // Remove commas if present
  const cleanAmount = amount.replace(/,/g, '');
  const parts = cleanAmount.split('.');
  const whole = parts[0] || '0';
  const fraction = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + fraction);
}

/**
 * Calculate percentage difference from peg (1.0)
 */
export function getPricePercentageFromPeg(price: number): string {
  const diff = ((price - 1) * 100).toFixed(3);
  return diff.startsWith('-') ? diff : `+${diff}`;
}

/**
 * Get suggested ticks for market maker
 * Bots only place bids (buy orders) to prevent them from filling each other
 * Users can sell into bot bids or place asks above peg
 */
export function getMarketMakerTicks(): {
  bidTicks: number[];
  askTicks: number[];
} {
  // Bots only place bids (buy orders) far below peg
  // This prevents bots from filling each other's orders
  // Users can sell tokens to bots at these prices
  const bidTicks = [-100, -80, -60, -40, -20];

  // No ask orders from bots - only users place asks
  // This leaves the entire ask side open for users
  const askTicks: number[] = [];

  return { bidTicks, askTicks };
}
