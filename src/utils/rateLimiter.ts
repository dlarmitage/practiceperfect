interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return true;
    }

    if (now > attempt.resetTime) {
      // Reset window
      this.attempts.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return true;
    }

    if (attempt.count >= this.config.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    
    const remaining = attempt.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  clear(): void {
    this.attempts.clear();
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  maxAttempts: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export const signupRateLimiter = new RateLimiter({
  maxAttempts: 3, // 3 attempts
  windowMs: 60 * 60 * 1000, // 1 hour
});

export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3, // 3 attempts
  windowMs: 60 * 60 * 1000, // 1 hour
});

export default RateLimiter; 