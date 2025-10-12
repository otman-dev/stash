import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getUserCategoriesCollection } from '@/lib/user-db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.user.id
    const collection = await getUserCategoriesCollection(userId)
    
    // Get all categories for this user
    const categories = await collection.find({ 
      // Skip the collection metadata document that was created when initializing the collection
      name: { $ne: 'Collection Metadata' } 
    }).toArray()
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error getting categories:', error)
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserCategoriesCollection(userId)
    
    const body = await req.json()
    
    if (!body.name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
    }
    
    const category = {
      name: body.name,
      description: body.description || '',
      color: body.color || '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId
    }
    
    const result = await collection.insertOne(category)
    
    return NextResponse.json({ 
      ok: true, 
      id: result.insertedId,
      category: { ...category, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserCategoriesCollection(userId)
    
    const body = await req.json()
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    if (!body.name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })
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
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, updated: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    const collection = await getUserCategoriesCollection(userId)
    
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true, deleted: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
