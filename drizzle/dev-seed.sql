INSERT OR IGNORE INTO subscription_plans (id, name, description, plan_type, price, currency, interval, monthly_limit, features, active)
VALUES ('dev-testing', 'Dev Testing', '1000 credits for local testing', 'premium', 0.00, 'USD', 'month', 1000, '["1000 Credits","All Features"]', 1);

INSERT OR REPLACE INTO user_subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, usage_count, usage_reset_at, created_at, updated_at)
VALUES (
  'dev-sub-alice',
  '12dd1538-cba0-4387-a1c7-ea9d8415fb36',
  'dev-testing',
  'active',
  strftime('%s', 'now'),
  strftime('%s', 'now', '+1 year'),
  0,
  strftime('%s', 'now', '+1 month'),
  strftime('%s', 'now'),
  strftime('%s', 'now')
);
