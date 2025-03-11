-- Create the nutrition_macros table for tracking user macronutrient data
CREATE TABLE IF NOT EXISTS public.nutrition_macros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  goal TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nutrition_macros_user_id ON public.nutrition_macros(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_macros_is_active ON public.nutrition_macros(is_active);

-- Enable Row Level Security
ALTER TABLE public.nutrition_macros ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Note: Drop existing policies first to avoid conflicts when re-running the script
DROP POLICY IF EXISTS "Users can view their own macros" ON public.nutrition_macros;
DROP POLICY IF EXISTS "Users can insert their own macros" ON public.nutrition_macros;
DROP POLICY IF EXISTS "Users can update their own macros" ON public.nutrition_macros;
DROP POLICY IF EXISTS "Users can delete their own macros" ON public.nutrition_macros;
DROP POLICY IF EXISTS "Service role has full access" ON public.nutrition_macros;

-- Create policies for user access
CREATE POLICY "Users can view their own macros" 
  ON public.nutrition_macros FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own macros" 
  ON public.nutrition_macros FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own macros" 
  ON public.nutrition_macros FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own macros" 
  ON public.nutrition_macros FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access" 
  ON public.nutrition_macros FOR ALL 
  USING (auth.role() = 'service_role');

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_nutrition_macros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_nutrition_macros_timestamp ON public.nutrition_macros;

CREATE TRIGGER update_nutrition_macros_timestamp
BEFORE UPDATE ON public.nutrition_macros
FOR EACH ROW
EXECUTE FUNCTION update_nutrition_macros_updated_at();

-- Ensure only one active macro set per user
CREATE OR REPLACE FUNCTION handle_nutrition_macros_is_active()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.nutrition_macros
    SET is_active = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_single_active_macros ON public.nutrition_macros;

CREATE TRIGGER ensure_single_active_macros
BEFORE INSERT OR UPDATE ON public.nutrition_macros
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION handle_nutrition_macros_is_active(); 