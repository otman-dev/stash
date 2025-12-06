"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give a slight delay to allow the session to be established after OAuth callback
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after the initial check is ready and status is confirmed unauthenticated
    if (isReady && status === "unauthenticated") {
      console.log("AuthGuard: Unauthenticated, redirecting to login");
      localStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
    }
  }, [status, router, pathname, isReady]);

  // Show loading state if status is still loading or not ready
  if (status === "loading" || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
          <div className="text-lg font-medium text-slate-700">Loading...</div>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return session ? <>{children}</> : null;
}