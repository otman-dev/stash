# Setting Up Google OAuth for NextAuth.js

This guide will walk you through the process of setting up Google OAuth credentials for your Next.js application using NextAuth.js.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select "New Project"
3. Name your project (e.g., "Stash Inventory") and click "Create"
4. Select your new project from the project dropdown

## 2. Configure OAuth Consent Screen

1. In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace organization) and click "Create"
3. Fill in the required app information:
   - App name: "Stash Inventory"
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Skip adding scopes and click "Save and Continue"
6. Add test users if you're in testing mode, then click "Save and Continue"
7. Review your settings and click "Back to Dashboard"

## 3. Create OAuth Credentials

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" at the top and select "OAuth client ID"
3. For "Application type", select "Web application"
4. Name your client (e.g., "Stash Inventory Web Client")
5. Add the following Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://your-production-domain.com` (for production)
6. Add the following Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
7. Click "Create"
8. Note down the "Client ID" and "Client Secret" - you will need these for your .env file

## 4. Set Up Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.example`)
2. Add the Google OAuth credentials:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

3. Make sure to set a strong `NEXTAUTH_SECRET` (at least 32 characters) for secure sessions
4. Set the correct `NEXTAUTH_URL` for your environment:
   - `http://localhost:3000` for development
   - `https://your-production-domain.com` for production

## 5. For Vercel Deployment

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add all the environment variables from your `.env.local` file
4. Make sure to update the `NEXTAUTH_URL` to your Vercel deployment URL

## Notes

- Keep your client secret secure and never commit it to your repository
- For production, make sure to verify your app in the Google Cloud Console if you want to allow access to all users (not just test users)
- If you change the scopes in NextAuth.js configuration, you may need to update the OAuth consent screen in Google Cloud Console