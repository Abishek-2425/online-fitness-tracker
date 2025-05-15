/*
  # Create initial schema for Online Fitness Tracker

  1. New Tables
    - `workouts` - Store workout exercises with sets, reps, weight, and duration
    - `body_weight` - Track user's weight measurements over time
    - `water_intake` - Record daily water consumption
    - `sleep_tracker` - Monitor sleep duration and quality
    - `goals` - Track fitness goals with deadlines

  2. Security
    - Enable Row Level Security (RLS) on all tables
    - Add policies to ensure users can only access their own data
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  exercise_name text NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight float NOT NULL,
  duration float NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create body_weight table
CREATE TABLE IF NOT EXISTS body_weight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  weight float NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create water_intake table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  amount_ml integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create sleep_tracker table
CREATE TABLE IF NOT EXISTS sleep_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date NOT NULL,
  duration_hr float NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  target_type text NOT NULL,
  target_value float NOT NULL,
  deadline date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts
CREATE POLICY "Users can create their own workouts"
  ON workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON workouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON workouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for body_weight
CREATE POLICY "Users can create their own weight entries"
  ON body_weight
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own weight entries"
  ON body_weight
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight entries"
  ON body_weight
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight entries"
  ON body_weight
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for water_intake
CREATE POLICY "Users can create their own water intake entries"
  ON water_intake
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own water intake entries"
  ON water_intake
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own water intake entries"
  ON water_intake
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water intake entries"
  ON water_intake
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for sleep_tracker
CREATE POLICY "Users can create their own sleep entries"
  ON sleep_tracker
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sleep entries"
  ON sleep_tracker
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
  ON sleep_tracker
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
  ON sleep_tracker
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can create their own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts (user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts (date);
CREATE INDEX IF NOT EXISTS idx_body_weight_user_id ON body_weight (user_id);
CREATE INDEX IF NOT EXISTS idx_body_weight_date ON body_weight (date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_id ON water_intake (user_id);
CREATE INDEX IF NOT EXISTS idx_water_intake_date ON water_intake (date);
CREATE INDEX IF NOT EXISTS idx_sleep_tracker_user_id ON sleep_tracker (user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_tracker_date ON sleep_tracker (date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals (user_id);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals (deadline);