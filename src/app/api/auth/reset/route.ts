import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Create a response that clears the auth cookies
  const response = NextResponse.json({ 
    success: true, 
    message: 'Authentication state has been reset.' 
  });
  
  // Set expiry to a past date to clear cookies
  const expiry = new Date(0).toUTCString();
  
  // Add headers to clear all next-auth cookies
  const cookieNames = [
    'next-auth.session-token',
    'next-auth.callback-url',
    'next-auth.csrf-token',
    'next-auth.pkce.code_verifier',
    'next-auth.state'
  ];
  
  for (const name of cookieNames) {
    response.headers.set(
      'Set-Cookie', 
      `${name}=; Path=/; Expires=${expiry}; HttpOnly; SameSite=Lax`
    );
  }
  
  return response;
}

export async function POST(req: NextRequest) {
  return GET(req); // Same handler for POST requests
}