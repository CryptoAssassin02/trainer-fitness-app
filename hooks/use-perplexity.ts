'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { PerplexityClientCache } from '@/utils/ai/perplexity-client-cache'
// NOTE: We're now importing Perplexity from perplexity-sdk instead of the mock
import Perplexity, { ChatCompletionsPostRequestModelEnum } from 'perplexity-sdk'

export interface PerplexitySearchArgs {
  userContent: string;
  systemContent?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  returnCitations?: boolean;
  returnImages?: boolean;
  onStream?: (chunk: string) => void;
  skipCache?: boolean;
}

export interface UsePerplexityReturn {
  search: (args: PerplexitySearchArgs) => Promise<string>;
  clearCache: () => void;
  isSearching: boolean;
  error: Error | null;
}

// Error types for more specific handling
enum PerplexityErrorType {
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  AUTH_ERROR = 'auth_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

interface PerplexityError extends Error {
  type: PerplexityErrorType;
  retryAfter?: number; // in seconds
}

// Queue for managing requests
interface QueuedRequest {
  args: PerplexitySearchArgs;
  resolve: (value: string) => void;
  reject: (reason: any) => void;
  attempt: number;
}

// Map our internal model names to Perplexity SDK model enum values
const mapModelToEnum = (model: string): ChatCompletionsPostRequestModelEnum => {
  // Model mapping dictionary
  const modelMap: Record<string, ChatCompletionsPostRequestModelEnum> = {
    'default': ChatCompletionsPostRequestModelEnum.Mixtral8x7bInstruct,
    'sonar-small-chat': ChatCompletionsPostRequestModelEnum.Mistral7bInstruct,
    'sonar-medium-chat': ChatCompletionsPostRequestModelEnum.Mixtral8x7bInstruct,
    'sonar-large-chat': ChatCompletionsPostRequestModelEnum.Llama270bChat,
    'sonar-small-online': ChatCompletionsPostRequestModelEnum.Pplx7bOnline,
    'sonar-medium-online': ChatCompletionsPostRequestModelEnum.Pplx70bOnline,
  };
  
  return modelMap[model] || ChatCompletionsPostRequestModelEnum.Mixtral8x7bInstruct;
};

/**
 * Hook for using Perplexity AI in client components
 * Includes client-side caching, request queuing, and rate limit handling
 */
export const usePerplexity = (): UsePerplexityReturn => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();
  
  // Request queue for rate limiting
  const requestQueue = useRef<QueuedRequest[]>([]);
  const isProcessingQueue = useRef(false);
  
