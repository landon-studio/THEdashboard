/**
 * Rate limiting utilities for API calls and user actions
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  onLimitReached?: () => void;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  public isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    // No previous record or window has expired
    if (!record || now > record.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Within window, check count
    if (record.count < this.config.maxRequests) {
      record.count++;
      return true;
    }

    // Limit reached
    if (this.config.onLimitReached) {
      this.config.onLimitReached();
    }
    return false;
  }

  /**
   * Get remaining requests
   */
  public getRemaining(key: string): number {
    const record = this.requests.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  /**
   * Get time until reset (in ms)
   */
  public getResetTime(key: string): number {
    const record = this.requests.get(key);
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }

  /**
   * Reset limit for a key
   */
  public reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all limits
   */
  public clear(): void {
    this.requests.clear();
  }
}

/**
 * Create a rate limiter instance
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}

/**
 * Debounce function for frequent operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Gemini API rate limiter (60 requests per minute)
export const geminiRateLimiter = createRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
  onLimitReached: () => {
    console.warn('Gemini API rate limit reached. Please wait before making more requests.');
  },
});

// Search/filter rate limiter (10 requests per second)
export const searchRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 1000, // 1 second
});

// Form submission rate limiter (3 submissions per minute)
export const formSubmissionRateLimiter = createRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000, // 1 minute
  onLimitReached: () => {
    console.warn('Too many form submissions. Please slow down.');
  },
});

// File upload rate limiter (5 uploads per minute)
export const uploadRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  onLimitReached: () => {
    console.warn('Upload rate limit reached. Please wait before uploading more files.');
  },
});

/**
 * Hook-style wrapper for rate limiting in React components
 */
export function useRateLimit(
  callback: (...args: any[]) => any,
  config: RateLimitConfig,
  key: string = 'default'
) {
  const limiter = createRateLimiter(config);

  return (...args: any[]) => {
    if (limiter.isAllowed(key)) {
      return callback(...args);
    } else {
      const resetTime = limiter.getResetTime(key);
      console.warn(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)}s`);
      return null;
    }
  };
}

/**
 * Queue system for handling rate-limited requests
 */
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;
  private rateLimiter: RateLimiter;

  constructor(config: RateLimitConfig) {
    this.rateLimiter = createRateLimiter(config);
  }

  /**
   * Add request to queue
   */
  public async enqueue<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Wait if rate limit is exceeded
          while (!this.rateLimiter.isAllowed(key)) {
            const waitTime = this.rateLimiter.getResetTime(key);
            await new Promise(res => setTimeout(res, waitTime));
          }

          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        await request();
      }
    }

    this.processing = false;
  }

  /**
   * Get queue length
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  public clear(): void {
    this.queue = [];
  }
}

/**
 * Create a request queue with rate limiting
 */
export function createRequestQueue(config: RateLimitConfig): RequestQueue {
  return new RequestQueue(config);
}

/**
 * Pre-configured request queue for Gemini API
 */
export const geminiRequestQueue = createRequestQueue({
  maxRequests: 60,
  windowMs: 60 * 1000,
  onLimitReached: () => {
    console.warn('Gemini API request queued due to rate limiting');
  },
});

/**
 * Local storage based rate limiter (persists across sessions)
 */
export class PersistentRateLimiter {
  private key: string;
  private config: RateLimitConfig;

  constructor(key: string, config: RateLimitConfig) {
    this.key = `rate_limit_${key}`;
    this.config = config;
  }

  private getRecord(): RequestRecord | null {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setRecord(record: RequestRecord): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(record));
    } catch (error) {
      console.error('Failed to save rate limit record:', error);
    }
  }

  public isAllowed(): boolean {
    const now = Date.now();
    const record = this.getRecord();

    if (!record || now > record.resetTime) {
      this.setRecord({
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count < this.config.maxRequests) {
      record.count++;
      this.setRecord(record);
      return true;
    }

    if (this.config.onLimitReached) {
      this.config.onLimitReached();
    }
    return false;
  }

  public getRemaining(): number {
    const record = this.getRecord();
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  public reset(): void {
    localStorage.removeItem(this.key);
  }
}
