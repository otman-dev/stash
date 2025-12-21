import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageContext";
import AuthProvider from "@/components/AuthProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Move metadata to a separate metadata file since we're using 'use client'
// and metadata can't be exported from client components

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Try to get the session, but handle any errors gracefully
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error getting session:", error);
    // Continue with null session
  }

  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider session={session}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
