import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import ImageShare from '@/models/ImageShare'

export async function GET(
  request: NextRequest,
<<<<<<< HEAD
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    
=======
  { params }: { params: { type: string } }
) {
  try {
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
    await dbConnect()
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

<<<<<<< HEAD
=======
    const { type } = params

>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
    if (type !== 'outgoing' && type !== 'incoming') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "outgoing" or "incoming"' },
        { status: 400 }
      )
    }

    let query = {}
    if (type === 'outgoing') {
      query = { fromClinicId: user.clinicId }
    } else {
      query = { toClinicId: user.clinicId }
    }

    const shares = await ImageShare.find(query)
      .sort({ createdAt: -1 })
      .lean()

<<<<<<< HEAD
    const formattedShares = shares.map((share: any) => ({
=======
    const formattedShares = shares.map(share => ({
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
      id: share._id.toString(),
      imageId: share.imageId,
      fromClinicId: share.fromClinicId,
      toClinicId: share.toClinicId,
      sharedBy: share.sharedBy,
      shareType: share.shareType,
      status: share.status,
      requestMessage: share.requestMessage,
      responseMessage: share.responseMessage,
      consultationResult: share.consultationResult,
      expiresAt: share.expiresAt?.toISOString(),
      createdAt: share.createdAt.toISOString(),
      updatedAt: share.updatedAt.toISOString(),
    }))

    // Добавляем мок данные для демонстрации
    const mockShares = []
    if (type === 'incoming') {
      mockShares.push(
        {
          id: 'demo_incoming_1',
          imageId: 'img_001',
          fromClinicId: 'clinic_2',
          toClinicId: user.clinicId,
          sharedBy: 'dr_petrov',
          shareType: 'consultation',
          status: 'pending',
          requestMessage: 'Нужна консультация по рентгену грудной клетки. Подозрение на пневмонию.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'demo_incoming_2',
          imageId: 'img_002', 
          fromClinicId: 'clinic_3',
          toClinicId: user.clinicId,
          sharedBy: 'dr_ivanov',
          shareType: 'view',
          status: 'pending',
          requestMessage: 'Пациент переводится к вам. Нужен доступ к истории снимков.',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 часов назад
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        }
      )
    } else if (type === 'outgoing') {
      mockShares.push(
        {
          id: 'demo_outgoing_1',
          imageId: 'img_003',
          fromClinicId: user.clinicId,
          toClinicId: 'clinic_4',
          sharedBy: user.id,
          shareType: 'consultation',
          status: 'approved',
          requestMessage: 'Сложный случай перелома. Нужно мнение травматолога.',
          responseMessage: 'Заключение: перелом со смещением, рекомендуется операция.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // день назад
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      )
    }

    return NextResponse.json([...formattedShares, ...mockShares])
  } catch (error) {
    console.error('Get shares error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 