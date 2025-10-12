import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

/**
 * Middleware to protect routes
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  try {
    const token = await getToken({ req, secret });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return handler(req);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Middleware to restrict routes to specific roles
 */
export async function withRole(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredRole: string | string[] = ['user', 'admin']
) {
  try {
    const token = await getToken({ req, secret });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(token.role as string)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return handler(req);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}