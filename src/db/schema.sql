-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration INTEGER,
  mood TEXT,
  notes TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own sessions
CREATE POLICY select_own_sessions ON sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own sessions
CREATE POLICY insert_own_sessions ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own sessions
CREATE POLICY update_own_sessions ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own sessions
CREATE POLICY delete_own_sessions ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_goal_id_idx ON sessions(goal_id);
