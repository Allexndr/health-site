import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { demoStorage, type DemoImage } from '@/lib/demo-storage'

// Ensure dynamic route handling for Vercel
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации (упрощено для демо)
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')
    
    // Для демо не блокируем запросы без авторизации
    if (!isAuthenticated) {
      console.log('Demo mode: proceeding without authentication')
    }

    // Проверяем тип контента
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { detail: 'Требуется multipart/form-data с файлом' },
        { status: 400 }
      )
    }

    // Получаем данные формы
    const formData = await request.formData()
    const file = formData.get('file') as File
    const patientName = formData.get('patient_name') as string
    const patientId = formData.get('patient_id') as string
    const studyDate = formData.get('study_date') as string
    const modality = formData.get('modality') as string

    // Проверяем наличие файла
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { detail: 'Файл не предоставлен или имеет неверный формат' },
        { status: 400 }
      )
    }

    // Проверяем обязательные поля
    if (!patientName) {
      return NextResponse.json(
        { detail: 'Имя пациента обязательно' },
        { status: 400 }
      )
    }

    // Создаем новое изображение
    const mockImageId = Math.random().toString(36).substr(2, 9)
    const mockUrl = `https://placehold.co/800x600/e2e8f0/475569?text=${encodeURIComponent(file.name)}`
    
    const newImage: DemoImage = {
      id: mockImageId,
      filename: file.name,
      file_path: mockUrl,
      mime_type: file.type,
      clinic_id: '1',
      uploaded_by: '1',
      created_at: new Date().toISOString(),
      patient_id: patientId || `PAT_${Date.now()}`,
      patient_name: patientName,
      study_date: studyDate,
      modality: modality
    }

    // Добавляем в общее хранилище
    demoStorage.addImage(newImage)

    return NextResponse.json(newImage)
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    return NextResponse.json(
      { detail: 'Не удалось загрузить файл' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 