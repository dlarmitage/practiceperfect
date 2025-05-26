-- Update RLS policies for the goals table
-- Enable RLS on the goals table if not already enabled
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON goals;

-- Create comprehensive policies for all operations
-- Policy for SELECT operations
CREATE POLICY "Users can view their own goals" 
ON goals FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for INSERT operations
CREATE POLICY "Users can insert their own goals" 
ON goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE operations
CREATE POLICY "Users can update their own goals" 
ON goals FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE operations
CREATE POLICY "Users can delete their own goals" 
ON goals FOR DELETE 
USING (auth.uid() = user_id);
