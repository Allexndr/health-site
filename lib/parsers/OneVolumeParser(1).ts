export interface OneVolumeMetadata {
  // Данные из ver_ctrl.txt
  version: string
  patientId: string
  patientName: string
  birthDay: string
  sex: string
  ctTaskId: string
  photoDate: string
  
  // Данные из VolumeId.xml
  volumeRadius: number
  volumeCenter: { x: number, y: number, z: number }
  voxelSize: number
  reconstructionFilter: string
  
  // Технические параметры из комментариев
  kv: number
  ma: number
  sliceInterval: number
  sliceThickness: number
  pixelSpacing: number
}

export interface OneVolumeData {
  metadata: OneVolumeMetadata
  volumeData: ArrayBuffer
  dimensions: { x: number, y: number, z: number }
  isValid: boolean
}

export class OneVolumeParser {
  static async parseDirectory(directoryPath: string): Promise<OneVolumeData> {
    try {
      // Сначала парсим метаданные
      const metadata = await this.parseMetadata(directoryPath)
      
      // Затем загружаем объемные данные
      const volumeData = await this.parseVolumeFile(directoryPath)
      
      // Вычисляем размеры на основе метаданных
      const dimensions = this.calculateDimensions(metadata)
      
      return {
        metadata,
        volumeData,
        dimensions,
        isValid: true
      }
    } catch (error) {
      console.error('Ошибка парсинга OneVolumeViewer данных:', error)
      return {
        metadata: {} as OneVolumeMetadata,
        volumeData: new ArrayBuffer(0),
        dimensions: { x: 0, y: 0, z: 0 },
        isValid: false
      }
    }
  }

  private static async parseMetadata(directoryPath: string): Promise<OneVolumeMetadata> {
    // Парсим ver_ctrl.txt
    const verCtrlContent = await this.readTextFile(`${directoryPath}/ver_ctrl.txt`)
    const verCtrlData = this.parseVerCtrl(verCtrlContent)
    
    // Парсим VolumeId.xml
    const volumeXmlContent = await this.readTextFile(`${directoryPath}/CT_20250718102232/VolumeId.xml`)
    const volumeData = this.parseVolumeXml(volumeXmlContent)
    
    // Извлекаем технические параметры из комментариев
    const techParams = this.parseTechnicalParams(verCtrlData.comment)
    
    return {
      ...verCtrlData,
      ...volumeData,
      ...techParams
    }
  }

  private static parseVerCtrl(content: string): Partial<OneVolumeMetadata> {
    const lines = content.split('\n')
    const data: any = {}
    
    for (const line of lines) {
      const match = line.match(/(\w+)\s*=\s*"([^"]*)"/)
      if (match) {
        const [, key, value] = match
        data[key] = value
      }
    }
    
    return {
      version: data.Ver,
      patientId: data.PatientID,
      patientName: data.PatientName,
      birthDay: data.BirthDay,
      sex: data.Sex,
      ctTaskId: data.CTTaskID,
      photoDate: data.PhotoDate
    }
  }

  private static parseVolumeXml(content: string): Partial<OneVolumeMetadata> {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/xml')
    
    const v0 = doc.querySelector('V0')
    if (!v0) throw new Error('Не найден элемент V0 в VolumeId.xml')
    
    const volumeRadius = parseFloat(v0.querySelector('dmmVolumeRadius')?.getAttribute('value') || '0')
    const voxelSize = parseFloat(v0.querySelector('dmmVoxelSize')?.getAttribute('value') || '0')
    const reconstructionFilter = v0.querySelector('strReconstructionFilterSetName')?.getAttribute('value') || ''
    
    const centerEl = v0.querySelector('dmmVolumeCenter')
    const volumeCenter = {
      x: parseFloat(centerEl?.getAttribute('X') || '0'),
      y: parseFloat(centerEl?.getAttribute('Y') || '0'),
      z: parseFloat(centerEl?.getAttribute('Z') || '0')
    }
    
    return {
      volumeRadius,
      volumeCenter,
      voxelSize,
      reconstructionFilter
    }
  }

  private static parseTechnicalParams(comment: string): Partial<OneVolumeMetadata> {
    const params: any = {}
    
    // Извлекаем параметры из строки комментариев
    const kvMatch = comment.match(/kV:([0-9.]+)/)
    if (kvMatch) params.kv = parseFloat(kvMatch[1])
    
    const maMatch = comment.match(/mA:([0-9.]+)/)
    if (maMatch) params.ma = parseFloat(maMatch[1])
    
    const sliceIntervalMatch = comment.match(/SliceInterval:([0-9.]+)mm/)
    if (sliceIntervalMatch) params.sliceInterval = parseFloat(sliceIntervalMatch[1])
    
    const sliceThicknessMatch = comment.match(/SliceThickness:([0-9.]+)mm/)
    if (sliceThicknessMatch) params.sliceThickness = parseFloat(sliceThicknessMatch[1])
    
    const pixelSpacingMatch = comment.match(/PixelSpacing:([0-9.]+)\\([0-9.]+)/)
    if (pixelSpacingMatch) params.pixelSpacing = parseFloat(pixelSpacingMatch[1])
    
    return params
  }

  private static async parseVolumeFile(directoryPath: string): Promise<ArrayBuffer> {
    // Загружаем файл CT_0.vol
    const volumeFilePath = `${directoryPath}/CT_20250718102232/CT_0.vol`
    const response = await fetch(volumeFilePath)
    
    if (!response.ok) {
      throw new Error(`Не удалось загрузить файл ${volumeFilePath}`)
    }
    
    return await response.arrayBuffer()
  }

  private static calculateDimensions(metadata: OneVolumeMetadata): { x: number, y: number, z: number } {
    // Рассчитываем размеры на основе радиуса и размера вокселя
    const radius = metadata.volumeRadius
    const voxelSize = metadata.voxelSize
    
    // Диаметр в вокселях
    const diameterInVoxels = Math.round((radius * 2) / voxelSize)
    
    // Для CBCT обычно кубический объем
    return {
      x: diameterInVoxels,
      y: diameterInVoxels,
      z: diameterInVoxels
    }
  }

  private static async readTextFile(path: string): Promise<string> {
    const response = await fetch(path)
    if (!response.ok) {
      throw new Error(`Не удалось загрузить файл ${path}`)
    }
    return await response.text()
  }
} 
 
 
 
 
 
 
 
 
 