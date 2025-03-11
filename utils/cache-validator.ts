/**
 * Cache Validation Utility
 * 
 * This utility helps validate that caching mechanisms are working properly
 * throughout the application. It provides functions to:
 * 
 * 1. Check Perplexity cache efficiency
 * 2. Validate localStorage caching
 * 3. Test React Query caching
 */

import { createClient } from "@/utils/supabase/client"

interface CacheStats {
  total: number;
  hits: number;
  misses: number;
  hitRatio: number;
  avgResponseTime: number;
}

// Simple validator for Perplexity caching
export async function validatePerplexityCache(): Promise<CacheStats | null> {
  try {
    const supabase = createClient()
    
    // Get total cache entries
    const { data: cacheData, error: cacheError } = await supabase
      .from('perplexity_cache')
      .select('access_count')
    
    if (cacheError) {
      console.error('Error fetching perplexity cache:', cacheError)
      return null
    }
    
    // Get analytics for cache hits/misses
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('perplexity_analytics')
      .select('cached, response_time_ms')
    
    if (analyticsError) {
      console.error('Error fetching perplexity analytics:', analyticsError)
      return null
    }
    
    // Calculate statistics
    const totalRequests = analyticsData?.length || 0
    const cacheHits = analyticsData?.filter(item => item.cached)?.length || 0
    const cacheMisses = totalRequests - cacheHits
    const hitRatio = totalRequests > 0 ? cacheHits / totalRequests : 0
    
    // Average response time
    const totalResponseTime = analyticsData?.reduce((acc, item) => acc + item.response_time_ms, 0) || 0
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0
    
    return {
      total: totalRequests,
      hits: cacheHits,
      misses: cacheMisses,
      hitRatio: hitRatio,
      avgResponseTime: avgResponseTime
    }
  } catch (err) {
    console.error('Error validating Perplexity cache:', err)
    return null
  }
}

// Check client-side caching status
export function validateLocalStorageCache(cacheKey: string = 'perplexity-cache'): {
  exists: boolean;
  size: number;
  entries: number;
  lastUpdated: Date | null;
} {
  if (typeof window === 'undefined') {
    return { exists: false, size: 0, entries: 0, lastUpdated: null }
  }
  
  try {
    const cacheData = localStorage.getItem(cacheKey)
    
    if (!cacheData) {
      return { exists: false, size: 0, entries: 0, lastUpdated: null }
    }
    
    // Parse the cache data
    const cache = JSON.parse(cacheData)
    const entries = Object.keys(cache.data || {}).length
    const lastUpdated = cache.lastUpdated ? new Date(cache.lastUpdated) : null
    
    // Calculate size in bytes
    const size = new Blob([cacheData]).size
    
    return {
      exists: true,
      size,
      entries,
      lastUpdated
    }
  } catch (err) {
    console.error('Error validating localStorage cache:', err)
    return { exists: false, size: 0, entries: 0, lastUpdated: null }
  }
}

// Export a function to run all validations at once
export async function validateAllCaches(): Promise<{
  perplexity: CacheStats | null;
  localStorage: { exists: boolean; size: number; entries: number; lastUpdated: Date | null; };
}> {
  const perplexityStats = await validatePerplexityCache()
  const localStorageStats = validateLocalStorageCache()
  
  return {
    perplexity: perplexityStats,
    localStorage: localStorageStats
  }
} 