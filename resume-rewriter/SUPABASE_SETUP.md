# Supabase Email Verification Setup Guide

## Problem: Email Registration/Verification Not Working

The email verification feature requires proper Supabase configuration. Follow these steps to fix it:

## Solution 1: Disable Email Confirmation (Recommended for Development)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hsiguofeamzpufesnndw
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. **Toggle OFF** "Enable email confirmations"
5. Save changes

This allows users to register and log in immediately without email verification.

## Solution 2: Configure Email Provider (Recommended for Production)

### Step 1: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to the "Redirect URLs" list:
   - `http://localhost:5174/auth/callback`
   - `http://localhost:5173/auth/callback`
   - `https://4ulw1y46p5yr.space.minimax.io/auth/callback`
   - `https://yourdomain.com/auth/callback` (your production domain)

### Step 2: Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the "Confirm Signup" template
3. Make sure the template includes the `{{ .ConfirmationURL }}` variable

### Step 3: Test Email Delivery

Supabase provides email delivery by default for development:
- First 10,000 emails/month are free
- Check your spam folder if you don't receive emails
- For production, consider using a custom SMTP provider

### Step 4: Custom SMTP (Optional for Production)

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (SendGrid, AWS SES, etc.)
3. Test the configuration

## Solution 3: Manual User Verification

For testing purposes, you can manually verify users:

1. Go to **Authentication** → **Users**
2. Find the user you want to verify
3. Click on the user
4. Toggle "Email Confirmed" to ON

## Creating Test Accounts

### Method 1: Via Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Enter:
   - Email: `demo@test.com`
   - Password: `Demo123456!`
4. Toggle "Auto Confirm User" to ON
5. Click "Create User"

### Method 2: Via the Application
1. Navigate to http://localhost:5174/register
2. Register with any email
3. If email confirmation is required, manually verify in Supabase Dashboard

## Recommended Test Credentials

After following the steps above, use these credentials:

**Email:** demo@test.com  
**Password:** Demo123456!

## Troubleshooting

### Issue: "Email not confirmed" error
- Check if email confirmations are disabled in Auth settings
- OR manually confirm the user in the dashboard

### Issue: No email received
- Check spam/junk folder
- Verify email templates are configured
- Check Supabase email logs in Dashboard

### Issue: "Invalid redirect URL"
- Add your URL to the allowed redirect URLs list
- Make sure the URL format matches exactly (including http/https)

## Additional Configuration

### Enable Auto-confirm for Development

Add this to your Supabase Auth settings:
```sql
-- In Supabase SQL Editor
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

This confirms all existing unconfirmed users.

## Current Setup Status

Your Supabase project:
- **URL:** https://hsiguofeamzpufesnndw.supabase.co
- **Project ID:** hsiguofeamzpufesnndw

Next steps:
1. ✅ Disable email confirmation (quickest fix)
2. ✅ Create test user via dashboard
3. ✅ Test login functionality
4. 🔲 Configure custom email templates (optional)
5. 🔲 Set up custom SMTP (production only)



