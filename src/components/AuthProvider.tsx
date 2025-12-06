"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export interface AuthProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0} // Disable constant refetching
      refetchOnWindowFocus={true} // Re-fetch on window focus to sync session
    >
      {children}
    </SessionProvider>
  );
}