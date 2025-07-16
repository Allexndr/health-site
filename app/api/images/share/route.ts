import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import ImageShare from '@/models/ImageShare'
import { z } from 'zod'

const shareImageSchema = z.object({
  imageId: z.string(),
  toClinicId: z.string(),
  shareType: z.enum(['view', 'consultation', 'transfer']),
  requestMessage: z.string().optional(),
  expiresAt: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const shareData = shareImageSchema.parse(body)

    // Проверяем, что не делимся сами с собой
    if (shareData.toClinicId === user.clinicId) {
      return NextResponse.json(
        { error: 'Cannot share with your own clinic' },
        { status: 400 }
      )
    }

    // Создаем запрос на обмен
    const imageShare = await ImageShare.create({
      imageId: shareData.imageId,
      fromClinicId: user.clinicId,
      toClinicId: shareData.toClinicId,
      sharedBy: user.id,
      shareType: shareData.shareType,
      requestMessage: shareData.requestMessage,
      expiresAt: shareData.expiresAt ? new Date(shareData.expiresAt) : undefined,
      status: 'pending'
    })

    return NextResponse.json({
      id: imageShare._id.toString(),
      imageId: imageShare.imageId,
      fromClinicId: imageShare.fromClinicId,
      toClinicId: imageShare.toClinicId,
      sharedBy: imageShare.sharedBy,
      shareType: imageShare.shareType,
      status: imageShare.status,
      requestMessage: imageShare.requestMessage,
      expiresAt: imageShare.expiresAt?.toISOString(),
      createdAt: imageShare.createdAt.toISOString(),
      updatedAt: imageShare.updatedAt.toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Share image error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 