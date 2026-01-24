# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your resume website.

## Prerequisites

- A Google Cloud Console account
- Your application deployed or running locally

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "PixelPear Resume")
4. Click "Create"

## Step 2: Enable Google OAuth API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required information:
   - **App name**: PixelPear Resume
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `openid`
   - `email`
   - `profile`
8. Click "Save and Continue"
9. Add test users (optional for development)
10. Click "Save and Continue"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: PixelPear Resume Web Client
   - **Authorized JavaScript origins**:
     - For local development: `http://localhost:5173`
     - For production: `https://pixelpear.io`
   - **Authorized redirect URIs**:
     - For local development: `http://localhost:5173/auth/google/callback`
     - For production: `https://pixelpear.io/auth/google/callback`
5. Click "Create"
6. **IMPORTANT**: Copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

### Frontend (resume-rewriter)

Create a `.env` file in the `resume-rewriter` directory:

```env
# API base URL (local dev default). Update for production if needed.
VITE_API_URL=http://localhost:8788/api

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# For production, update to:
# VITE_API_URL=https://pixelpear.io/api
# VITE_GOOGLE_REDIRECT_URI=https://pixelpear.io/auth/google/callback
```

### Backend (Cloudflare Pages Functions)

Add these environment variables to your Cloudflare Pages project:

1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Go to "Settings" → "Environment variables"
4. Add the following variables:

```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://pixelpear.io/auth/google/callback
```

For local development with Wrangler, create a `.dev.vars` file in the project root:

```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   cd resume-rewriter
   pnpm dev
   ```

2. Navigate to the registration page: `http://localhost:5173/register`

3. Click "Sign up with Google"

4. You should see a Google Sign-In popup

5. Select your Google account

6. After successful authentication, you should be redirected to the dashboard

## Troubleshooting

### "Google OAuth is not configured" Error

- Make sure you've set the `VITE_GOOGLE_CLIENT_ID` environment variable
- Restart your development server after adding environment variables

### "Failed to open Google Sign-In window" Error

- Check if your browser is blocking popups
- Allow popups for your site

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in your `.env` file matches exactly what you configured in Google Cloud Console
- Check for trailing slashes - they must match exactly

### "invalid_client" Error

- Verify your Client ID and Client Secret are correct
- Make sure you're using the Web application credentials (not iOS, Android, etc.)

## Security Notes

1. **Never commit** `.env` files or `.dev.vars` files to version control
2. Keep your Client Secret secure - it should only be stored in environment variables
3. For production, always use HTTPS
4. Regularly rotate your Client Secret
5. Monitor your OAuth usage in Google Cloud Console

## Email Registration

Email registration is already implemented and working! Users can:

1. Register with email and password (minimum 6 characters)
2. Receive a session token upon successful registration
3. Login with their credentials

The registration form now has:
- ✅ Proper text colors (no more white text on white background!)
- ✅ Beautiful modern UI with proper contrast
- ✅ Form validation with helpful error messages
- ✅ Loading states for better UX

## What's Working Now

✅ **Email Registration**: Users can register with email/password
✅ **Email Login**: Users can login with their credentials
✅ **Google OAuth UI**: Beautiful Google Sign-In button on both login and register pages
✅ **Text Visibility**: All form inputs now have proper text colors
✅ **Backend Support**: Full backend implementation for both email and Google auth

## What Needs Configuration

⚠️ **Google OAuth Backend**: You need to add the Google OAuth credentials to your Cloudflare environment variables for the Google Sign-In to work in production.

For now, clicking "Sign in with Google" will show a helpful message. Once you complete the setup above, it will work seamlessly!
