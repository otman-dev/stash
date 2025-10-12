import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

/**
 * Gets the user's ID from the session
 */
export async function getUserId() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return session.user.id;
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw error;
  }
}

/**
 * Gets the user's products collection
 */
export async function getUserProductsCollection(userId?: string) {
  try {
    const id = userId || await getUserId();
    const db = await getDb();
    return db.collection(`products_${id}`);
  } catch (error) {
    console.error('Error getting user products collection:', error);
    throw error;
  }
}

/**
 * Gets the user's categories collection
 */
export async function getUserCategoriesCollection(userId?: string) {
  try {
    const id = userId || await getUserId();
    const db = await getDb();
    return db.collection(`categories_${id}`);
  } catch (error) {
    console.error('Error getting user categories collection:', error);
    throw error;
  }
}

/**
 * Gets a user by their ID
 */
export async function getUserById(id: string) {
  try {
    const db = await getDb();
    return db.collection('users').findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Gets a user by their email
 */
export async function getUserByEmail(email: string) {
  try {
    const db = await getDb();
    return db.collection('users').findOne({ email });
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * Initializes collections for a user if they don't exist yet
 */
export async function initializeUserCollections(userId: string) {
  try {
    const db = await getDb();
    
    // Check if collections exist first to avoid duplicates
    const productsCollName = `products_${userId}`;
    const categoriesCollName = `categories_${userId}`;
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);
    
    if (!collectionNames.includes(productsCollName)) {
      await db.collection(productsCollName).insertOne({
        name: 'Collection Metadata',
        description: 'Product collection for user',
        createdAt: new Date(),
        ownerId: userId,
      });
    }
    
    if (!collectionNames.includes(categoriesCollName)) {
      await db.collection(categoriesCollName).insertOne({
        name: 'Collection Metadata',
        description: 'Category collection for user',
        createdAt: new Date(),
        ownerId: userId,
      });
    }
    
    // Mark the user as having initialized collections
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          hasInitializedCollections: true,
          updatedAt: new Date()
        } 
      },
      { upsert: false }
    );
    
    return true;
  } catch (error) {
    console.error('Error initializing user collections:', error);
    throw error;
  }
}