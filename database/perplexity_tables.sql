-- Create the pg_cron extension for potential future use
CREATE EXTENSION IF NOT EXISTS pg_cron;

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
  model TEXT,
  CONSTRAINT valid_hash CHECK (length(query_hash) > 0)
);

-- Create index on query_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_perplexity_cache_query_hash ON public.perplexity_cache(query_hash);

-- Add permissions for authenticated users
ALTER TABLE public.perplexity_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow service role full access" ON public.perplexity_cache;
DROP POLICY IF EXISTS "Allow authenticated users to read cache" ON public.perplexity_cache;

-- Only allow the service role and authenticated users to read from cache
CREATE POLICY "Allow service role full access" ON public.perplexity_cache 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow authenticated users to read cache" ON public.perplexity_cache 
  FOR SELECT USING (auth.role() = 'authenticated');

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

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_perplexity_analytics_user_id ON public.perplexity_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_perplexity_analytics_timestamp ON public.perplexity_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_perplexity_analytics_success ON public.perplexity_analytics(success);

-- Add permissions for authenticated users
ALTER TABLE public.perplexity_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow service role full access" ON public.perplexity_analytics;
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.perplexity_analytics;

-- Only allow the service role full access and users to read their own data
CREATE POLICY "Allow service role full access" ON public.perplexity_analytics 
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow users to read their own data" ON public.perplexity_analytics 
  FOR SELECT USING (auth.uid() = user_id);

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

-- Add permissions for rate limits
ALTER TABLE public.perplexity_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow service role full access" ON public.perplexity_rate_limits;

-- Only allow the service role to manage rate limits
CREATE POLICY "Allow service role full access" ON public.perplexity_rate_limits 
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to clean expired cache entries (but don't schedule it)
-- This can be run manually when needed to free up space
CREATE OR REPLACE FUNCTION clean_expired_perplexity_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete entries that are older than 7 days AND haven't been accessed in 3 days
  -- This preserves frequently accessed entries regardless of age
  DELETE FROM public.perplexity_cache
  WHERE 
    created_at < NOW() - INTERVAL '7 days' AND
    last_accessed < NOW() - INTERVAL '3 days';
    
  -- Log the cleanup
  RAISE NOTICE 'Perplexity cache cleanup completed';
END;
$$;

-- NOTE: No automatic cleanup is scheduled to preserve cache entries
-- To manually clean the cache, run: SELECT clean_expired_perplexity_cache();
-- Example of how to schedule if needed in the future (commented out):
-- SELECT cron.schedule('clean-perplexity-cache', '0 3 * * *', 'SELECT clean_expired_perplexity_cache()'); 