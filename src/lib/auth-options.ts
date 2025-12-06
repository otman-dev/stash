import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "@/lib/mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/auth";

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
  debug: process.env.NEXTAUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  // Make sure the callback URL works in both production and development
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
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
    error: "/login",
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
      console.log("Session callback:", { sessionUser: session?.user });
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in - persist the user data to the token
      if (account && user) {
        console.log("JWT callback - Initial sign in:", { 
          provider: account.provider, 
          userId: user.id, 
          email: user.email 
        });
        return {
          ...token,
          userId: user.id,
          role: (user as any).role || "user",
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        };
      }
      console.log("JWT callback - Subsequent request:", { tokenSub: token.sub });
      return token;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback triggered:', { 
          provider: account?.provider,
          email: user.email,
          name: user.name
        });
        
        if (account?.provider === 'google' && user.email) {
          const db = await getDb();
          
          // Check if the user already exists in our database
          const existingUser = await db.collection('users').findOne({ email: user.email });
          console.log('Existing user check:', { found: !!existingUser });
          
          // If this is a new user coming from Google, set up their collections
          if (!existingUser || (existingUser && !existingUser.hasInitializedCollections)) {
            // For new users, we need to wait for MongoDB adapter to create the user
            // and then use the MongoDB _id to initialize collections
            
            // Wait a bit to ensure the adapter has created the user
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Find the user by email since the ID might not be a valid MongoDB ObjectId
            const dbUser = await db.collection('users').findOne({ email: user.email });
            
            if (dbUser) {
              const userId = dbUser._id.toString();
              await initializeUserCollections(db, userId);
              
              // Mark the user as having initialized collections
              await db.collection('users').updateOne(
                { _id: dbUser._id },
                { 
                  $set: { 
                    hasInitializedCollections: true,
                    role: 'user',
                    updatedAt: new Date()
                  } 
                }
              );
              console.log('User collections initialized for:', user.email);
            } else {
              console.log('User not found in database after OAuth sign-in:', user.email);
            }
          }
        }
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Still allow sign in even if collection creation fails
      }
    },
  },
};