import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Extend session user type to include ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
  }
}

// Create the handler using the auth options
const handler = NextAuth(authOptions);

// Export the handler for the API route
export { handler as GET, handler as POST };