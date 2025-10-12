# Gmail Authentication Implementation Guide

This document outlines how Gmail authentication is implemented in the Stash inventory management application.

## Overview

The authentication system uses NextAuth.js with the Google provider to allow users to sign in with their Gmail accounts. When a user signs in for the first time, the system automatically creates user-specific collections in the database to store their inventory data.

## Key Components

### 1. NextAuth.js Configuration

The NextAuth.js configuration is located in `src/app/api/auth/[...nextauth]/route.ts`. It includes:

- Google provider setup for OAuth authentication
- Credentials provider for traditional email/password authentication
- MongoDB adapter for storing sessions and user data
- Custom callbacks for session and JWT handling
- Automatic user collection initialization for new Google users

### 2. Environment Variables

Required environment variables (stored in `.env.local`):

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000 (or your production URL)
NEXTAUTH_SECRET=your_secure_secret
MONGODB_URI=your_mongodb_connection_string
```

### 3. Authentication Flow

1. **User Visits Login Page**: User is presented with options to sign in with Google or credentials
2. **Google Sign-In**: User clicks "Sign in with Google" button
3. **OAuth Flow**:
   - User is redirected to Google's consent screen
   - User authorizes the application
   - Google redirects back to the callback URL with an authorization code
   - NextAuth exchanges the code for tokens and creates a session
4. **User Record Creation**:
   - For first-time Google users, a new user record is created in the database
   - User-specific collections are initialized (`products_${userId}`, `categories_${userId}`)
5. **Session Management**:
   - JWT session is created and stored in cookies
   - User is redirected to the dashboard

### 4. Protected Routes

All dashboard routes are protected by the `AuthGuard` component, which:
- Checks if the user is authenticated
- Redirects to the login page if not authenticated
- Stores the current path for redirection after login

### 5. Client-Side Utilities

- `useAuth()` hook in `src/lib/client-auth.ts` provides convenient methods for authentication
- `AuthProvider` component wraps the application to provide session context

### 6. Database Structure

For each user (including Google-authenticated users), the system creates:
- A record in the `users` collection with user details
- A user-specific products collection: `products_${userId}`
- A user-specific categories collection: `categories_${userId}`

## Security Considerations

- JWT tokens for secure session management
- HTTP-only cookies to prevent client-side access to tokens
- Environment variables for storing sensitive information
- OAuth for delegating authentication to Google

## Deployment on Vercel

When deploying to Vercel:
1. Set all environment variables in the Vercel project settings
2. Update the authorized redirect URIs in Google Cloud Console to include your Vercel domain
3. Set `NEXTAUTH_URL` to your Vercel deployment URL

## Troubleshooting

Common issues:
- **"Invalid redirect_uri"**: Check that the callback URL in Google Cloud Console matches your environment variables
- **"Missing Client ID"**: Ensure GOOGLE_CLIENT_ID is set in environment variables
- **"Failed to initialize user collections"**: Check MongoDB connection and permissions

## Future Improvements

Possible enhancements to the authentication system:
- Add more OAuth providers (GitHub, Microsoft, etc.)
- Implement email verification
- Add two-factor authentication
- Implement password reset functionality
- Account linking (connect Google account to existing account)