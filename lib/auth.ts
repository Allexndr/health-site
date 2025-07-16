import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

export type UserRole = 'admin' | 'doctor' | 'staff'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  clinicId: string
}

export interface AuthTokenPayload {
  sub: string // user id
  email: string
  role: UserRole
  clinicId: string
  exp: number
}

export async function signToken(user: User): Promise<string> {
  const payload: Omit<AuthTokenPayload, 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

export async function verifyToken(token: string): Promise<AuthTokenPayload> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    return payload as AuthTokenPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const payload = await verifyToken(token)
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      clinicId: payload.clinicId,
      name: '', // This would come from your database
    }
  } catch {
    return null
  }
}

export function hasPermission(user: User, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    doctor: 2,
    staff: 1,
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function setAuthCookie(token: string): void {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export function clearAuthCookie(): void {
  cookies().delete(COOKIE_NAME)
} 