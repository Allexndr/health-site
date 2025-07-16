import fs from 'fs'
import path from 'path'

// Общее хранилище для демо-режима
// В реальной системе это была бы база данных

interface DemoImage {
  id: string
  filename: string
  file_path: string
  mime_type: string
  clinic_id: string
  uploaded_by: string
  created_at: string
  patient_id: string
  patient_name: string
  study_date: string
  modality: string
}

// Файл для хранения загруженных изображений
const STORAGE_FILE = path.join(process.cwd(), '.demo-storage.json')

// Загруженные пользователем изображения
let uploadedImages: DemoImage[] = []

// Загружаем данные из файла при инициализации
function loadStoredImages() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      uploadedImages = JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading stored images:', error)
    uploadedImages = []
  }
}

// Сохраняем данные в файл
function saveStoredImages() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(uploadedImages, null, 2))
  } catch (error) {
    console.error('Error saving stored images:', error)
  }
}

// Загружаем данные при первом импорте
loadStoredImages()

// Статические демо-данные
const staticMockImages: DemoImage[] = [
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

export const demoStorage = {
  // Добавить новое изображение
  addImage(image: DemoImage): void {
    uploadedImages.unshift(image) // Добавляем в начало (новые сверху)
    saveStoredImages() // Сохраняем в файл
    console.log('Added image to demo storage:', image.filename)
    console.log('Total images in storage:', uploadedImages.length)
  },

  // Получить все изображения (загруженные + статические)
  getAllImages(): DemoImage[] {
    loadStoredImages() // Перезагружаем из файла для актуальности
    // Возвращаем сначала загруженные пользователем, потом статические
    return [...uploadedImages, ...staticMockImages]
  },

  // Получить только загруженные изображения
  getUploadedImages(): DemoImage[] {
    loadStoredImages() // Перезагружаем из файла
    return [...uploadedImages]
  },

  // Получить изображение по ID
  getImageById(id: string): DemoImage | undefined {
    loadStoredImages() // Перезагружаем из файла
    const allImages = this.getAllImages()
    return allImages.find(img => img.id === id)
  },

  // Удалить изображение по ID
  deleteImage(id: string): boolean {
    loadStoredImages() // Перезагружаем из файла
    
    const uploadedIndex = uploadedImages.findIndex(img => img.id === id)
    if (uploadedIndex !== -1) {
      const deletedImage = uploadedImages[uploadedIndex]
      uploadedImages.splice(uploadedIndex, 1)
      saveStoredImages() // Сохраняем изменения
      console.log('Deleted uploaded image from demo storage:', deletedImage.filename)
      console.log('Remaining uploaded images:', uploadedImages.length)
      return true
    }
    
    // Проверяем статические изображения (в демо-режиме позволяем удалять и их)
    const staticIndex = staticMockImages.findIndex(img => img.id === id)
    if (staticIndex !== -1) {
      const deletedImage = staticMockImages[staticIndex]
      staticMockImages.splice(staticIndex, 1)
      console.log('Deleted static image from demo storage:', deletedImage.filename)
      return true
    }
    
    console.log('Image not found for deletion:', id)
    return false
  },

  // Очистить загруженные изображения (для отладки)
  clearUploadedImages(): void {
    uploadedImages = []
    saveStoredImages()
    console.log('Cleared uploaded images from demo storage')
  }
}

export type { DemoImage } 