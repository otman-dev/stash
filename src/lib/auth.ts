import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

export async function hashPassword(pw: string) {
  return await bcrypt.hash(pw, 10)
}

export async function verifyPassword(pw: string, hash: string) {
  return await bcrypt.compare(pw, hash)
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}
