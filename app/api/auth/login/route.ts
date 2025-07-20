import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { signToken, setAuthCookie } from '@/lib/auth'
import { z } from 'zod'

// Ensure dynamic route handling for Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Validation schema for login request
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and FormData
    let username: string, password: string
    
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      const validated = loginSchema.parse(body)
      username = validated.username
      password = validated.password
    } else {
      // Handle FormData from API client
      const formData = await request.formData()
      username = formData.get('username') as string
      password = formData.get('password') as string
      
      if (!username || !password) {
        return NextResponse.json(
          { error: 'Username and password are required' },
          { status: 400 }
        )
      }
    }

    // Check demo credentials that match the frontend
    if (username === 'dental_clinic_1' && password === 'demo123') {
      const clinic = {
        _id: '1',
        name: 'Стоматологическая клиника "Белая улыбка"',
        login: 'dental_clinic_1',
      }

<<<<<<< HEAD
      // Create User object for JWT token
      const user = {
        id: '1',
        email: 'dental_clinic_1@demo.com',
        name: 'Стоматологическая клиника "Белая улыбка"',
        role: 'admin' as const,
        clinicId: 'dental_clinic_1'
      }

      // Generate JWT token
      const token = await signToken(user)
=======
      // Generate JWT token
      const token = await signToken(clinic)
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a

      // Return token response that matches frontend expectations
      return NextResponse.json({ 
        access_token: token,
        token: token, // For compatibility with different clients
        token_type: 'bearer',
        user: clinic
      })
    }

    // Invalid credentials
    return NextResponse.json(
      { detail: 'Invalid username or password' },
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
<<<<<<< HEAD
}

=======
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
} 