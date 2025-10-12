import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getUserProductsCollection } from '@/lib/user-db';
import { ObjectId } from 'mongodb';

// @ts-ignore - Ignore TypeScript errors for Next.js route handlers
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication using getServerSession
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = context.params;
    const userId = session.user.id;
    const collection = await getUserProductsCollection(userId);
    
    // Get the product by ID
    const product = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

// @ts-ignore - Ignore TypeScript errors for Next.js route handlers
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = context.params;
    const userId = session.user.id;
    const collection = await getUserProductsCollection(userId);
    
    // Get the request body
    const body = await request.json();
    
    // Remove _id if it exists to avoid MongoDB update errors
    if (body._id) delete body._id;
    
    // Add updated timestamp
    body.updatedAt = new Date();
    
    // Update the product
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      ok: true, 
      updated: result.modifiedCount > 0 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// @ts-ignore - Ignore TypeScript errors for Next.js route handlers
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { id } = context.params;
    const userId = session.user.id;
    const collection = await getUserProductsCollection(userId);
    
    // Delete the product
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ ok: true, deleted: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}