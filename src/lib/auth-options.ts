import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/auth";

// List of admin emails - these users will automatically get admin role
const ADMIN_EMAILS = [
  'otman.mouhib.career@gmail.com',
];

// Function to check if email should be admin
function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Function to initialize user collections
async function initializeUserCollections(db: any, userId: string) {
  try {
    // Check if collections exist first to avoid duplicates
    const productsCollName = `products_${userId}`;
    const categoriesCollName = `categories_${userId}`;
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    if (!collectionNames.includes(productsCollName)) {
      await db.collection(productsCollName).insertOne({
        name: 'Collection Metadata',
        description: 'Product collection for user',
        createdAt: new Date(),
        ownerId: userId,
      });
    }
    
    if (!collectionNames.includes(categoriesCollName)) {
      await db.collection(categoriesCollName).insertOne({
        name: 'Collection Metadata',
        description: 'Category collection for user',
        createdAt: new Date(),
        ownerId: userId,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing user collections:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug to troubleshoot
  // Allow linking accounts with same email (fixes OAuth callback loop)
  allowDangerousEmailAccountLinking: true,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to false for localhost
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Changed from "consent" to reduce OAuth traffic
          access_type: "offline",
          response_type: "code"
        }
      },
      // Add logging for debugging
      profile(profile) {
        if (process.env.NODE_ENV === 'development') {
          console.log("Google Profile received:", profile);
        }
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await getDb();
          const user = await db.collection("users").findOne({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await verifyPassword(credentials.password, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Will redirect with ?error=OAuthCallback etc
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      if (process.env.NODE_ENV === 'development') {
        console.log("EVENT signIn:", { userEmail: user.email, provider: account?.provider, isNewUser });
      }
    },
    async signOut({ token }) {
      if (process.env.NODE_ENV === 'development') {
        console.log("EVENT signOut:", { email: token?.email });
      }
    },
    async createUser({ user }) {
      // Initialize collections for newly created users
      try {
        if (user.email) {
          const db = await getDb();
          const userRole = isAdminEmail(user.email) ? 'admin' : 'user';
          const userId = user.id;
          
          await initializeUserCollections(db, userId);
          
          // Update the newly created user with role and initialization flag
          await db.collection('users').updateOne(
            { email: user.email },
            { 
              $set: { 
                hasInitializedCollections: true,
                role: userRole,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          );
          
          if (process.env.NODE_ENV === 'development') {
            console.log('New user created and collections initialized:', user.email);
          }
        }
      } catch (error) {
        console.error('Error initializing new user collections:', error);
      }
    },
  },
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata);
    },
    warn(code) {
      // Only log warnings in development
      if (process.env.NODE_ENV === 'development') {
        console.warn("NextAuth Warning:", code);
      }
    },
    debug(code, metadata) {
      // Only log debug in development
      if (process.env.NODE_ENV === 'development') {
        console.log("NextAuth Debug:", code, metadata);
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string || "user";
      }
      // Only log in development to reduce noise
      if (process.env.NODE_ENV === 'development') {
        console.log("Session callback:", { sessionUser: session?.user });
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in - persist the user data to the token
      if (account && user) {
        if (process.env.NODE_ENV === 'development') {
          console.log("JWT callback - Initial sign in:", { 
            provider: account.provider, 
            userId: user.id, 
            email: user.email 
          });
        }
        
        // Check if user should be admin
        const userRole = user.email && isAdminEmail(user.email) ? 'admin' : ((user as any).role || 'user');
        
        return {
          ...token,
          userId: user.id,
          role: userRole,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        };
      }
      
      // On subsequent requests, always check if this email should be admin
      // This ensures admin status is always correctly reflected
      if (token.email) {
        const shouldBeAdmin = isAdminEmail(token.email as string);
        if (shouldBeAdmin && token.role !== 'admin') {
          token.role = 'admin';
        } else if (!token.role) {
          token.role = 'user';
        }
      }
      
      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('SignIn callback triggered:', { 
            provider: account?.provider,
            email: user.email,
            name: user.name
          });
        }
        
        if (account?.provider === 'google' && user.email) {
          const db = await getDb();
          
          // Determine user role - admin for specific emails
          const userRole = isAdminEmail(user.email) ? 'admin' : 'user';
          
          // Check if the user already exists in our database
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (existingUser) {
            // User exists - update role if needed and ensure collections are initialized
            const updates: any = { updatedAt: new Date() };
            
            if (isAdminEmail(user.email) && existingUser.role !== 'admin') {
              updates.role = 'admin';
            }
            
            if (!existingUser.hasInitializedCollections) {
              const userId = existingUser._id.toString();
              await initializeUserCollections(db, userId);
              updates.hasInitializedCollections = true;
            }
            
            if (!existingUser.createdAt) {
              updates.createdAt = new Date();
            }
            
            await db.collection('users').updateOne(
              { _id: existingUser._id },
              { $set: updates }
            );
          }
          // For new users, the adapter will create them.
          // We'll initialize collections in the createUser event or on first dashboard access
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Still allow sign in even if collection creation fails
      }
    },
  },
};