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
    
    // Get all users
    const users = await db.collection('users').find({}).toArray();
    
    // Get collection names to count products and categories per user
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    // Add product and category counts for each user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const userId = user._id.toString();
      const productCollName = `products_${userId}`;
      const categoryCollName = `categories_${userId}`;
      
      let productCount = 0;
      let categoryCount = 0;
      
      if (collectionNames.includes(productCollName)) {
        productCount = await db.collection(productCollName).countDocuments({ name: { $ne: 'Collection Metadata' } });
      }
      
      if (collectionNames.includes(categoryCollName)) {
        categoryCount = await db.collection(categoryCollName).countDocuments({ name: { $ne: 'Collection Metadata' } });
      }
      
      return {
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        image: user.image,
        createdAt: user.createdAt || getCreatedAtFromObjectId(user._id),
        hasInitializedCollections: user.hasInitializedCollections,
        productCount,
        categoryCount,
      };
    }));

    return NextResponse.json({ users: usersWithCounts });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
