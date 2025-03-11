interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>
  private readonly limit: number
  private readonly windowMs: number

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.store = new Map()
    this.limit = limit
    this.windowMs = windowMs
  }

  check(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (entry.count >= this.limit) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      return this.limit
    }

    return Math.max(0, this.limit - entry.count)
  }

  getResetTime(key: string): number | null {
    const entry = this.store.get(key)
    return entry ? entry.resetTime : null
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now()
    Array.from(this.store.keys()).forEach(key => {
      const entry = this.store.get(key)
      if (entry && now > entry.resetTime) {
        this.store.delete(key)
      }
    })
  }
}

// Create instances for different rate limits
export const importRateLimiter = new RateLimiter(5, 300000) // 5 requests per 5 minutes
export const exportRateLimiter = new RateLimiter(10, 600000) // 10 requests per 10 minutes

// Run cleanup every hour
setInterval(() => {
  importRateLimiter.cleanup()
  exportRateLimiter.cleanup()
}, 3600000) 