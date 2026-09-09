ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_study_goal_hours FLOAT DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS study_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'::jsonb,
ADD COLUMN IF NOT EXISTS busyness TEXT DEFAULT 'Average';
