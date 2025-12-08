"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Hook for accessing authentication functions and user data
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /**
   * Sign in with credentials
   */
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      return { success: !result?.error, error: result?.error };
    } catch (error) {
      return { success: false, error: "Authentication failed" };
    }
  };

  /**
   * Sign in with Google
   */
  const googleLogin = async () => {
    try {
      // Changed to force redirect in the browser instead of handling in catch
      return await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (error) {
      console.error("Google auth error:", error);
      return { success: false, error: "Google authentication failed" };
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  // Include role from session
  const user = session?.user ? {
    ...session.user,
    role: session.user.role || 'user',
  } : undefined;

  return {
    user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    isAdmin: session?.user?.role === 'admin',
    login,
    googleLogin,
    logout,
  };
}