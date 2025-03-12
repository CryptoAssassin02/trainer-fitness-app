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
// Define model enum directly to avoid package dependency issues
const ChatCompletionsPostRequestModelEnum = {
  Mistral7bInstruct: 'mistral-7b-instruct',
  Mixtral8x7bInstruct: 'mixtral-8x7b-instruct',
  Llama270bChat: 'llama-2-70b-chat',
  Pplx7bOnline: 'pplx-7b-online',
  Pplx70bOnline: 'pplx-70b-online',
};

// Maximum number of retries for rate limited requests
const MAX_RETRIES = 3;

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

// Function to make direct API calls to Perplexity
async function callPerplexityAPI(apiKey: string, messages: any[], modelName: string, temperature: number, maxTokens: number) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature,
      max_tokens: maxTokens
    })
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
    
    const error: any = new Error(`Perplexity API error: ${responseText}`);
    error.status = status;
    error.headers = response.headers;
    throw error;
  }

  return await response.json();
}

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
        
        // Map to appropriate model name
        const modelName = mapModelToEnum(model);
        
        // Call the Perplexity API directly
        const perplexityResponse = await callPerplexityAPI(
          apiKey,
          messages,
          modelName,
          temperature,
          maxTokens
        );
        
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
          
          // Wait based on retry-after header or default backoff
          logger.info(`Perplexity API rate limit, retry ${retries + 1}/${MAX_RETRIES} after ${retryMs}ms`);
          await sleep(retryMs);
          retries++;
          continue;
        }
        
        // For other errors, throw to be handled by the catch block
        throw error;
      }
    }
    
    // If we reached here with no result, we exhausted retries
    if (!result) {
      const errorMessage = `Failed to get response after ${MAX_RETRIES} retries`;
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
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    
    // Extract the actual content from the response
    const content = result.choices[0].message.content;
    
    // Cache the successful response
    await cacheResponse(queryHash, userContent, systemContent || "", content, model);
    
    // Record analytics for successful response
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
    
    // Return the response - ensure we use the 'text' field for consistency with client expectations
    return NextResponse.json({ text: content });
    
  } catch (error: any) {
    logger.error('Perplexity API route error:', error);
    
    // Provide a user-friendly error message
    let errorMessage = "An error occurred while processing your request";
    let statusCode = 500;
    
    if (error.status === 429 || (error.message && error.message.includes('rate limit'))) {
      errorMessage = "Rate limit exceeded. Please try again later.";
      statusCode = 429;
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = "Authentication error with AI service. Please contact support.";
      statusCode = 403;
    } else if (error.message) {
      // For development, include the actual error message
      if (process.env.NODE_ENV === "development") {
        errorMessage = `Error processing request: ${error.message}`;
      }
    }
    
    // Try to record analytics but don't let it block the response
    try {
      const responseTime = Date.now() - startTime;
      await recordAnalytics(
        userId,
        "", // We don't know the userContent at this point
        null, // We don't know the systemContent
        "unknown", // We don't know the model
        false,
        responseTime,
        error.message || "Unknown error",
        false
      );
    } catch (analyticsError) {
      logger.error('Failed to record analytics for error:', analyticsError);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 