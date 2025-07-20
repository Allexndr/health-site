import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import ImageShare from '@/models/ImageShare'
import { z } from 'zod'

const responseSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  responseMessage: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params
    
    await dbConnect()
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const responseData = responseSchema.parse(body)

    // Находим запрос на обмен
    const imageShare = await ImageShare.findById(shareId)
    
    if (!imageShare) {
      return NextResponse.json(
        { error: 'Share request not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь имеет право отвечать на этот запрос
    if (imageShare.toClinicId !== user.clinicId) {
      return NextResponse.json(
        { error: 'Not authorized to respond to this share request' },
        { status: 403 }
      )
    }

    // Проверяем, что запрос ещё в состоянии pending
    if (imageShare.status !== 'pending') {
      return NextResponse.json(
        { error: 'Share request has already been responded to' },
        { status: 400 }
      )
    }

    // Обновляем статус
    imageShare.status = responseData.status
    imageShare.responseMessage = responseData.responseMessage
    await imageShare.save()

    return NextResponse.json({
      id: imageShare._id.toString(),
      imageId: imageShare.imageId,
      fromClinicId: imageShare.fromClinicId,
      toClinicId: imageShare.toClinicId,
      sharedBy: imageShare.sharedBy,
      shareType: imageShare.shareType,
      status: imageShare.status,
      requestMessage: imageShare.requestMessage,
      responseMessage: imageShare.responseMessage,
      consultationResult: imageShare.consultationResult,
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

    console.error('Respond to share error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

} 