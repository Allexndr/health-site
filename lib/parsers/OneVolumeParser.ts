export interface OneVolumeMetadata {
  version: string
  patientId: string
  patientName: string
  birthDay: string
  sex: string
  ctTaskId: string
  photoDate: string
  comment?: string
  volumeRadius: number
  volumeCenter: { x: number, y: number, z: number }
  voxelSize: number
  pixelSpacing: number
}

export interface OneVolumeData {
  metadata: OneVolumeMetadata
  volumeData: ArrayBuffer
  patientInfo: {
    name: string
    id: string
    birthDate: string
  }
}

export class OneVolumeParser {
  async parseArchive(file: File): Promise<OneVolumeData> {
    // Симуляция парсинга архива
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockMetadata: OneVolumeMetadata = {
      version: '1.0',
      patientId: 'P' + Math.random().toString(36).substr(2, 9),
      patientName: 'Тестовый Пациент',
      birthDay: '1985-01-01',
      sex: 'M',
      ctTaskId: 'CT' + Math.random().toString(36).substr(2, 9),
      photoDate: new Date().toISOString().split('T')[0],
      comment: 'Тестовые данные',
      volumeRadius: 50,
      volumeCenter: { x: 0, y: 0, z: 0 },
      voxelSize: 0.5,
      pixelSpacing: 0.5
    }

    const mockVolumeData = new ArrayBuffer(512 * 512 * 256 * 2) // 2 bytes per voxel

    return {
      metadata: mockMetadata,
      volumeData: mockVolumeData,
      patientInfo: {
        name: mockMetadata.patientName,
        id: mockMetadata.patientId,
        birthDate: mockMetadata.birthDay
      }
    }
  }

  async parseDirectory(directoryPath: string): Promise<OneVolumeData> {
    // Симуляция парсинга директории
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return this.parseArchive(new File([], 'mock.ovv'))
  }
}