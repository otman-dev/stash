import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to extract timestamp from MongoDB ObjectId
function getCreatedAtFromObjectId(id: ObjectId | string): Date {
  try {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return objectId.getTimestamp();
  } catch {
    return new Date();
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const db = await getDb();
    
    // Get total users count
    const totalUsers = await db.collection('users').countDocuments();
    
    // Get all collections to count products and categories
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    // Count products across all user product collections
    let totalProducts = 0;
    const productCollections = collectionNames.filter((name: string) => name.startsWith('products_'));
    for (const collName of productCollections) {
      // Subtract 1 for the metadata document
      const count = await db.collection(collName).countDocuments({ name: { $ne: 'Collection Metadata' } });
      totalProducts += count;
    }
    
    // Count categories across all user category collections
    let totalCategories = 0;
    const categoryCollections = collectionNames.filter((name: string) => name.startsWith('categories_'));
    for (const collName of categoryCollections) {
      // Subtract 1 for the metadata document
      const count = await db.collection(collName).countDocuments({ name: { $ne: 'Collection Metadata' } });
      totalCategories += count;
    }
    
    // Get recent users
    const recentUsers = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalCategories,
      recentUsers: recentUsers.map(u => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        createdAt: u.createdAt || getCreatedAtFromObjectId(u._id),
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
