import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации (упрощено для демо)
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')
    
    // Для демо не блокируем запросы без авторизации
    if (!isAuthenticated) {
      console.log('Demo mode: proceeding without authentication')
    }

    // Получаем данные формы
    const formData = await request.formData()
    const file = formData.get('file') as File
    const patientName = formData.get('patient_name') as string
    const patientId = formData.get('patient_id') as string
    const studyDate = formData.get('study_date') as string
    const modality = formData.get('modality') as string

    // Проверяем наличие файла
    if (!file) {
      return NextResponse.json(
        { detail: 'Файл не предоставлен' },
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

    // Демонстрационная загрузка - просто возвращаем успех
    // В реальной реализации здесь была бы загрузка в Cloudinary
    const mockImageId = Math.random().toString(36).substr(2, 9)
    const mockUrl = `https://demo-storage.example.com/images/${mockImageId}_${file.name}`

    return NextResponse.json({ 
      id: mockImageId,
      url: mockUrl,
      filename: file.name,
      patient_name: patientName,
      patient_id: patientId,
      study_date: studyDate,
      modality: modality,
      uploaded_at: new Date().toISOString()
    })
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