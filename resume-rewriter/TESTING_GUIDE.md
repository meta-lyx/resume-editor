# Authentication Testing Guide

This guide will help you test the authentication system to ensure everything is working correctly.

## Prerequisites

1. Make sure your backend is running (Cloudflare Pages Functions or local Wrangler)
2. Make sure your frontend is running (`pnpm dev` in resume-rewriter directory)
3. Have a test email address ready

## Test 1: Email Registration (Critical)

### Steps:
1. Navigate to `http://localhost:5173/register` (or `https://pixelpear.io/register`)
2. Fill in the registration form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: testpass123
   - **Confirm Password**: testpass123
3. Click "Create Account"

### Expected Results:
✅ Form validates all fields
✅ Password must match confirmation
✅ Success toast appears: "Registration successful..."
✅ User is redirected to `/dashboard`
✅ User is logged in (check navbar for user menu)

### Common Issues:
- **White text not visible**: FIXED ✅ (now uses proper text colors)
- **"User already exists"**: Use a different email or check database
- **"Unable to connect to server"**: Backend is not running
- **Validation errors**: Check that all fields meet requirements

## Test 2: Email Login

### Steps:
1. Navigate to `http://localhost:5173/login`
2. Enter credentials from Test 1:
   - **Email**: test@example.com
   - **Password**: testpass123
3. Click "Sign in"

### Expected Results:
✅ Success toast appears: "Login successful"
✅ User is redirected to `/dashboard`
✅ User is logged in

### Common Issues:
- **"Invalid credentials"**: Check email/password are correct
- **"User not found"**: Complete Test 1 first

## Test 3: Form Validation

### Steps:
1. Navigate to `http://localhost:5173/register`
2. Try these invalid inputs:

#### Test 3a: Invalid Email
- **Email**: notanemail
- Click "Create Account"
- **Expected**: "Please enter a valid email address"

#### Test 3b: Short Password
- **Email**: test@example.com
- **Password**: 123
- **Expected**: "Password must be at least 6 characters"

#### Test 3c: Password Mismatch
- **Password**: password123
- **Confirm Password**: password456
- **Expected**: "Passwords do not match"

#### Test 3d: Short Name
- **Name**: A
- **Expected**: "Name must be at least 2 characters"

### Expected Results:
✅ All validation errors display correctly
✅ Error messages are clear and helpful
✅ Form cannot be submitted with invalid data

## Test 4: Text Visibility (Critical Fix)

### Steps:
1. Navigate to `http://localhost:5173/register`
2. Click in each input field
3. Type some text

### Expected Results:
✅ Text is clearly visible in all fields (dark text on light background)
✅ Placeholder text is visible but lighter
✅ Icons are visible
✅ No white text on white background

### What Was Fixed:
- Changed input text color from `text-white` to `text-foreground`
- Added proper background color `bg-surface-light`
- Updated placeholder color to `placeholder:text-muted-foreground/60`
- Improved focus states with visible rings

## Test 5: Google Sign-In Button

### Steps:
1. Navigate to `http://localhost:5173/register`
2. Scroll down to see "Or continue with" section
3. Look for the Google Sign-In button

### Expected Results:
✅ Google Sign-In button is visible
✅ Button has Google logo (colorful G icon)
✅ Button text says "Sign up with Google"
✅ Button has hover effect

### Testing the OAuth Flow:
**Note**: This requires Google OAuth to be configured (see `GOOGLE_OAUTH_SETUP.md`)

1. Click "Sign up with Google"
2. **If not configured**: Error toast appears with helpful message
3. **If configured**: 
   - Popup window opens with Google sign-in
   - Select Google account
   - Popup closes automatically
   - Success toast appears
   - Redirected to dashboard
   - User is logged in

## Test 6: Loading States

### Steps:
1. Navigate to `http://localhost:5173/register`
2. Fill in valid information
3. Click "Create Account"
4. Observe the button

### Expected Results:
✅ Button shows "Creating account..." with spinner
✅ Button is disabled during submission
✅ Form inputs remain visible
✅ After completion, button returns to normal

## Test 7: Logout

### Steps:
1. Make sure you're logged in (complete Test 1 or 2)
2. Click on user menu in navbar
3. Click "Logout"

### Expected Results:
✅ User is logged out
✅ Redirected to home page or login page
✅ User menu disappears from navbar

## Test 8: Protected Routes

