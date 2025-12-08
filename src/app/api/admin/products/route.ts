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
    
    // Get all product collections
    const collections = await db.listCollections().toArray();
    const productCollections = collections
      .map((c: any) => c.name)
      .filter((name: string) => name.startsWith('products_'));
    
    // Fetch all products from all collections
    const allProducts: any[] = [];
    
    for (const collName of productCollections) {
      const ownerId = collName.replace('products_', '');
      const products = await db.collection(collName)
        .find({ name: { $ne: 'Collection Metadata' } })
        .toArray();
      
      const ownerInfo = userMap.get(ownerId) || { name: 'Unknown', email: 'Unknown' };
      
      products.forEach(product => {
        allProducts.push({
          _id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          units: product.units,
          media: product.media,
          category: product.category,
          createdAt: product.createdAt,
          ownerId,
          ownerName: ownerInfo.name,
          ownerEmail: ownerInfo.email,
        });
      });
    }
    
    // Sort by creation date (newest first)
    allProducts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
