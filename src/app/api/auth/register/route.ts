import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '../../../../lib/mongodb'
import bcrypt from 'bcrypt'

// Use bcrypt directly if hashPassword function isn't available
async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

// Function to initialize user collections
async function initializeUserCollections(db: any, userId: string) {
  await db.collection(`products_${userId}`).insertOne({
    name: 'Collection Metadata',
    description: 'Product collection for user',
    createdAt: new Date(),
    ownerId: userId,
  })
  
  await db.collection(`categories_${userId}`).insertOne({
    name: 'Collection Metadata',
    description: 'Category collection for user',
    createdAt: new Date(),
    ownerId: userId,
  })
  
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, provider } = body
    
    // Check if this is a Google account registration
    if (provider === 'google') {
      if (!name || !email) {
        return NextResponse.json(
          { error: 'Name and email are required for Google registration' }, 
          { status: 400 }
        )
      }
      
      const db = await getDb()
      const users = db.collection('users')
      const exists = await users.findOne({ email })
      
      if (exists) {
        // If user already exists but registered with Google, just return success
        if (exists.googleId) {
          return NextResponse.json({ 
            ok: true, 
            id: exists._id.toString(),
            message: 'Google account already registered' 
          })
        }
        
        // If user exists with traditional login, but now wants to use Google
        // We could update the user record to include Google authentication
        return NextResponse.json(
          { error: 'Email already registered with password login' }, 
          { status: 409 }
        )
      }
      
      // Create new user with Google registration
      const user = {
        name,
        email,
        googleId: body.googleId || true, // Store Google ID if provided
        createdAt: new Date(),
        role: 'user',
      }
      
      const result = await users.insertOne(user)
      const userId = result.insertedId.toString()
      
      // Initialize user's collections
      await initializeUserCollections(db, userId)
      
      return NextResponse.json({ 
        ok: true, 
        id: userId,
        message: 'Google user created successfully' 
      }, { status: 201 })
    } else {
      // Traditional password-based registration
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email, and password are required' }, 
          { status: 400 }
        )
      }
      
      const db = await getDb()
      const users = db.collection('users')
      const exists = await users.findOne({ email })
      
      if (exists) {
        return NextResponse.json(
          { error: 'User with this email already exists' }, 
          { status: 409 }
        )
      }
      
      const hashed = await hashPassword(password)
      
      const user = {
        name,
        email,
        password: hashed,
        createdAt: new Date(),
        role: 'user',
      }
      
      const result = await users.insertOne(user)
      const userId = result.insertedId.toString()
      
      // Initialize user's collections
      await initializeUserCollections(db, userId)
      
      return NextResponse.json({ 
        ok: true, 
        id: userId,
        message: 'User created successfully' 
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
