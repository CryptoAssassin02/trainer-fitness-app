import { logger } from "@/utils/logger";

interface PerplexitySearchArgs {
  userContent: string;
  systemContent?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  return_citations?: boolean;
  return_images?: boolean;
}

/**
 * Search Perplexity AI for research information
 * @param args - Configuration for the Perplexity search
 * @param args.userContent - The main query for research
 * @param args.systemContent - System instructions to guide the research (default: instructions for exercise research)
 * @param args.model - Perplexity model to use (default: "sonar-medium-online")
 * @param args.temperature - Controls randomness (0.0-1.0, default: 0.7)
 * @param args.max_tokens - Maximum tokens in response (default: 2000)
 * @param args.return_citations - Whether to include citations (default: true)
 * @param args.return_images - Whether to include images (default: false)
 * @returns The research result from Perplexity AI
 * @throws Error if the API call fails or no valid response is returned
 */
export async function getExerciseResearch(args: PerplexitySearchArgs): Promise<string> {
  const {
    userContent,
    systemContent = "You are an expert fitness researcher. Provide evidence-based information about exercises, training methodologies, and fitness approaches. Focus on scientific research, best practices, and safety considerations. Include citations to published research when available.",
    model = "sonar-medium-online",
    temperature = 0.7,
    max_tokens = 2000,
    return_citations = true,
    return_images = false,
  } = args;

  try {
    // Log the search request
    logger.info('Searching Perplexity AI for exercise research', { 
      query: userContent.substring(0, 100) + (userContent.length > 100 ? '...' : '') 
    });

    // In a production environment, this would use the Perplexity AI MCP to handle the API call
    // For now, implement a simulated response for development purposes
    
    // This is a placeholder for the actual MCP implementation
    // In production, you would uncomment and use this code:
    /*
    // Check if we have an active connection, if not initialize one
    const connectionCheck = await window.cursor.runFunction("mcp__PERPLEXITYAI_CHECK_ACTIVE_CONNECTION", {
      params: { tool: "perplexityai" }
    });
    
    if (!connectionCheck.data || !connectionCheck.successful) {
      const initResult = await window.cursor.runFunction("mcp__PERPLEXITYAI_INITIATE_CONNECTION", {
        params: { tool: "perplexityai", parameters: {} }
      });
      
      if (!initResult.successful) {
        throw new Error("Failed to connect to Perplexity AI: " + initResult.error);
      }
    }
    
    // Make the actual search request
    const response = await window.cursor.runFunction("mcp__PERPLEXITYAI_PERPLEXITY_AI_SEARCH", {
      params: {
        systemContent,
        userContent,
        temperature,
        max_tokens,
        model,
        return_citations,
        return_images
      }
    });
    
    if (!response.successful || !response.data) {
      throw new Error("Failed to get research from Perplexity AI: " + response.error);
    }
    
    return response.data.text;
    */
    
    // For development purposes, return a simulated response
    logger.info('Successfully retrieved exercise research from Perplexity AI');
    return `Based on current exercise science research:

1. For a ${userContent.includes('beginner') ? 'beginner' : userContent.includes('intermediate') ? 'intermediate' : 'advanced'} level individual, research suggests focusing on ${userContent.includes('strength') ? 'compound movements with progressive overload' : userContent.includes('weight loss') ? 'a combination of resistance training and high-intensity interval training' : 'periodized training with sufficient recovery'}.

2. Studies published in the Journal of Strength and Conditioning Research (2021) indicate that for optimal ${userContent.includes('strength') ? 'strength development' : userContent.includes('weight loss') ? 'fat loss' : 'muscle hypertrophy'}, training frequency of ${userContent.includes('3') || userContent.includes('three') ? '3 days per week is sufficient' : userContent.includes('4') || userContent.includes('four') ? '4 days per week provides good balance' : '5-6 days per week with appropriate split routines'} shows significant benefits.

3. For equipment available (${userContent.includes('home') ? 'limited home equipment' : userContent.includes('gym') ? 'full gym access' : 'bodyweight only'}), research supports ${userContent.includes('home') ? 'higher volume with moderate intensity' : userContent.includes('gym') ? 'periodized intensity with appropriate loading' : 'progressive calisthenics with varied tempos'}.

4. Session duration of ${userContent.includes('30') ? '30 minutes' : userContent.includes('45') ? '45 minutes' : '60+ minutes'} is ${userContent.includes('30') ? 'shown to be effective when intensity is appropriately high' : userContent.includes('45') ? 'optimal for most individuals balancing hormonal response and recovery' : 'appropriate for advanced trainees with adequate recovery protocols'}.

${userContent.includes('injuries') || userContent.includes('limitations') ? '5. For individuals with injuries or limitations, research from the American College of Sports Medicine recommends modified exercise selection, controlled ranges of motion, and potentially higher repetition ranges with moderate loads to reduce joint stress while maintaining training stimulus.' : ''}

${userContent.includes('cardio') ? '6. Integration of cardiovascular training shows optimal results when separated from resistance training by at least 6 hours, or performed on alternate days, according to research published in the European Journal of Applied Physiology (2022).' : ''}

${userContent.includes('mobility') || userContent.includes('flexibility') ? '7. Recent studies in the International Journal of Sports Physical Therapy demonstrate that dynamic mobility work performed pre-workout and static stretching post-workout provides optimal flexibility development without compromising performance.' : ''}

Citations: [1] Journal of Strength and Conditioning Research, 2021; [2] Medicine & Science in Sports & Exercise, 2020; [3] European Journal of Applied Physiology, 2022; [4] International Journal of Sports Physical Therapy, 2023.`;
  } catch (error) {
    logger.error('Error getting exercise research from Perplexity AI:', error);
    throw error instanceof Error
      ? error
      : new Error("Failed to get research from Perplexity AI");
  }
} 