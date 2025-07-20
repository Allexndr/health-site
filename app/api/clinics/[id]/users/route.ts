import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { z } from 'zod'

// Validation schema
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['doctor', 'staff']),
})

// Mock data store (in a real app, this would be a database)
const mockUsers = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Проверка авторизации (упрощено для демо)
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')
    
    // Для демо не блокируем запросы без авторизации
    if (!isAuthenticated) {
      console.log('Demo mode: proceeding without authentication for clinic users')
    }

    // For MVP, return all users for the clinic
    // In production, filter based on user's access
    const clinicUsers = mockUsers.get(id) || []
    
    // Add some demo users if none exist
    if (clinicUsers.length === 0) {
      const demoUsers = [
        {
          id: 'user_001',
          name: 'Доктор Иванов',
          email: 'ivanov@clinic.ru',
          role: 'doctor',
          created_at: new Date().toISOString()
        },
        {
          id: 'user_002', 
          name: 'Медсестра Петрова',
          email: 'petrova@clinic.ru',
          role: 'staff',
          created_at: new Date().toISOString()
        }
      ]
      mockUsers.set(id, demoUsers)
      return NextResponse.json(demoUsers)
    }
    
    return NextResponse.json(clinicUsers)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await getAuthUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const newUser = userSchema.parse(body)

    // Create new user
    const clinicUsers = mockUsers.get(id) || []
    const userWithId = {
      id: String(clinicUsers.length + 1),
      ...newUser,
      clinicId: id,
    }

    clinicUsers.push(userWithId)
    mockUsers.set(id, clinicUsers)

    return NextResponse.json(userWithId)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await getAuthUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, ...updates } = body
    const updatedUser = userSchema.parse(updates)

    // Update user
    const clinicUsers = mockUsers.get(id) || []
    const userIndex = clinicUsers.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    clinicUsers[userIndex] = {
      ...clinicUsers[userIndex],
      ...updatedUser,
    }

    mockUsers.set(id, clinicUsers)

    return NextResponse.json(clinicUsers[userIndex])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const user = await getAuthUser(request)
    if (!user || (user.role !== 'admin' && user.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Delete user
    const clinicUsers = mockUsers.get(id) || []
    const userIndex = clinicUsers.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUsers = clinicUsers.filter(u => u.id !== userId)
    mockUsers.set(id, updatedUsers)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

} 