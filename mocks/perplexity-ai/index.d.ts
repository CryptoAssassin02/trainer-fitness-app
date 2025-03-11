// Type definitions for perplexity-ai mock
// This provides TypeScript type information for the mock package

declare module 'perplexity-ai' {
  export interface SearchOptions {
    userContent?: string;
    systemContent?: string;
    returnCitations?: boolean;
    skipCache?: boolean;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }

  export interface Citation {
    title: string;
    url: string;
  }

  export interface SearchResult {
    answer: string;
    citations: Citation[];
    cached: boolean;
    runtimeMs: number;
  }

  export interface CacheStats {
    totalQueries: number;
    cacheHits: number;
    cacheMisses: number;
    avgResponseTime: number;
  }

  /**
   * Perform a search using Perplexity AI
   * @param options Search options
   */
  export function search(options: SearchOptions): Promise<SearchResult>;

  /**
   * Clear the local cache
   */
  export function clearCache(): void;

  /**
   * Get cache statistics
   */
  export function getStats(): CacheStats;
} 