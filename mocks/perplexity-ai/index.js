// Mock implementation of perplexity-ai
// This simulates the API with realistic responses

/**
 * Mock search function that returns simulated Perplexity AI results
 * @param {Object} options - Search options
 * @param {string} options.userContent - The user's search query
 * @param {string} options.systemContent - System instructions for the AI
 * @param {boolean} options.returnCitations - Whether to include citations in the response
 * @param {boolean} options.skipCache - Whether to skip cached results
 * @returns {Promise<Object>} - The search results
 */
async function search(options = {}) {
  const { 
    userContent = "",
    systemContent = "You are a helpful AI assistant.", 
    returnCitations = false,
    skipCache = false
  } = options;
  
  console.log('[MOCK] Perplexity search called with:', options);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For fitness-related queries, return appropriate mock data
  if (userContent.toLowerCase().includes('workout') || 
      userContent.toLowerCase().includes('exercise') || 
      userContent.toLowerCase().includes('fitness')) {
    return {
      answer: "Based on current research, an effective workout plan should incorporate both strength training and cardiovascular exercise. For beginners, 3-4 workout sessions per week is ideal, with 48 hours of rest between training the same muscle groups.",
      citations: returnCitations ? [
        { title: "American College of Sports Medicine Guidelines", url: "https://www.acsm.org/guidelines" },
        { title: "Journal of Strength and Conditioning Research", url: "https://journals.lww.com/nsca-jscr" }
      ] : [],
      cached: !skipCache,
      runtimeMs: 842
    };
  }
  
  // Default response for other queries
  return {
    answer: "I'm a mock implementation of the Perplexity AI. Your query was: " + userContent,
    citations: returnCitations ? [
      { title: "Mock Citation 1", url: "https://example.com/1" },
      { title: "Mock Citation 2", url: "https://example.com/2" }
    ] : [],
    cached: !skipCache,
    runtimeMs: 634
  };
}

module.exports = {
  search,
  // Add any other methods that the real package might have
  clearCache: () => console.log('[MOCK] Perplexity cache cleared'),
  getStats: () => ({
    totalQueries: 53,
    cacheHits: 28,
    cacheMisses: 25,
    avgResponseTime: 721
  })
};
