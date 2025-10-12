# Authentication Troubleshooting Guide

If you're experiencing issues with Google OAuth authentication or JWT session errors, follow these steps:

## Quick Fix Steps

### 1. Reset Your Authentication State

The fastest way to fix most authentication issues is to reset your authentication state:

1. Visit: http://localhost:3000/reset-auth
2. Wait for the page to clear your authentication cookies and redirect to login
3. Try signing in again

### 2. Clear Browser Data Manually

If the reset page doesn't solve your issue:

1. Open your browser's developer tools (F12 or right-click > Inspect)
2. Go to the "Application" tab
3. In the Storage section, select "Cookies" and delete all cookies for localhost
4. Also clear "Local Storage" and "Session Storage" for localhost
5. Refresh the page and try again

### 3. Restart Your Development Server

Sometimes a fresh start helps:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Common Error Solutions

### JWT Session Decryption Errors

If you see: `JWT_SESSION_ERROR decryption operation failed`

This usually happens when:
- The NEXTAUTH_SECRET or JWT_SECRET has changed
- You have old cookies with different encryption keys
- The JWT token is malformed

**Solution:** Visit http://localhost:3000/reset-auth to clear all auth tokens.

### OAuth Request Timeout

If you see: `outgoing request timed out after 3500ms`

This usually happens when:
- Your internet connection is slow or unstable
- Google's authentication servers are experiencing high load
- There's a network issue blocking requests to Google

**Solution:** Check your internet connection and try again. If the issue persists, try using a different network.

### Invalid Image Src (Google Profile Pictures)

If you see: `Invalid src prop on next/image, hostname "lh3.googleusercontent.com" is not configured`

**Solution:** This issue has been fixed by updating `next.config.js`. Restart your development server for changes to take effect.

### MongoDB ObjectId Error

If you see: `BSONError: Argument passed in must be a string of 12 bytes...`

**Solution:** This issue has been fixed in the signin callback. Restart your server and try again.

## Still Having Issues?

If you're still experiencing problems:

1. Run the MongoDB test script to check your database connection:
   ```bash
   node scripts/test-mongodb.js
   ```

2. Execute the reset script to regenerate secure keys:
   ```bash
   node scripts/reset-next-auth.js
   ```

3. Clear your browser cache completely and try in a different browser

4. Check for any firewall or proxy settings that might be blocking connections to Google or MongoDB