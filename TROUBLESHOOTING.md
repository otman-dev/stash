# NextAuth.js Troubleshooting Guide

We've identified and fixed several issues with your NextAuth.js setup. Follow these steps to resolve the authentication problems:

## Step 1: Stop Your Server

First, stop your Next.js development server completely.

## Step 2: Clear Browser Data

In your browser:
1. Open Developer Tools (F12)
2. Go to Application tab
3. Delete all cookies for localhost
4. Clear Local Storage and Session Storage for localhost
5. Close and reopen your browser

## Step 3: Start Your Server

Restart your Next.js development server:
```
npm run dev
```

## Step 4: Try Authentication

Visit http://localhost:3000/login and try signing in with Google again.

## Technical Changes Made:

1. **Environment Variables**:
   - Updated NEXTAUTH_SECRET with a new secure key
   - Made JWT_SECRET match NEXTAUTH_SECRET for consistency
   - REMOVED directConnection=true from MongoDB URI (it's incompatible with SRV connections)

2. **MongoDB Configuration**:
   - Updated connection options in mongodb.ts
   - Removed directConnection option for compatibility with SRV URIs

3. **NextAuth Setup**:
   - Made layout.tsx more resilient to session errors
   - Added debugging to better identify issues

4. **Next.js Configuration**:
   - Updated next.config.js with optimizations for MongoDB compatibility
   - Fixed webpack externals for MongoDB adapter

## MongoDB SRV URI with directConnection Error

### Issue Solved
When using an SRV connection string (starting with `mongodb+srv://`), you cannot use the `directConnection=true` parameter in the connection string. This was resulting in the error:

```
MongoAPIError: SRV URI does not support directConnection
```

### Solution Applied
1. Removed `directConnection=true` from the MongoDB URI in `.env.local`
2. Removed the `directConnection: true` option from the MongoDB client options in `src/lib/mongodb.ts`

### Technical Explanation
SRV records are used to discover multiple servers in a MongoDB cluster, while `directConnection` is meant to bypass this discovery process and connect directly to a single server. These two concepts are contradictory, which is why MongoDB throws this error.

## If Issues Persist:

Try these additional steps:

1. Run cleanup script in browser console:
   ```javascript
   fetch('/cleanup-script.js')
     .then(response => response.text())
     .then(script => eval(script))
     .catch(error => console.error('Error fetching cleanup script:', error));
   ```

2. Visit the reset-auth page:
   http://localhost:3000/reset-auth

3. Check MongoDB connection:
   ```
   node scripts/test-mongodb.js
   ```

4. Reinstall NextAuth dependencies:
   ```
   npm install next-auth@latest @auth/mongodb-adapter@latest
   ```