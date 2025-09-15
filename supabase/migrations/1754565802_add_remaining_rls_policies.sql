-- Migration: add_remaining_rls_policies
-- Created at: 1754565802

-- Enable RLS on remaining tables
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for resume_versions table
CREATE POLICY "Users can view their resume versions" ON resume_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resumes 
            WHERE resumes.id = resume_versions.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their resume versions" ON resume_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM resumes 
            WHERE resumes.id = resume_versions.resume_id 
            AND resumes.user_id = auth.uid()
        )
    );

-- RLS policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS policies for resume_subscriptions table
CREATE POLICY "Users can view their resume subscriptions" ON resume_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their resume subscriptions" ON resume_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their resume subscriptions" ON resume_subscriptions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);;