# Perplexity AI Integration - trAIner Fitness App

## Overview

The trAIner fitness app integrates with Perplexity AI as a Managed Content Provider (MCP) to source research-based fitness information for generating personalized workout plans. Perplexity AI serves as a knowledge retrieval system that fetches evidence-based exercises, training methodologies, and fitness approaches from scientific and reputable sources.

This document outlines the implementation details, usage guidelines, and best practices for working with the Perplexity AI integration.

## Implementation Architecture

### Server-Side Integration

The server-side integration uses the Perplexity AI API to fetch research data that informs workout plan generation. It's primarily used in the workout generation API route.

Key files:
- `/utils/ai/perplexity.ts` - Core utility functions for interacting with Perplexity AI
- `/app/api/ai/perplexity/route.ts` - API endpoint for Perplexity AI requests
- `/utils/ai/perplexity-cache.ts` - Server-side caching and rate limiting
- `/app/api/workout/generate/route.ts` - API endpoint that uses Perplexity AI for workout plan generation

### Client-Side Integration

The client-side integration provides a React hook and components for direct interaction with Perplexity AI, allowing users to:
- Research exercises and fitness approaches
- Get evidence-based information about training techniques
- Find scientific support for workout methodologies

Key files:
- `/hooks/use-perplexity.ts` - React hook for using Perplexity AI in client components
- `/utils/ai/perplexity-client-cache.ts` - Client-side caching utilities
- `/components/workout/exercise-research.tsx` - Component for researching exercises

## Using Perplexity AI in Your Code

### Server-Side Usage

```typescript
import { getExerciseResearch } from '@/utils/ai/perplexity';

// Example usage in an API route
export async function POST(req: Request) {
  const { query } = await req.json();
  
  const researchResult = await getExerciseResearch({
    userContent: query,
    maxTokens: 1500
  });
  
  // Use the research result
  return Response.json({ result: researchResult });
}
```

### Client-Side Usage

```typescript
import { usePerplexity } from '@/hooks/use-perplexity';

// Example usage in a React component
function ExerciseSearchComponent() {
  const { search, isSearching, error, clearCache } = usePerplexity();
  
  const handleSearch = async () => {
    try {
      const result = await search({
        userContent: "Best exercises for beginners with lower back issues",
        returnCitations: true,
        skipCache: false // Use cache if available
      });
      
      // Use the search result
      console.log(result);
    } catch (error) {
      // Handle any errors
    }
  };
  
  return (
    <div>
      <button onClick={handleSearch} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search'}
      </button>
      <button onClick={clearCache}>Clear Cache</button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

Or use the pre-built component:

```typescript
import { ExerciseResearch } from "@/components/workout/exercise-research";

function WorkoutPlanForm() {
  const handleResearchComplete = (research) => {
    // Use the research data
    console.log(research);
  };
  
  return (
    <div>
      <ExerciseResearch 
        onResearchComplete={handleResearchComplete}
        skipCache={false} // Use cache by default
      />
    </div>
  );
}
```

## Caching System

The integration includes a sophisticated caching system to improve performance and reduce API costs:

### Server-Side Caching
- Uses Supabase to store query results in the `perplexity_cache` table
- Queries are hashed based on content, system instructions, and model
- Cache expiration is set to 7 days by default
- Access counts are tracked to identify popular queries

### Client-Side Caching
- Uses localStorage for temporary client-side caching
- Provides immediate response for repeated queries
- Limited to 50 cached responses (LRU eviction)
- Expiration set to 24 hours

### Cache Invalidation
- Automatic cleanup of unused cache entries
- Manual cache clearing through the UI
- Option to skip cache for time-sensitive queries

## Rate Limiting

The integration implements comprehensive rate limiting to prevent hitting API quotas:

### Server-Side Rate Limiting
- Tracks and enforces per-minute and daily rate limits
- Configurable limits stored in the `perplexity_rate_limits` table
- Implements exponential backoff for retries
- Returns proper HTTP 429 status codes with Retry-After headers

### Client-Side Queue Management
- Queues requests when rate limits are hit
- Manages retries with backoff
- Provides user feedback about queued status

## Error Handling

Robust error handling is implemented throughout the integration:

### Error Types
- Rate limiting errors (both from our system and Perplexity's API)
- Network/timeout errors with automatic retries
- Authentication/authorization errors
- Server errors with graceful fallbacks
- Unknown errors with helpful messages

### Recovery Strategies
- Automatic retries for transient errors
- Exponential backoff to prevent overwhelming systems
- Fallback to development mode with simulated responses when needed
- Clear user feedback through toast notifications

## Analytics

The integration tracks usage patterns to optimize performance:

### Query Analytics
- Stores query data in the `perplexity_analytics` table
- Tracks success/failure rates, response times, and cache hits
- Associates analytics with users when authenticated
- Provides data for future optimization

### Privacy Considerations
- Respects user privacy by only allowing users to see their own analytics
- Service role has access to aggregated analytics for system optimization

## Database Schema

The integration requires three tables in the Supabase database:

```sql
-- Perplexity Cache Table
CREATE TABLE IF NOT EXISTS public.perplexity_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL UNIQUE,
  query TEXT NOT NULL,
  system_content TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 1,
  model TEXT
);

