import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { signToken, setAuthCookie } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { email, password } = loginSchema.parse(body)

    // TODO: Replace with actual database lookup and password verification
    // This is just a mock implementation for the MVP
    if (email === 'demo@example.com' && password === 'password123') {
      const user = {
        id: '1',
        email,
        name: 'Demo User',
        role: 'doctor' as const,
        clinicId: '1',
      }

      // Generate JWT token
      const token = await signToken(user)

      // Set auth cookie
      setAuthCookie(token)

      return NextResponse.json({ 
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        }
      })
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 