  // Process the request queue
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) {
      return;
    }
    
    isProcessingQueue.current = true;
    
    try {
      const request = requestQueue.current[0];
      
      try {
        // Process the request
        const result = await executeSearch(request.args, request.attempt);
        request.resolve(result);
        
        // Remove the processed request from the queue
        requestQueue.current.shift();
        
      } catch (error: any) {
        // Handle rate limiting specially
        if (error.type === PerplexityErrorType.RATE_LIMIT && error.retryAfter) {
          console.log(`Rate limited, retrying after ${error.retryAfter}s`);
          
          // Schedule retry after the specified delay
          setTimeout(() => {
            request.attempt += 1;
            isProcessingQueue.current = false;
            processQueue();
          }, error.retryAfter * 1000);
          
          // Don't remove from queue, will retry
          return;
        }
        
        // For other errors, reject the request and remove it from the queue
        request.reject(error);
        requestQueue.current.shift();
      }
    } finally {
      // If there are more requests in the queue, continue processing
      if (requestQueue.current.length > 0) {
        // Add a small delay to avoid overwhelming the API
        setTimeout(() => {
          isProcessingQueue.current = false;
          processQueue();
        }, 500);
      } else {
        isProcessingQueue.current = false;
      }
    }
  }, []);
  
  // Execute a search request against the API
  const executeSearch = async (args: PerplexitySearchArgs, attempt: number = 1): Promise<string> => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('usePerplexity hook can only be used in client components');
      }
      
      // Check cache if not explicitly skipping
      if (!args.skipCache) {
        const cachedResult = await PerplexityClientCache.checkCache(
          args.userContent,
          args.systemContent || "",
          args.model || "default"
        );
        
        if (cachedResult.cached && cachedResult.response) {
          console.log('Using cached Perplexity response');
          return cachedResult.response;
        }
      }
      
      // Use MCP directly if available
      if (window.cursor && window.cursor.runFunction) {
        try {
          // Check if we have an active connection
          const connectionCheck = await window.cursor.runFunction("mcp__PERPLEXITYAI_CHECK_ACTIVE_CONNECTION", {
            params: { tool: "perplexityai" }
          });
          
          // If no active connection, initialize one
          if (!connectionCheck.data?.active_connection) {
            const initResult = await window.cursor.runFunction("mcp__PERPLEXITYAI_INITIATE_CONNECTION", {
              params: { 
                tool: "perplexityai", 
                parameters: {} // API key is managed by Cursor MCP
              }
            });
            
            if (!initResult.successful) {
              throw createPerplexityError(
                `Failed to connect to Perplexity AI: ${initResult.error}`,
                PerplexityErrorType.AUTH_ERROR
              );
            }
          }
          
          // Make the search request
          const response = await window.cursor.runFunction("mcp__PERPLEXITYAI_PERPLEXITY_AI_SEARCH", {
            params: {
              systemContent: args.systemContent || "You are a fitness and exercise expert. Provide detailed, evidence-based information about exercises, workout techniques, and training methodologies.",
              userContent: args.userContent,
              temperature: args.temperature || 0.7,
              max_tokens: args.maxTokens || 1000,
              model: args.model || "sonar-medium-chat",
              return_citations: args.returnCitations || false,
              return_images: args.returnImages || false
            }
          });
          
          if (!response.successful || !response.data) {
            // Check for rate limiting in error message
            if (response.error && typeof response.error === 'string' && 
                (response.error.includes('rate limit') || response.error.includes('429'))) {
              throw createPerplexityError(
                `Rate limit exceeded: ${response.error}`,
                PerplexityErrorType.RATE_LIMIT,
                60 // Default retry after 60 seconds
              );
            }
            
            throw createPerplexityError(
              `Failed to get research from Perplexity AI: ${response.error}`,
              PerplexityErrorType.UNKNOWN
            );
          }
          
          const result = response.data.choices[0].message.content;
          
          // Cache the successful response
          if (!args.skipCache) {
            await PerplexityClientCache.cacheResponse(
              args.userContent,
              args.systemContent || "",
              result,
              args.model || "default"
            );
          }
          
          return result;
        } catch (mcpError) {
          console.error("MCP error:", mcpError);
          // Fall through to SDK or API route
        }
      }
      
      // Try to use the SDK directly if we're in a client environment and have an API key
      const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || null;
      if (apiKey) {
        try {
          // Initialize Perplexity client 
          const perplexity = new Perplexity({ apiKey }).client();
          
          // Map our internal model names to Perplexity SDK model enum values
          const modelEnum = mapModelToEnum(args.model || 'default');
          
          // Format messages for the API
          const messages = [
            {
              role: "system",
              content: args.systemContent || "You are a fitness and exercise expert. Provide detailed, evidence-based information about exercises, workout techniques, and training methodologies."
            },
            {
              role: "user",
              content: args.userContent
            }
          ];
          
          // Make the request using the SDK
          const response = await perplexity.chatCompletionsPost({
            model: modelEnum,
            messages,
            temperature: args.temperature || 0.7,
            maxTokens: args.maxTokens || 1000
          });
          
          if (!response.choices || !response.choices[0] || !response.choices[0].message) {
            throw createPerplexityError(
              "Invalid response from Perplexity SDK",
              PerplexityErrorType.UNKNOWN
            );
          }
          
          const result = response.choices[0].message.content || "";
          
          // Cache the successful response
          if (!args.skipCache) {
            await PerplexityClientCache.cacheResponse(
              args.userContent,
              args.systemContent || "",
              result,
              args.model || "default"
            );
          }
          
          return result;
        } catch (sdkError: any) {
          console.error("SDK error:", sdkError);
          
          // Handle SDK errors with appropriate types
          if (sdkError.status === 429 || (sdkError.message && sdkError.message.includes('rate limit'))) {
            throw createPerplexityError(
              `Rate limit exceeded: ${sdkError.message}`,
              PerplexityErrorType.RATE_LIMIT,
              60 // Default retry after 60 seconds
            );
          } else if (sdkError.status >= 500) {
            throw createPerplexityError(
              `Server error: ${sdkError.message}`,
              PerplexityErrorType.SERVER_ERROR
            );
          } else if (sdkError.status === 401 || sdkError.status === 403) {
            throw createPerplexityError(
              `Authentication error: ${sdkError.message}`,
              PerplexityErrorType.AUTH_ERROR
            );
          }
          
          // Fall through to API route as backup
        }
      }
      
      // Fallback to API route if MCP and SDK are not available or failed
      const response = await fetch("/api/ai/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userContent: args.userContent,
          systemContent: args.systemContent || "You are a fitness and exercise expert. Provide detailed, evidence-based information about exercises, workout techniques, and training methodologies.",
          model: args.model || "sonar-medium-chat",
          temperature: args.temperature || 0.7,
          maxTokens: args.maxTokens || 1000,
          returnCitations: args.returnCitations || false,
          returnImages: args.returnImages || false,
        }),
      });
      
      if (!response.ok) {
        const status = response.status;
        let responseText = "";
        
        try {
          const errorData = await response.json();
          responseText = errorData.error || response.statusText;
        } catch (e) {
          responseText = response.statusText;
        }
        
        // Handle specific status codes
        if (status === 429) {
          // Rate limit exceeded
          const retryAfter = response.headers.get('retry-after');
          const retrySeconds = retryAfter ? parseInt(retryAfter) : 60; // Default 60 seconds
          
          throw createPerplexityError(
            `Rate limit exceeded. Please try again later.`,
            PerplexityErrorType.RATE_LIMIT,
            retrySeconds
          );
        } else if (status >= 500) {
          // Server error
          throw createPerplexityError(
            `Server error: ${responseText}`,
            PerplexityErrorType.SERVER_ERROR
          );
        } else if (status === 401 || status === 403) {
          // Authentication error
          throw createPerplexityError(
            `Authentication error: ${responseText}`,
            PerplexityErrorType.AUTH_ERROR
          );
        } else {
          // Other error
          throw createPerplexityError(
            `Error from Perplexity API: ${responseText}`,
            PerplexityErrorType.UNKNOWN
          );
        }
      }
      
      let result = "";
      
      if (args.onStream) {
        const reader = response.body?.getReader();
        if (!reader) throw createPerplexityError("Response body is null", PerplexityErrorType.UNKNOWN);
        
        const decoder = new TextDecoder();
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            args.onStream(chunk);
            result += chunk;
          }
        }
      } else {
        const data = await response.json();
        result = data.text;
      }
      
      // Cache the successful response
      if (!args.skipCache) {
        await PerplexityClientCache.cacheResponse(
          args.userContent,
          args.systemContent || "",
          result,
          args.model || "default"
        );
      }
      
      return result;
      
    } catch (err: any) {
      // Create a proper error object if it's not already one
      const perplexityError = err.type 
        ? err 
        : createPerplexityError(
            err.message || "Unknown error", 
            err.name === 'TypeError' && err.message.includes('fetch') 
              ? PerplexityErrorType.NETWORK_ERROR 
              : PerplexityErrorType.UNKNOWN
          );
      
      // If it's a network error and not the last attempt, throw for retry
      if (perplexityError.type === PerplexityErrorType.NETWORK_ERROR && attempt < 3) {
        // Exponential backoff for network errors
        const backoffTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        // Retry the request
        return executeSearch(args, attempt + 1);
      }
      
      // For all other errors, propagate
      throw perplexityError;
    }
  };
  
  // Create an error with a specific type
  const createPerplexityError = (
    message: string,
    type: PerplexityErrorType,
    retryAfter?: number
  ): PerplexityError => {
    const error = new Error(message) as PerplexityError;
    error.type = type;
    if (retryAfter) error.retryAfter = retryAfter;
    return error;
  };
  
  // Add a search request to the queue
  const queueSearch = useCallback((args: PerplexitySearchArgs): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      // Add the request to the queue
      requestQueue.current.push({
        args,
        resolve,
        reject,
        attempt: 1,
      });
      
      // Start processing the queue if not already processing
      if (!isProcessingQueue.current) {
        processQueue();
      }
    });
  }, [processQueue]);
  
  // Main search function exposed to the user
  const search = useCallback(async (args: PerplexitySearchArgs): Promise<string> => {
    setIsSearching(true);
    setError(null);
    
    try {
      // For fast response, first check client-side cache
      if (!args.skipCache && typeof window !== 'undefined') {
        const cachedResult = await PerplexityClientCache.checkCache(
          args.userContent,
          args.systemContent || "",
          args.model || "default"
        );
        
        if (cachedResult.cached && cachedResult.response) {
          return cachedResult.response;
        }
      }
      
      // Queue the search request
      return await queueSearch(args);
    } catch (err: any) {
      console.error("Error fetching from Perplexity AI:", err);
      
      setError(err);
      
      // More specific error messages based on error type
      if (err.type === PerplexityErrorType.RATE_LIMIT) {
        const retryAfter = err.retryAfter 
          ? `Please try again in ${Math.ceil(err.retryAfter / 60)} minute(s).` 
          : 'Please try again later.';
        toast.error(`Rate limit exceeded. ${retryAfter}`);
      } else if (err.type === PerplexityErrorType.SERVER_ERROR) {
        toast.error("Perplexity AI servers are experiencing issues. Please try again later.");
      } else if (err.type === PerplexityErrorType.NETWORK_ERROR) {
        toast.error("Network error. Please check your internet connection.");
      } else if (err.type === PerplexityErrorType.AUTH_ERROR) {
        toast.error("Authentication error with Perplexity AI. Please contact support.");
      } else {
        toast.error("Failed to fetch research: " + (err.message || "Unknown error"));
      }
      
      return "Error fetching research. Please try again later.";
    } finally {
      setIsSearching(false);
    }
  }, [queueSearch]);
  
  // Clear the cache
  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      PerplexityClientCache.clearCache();
      toast.success("Perplexity cache cleared");
    }
  }, []);
  
  return {
    search,
    clearCache,
    isSearching,
    error,
  };
}; 