-- Perplexity Analytics Table
CREATE TABLE IF NOT EXISTS public.perplexity_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  system_content TEXT,
  model TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  response_time_ms INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cached BOOLEAN DEFAULT FALSE
);

-- Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.perplexity_rate_limits (
  id TEXT PRIMARY KEY DEFAULT 'default',
  requests_per_minute INTEGER NOT NULL DEFAULT 10,
  requests_per_day INTEGER NOT NULL DEFAULT 1000,
  last_reset_minute TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_reset_day TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_minute_count INTEGER DEFAULT 0,
  current_day_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

See the full SQL setup in `/database/perplexity_tables.sql`.

## Advanced Usage

### Skipping Cache

For time-sensitive queries, you can skip the cache:

```typescript
const { search } = usePerplexity();

const result = await search({
  userContent: "Latest research on protein timing",
  skipCache: true  // Force a fresh result
});
```

### Clearing Cache

Users can manually clear their client-side cache:

```typescript
const { clearCache } = usePerplexity();

// Clear all cached responses
clearCache();
```

### Custom Error Handling

The hook provides detailed error information:

```typescript
try {
  const result = await search({ userContent: "My query" });
} catch (error) {
  if (error.type === 'rate_limit') {
    console.log(`Rate limited, retry after ${error.retryAfter} seconds`);
  }
}
```

## Cursor MCP Integration

The integration uses Cursor's Managed Content Provider (MCP) system to interact with Perplexity AI. This is implemented through function calls to the `window.cursor.runFunction` API.

MCP functions used:
- `mcp__PERPLEXITYAI_CHECK_ACTIVE_CONNECTION` - Check if a connection to Perplexity AI is active
- `mcp__PERPLEXITYAI_INITIATE_CONNECTION` - Initiate a connection to Perplexity AI
- `mcp__PERPLEXITYAI_PERPLEXITY_AI_SEARCH` - Perform a search using Perplexity AI

> **Note:** For development purposes, the actual MCP calls are commented out in the code and replaced with simulated responses. To use the real Perplexity AI service, uncomment the MCP implementation in both client and server code.

## Configuration and Environment Variables

To enable the Perplexity AI integration:

1. Ensure you have a Perplexity API key.
2. Set the following environment variable:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```
3. Run the database setup script in `/database/perplexity_tables.sql` to create the required tables.

## Development vs. Production

Currently, the integration includes two implementations:

1. **Development Mode**: Simulated responses are provided to facilitate development without API rate limits.
2. **Production Mode**: Uses the actual Perplexity AI MCP integration.

In production code, uncomment the MCP implementation in:
- `/utils/ai/perplexity.ts`
- `/hooks/use-perplexity.ts`

## Best Practices

1. **Rate Limiting and Caching**:
   - Leverage the built-in caching for common queries
   - Monitor usage analytics to adjust rate limits if needed
   - Use `skipCache: true` only when necessary

2. **Query Construction**:
   - Make queries specific and goal-oriented
   - Include relevant context like fitness level, equipment availability, etc.
   - Keep queries focused on a single topic for better results

3. **Error Handling**:
   - Implement UI feedback for rate-limited requests
   - Provide fallback information when API requests fail
   - Log errors for debugging and improvement

4. **Performance Optimization**:
   - Pre-cache common queries during app initialization
   - Use the compact view for mobile devices
   - Consider implementing a worker for background processing

## Troubleshooting

Common issues and solutions:

1. **Connection Errors**:
   - Check that your API key is valid in `.env`
   - Ensure the Supabase tables are properly created
   - Verify network connectivity

2. **Rate Limiting**:
   - Adjust the rate limits in the `perplexity_rate_limits` table
   - Monitor the analytics table for patterns of high usage
   - Use client-side caching to reduce API calls

3. **Response Formatting**:
   - Use the systemContent parameter to guide response formatting
   - Implement post-processing for consistent display

## Future Enhancements

Planned improvements for the Perplexity AI integration:

1. **Citation Enhancement**: Improved parsing and displaying of research citations
2. **Response Streaming**: Real-time streaming of research results
3. **Advanced Filtering**: Custom filters for specific training methodologies or exercise types
4. **Semantic Search**: Better contextual understanding of fitness queries
5. **Personalization**: Using user history to improve research relevance 
6. **Analytics Dashboard**: Visual interface for monitoring usage patterns 