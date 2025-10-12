import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/mongodb';
import { verifyPassword } from '../../../../lib/auth';

/**
 * This route is maintained for backward compatibility with the old auth system.
 * New authentication should use NextAuth.js directly.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email });
    
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Authentication successful - return user information
    // NextAuth.js will handle the actual session creation
    return NextResponse.json({ 
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      ok: true
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
