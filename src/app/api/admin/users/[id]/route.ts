import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const db = await getDb();
    
    // Find the user first to make sure they exist
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent admin from deleting themselves
    if (user.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Drop user's products collection
    const productsCollName = `products_${id}`;
    try {
      await db.collection(productsCollName).drop();
      console.log(`Dropped collection: ${productsCollName}`);
    } catch (err: any) {
      // Collection might not exist, which is fine
      if (err.codeName !== 'NamespaceNotFound') {
        console.error(`Error dropping ${productsCollName}:`, err);
      }
    }

    // Drop user's categories collection
    const categoriesCollName = `categories_${id}`;
    try {
      await db.collection(categoriesCollName).drop();
      console.log(`Dropped collection: ${categoriesCollName}`);
    } catch (err: any) {
      // Collection might not exist, which is fine
      if (err.codeName !== 'NamespaceNotFound') {
        console.error(`Error dropping ${categoriesCollName}:`, err);
      }
    }

    // Delete the user's account from the accounts collection (OAuth accounts)
    await db.collection('accounts').deleteMany({ userId: new ObjectId(id) });
    
    // Delete the user's sessions
    await db.collection('sessions').deleteMany({ userId: new ObjectId(id) });

    // Finally, delete the user
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    console.log(`Successfully deleted user ${id} and all associated data`);
    return NextResponse.json({ 
      success: true, 
      message: 'User and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
