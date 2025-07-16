import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import Clinic from '@/models/Clinic'

// Validation schemas
const clinicSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Для демонстрации возвращаем мок данные сети клиник
    const mockClinics = [
      {
        _id: 'clinic_1',
        name: 'Центральная клиника',
        login: 'central',
      },
      {
        _id: 'clinic_2', 
        name: 'Северный филиал',
        login: 'north_branch',
      },
      {
        _id: 'clinic_3',
        name: 'Южный филиал', 
        login: 'south_branch',
      },
      {
        _id: 'clinic_4',
        name: 'Восточный филиал',
        login: 'east_branch',
      },
      {
        _id: 'clinic_5',
        name: 'Западный филиал',
        login: 'west_branch',
      },
    ]
    
    return NextResponse.json(mockClinics)
  } catch (error) {
    console.error('Failed to fetch clinics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const clinicData = clinicSchema.parse(body)
    const newClinic = await Clinic.create(clinicData)
    return NextResponse.json(newClinic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Failed to create clinic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const body = await request.json()
    const { id, ...updates } = body
    const clinicData = clinicSchema.parse(updates)
    const updatedClinic = await Clinic.findByIdAndUpdate(id, clinicData, { new: true })
    if (!updatedClinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(updatedClinic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Failed to update clinic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthUser(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Clinic ID is required' },
        { status: 400 }
      )
    }
    const deleted = await Clinic.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ message: 'Clinic deleted successfully' })
  } catch (error) {
    console.error('Failed to delete clinic:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 