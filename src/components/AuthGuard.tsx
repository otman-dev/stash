"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Save the current path for redirection after login
    if (status === "unauthenticated") {
      localStorage.setItem("redirectAfterLogin", pathname);
      router.push("/login");
    }
  }, [status, router, pathname]);

  // Show loading state if status is still loading
  if (status === "loading") {
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