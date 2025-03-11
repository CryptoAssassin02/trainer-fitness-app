import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { 
  checkCache, 
  cacheResponse, 
  createQueryHash, 
  checkRateLimit, 
  sleep, 
  calculateBackoff,
  recordAnalytics
} from "@/utils/ai/perplexity-cache"
import { logger } from "@/utils/logger"
import Perplexity, { ChatCompletionsPostRequestModelEnum } from 'perplexity-sdk'

// Maximum number of retries for rate limited requests
const MAX_RETRIES = 3;

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
 * Perplexity AI API route handler
 * Implements caching, rate limiting, and error handling
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  let userId: string | null = null;
  
  try {
    // Get authenticated user if available
    const session = await auth();
    userId = session?.userId || null;
    
    // Parse request body
    const {
      userContent,
      systemContent,
      model = "sonar-medium-chat",
      temperature = 0.7,
      maxTokens = 1000,
      returnCitations = false,
      returnImages = false,
    } = await req.json();
    
    logger.info('Perplexity API route called', { 
      userContent: userContent.substring(0, 100) + (userContent.length > 100 ? '...' : ''),
      model 
    });
    
    // Create a hash for caching
    const queryHash = createQueryHash(userContent, systemContent || "", model);
    
    // Check cache first
    const cachedResult = await checkCache(queryHash);
    if (cachedResult.cached && cachedResult.response) {
      logger.info('Returning cached response', { queryHash });
      
      // Record analytics for cached response
      const responseTime = Date.now() - startTime;
      await recordAnalytics(
        userId,
        userContent,
        systemContent || null,
        model,
        true,
        responseTime,
        null,
        true // cached = true
      );
      
      return NextResponse.json({ text: cachedResult.response });
    }
    
    // For development, we'll simulate a response if no API key
    if (process.env.NODE_ENV === "development" && !process.env.PERPLEXITY_API_KEY) {
      logger.info('Using simulated response (no API key in development)');
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a simulated response
      const simulatedResponse = `Here's some research on ${userContent}:\n\n` +
              "The best approach for this exercise is to focus on proper form and controlled movements. " +
              "Studies have shown that progressive overload is key to muscle development, but it's equally " +
              "important to maintain proper technique to prevent injuries.\n\n" +
              "When incorporating this into your routine, aim for 3-4 sets of 8-12 repetitions for hypertrophy " +
              "or 4-6 sets of 3-5 repetitions for strength development.\n\n" +
              "Remember to allow adequate recovery time between training sessions targeting the same muscle groups.";
      
      // Cache the simulated response
      await cacheResponse(queryHash, userContent, systemContent || "", simulatedResponse, model);
      
      // Record analytics
      const responseTime = Date.now() - startTime;
      await recordAnalytics(
        userId,
        userContent,
        systemContent || null,
        model,
        true,
        responseTime,
        null,
        false
      );
      
      return NextResponse.json({ text: simulatedResponse });
    }
    
    // Check for API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      const errorMessage = "Perplexity API key is not configured";
      logger.error(errorMessage);
      
      // Record analytics for error
      const responseTime = Date.now() - startTime;
      await recordAnalytics(
        userId,
        userContent,
        systemContent || null,
        model,
        false,
        responseTime,
        errorMessage,
        false
      );
      
      throw new Error(errorMessage);
    }
    
    // Rate limiting with retries
    let retries = 0;
    let result;
    
    while (retries <= MAX_RETRIES) {
      // Check rate limits
      const rateLimitCheck = await checkRateLimit();
      if (!rateLimitCheck.allowed) {
        if (retries >= MAX_RETRIES) {
          const errorMessage = `Rate limit exceeded. Please try again later. (${rateLimitCheck.limitType} limit)`;
          logger.warn(errorMessage);
          
          // Record analytics for rate limit error
          const responseTime = Date.now() - startTime;
          await recordAnalytics(
            userId,
            userContent,
            systemContent || null,
            model,
            false,
            responseTime,
            errorMessage,
            false
          );
          
          return NextResponse.json(
            { error: errorMessage },
            { 
              status: 429,
              headers: {
                'Retry-After': Math.ceil((rateLimitCheck.retryAfterMs || 60000) / 1000).toString()
              }
            }
          );
        }
        
        // Calculate backoff time with exponential backoff strategy
        const backoffTime = calculateBackoff(retries + 1);
        logger.info(`Rate limited, retry ${retries + 1}/${MAX_RETRIES} after ${backoffTime}ms`);
        
        // Wait before retrying
        await sleep(backoffTime);
        retries++;
        continue;
      }
      
      // Make actual API call to Perplexity AI
      logger.info('Making request to Perplexity API', { model, maxTokens });
      
      try {
        // Use Perplexity SDK instead of direct API call
        const perplexity = new Perplexity({ apiKey }).client();
        
        // Map our internal model names to Perplexity SDK model enum values
        const modelEnum = mapModelToEnum(model);
        
        // Format messages for the API
        const messages = [
          {
            role: "system",
            content: systemContent || "You are a fitness and exercise expert. Provide detailed, evidence-based information about exercises, workout techniques, and training methodologies."
          },
          {
            role: "user",
            content: userContent
          }
        ];
        
        // Make the request using the SDK
        const perplexityResponse = await perplexity.chatCompletionsPost({
          model: modelEnum,
          messages,
          temperature,
          maxTokens
        });
        
        // Parse the response
        result = perplexityResponse;
        break;
      } catch (error: any) {
        logger.error('Perplexity API error:', error);
        
        // Handle specific error types
        if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
          // Rate limiting error from Perplexity API itself
          const retryAfter = error.headers?.get('retry-after');
          const retryMs = retryAfter ? parseInt(retryAfter) * 1000 : calculateBackoff(retries + 1);
          
          if (retries >= MAX_RETRIES) {
            // Record analytics for rate limit error
            const responseTime = Date.now() - startTime;
            await recordAnalytics(
              userId,
              userContent,
              systemContent || null,
              model,
              false,
              responseTime,
              `Perplexity API rate limit exceeded after ${MAX_RETRIES} retries`,
              false
            );
            
            return NextResponse.json(
              { error: `Rate limit from Perplexity API. Please try again later.` },
              { status: 429, headers: { 'Retry-After': retryAfter?.toString() || '60' } }
            );
          }
          
          logger.info(`API rate limited, retry ${retries + 1}/${MAX_RETRIES} after ${retryMs}ms`);
          await sleep(retryMs);
          retries++;
          continue;
        } else if (error.status >= 500) {
          // Server error, retry with backoff
          if (retries >= MAX_RETRIES) {
            // Record analytics for server error
            const responseTime = Date.now() - startTime;
            await recordAnalytics(
              userId,
              userContent,
              systemContent || null,
              model,
              false,
              responseTime,
              `Perplexity API server error after ${MAX_RETRIES} retries: ${error.status}`,
              false
            );
            
            return NextResponse.json(
              { error: `Perplexity API server error. Please try again later.` },
              { status: 503 }
            );
          }
          
          const backoffTime = calculateBackoff(retries + 1);
          logger.info(`API server error ${error.status}, retry ${retries + 1}/${MAX_RETRIES} after ${backoffTime}ms`);
          await sleep(backoffTime);
          retries++;
          continue;
        } else if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message.includes('timeout')) {
          // Network timeout, retry with backoff
          if (retries >= MAX_RETRIES) {
            logger.error(`Request timed out after ${MAX_RETRIES} retries`);
            
            // Record analytics for timeout
            const responseTime = Date.now() - startTime;
            await recordAnalytics(
              userId,
              userContent,
              systemContent || null,
              model,
              false,
              responseTime,
              `Request timed out after ${MAX_RETRIES} retries`,
              false
            );
            
            return NextResponse.json(
              { error: "Request timed out. Please try again later." },
              { status: 504 }
            );
          }
          
          const backoffTime = calculateBackoff(retries + 1);
          logger.info(`Request timed out, retry ${retries + 1}/${MAX_RETRIES} after ${backoffTime}ms`);
          await sleep(backoffTime);
          retries++;
          continue;
        } else {
          // Other errors, don't retry
          // Record analytics for unhandled error
          const responseTime = Date.now() - startTime;
          await recordAnalytics(
            userId,
            userContent,
            systemContent || null,
            model,
            false,
            responseTime,
            `Perplexity API error: ${error.status || 500} - ${error.message || 'Unknown error'}`,
            false
          );
          
          throw error;
        }
      }
    }
    
    if (!result) {
      throw new Error("Failed to get a response after retries");
    }
    
    logger.info('Perplexity API response received successfully');
    
    // Parse the response content
    const content = result?.choices?.[0]?.message?.content || "";
    
    // Cache the successful response
    await cacheResponse(queryHash, userContent, systemContent || "", content, model);
    
    // Record analytics for successful request
    const responseTime = Date.now() - startTime;
    await recordAnalytics(
      userId,
      userContent,
      systemContent || null,
      model,
      true,
      responseTime,
      null,
      false
    );
    
    // Return the response
    return NextResponse.json({
      text: content,
      citations: returnCitations ? extractCitations(result) : [],
      images: returnImages ? [] : [] // SDK doesn't support images yet
    });
  } catch (error: any) {
    logger.error("Error calling Perplexity AI:", error);
    
    // Record analytics for unhandled error
    const responseTime = Date.now() - startTime;
    await recordAnalytics(
      userId,
      "error", // We don't have the query if JSON parsing failed
      null,
      null,
      false,
      responseTime,
      error.message || "Unknown error",
      false
    );
    
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

// Helper to extract citations from the response
function extractCitations(result: any): any[] {
  try {
    // Different models might return citations in different formats
    // Try to handle the common patterns
    const message = result?.choices?.[0]?.message;
    
    if (message?.citation_metadata?.citations) {
      return message.citation_metadata.citations;
    }
    
    if (message?.tool_calls) {
      // Some API versions return citations as tool calls
      return message.tool_calls
        .filter((call: any) => call.function?.name === 'citations')
        .map((call: any) => {
          try {
            return JSON.parse(call.function.arguments || '{}');
          } catch (e) {
            return [];
          }
        })
        .flat();
    }
    
    return [];
  } catch (error) {
    logger.error('Error extracting citations:', error);
    return [];
  }
} 