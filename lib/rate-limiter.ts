/**
 * Simple rate limiter to prevent hitting RPC rate limits
 * Adds a minimum delay between requests
 */

class RateLimiter {
  private lastRequestTime = 0;
  private minDelay = 200; // Minimum 200ms between requests

  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelay) {
      const delay = this.minDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }
}

export const rateLimiter = new RateLimiter();
