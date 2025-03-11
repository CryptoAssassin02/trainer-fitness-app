import { createHash } from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';
import { logger } from '@/utils/logger';

// Default rate limits for Perplexity API
// These should be adjusted based on your actual API plan
const DEFAULT_RATE_LIMITS = {
  requests_per_minute: 10,
  requests_per_day: 1000,
};

// Cache settings
const CACHE_EXPIRY_DAYS = 7; // How long to keep cached responses

/**
 * Create a unique hash for the query to use as a cache key
 */
export function createQueryHash(query: string, systemContent: string, model: string = 'default'): string {
  const hashContent = `${query}|${systemContent}|${model}`.toLowerCase();
  return createHash('sha256').update(hashContent).digest('hex');
}

/**
 * Check if a query is in the cache
 */
export async function checkCache(
  queryHash: string
): Promise<{ cached: boolean; response?: string }> {
  try {
    const supabase = createClient();
    
    // Get the cached response
    const { data, error } = await supabase
      .from('perplexity_cache')
      .select('response, created_at, access_count')
      .eq('query_hash', queryHash)
      .single();
    
    if (error || !data) {
      logger.debug('Cache miss for query', { queryHash });
      return { cached: false };
    }
    
    // Check if cache is expired
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > CACHE_EXPIRY_DAYS) {
      logger.debug('Cache expired for query', { queryHash, age: diffDays });
      // Delete expired cache
      await supabase
        .from('perplexity_cache')
        .delete()
        .eq('query_hash', queryHash);
      return { cached: false };
    }
    
    // Update last accessed and access count
    await supabase
      .from('perplexity_cache')
      .update({
        last_accessed: new Date().toISOString(),
        access_count: data.access_count + 1,
      })
      .eq('query_hash', queryHash);
    
    logger.info('Cache hit for query', { queryHash, accessCount: data.access_count + 1 });
    return { cached: true, response: data.response };
  } catch (error) {
    logger.error('Error checking cache', { error });
    return { cached: false };
  }
}

/**
 * Cache a response for a query
 */
export async function cacheResponse(
  queryHash: string,
  query: string,
  systemContent: string,
  response: string,
  model: string = 'default'
): Promise<void> {
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    
    // Store the response in the cache
    const { error } = await supabase.from('perplexity_cache').insert({
      query_hash: queryHash,
      query,
      system_content: systemContent,
      response,
      model,
      created_at: now,
      last_accessed: now,
      access_count: 1,
    });
    
    if (error) {
      logger.error('Error caching response', { error });
    } else {
      logger.info('Cached response for query', { queryHash });
    }
  } catch (error) {
    logger.error('Error caching response', { error });
  }
}

/**
 * Record analytics for a Perplexity API query
 */
export async function recordAnalytics(
  userId: string | null,
  query: string,
  systemContent: string | null,
  model: string | null,
  success: boolean,
  responseTimeMs: number,
  errorMessage: string | null = null,
  cached: boolean = false
): Promise<void> {
  try {
    const supabase = createClient();
    const now = new Date().toISOString();
    
    // Store analytics data
    const { error } = await supabase.from('perplexity_analytics').insert({
      user_id: userId,
      query,
      system_content: systemContent,
      model,
      success,
      error_message: errorMessage,
      response_time_ms: responseTimeMs,
      timestamp: now,
      cached,
    });
    
    if (error) {
      logger.error('Error recording analytics', { error });
    }
  } catch (error) {
    logger.error('Error recording analytics', { error });
  }
}

/**
 * Check and update rate limits
 */
export async function checkRateLimit(): Promise<{
  allowed: boolean;
  retryAfterMs?: number;
  limitType?: 'minute' | 'day';
}> {
  try {
    const supabase = createClient();
    const now = new Date();
    
    // Get current rate limit settings and counters
    const { data, error } = await supabase
      .from('perplexity_rate_limits')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking rate limits', { error });
      return { allowed: true }; // Default to allowing if there's an error
    }
    
    // Initialize rate limits if they don't exist
    if (!data) {
      await supabase.from('perplexity_rate_limits').insert({
        id: 'default',
        requests_per_minute: DEFAULT_RATE_LIMITS.requests_per_minute,
        requests_per_day: DEFAULT_RATE_LIMITS.requests_per_day,
        last_reset_minute: now.toISOString(),
        last_reset_day: now.toISOString(),
        current_minute_count: 0,
        current_day_count: 0,
        updated_at: now.toISOString(),
      });
      
      return { allowed: true };
    }
    
    // Check if minute reset is needed
    const lastResetMinute = new Date(data.last_reset_minute);
    const diffMinutes = Math.floor((now.getTime() - lastResetMinute.getTime()) / (1000 * 60));
    
    let currentMinuteCount = data.current_minute_count;
    if (diffMinutes >= 1) {
      currentMinuteCount = 0;
    }
    
    // Check if day reset is needed
    const lastResetDay = new Date(data.last_reset_day);
    const diffDays = Math.floor((now.getTime() - lastResetDay.getTime()) / (1000 * 60 * 60 * 24));
    
    let currentDayCount = data.current_day_count;
    if (diffDays >= 1) {
      currentDayCount = 0;
    }
    
    // Check minute rate limit
    if (currentMinuteCount >= data.requests_per_minute) {
      const nextMinute = new Date(lastResetMinute.getTime() + 60 * 1000);
      const waitTimeMs = nextMinute.getTime() - now.getTime();
      logger.warn('Minute rate limit exceeded', { current: currentMinuteCount, limit: data.requests_per_minute });
      return { allowed: false, retryAfterMs: waitTimeMs, limitType: 'minute' };
    }
    
    // Check day rate limit
    if (currentDayCount >= data.requests_per_day) {
      const nextDay = new Date(lastResetDay.getTime() + 24 * 60 * 60 * 1000);
      const waitTimeMs = nextDay.getTime() - now.getTime();
      logger.warn('Daily rate limit exceeded', { current: currentDayCount, limit: data.requests_per_day });
      return { allowed: false, retryAfterMs: waitTimeMs, limitType: 'day' };
    }
    
    // Update counters
    const updates: any = {
      current_minute_count: diffMinutes >= 1 ? 1 : currentMinuteCount + 1,
      current_day_count: diffDays >= 1 ? 1 : currentDayCount + 1,
      updated_at: now.toISOString(),
    };
    
    if (diffMinutes >= 1) {
      updates.last_reset_minute = now.toISOString();
    }
    
    if (diffDays >= 1) {
      updates.last_reset_day = now.toISOString();
    }
    
    await supabase
      .from('perplexity_rate_limits')
      .update(updates)
      .eq('id', 'default');
    
    return { allowed: true };
  } catch (error) {
    logger.error('Error checking rate limits', { error });
    return { allowed: true }; // Default to allowing if there's an error
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff wait time
 * @param attempt The current attempt number (starting from 1)
 * @param baseMs Base milliseconds to wait
 * @param maxMs Maximum milliseconds to wait
 */
export function calculateBackoff(attempt: number, baseMs = 1000, maxMs = 30000): number {
  const backoff = Math.min(Math.pow(2, attempt) * baseMs, maxMs);
  const jitter = Math.random() * 0.2 * backoff; // Add up to 20% jitter
  return Math.floor(backoff + jitter);
} 