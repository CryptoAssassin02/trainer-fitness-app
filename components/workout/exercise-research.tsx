"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, XCircle } from "lucide-react"
import { usePerplexity } from "@/hooks/use-perplexity"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ExerciseResearchProps {
  initialQuery?: string
  onResearchComplete?: (research: string) => void
  isCompact?: boolean
  skipCache?: boolean
}

// Function to generate a fallback response if the API fails
function generateFallbackResponse(query: string): string {
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

Note: This is a general recommendation. For more specific guidance, consider consulting with a certified fitness professional.`;
}

export function ExerciseResearch({
  initialQuery = "",
  onResearchComplete,
  isCompact = false,
  skipCache = false,
}: ExerciseResearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [research, setResearch] = useState("")
  const [isCached, setIsCached] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const { search, clearCache, isSearching, error } = usePerplexity()
  
  // Track if we've shown a rate limit toast to avoid duplicates
  const [hasShownRateLimitToast, setHasShownRateLimitToast] = useState(false)
  
  // Reset the rate limit toast flag when isSearching changes to false
  useEffect(() => {
    if (!isSearching) {
      setHasShownRateLimitToast(false)
    }
  }, [isSearching])

  // Use initial query if provided
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a research query first.")
      return
    }

    try {
      setIsFallback(false)
      // Start time to measure response time
      const startTime = performance.now()
      
      setIsCached(false) // Reset cached indicator
      const result = await search({
        userContent: query,
        systemContent: "You are an expert fitness researcher. Provide evidence-based information about exercises, training methodologies, and fitness approaches. Focus on scientific research, best practices, and safety considerations. Include citations to published research when available.",
        returnCitations: true,
        skipCache,
      })

      // Calculate response time
      const responseTime = performance.now() - startTime
      
      // If response is very fast, it's likely from cache
      if (responseTime < 100) {
        setIsCached(true)
      }

      setResearch(result)
      if (onResearchComplete) {
        onResearchComplete(result)
      }
    } catch (error: any) {
      console.error("Error in exercise research:", error);
      
      // Error handling is mostly done in the hook,
      // but we can add some UI-specific handling here
      if (error.message?.includes('rate limit') && !hasShownRateLimitToast) {
        toast.error("Rate limit exceeded. Your request has been queued and will be processed when possible.")
        setHasShownRateLimitToast(true)
      } else {
        toast.error("Error fetching research. Using fallback response instead.")
      }
      
      // Generate a fallback response to ensure users always get some content
      const fallbackResponse = generateFallbackResponse(query);
      setResearch(fallbackResponse);
      setIsFallback(true);
      
      if (onResearchComplete) {
        onResearchComplete(fallbackResponse);
      }
    }
  }
  
  const handleClearCache = () => {
    clearCache()
    setIsCached(false)
    setIsFallback(false)
  }

  if (isCompact) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Textarea
            placeholder="What exercise research are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="w-full md:w-auto h-full md:min-h-[80px]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Researching...
                </>
              ) : (
                "Research"
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearCache}
              title="Clear cache"
              className="h-full md:min-h-[80px] aspect-square"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {research && (
          <div className="rounded-md border p-4 relative">
            {isCached && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-sm">
                Cached
              </div>
            )}
            {isFallback && (
              <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-sm">
                Fallback
              </div>
            )}
            <pre className="whitespace-pre-wrap font-sans text-sm">{research}</pre>
          </div>
        )}
        {error && !isFallback && (
          <div className="rounded-md border border-destructive p-4 bg-destructive/10">
            <div className="flex items-center text-destructive mb-2">
              <XCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm">{error.message}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Research</CardTitle>
        <CardDescription>
          Use Perplexity AI to gather evidence-based exercise information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Textarea
            placeholder="What exercise research are you looking for? (e.g., 'Best exercises for beginners with lower back issues', 'Scientific research on training frequency for strength', etc.)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
            className="min-h-[120px]"
          />
          {research && (
            <div className="rounded-md border p-4 max-h-[400px] overflow-y-auto relative">
              {isCached && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-sm">
                  Cached
                </div>
              )}
              {isFallback && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-sm">
                  Fallback
                </div>
              )}
              <pre className="whitespace-pre-wrap font-sans text-sm">{research}</pre>
            </div>
          )}
          {error && !isFallback && (
            <div className="rounded-md border border-destructive p-4 bg-destructive/10">
              <div className="flex items-center text-destructive mb-2">
                <XCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm">{error.message}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleClearCache}
          disabled={isSearching}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Clear Cache
        </Button>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gathering Research...
            </>
          ) : (
            "Get Research"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 