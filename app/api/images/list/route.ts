import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации (упрощено для демо)
    const authHeader = request.headers.get('authorization')
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')
    
    // Для демо не блокируем запросы без авторизации
    if (!isAuthenticated) {
      console.log('Demo mode: proceeding without authentication')
    }

    // Демонстрационные данные изображений
    const mockImages = [
      {
        id: 'img_001',
        filename: 'panoramic_x_ray_001.jpg',
        file_path: 'https://placehold.co/800x400/e2e8f0/475569?text=Панорамный+снимок',
        mime_type: 'image/jpeg',
        clinic_id: '1',
        uploaded_by: '1',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 дня назад
        patient_id: 'PAT_001',
        patient_name: 'Иванов Иван Иванович',
        study_date: '2025-01-13',
        modality: 'Панорамный снимок'
      },
      {
        id: 'img_002',
        filename: 'dental_xray_002.jpg',
        file_path: 'https://placehold.co/600x600/e2e8f0/475569?text=Прицельный+снимок',
        mime_type: 'image/jpeg',
        clinic_id: '1',
        uploaded_by: '1',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 часов назад
        patient_id: 'PAT_002',
        patient_name: 'Петрова Мария Сергеевна',
        study_date: '2025-01-15',
        modality: 'Прицельный снимок'
      },
      {
        id: 'img_003',
        filename: 'cbct_scan_003.dcm',
        file_path: 'https://placehold.co/512x512/e2e8f0/475569?text=КЛКТ',
        mime_type: 'application/dicom',
        clinic_id: '1',
        uploaded_by: '1',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 минут назад
        patient_id: 'PAT_003',
        patient_name: 'Сидоров Алексей Михайлович',
        study_date: '2025-01-15',
        modality: 'КЛКТ'
      },
      {
        id: 'img_004',
        filename: 'intraoral_004.jpg',
        file_path: 'https://placehold.co/800x600/e2e8f0/475569?text=Внутриротовой+снимок',
        mime_type: 'image/jpeg',
        clinic_id: '1',
        uploaded_by: '1',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
        patient_id: 'PAT_004',
        patient_name: 'Козлова Елена Дмитриевна',
        study_date: '2025-01-14',
        modality: 'Внутриротовой снимок'
      },
      {
        id: 'img_005',
        filename: 'cephalometric_005.jpg',
        file_path: 'https://placehold.co/700x900/e2e8f0/475569?text=ТРГ',
        mime_type: 'image/jpeg',
        clinic_id: '1',
        uploaded_by: '1',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 часа назад
        patient_id: 'PAT_005',
        patient_name: 'Михайлов Дмитрий Васильевич',
        study_date: '2025-01-15',
        modality: 'ТРГ'
      }
    ]

    return NextResponse.json(mockImages)
  } catch (error) {
    console.error('Ошибка получения изображений:', error)
    return NextResponse.json(
      { detail: 'Не удалось получить изображения' },
      { status: 500 }
    )
  }
} 