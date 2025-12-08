import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    const productCollections = collectionNames.filter((name: string) => name.startsWith('products_'));
    
    // Build a map of all categories from all users
    const categoryMap = new Map<string, string>();
    const categoryCollections = collectionNames.filter((name: string) => name.startsWith('categories_'));
    
    for (const collName of categoryCollections) {
      const categories = await db.collection(collName)
        .find({ name: { $ne: 'Collection Metadata' } })
        .toArray();
      
      categories.forEach(cat => {
        categoryMap.set(cat._id.toString(), cat.name);
      });
    }
    
    // Fetch all products from all collections
    const allProducts: any[] = [];
    
    for (const collName of productCollections) {
      const ownerId = collName.replace('products_', '');
      const products = await db.collection(collName)
        .find({ name: { $ne: 'Collection Metadata' } })
        .toArray();
      
      const ownerInfo = userMap.get(ownerId) || { name: 'Unknown', email: 'Unknown' };
      
      products.forEach(product => {
        // Look up category name from categoryId
        let categoryName = null;
        if (product.categoryId) {
          const catId = typeof product.categoryId === 'string' 
            ? product.categoryId 
            : product.categoryId.toString();
          categoryName = categoryMap.get(catId) || null;
        }
        
        allProducts.push({
          _id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          units: product.units,
          media: product.media,
          category: categoryName,
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
