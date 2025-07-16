import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // For now, return mock clinic data since we're using the demo login
    // In a real implementation, this would verify the JWT and get clinic from database
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Return demo clinic data that matches our login
    return NextResponse.json({
      _id: '1',
      name: 'Стоматологическая клиника "Белая улыбка"',
      login: 'dental_clinic_1',
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
} 