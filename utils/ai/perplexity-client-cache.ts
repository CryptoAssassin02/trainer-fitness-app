'use client';

import { createHash } from 'crypto';

// Cache expiry time in milliseconds (24 hours)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Maximum number of cache entries to keep in localStorage
const MAX_CACHE_ENTRIES = 50;

interface CacheEntry {
  response: string;
  timestamp: number;
}

interface CacheMetadata {
  queryHashes: string[];
  lastCleanup: number;
}

/**
 * Client-side caching for Perplexity AI responses
 * Uses localStorage for temporary caching between sessions
 */
export class PerplexityClientCache {
  private static CACHE_PREFIX = 'perplexity_cache_';
  private static METADATA_KEY = 'perplexity_cache_metadata';
  
  /**
   * Create a hash for the query, using browser's crypto API
   */
  static async createQueryHash(query: string, systemContent: string, model: string = 'default'): Promise<string> {
    try {
      const hashContent = `${query}|${systemContent}|${model}`.toLowerCase();
      
      // Use browser's SubtleCrypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(hashContent);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      // Fallback to simpler hashing if SubtleCrypto is not available
      let hash = 0;
      const hashContent = `${query}|${systemContent}|${model}`.toLowerCase();
      
      for (let i = 0; i < hashContent.length; i++) {
        const char = hashContent.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      return Math.abs(hash).toString(16);
    }
  }
  
  /**
   * Get metadata about the cache
   */
  private static getMetadata(): CacheMetadata {
    try {
      const metadata = localStorage.getItem(this.METADATA_KEY);
      if (metadata) {
        return JSON.parse(metadata);
      }
    } catch (error) {
      console.error('Error reading cache metadata', error);
    }
    
    return {
      queryHashes: [],
      lastCleanup: Date.now(),
    };
  }
  
  /**
   * Save metadata about the cache
   */
  private static saveMetadata(metadata: CacheMetadata): void {
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving cache metadata', error);
    }
  }
  
  /**
   * Add a query hash to the metadata
   */
  private static addQueryHashToMetadata(queryHash: string): void {
    const metadata = this.getMetadata();
    
    // Remove the hash if it already exists
    const index = metadata.queryHashes.indexOf(queryHash);
    if (index !== -1) {
      metadata.queryHashes.splice(index, 1);
    }
    
    // Add the hash to the end (most recently used)
    metadata.queryHashes.push(queryHash);
    
    // Cleanup if needed
    if (Date.now() - metadata.lastCleanup > CACHE_EXPIRY_MS || metadata.queryHashes.length > MAX_CACHE_ENTRIES) {
      this.cleanupCache(metadata);
    }
    
    this.saveMetadata(metadata);
  }
  
  /**
   * Remove expired entries and limit the cache size
   */
  private static cleanupCache(metadata: CacheMetadata): void {
    const now = Date.now();
    const validHashes: string[] = [];
    
    // Check each hash, remove expired entries
    for (const hash of metadata.queryHashes) {
      try {
        const cacheKey = this.CACHE_PREFIX + hash;
        const cacheJson = localStorage.getItem(cacheKey);
        
        if (cacheJson) {
          const cache: CacheEntry = JSON.parse(cacheJson);
          
          // Keep if not expired
          if (now - cache.timestamp < CACHE_EXPIRY_MS) {
            validHashes.push(hash);
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      } catch (error) {
        console.error('Error checking cache entry', error);
      }
    }
    
    // Limit the number of cache entries
    if (validHashes.length > MAX_CACHE_ENTRIES) {
      // Remove oldest entries (beginning of the array)
      const toRemove = validHashes.slice(0, validHashes.length - MAX_CACHE_ENTRIES);
      for (const hash of toRemove) {
        localStorage.removeItem(this.CACHE_PREFIX + hash);
      }
      
      // Keep only the newest entries
      metadata.queryHashes = validHashes.slice(validHashes.length - MAX_CACHE_ENTRIES);
    } else {
      metadata.queryHashes = validHashes;
    }
    
    metadata.lastCleanup = now;
  }
  
  /**
   * Check if a query is in the cache
   */
  static async checkCache(
    query: string,
    systemContent: string,
    model: string = 'default'
  ): Promise<{ cached: boolean; response?: string }> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { cached: false };
      }
      
      const queryHash = await this.createQueryHash(query, systemContent, model);
      const cacheKey = this.CACHE_PREFIX + queryHash;
      const cacheJson = localStorage.getItem(cacheKey);
      
      if (!cacheJson) {
        return { cached: false };
      }
      
      const cache: CacheEntry = JSON.parse(cacheJson);
      const now = Date.now();
      
      // Check if expired
      if (now - cache.timestamp > CACHE_EXPIRY_MS) {
        localStorage.removeItem(cacheKey);
        return { cached: false };
      }
      
      // Add to recently used
      this.addQueryHashToMetadata(queryHash);
      
      return { cached: true, response: cache.response };
    } catch (error) {
      console.error('Error checking client cache', error);
      return { cached: false };
    }
  }
  
  /**
   * Store a response in the cache
   */
  static async cacheResponse(
    query: string,
    systemContent: string,
    response: string,
    model: string = 'default'
  ): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      const queryHash = await this.createQueryHash(query, systemContent, model);
      const cacheKey = this.CACHE_PREFIX + queryHash;
      
      const cacheEntry: CacheEntry = {
        response,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      this.addQueryHashToMetadata(queryHash);
      
    } catch (error) {
      console.error('Error caching response', error);
    }
  }
  
  /**
   * Clear all cached responses
   */
  static clearCache(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      const metadata = this.getMetadata();
      
      // Remove all cache entries
      for (const hash of metadata.queryHashes) {
        localStorage.removeItem(this.CACHE_PREFIX + hash);
      }
      
      // Clear metadata
      metadata.queryHashes = [];
      metadata.lastCleanup = Date.now();
      this.saveMetadata(metadata);
      
    } catch (error) {
      console.error('Error clearing cache', error);
    }
  }
} 