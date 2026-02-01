-- Add trial_ends_at column to user_subscriptions table
ALTER TABLE user_subscriptions ADD COLUMN trial_ends_at INTEGER;

-- Add trial plan for new user signups
INSERT OR IGNORE INTO subscription_plans (id, name, description, plan_type, price, currency, interval, monthly_limit, features, active)
VALUES ('trial-plan', 'Free Trial', '3-day free trial with 3 credits', 'trial', 0.00, 'USD', 'trial', 3, '["3 Free Credits","3-Day Trial Period","ATS Optimization","Job Matching"]', 1);
