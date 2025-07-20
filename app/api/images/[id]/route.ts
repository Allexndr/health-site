import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { demoStorage } from '@/lib/demo-storage'

// Ensure dynamic route handling for Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
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
      console.log('Demo mode: proceeding without authentication')
    }

    const imageId = id

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, существует ли изображение
    const image = demoStorage.getImageById(imageId)
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Удаляем изображение
    const deleted = demoStorage.deleteImage(imageId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    console.log(`Successfully deleted image: ${imageId}`)

    return NextResponse.json({ 
      message: 'Image deleted successfully',
      id: imageId 
    })
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
      console.log('Demo mode: proceeding without authentication')
    }

    const imageId = id

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      )
    }

    // Получаем изображение по ID
    const image = demoStorage.getImageById(imageId)
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error('Get image error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

} 