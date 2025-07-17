import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { demoStorage } from '@/lib/demo-storage'

// Ensure dynamic route handling for Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации (упрощено для демо)
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')
    
    // Для демо не блокируем запросы без авторизации
    if (!isAuthenticated) {
      console.log('Demo mode: proceeding without authentication')
    }

    // Получаем все изображения из общего хранилища
    const allImages = demoStorage.getAllImages()
    
    console.log('Returning images from demo storage:', allImages.length)
    console.log('Uploaded images count:', demoStorage.getUploadedImages().length)

    return NextResponse.json(allImages)
  } catch (error) {
    console.error('Ошибка получения изображений:', error)
    return NextResponse.json(
      { detail: 'Не удалось получить изображения' },
      { status: 500 }
    )
  }
} 