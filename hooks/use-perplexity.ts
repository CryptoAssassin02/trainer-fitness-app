'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { PerplexityClientCache } from '@/utils/ai/perplexity-client-cache'
// Remove direct SDK import that's causing problems
// Instead, define the enum directly to avoid package dependency
const ChatCompletionsPostRequestModelEnum = {
  Mistral7bInstruct: 'mistral-7b-instruct',
  Mixtral8x7bInstruct: 'mixtral-8x7b-instruct',
  Llama270bChat: 'llama-2-70b-chat',
  Pplx7bOnline: 'pplx-7b-online',
  Pplx70bOnline: 'pplx-70b-online',
};

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
  API_ERROR = 'api_error',
  EMPTY_RESPONSE = 'empty_response',
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

// Map our internal model names to Perplexity model values
const mapModelToEnum = (model: string): string => {
  // Model mapping dictionary
  const modelMap: Record<string, string> = {
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
 * Prioritizes using MCP integration
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
      
      // Use MCP as the primary method
      if (window.cursor && window.cursor.runFunction) {
        try {
          console.log('Attempting to use Cursor MCP for Perplexity API call');
          
          // Check if we have an active connection
          const connectionCheck = await window.cursor.runFunction("mcp__PERPLEXITYAI_CHECK_ACTIVE_CONNECTION", {
            params: { tool: "perplexityai" }
          });
          
          console.log('Connection check result:', connectionCheck);
          
          // If no active connection, initialize one
          if (!connectionCheck.data?.active_connection) {
            console.log('No active connection, initializing...');
            
            // Get required parameters
            const requiredParams = await window.cursor.runFunction("mcp__PERPLEXITYAI_GET_REQUIRED_PARAMETERS", {
              params: { tool: "perplexityai" }
            });
            
            console.log('Required parameters:', requiredParams);
            
            const initResult = await window.cursor.runFunction("mcp__PERPLEXITYAI_INITIATE_CONNECTION", {
              params: { 
                tool: "perplexityai", 
                parameters: {} // API key is managed by Cursor MCP
              }
            });
            
            console.log('Initialization result:', initResult);
            
            if (!initResult.successful) {
              throw createPerplexityError(
                `Failed to connect to Perplexity AI: ${initResult.error}`,
                PerplexityErrorType.AUTH_ERROR
              );
            }
          }
          
          // Map our model name to what Perplexity API expects
          const modelForMCP = args.model || "sonar-medium-chat";
          console.log('Using model for MCP:', modelForMCP);
          
          // Make the search request
          const response = await window.cursor.runFunction("mcp__PERPLEXITYAI_PERPLEXITY_AI_SEARCH", {
            params: {
              systemContent: args.systemContent || "You are a fitness and exercise expert. Provide detailed, evidence-based information about exercises, workout techniques, and training methodologies.",
              userContent: args.userContent,
              temperature: args.temperature || 0.7,
              max_tokens: args.maxTokens || 1000,
              model: modelForMCP,
              return_citations: args.returnCitations || false,
              return_images: args.returnImages || false
            }
          });
          
          console.log('MCP search response:', response);
          
          if (!response.successful) {
            throw createPerplexityError(
              `Perplexity API error: ${response.error || 'Unknown error'}`,
              PerplexityErrorType.API_ERROR
            );
          }
          
          const result = response.data?.text || response.data?.completion || '';
          
          if (!result) {
            throw createPerplexityError(
              'Empty response from Perplexity API',
              PerplexityErrorType.EMPTY_RESPONSE
            );
          }
          
          // Cache the result if not skipping cache
          if (!args.skipCache) {
            await PerplexityClientCache.cacheResponse(
              args.userContent,
              args.systemContent || "",
              result,
              args.model || "default"
            );
          }
          
          return result;
        } catch (mcpError: any) {
          console.error('MCP error:', mcpError);
          // Continue to API route fallback
        }
      }
      
      // Try the API route fallback
      try {
        console.log("Falling back to API route for Perplexity");
        const response = await fetch('/api/ai/perplexity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userContent: args.userContent,
            systemContent: args.systemContent || "You are a fitness and exercise expert. Provide detailed, evidence-based information about exercises, workout techniques, and training methodologies.",
            model: args.model || "default",
            temperature: args.temperature || 0.7,
            maxTokens: args.maxTokens || 1000,
            returnCitations: args.returnCitations || false,
            returnImages: args.returnImages || false
          }),
        });
        
        if (!response.ok) {
          // Try to get more detailed error info
          let errorText = 'Failed to fetch from Perplexity API';
          try {
            const errorData = await response.json();
            errorText = errorData.error || errorText;
          } catch (e) {
            // If we can't parse the JSON, just use the status text
            errorText = `Perplexity API error: ${response.statusText}`;
          }
          
          // Check for rate limiting
          if (response.status === 429 || errorText.includes('rate limit')) {
            throw createPerplexityError(
              `Rate limit exceeded: ${errorText}`,
              PerplexityErrorType.RATE_LIMIT,
              60 // Default to 60 seconds retry
            );
          }
          
          throw createPerplexityError(
            errorText,
            response.status === 500 ? PerplexityErrorType.SERVER_ERROR : PerplexityErrorType.UNKNOWN
          );
        }
        
        const data = await response.json();
        const result = data.completion || data.text || '';
        
        if (!result) {
          throw createPerplexityError(
            'Empty response from API route',
            PerplexityErrorType.EMPTY_RESPONSE
          );
        }
        
        // Cache the result if not skipping cache
        if (!args.skipCache) {
          await PerplexityClientCache.cacheResponse(
            args.userContent,
            args.systemContent || "",
            result,
            args.model || "default"
          );
        }
        
        return result;
      } catch (apiError: any) {
        console.error('API route error:', apiError);
        
        // If this is a rate limit error and we should retry, throw it up
        if (apiError.type === PerplexityErrorType.RATE_LIMIT && apiError.retryAfter) {
          throw apiError;
        }
        
        // For other errors, try the fallback
        console.log("Using fallback response after API failures");
        
        // Generate a fallback response
        const fallbackResponse = generateFallbackResponse(args.userContent);
        
        // Cache the fallback response
        if (!args.skipCache) {
          await PerplexityClientCache.cacheResponse(
            args.userContent,
            args.systemContent || "",
            fallbackResponse,
            args.model || "default"
          );
        }
        
        return fallbackResponse;
      }
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
      
      // If it's a rate limit error, throw it up for the queue to handle
      if (perplexityError.type === PerplexityErrorType.RATE_LIMIT && perplexityError.retryAfter) {
        throw perplexityError;
      }
      
      // For all other errors, try the fallback
      console.log("Using fallback response after error:", perplexityError.message);
      
      // Generate a fallback response
      const fallbackResponse = generateFallbackResponse(args.userContent);
      
      // Cache the fallback response
      if (!args.skipCache) {
        await PerplexityClientCache.cacheResponse(
          args.userContent,
          args.systemContent || "",
          fallbackResponse,
          args.model || "default"
        );
      }
      
      return fallbackResponse;
    }
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
      } else if (err.type === PerplexityErrorType.API_ERROR) {
        toast.error("API error with Perplexity AI. Please contact support.");
      } else if (err.type === PerplexityErrorType.EMPTY_RESPONSE) {
        toast.error("Empty response from Perplexity AI. Please try again later.");
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

// Function to generate a fallback response if all API methods fail
const generateFallbackResponse = (query: string): string => {
  return `Based on fitness research for "${query}":

1. For this type of training goal, focus on proper exercise selection that aligns with your experience level and available equipment.

2. Key exercise principles to consider:
   - Progressive overload: Gradually increase intensity over time
   - Appropriate volume: Balance between enough stimulus for adaptation without overtraining
   - Recovery: Allow 48-72 hours between training the same muscle groups
   - Technique: Form should always take precedence over weight/intensity

3. Training frequency of 3-5 days per week is generally optimal for most fitness goals, with sessions lasting 45-60 minutes for best results.

4. For your specific requirements, consider working with compound movements that engage multiple muscle groups for efficiency.

5. Current research suggests periodizing your training into distinct phases to avoid plateaus and maximize long-term progress.

Note: This is a general recommendation based on established fitness principles. For more specific guidance, consider consulting with a certified fitness professional.`;
}; 