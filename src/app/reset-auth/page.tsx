"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This component clears all browser cookies and redirects to login.
 * Use it on the /reset-auth page to help resolve authentication issues.
 */
export default function ResetAuth() {
  const router = useRouter();

  useEffect(() => {
    // Function to clear all cookies
    const clearAllCookies = () => {
      const cookies = document.cookie.split(";");
      
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Set expiration date to past date to delete the cookie
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    };

    // Function to reset auth state both client-side and server-side
    const resetAuth = async () => {
      // Clear client-side storage
      clearAllCookies();
      localStorage.clear();
      sessionStorage.clear();
      
      // Also call server API to reset cookies
      try {
        await fetch('/api/auth/reset', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error calling reset API:', error);
      }
    };

    // Reset auth and redirect
    resetAuth();
    
    // Wait a moment before redirecting
    const timer = setTimeout(() => {
      router.push('/login');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow text-center max-w-md w-full">
        <div className="animate-spin mb-6 mx-auto h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        <h1 className="text-2xl font-bold mb-2">Resetting Authentication</h1>
        <p className="text-slate-500 mb-4">Clearing authentication data and redirecting to login...</p>
      </div>
    </div>
  );
}