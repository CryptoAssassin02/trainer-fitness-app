-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  height FLOAT,
  weight FLOAT,
  age INTEGER,
  gender TEXT,
  unit_system TEXT DEFAULT 'imperial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for workout plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  equipment TEXT NOT NULL,
  days_per_week INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  preferences TEXT,
  injuries TEXT,
  include_cardio BOOLEAN DEFAULT TRUE,
  include_mobility BOOLEAN DEFAULT FALSE,
  plan_content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for workout days
CREATE TABLE IF NOT EXISTS workout_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  exercises_count INTEGER NOT NULL,
  duration TEXT NOT NULL,
  intensity TEXT NOT NULL,
  is_rest_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_day_id UUID REFERENCES workout_days(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  rest_period TEXT,
  technique_notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for progress check-ins
CREATE TABLE IF NOT EXISTS progress_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  weight FLOAT NOT NULL,
  body_fat FLOAT,
  chest FLOAT,
  waist FLOAT,
  arms FLOAT,
  legs FLOAT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for nutrition macros
CREATE TABLE IF NOT EXISTS nutrition_macros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  goal TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email_workout BOOLEAN DEFAULT TRUE,
  email_progress BOOLEAN DEFAULT TRUE,
  email_nutrition BOOLEAN DEFAULT FALSE,
  push_workout BOOLEAN DEFAULT TRUE,
  push_progress BOOLEAN DEFAULT FALSE,
  push_nutrition BOOLEAN DEFAULT FALSE,
  sms_workout BOOLEAN DEFAULT FALSE,
  sms_progress BOOLEAN DEFAULT FALSE,
  sms_nutrition BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) policies
-- Profiles: Users can only view and update their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workout Plans: Users can only view and modify their own workout plans
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout plans"
  ON workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Apply RLS policies to other tables
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create workout_days policies
CREATE POLICY "Users can view own workout days"
  ON workout_days FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workout_plans wp 
    WHERE wp.id = workout_days.workout_plan_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own workout days"
  ON workout_days FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_plans wp 
    WHERE wp.id = workout_plan_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own workout days"
  ON workout_days FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workout_plans wp 
    WHERE wp.id = workout_plan_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own workout days"
  ON workout_days FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workout_plans wp 
    WHERE wp.id = workout_plan_id 
    AND wp.user_id = auth.uid()
  ));

-- Create exercises policies
CREATE POLICY "Users can view own exercises"
  ON exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workout_days wd 
    JOIN workout_plans wp ON wp.id = wd.workout_plan_id 
    WHERE wd.id = exercises.workout_day_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own exercises"
  ON exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workout_days wd 
    JOIN workout_plans wp ON wp.id = wd.workout_plan_id 
    WHERE wd.id = workout_day_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own exercises"
  ON exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workout_days wd 
    JOIN workout_plans wp ON wp.id = wd.workout_plan_id 
    WHERE wd.id = workout_day_id 
    AND wp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own exercises"
  ON exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workout_days wd 
    JOIN workout_plans wp ON wp.id = wd.workout_plan_id 
    WHERE wd.id = workout_day_id 
    AND wp.user_id = auth.uid()
  ));

-- Create progress_checkins policies
CREATE POLICY "Users can view own progress"
  ON progress_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON progress_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON progress_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Create nutrition_macros policies
CREATE POLICY "Users can view own nutrition"
  ON nutrition_macros FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition"
  ON nutrition_macros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition"
  ON nutrition_macros FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition"
  ON nutrition_macros FOR DELETE
  USING (auth.uid() = user_id);

-- Create notification_preferences policies
CREATE POLICY "Users can view own notifications"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the update_updated_at_column trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_days_updated_at
  BEFORE UPDATE ON workout_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_macros_updated_at
  BEFORE UPDATE ON nutrition_macros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated; 