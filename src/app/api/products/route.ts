import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import { getUserProductsCollection, getUserId } from '@/lib/user-db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const collection = await getUserProductsCollection(userId)
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (id) {
      const product = await collection.findOne({ _id: new ObjectId(id) })
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json(product)
    }
    
    // Get all products for this user
    const products = await collection.find({ 
      // Skip the collection metadata document that was created when initializing the collection
      name: { $ne: 'Collection Metadata' } 
    }).toArray()
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error getting products:', error)
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserProductsCollection(userId)
    
    const body = await req.json()
    const { name, categoryId, description, media = [], units = 0, price = 0, meta = {} } = body
    
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }
    
    const product = {
      name,
      categoryId: categoryId || null,
      description,
      media,
      units,
      price,
      meta,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId
    }
    
    const result = await collection.insertOne(product)
    
    return NextResponse.json({ 
      ok: true, 
      id: result.insertedId,
      product: { ...product, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserProductsCollection(userId)
    
    const { id, ...update } = await req.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    
    // Add updated timestamp
    update.updatedAt = new Date()
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )
    
    return NextResponse.json({ ok: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserProductsCollection(userId)
    
    const body = await req.json()
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    // Add updated timestamp
    body.updatedAt = new Date()
    
    // Remove _id if present to avoid update errors
    if (body._id) delete body._id
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserProductsCollection(userId)
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, deleted: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
