"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && status === "unauthenticated") {
      router.push("/login");
    } else if (isReady && status === "authenticated" && session?.user?.role !== "admin") {
      // Redirect non-admin users to dashboard
      router.push("/dashboard");
    }
  }, [status, router, isReady, session]);

  // Show loading state
  if (status === "loading" || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
          <div className="text-lg font-medium text-slate-700">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  // Only render if user is authenticated AND is admin
  if (session?.user?.role === "admin") {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
