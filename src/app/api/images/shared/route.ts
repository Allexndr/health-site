import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import ImageShare from '@/models/ImageShare'

// Мок данные снимков для демонстрации
const mockImages = [
  {
    id: '1',
    filename: 'xray_patient_001.dcm',
    file_path: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    mime_type: 'image/dicom',
    clinic_id: '1',
    uploaded_by: 'dr_smith',
    created_at: new Date().toISOString(),
    patient_id: 'PAT001',
    patient_name: 'Иван Петров',
    study_date: '2024-01-15',
    modality: 'X-Ray',
  },
  {
    id: '2',
    filename: 'ct_scan_002.dcm',
    file_path: 'https://res.cloudinary.com/demo/image/upload/v1234567890/medical/ct_scan.jpg',
    mime_type: 'image/dicom',
    clinic_id: '2',
    uploaded_by: 'dr_johnson',
    created_at: new Date().toISOString(),
    patient_id: 'PAT002',
    patient_name: 'Мария Сидорова',
    study_date: '2024-01-14',
    modality: 'CT',
  },
]

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получаем все одобренные запросы, где наша клиника получила доступ
    const approvedShares = await ImageShare.find({
      toClinicId: user.clinicId,
      status: 'approved'
    }).lean()

    // Для демонстрации возвращаем мок данные
    // В реальной системе здесь был бы запрос к базе данных изображений
    const sharedImages = approvedShares.map((share, index) => {
      const mockImage = mockImages[index % mockImages.length]
      return {
        ...mockImage,
        id: share.imageId,
        shareType: share.shareType,
        sharedFrom: share.fromClinicId,
        shareId: share._id.toString(),
      }
    })

    // Добавляем несколько мок изображений для демонстрации
    const demoSharedImages = [
      {
        ...mockImages[0],
        shareType: 'view',
        sharedFrom: 'clinic_2',
        shareId: 'demo_share_1',
      },
      {
        ...mockImages[1],
        shareType: 'consultation',
        sharedFrom: 'clinic_3', 
        shareId: 'demo_share_2',
      },
    ]

    return NextResponse.json([...sharedImages, ...demoSharedImages])
  } catch (error) {
    console.error('Get shared images error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 