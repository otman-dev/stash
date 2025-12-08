import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/mongodb';

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
    
    // Get all users to map IDs to names/emails
    const users = await db.collection('users').find({}).toArray();
    const userMap = new Map(users.map(u => [u._id.toString(), { name: u.name, email: u.email }]));
    
    // Get all category collections
    const collections = await db.listCollections().toArray();
    const categoryCollections = collections
      .map((c: any) => c.name)
      .filter((name: string) => name.startsWith('categories_'));
    
    // Fetch all categories from all collections
    const allCategories: any[] = [];
    
    for (const collName of categoryCollections) {
      const ownerId = collName.replace('categories_', '');
      const categories = await db.collection(collName)
        .find({ name: { $ne: 'Collection Metadata' } })
        .toArray();
      
      const ownerInfo = userMap.get(ownerId) || { name: 'Unknown', email: 'Unknown' };
      
      categories.forEach(category => {
        allCategories.push({
          _id: category._id.toString(),
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          ownerId,
          ownerName: ownerInfo.name,
          ownerEmail: ownerInfo.email,
        });
      });
    }
    
    // Sort by creation date (newest first)
    allCategories.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
