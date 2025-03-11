-- Create the notifications table for storing user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'progress', 'macro', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Note: Drop existing policies first to avoid conflicts when re-running the script
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role has full access to notifications" ON public.notifications;

-- Create policies for user access
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to notifications" 
  ON public.notifications FOR ALL 
  USING (auth.role() = 'service_role');

-- Create function to send a notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Validate notification type
  IF p_type NOT IN ('workout', 'progress', 'macro', 'system') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;
  
  -- Insert the notification
  INSERT INTO public.notifications(
    user_id,
    title,
    message,
    type,
    link
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_link
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$; 