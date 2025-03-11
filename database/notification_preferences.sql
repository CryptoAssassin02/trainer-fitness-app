-- Create the notification_preferences table for tracking user notification settings
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_workout BOOLEAN NOT NULL DEFAULT true,
  email_progress BOOLEAN NOT NULL DEFAULT true,
  email_nutrition BOOLEAN NOT NULL DEFAULT false,
  push_workout BOOLEAN NOT NULL DEFAULT true,
  push_progress BOOLEAN NOT NULL DEFAULT false,
  push_nutrition BOOLEAN NOT NULL DEFAULT false,
  sms_workout BOOLEAN NOT NULL DEFAULT false,
  sms_progress BOOLEAN NOT NULL DEFAULT false,
  sms_nutrition BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Note: Drop existing policies first to avoid conflicts when re-running the script
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Service role has full access to notification preferences" ON public.notification_preferences;

-- Create policies for user access
CREATE POLICY "Users can view their own notification preferences" 
  ON public.notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" 
  ON public.notification_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
  ON public.notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to notification preferences" 
  ON public.notification_preferences FOR ALL 
  USING (auth.role() = 'service_role');

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_timestamp ON public.notification_preferences;

CREATE TRIGGER update_notification_preferences_timestamp
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at(); 