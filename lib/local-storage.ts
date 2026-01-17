export type ActivityType =
  | 'order_placed'
  | 'order_filled'
  | 'order_cancelled'
  | 'swap_executed'
  | 'faucet_claim';

export interface Activity {
  id: string;
  type: ActivityType;
  timestamp: number;
  txHash?: string;
  details: {
    orderType?: 'limit' | 'flip' | 'market';
    tokenPair?: string;
    amount?: string;
    price?: string;
    side?: 'buy' | 'sell';
    [key: string]: any;
  };
}

const ACTIVITIES_KEY = 'tempo-dex-activities';
const MAX_ACTIVITIES = 100;

/**
 * Get all activities from localStorage
 */
export function getActivities(): Activity[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load activities:', error);
    return [];
  }
}

/**
 * Add a new activity
 */
export function addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const activities = getActivities();
    const newActivity: Activity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    const updated = [newActivity, ...activities].slice(0, MAX_ACTIVITIES);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save activity:', error);
  }
}

/**
 * Clear all activities
 */
export function clearActivities(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVITIES_KEY);
  } catch (error) {
    console.error('Failed to clear activities:', error);
  }
}

/**
 * Format activity for display
 */
export function formatActivity(activity: Activity): string {
  const time = new Date(activity.timestamp).toLocaleTimeString();
  const { type, details } = activity;

  switch (type) {
    case 'order_placed':
      return `[${time}] ${details.side?.toUpperCase()} ${details.orderType} order: ${details.amount} ${details.tokenPair} @ ${details.price}`;
    case 'order_filled':
      return `[${time}] Order filled: ${details.amount} ${details.tokenPair}`;
    case 'order_cancelled':
      return `[${time}] Order cancelled`;
    case 'swap_executed':
      return `[${time}] Swap: ${details.amountIn} ${details.tokenIn} → ${details.amountOut} ${details.tokenOut}`;
    case 'faucet_claim':
      return `[${time}] Claimed test tokens`;
    default:
      return `[${time}] ${type}`;
  }
}