### Steps:
1. Make sure you're logged out
2. Try to navigate to protected routes:
   - `http://localhost:5173/profile`
   - `http://localhost:5173/subscription`
   - `http://localhost:5173/my-resumes`

### Expected Results:
✅ Redirected to login page
✅ After login, redirected back to the original page

## Test 9: Session Persistence

### Steps:
1. Login (complete Test 2)
2. Refresh the page
3. Close the browser tab and reopen

### Expected Results:
✅ User remains logged in after refresh
✅ User remains logged in after reopening browser
✅ Session expires after 7 days

## Test 10: Multiple Browsers/Devices

### Steps:
1. Login on Chrome
2. Open the same site in Firefox
3. Try to login with the same account

### Expected Results:
✅ Can login on multiple browsers simultaneously
✅ Each browser has its own session
✅ Logging out on one browser doesn't affect others

## Test 11: Error Handling

### Test 11a: Network Error
1. Stop the backend server
2. Try to register or login
3. **Expected**: "Unable to connect to server..." error

### Test 11b: Duplicate Email
1. Register with an email
2. Try to register again with the same email
3. **Expected**: "User with this email already exists"

### Test 11c: Wrong Password
1. Login with correct email but wrong password
2. **Expected**: "Invalid credentials" or similar error

## Test 12: UI/UX

### Visual Tests:
1. Check that all elements are properly aligned
2. Verify that colors match the design system
3. Test hover effects on buttons
4. Check focus states on inputs
5. Verify that error messages are styled correctly

### Responsive Tests:
1. Resize browser window to mobile size
2. Test on actual mobile device
3. **Expected**: 
   - Form is still usable
   - Text is readable
   - Buttons are tappable
   - No horizontal scrolling

## Automated Testing Checklist

If you want to write automated tests, here's what to cover:

- [ ] Email validation regex
- [ ] Password length validation
- [ ] Password matching validation
- [ ] Name length validation
- [ ] API client methods (register, login, logout)
- [ ] Auth context state management
- [ ] Protected route redirects
- [ ] Session token storage
- [ ] OAuth popup handling

## Performance Tests

1. **Registration Speed**: Should complete in < 2 seconds
2. **Login Speed**: Should complete in < 1 second
3. **Form Validation**: Should be instant (client-side)
4. **Page Load**: Should load in < 1 second

## Security Tests

1. **Password Hashing**: Passwords should never be stored in plain text
2. **Token Security**: Tokens should be random and unpredictable
3. **XSS Prevention**: Test with `<script>alert('xss')</script>` in inputs
4. **SQL Injection**: Test with `'; DROP TABLE users; --` in inputs
5. **CORS**: Should only allow requests from your domain

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Accessibility Tests

1. **Keyboard Navigation**: Can you complete registration using only keyboard?
2. **Screen Reader**: Does the form make sense with a screen reader?
3. **Color Contrast**: Do all text elements meet WCAG AA standards?
4. **Focus Indicators**: Are focus states clearly visible?

## Troubleshooting Common Issues

### Issue: "White text not visible"
**Status**: FIXED ✅
**Solution**: Updated in this PR - all text now uses proper colors

### Issue: "Google Sign-In not working"
**Solution**: Configure Google OAuth (see `GOOGLE_OAUTH_SETUP.md`)

### Issue: "Unable to connect to server"
**Solution**: 
1. Check if backend is running
2. Verify `VITE_API_URL` environment variable
3. Check browser console for CORS errors

### Issue: "Registration succeeds but user not logged in"
**Solution**: 
1. Check that session token is being saved to localStorage
2. Verify auth context is properly updating state
3. Check browser console for errors

## Success Criteria

All tests should pass with these results:
✅ Email registration works
✅ Email login works
✅ Form validation works
✅ Text is visible in all fields
✅ Google Sign-In button is present
✅ Loading states work
✅ Error messages are clear
✅ Session persists across refreshes
✅ Protected routes redirect to login
✅ UI is responsive and accessible

## Next Steps After Testing

1. If all tests pass: Deploy to production
2. If tests fail: Check the error messages and fix issues
3. Configure Google OAuth for full functionality
4. Consider adding email verification
5. Consider adding password reset flow

## Support

If you encounter issues not covered here:
1. Check browser console for errors
2. Check network tab for failed requests
3. Review `AUTHENTICATION_FIXES.md` for implementation details
4. Check `GOOGLE_OAUTH_SETUP.md` for OAuth configuration
