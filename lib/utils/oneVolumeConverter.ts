/**
 * Конвертер OneVolumeViewer .vol файлов в DICOM формат
 * Для совместимости с Med3Web
 */

export interface OneVolumeMetadata {
  // Из VolumeId.xml
  volumeRadius: number
  voxelSize: number
  reconstructionFilter: string
  
  // Из ver_ctrl.txt
  patientId: string
  patientName: string
  birthDay: string
  sex: string
  ctTaskId: string
  photoDate: string
  
  // Из комментариев
  kv: number
  ma: number
  sliceInterval: number
  sliceThickness: number
  pixelSpacing: number
}

export interface DICOMSeries {
  files: ArrayBuffer[]
  metadata: OneVolumeMetadata
  dimensions: { width: number; height: number; depth: number }
}

export class OneVolumeConverter {
  /**
   * Конвертирует OneVolumeViewer архив в серию DICOM файлов
   */
  static async convertToDICOM(
    volumeData: ArrayBuffer,
    metadata: OneVolumeMetadata
  ): Promise<DICOMSeries> {
    try {
      console.log('🔄 Конвертация OneVolumeViewer в DICOM...')
      
      // Вычисляем размеры объема
      const dimensions = this.calculateDimensions(volumeData, metadata)
      console.log(`📏 Размеры объема: ${dimensions.width}×${dimensions.height}×${dimensions.depth}`)
      
      // Конвертируем в Uint16Array
      const volumeArray = new Uint16Array(volumeData)
      
      // Создаем серию DICOM файлов
      const dicomFiles: ArrayBuffer[] = []
      
      for (let z = 0; z < dimensions.depth; z++) {
        const sliceData = this.extractSlice(volumeArray, dimensions, z)
        const dicomFile = await this.createDICOMFile(sliceData, metadata, z, dimensions)
        dicomFiles.push(dicomFile)
        
        if (z % 50 === 0) {
          console.log(`📄 Создан DICOM файл ${z + 1}/${dimensions.depth}`)
        }
      }
      
      console.log(`✅ Конвертация завершена: ${dicomFiles.length} DICOM файлов`)
      
      return {
        files: dicomFiles,
        metadata,
        dimensions
      }
    } catch (error) {
      console.error('❌ Ошибка конвертации:', error)
      throw new Error(`Не удалось конвертировать в DICOM: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  /**
   * Вычисляет размеры объема на основе данных и метаданных
   */
  private static calculateDimensions(volumeData: ArrayBuffer, metadata: OneVolumeMetadata): {
    width: number
    height: number
    depth: number
  } {
    const totalVoxels = volumeData.byteLength / 2 // 16-bit = 2 bytes per voxel
    const radius = metadata.volumeRadius
    
    // Для кубического объема с радиусом 44мм и вокселем 0.125мм
    // Диаметр = 2 * радиус = 88мм
    // Количество вокселей = диаметр / размер вокселя = 88 / 0.125 = 704
    const estimatedSize = Math.round((radius * 2) / metadata.voxelSize)
    
    // Проверяем, подходит ли наш размер
    const calculatedVolume = estimatedSize * estimatedSize * estimatedSize
    
    if (Math.abs(calculatedVolume - totalVoxels) < 1000) {
      return {
        width: estimatedSize,
        height: estimatedSize,
        depth: estimatedSize
      }
    }
    
    // Если не подходит, вычисляем кубический корень
    const cubeRoot = Math.cbrt(totalVoxels)
    const size = Math.round(cubeRoot)
    
    return {
      width: size,
      height: size,
      depth: size
    }
  }

  /**
   * Извлекает срез из объемных данных
   */
  private static extractSlice(
    volumeArray: Uint16Array,
    dimensions: { width: number; height: number; depth: number },
    zIndex: number
  ): Uint16Array {
    const sliceSize = dimensions.width * dimensions.height
    const startIndex = zIndex * sliceSize
    const endIndex = startIndex + sliceSize
    
    return volumeArray.slice(startIndex, endIndex)
  }

  /**
   * Создает DICOM файл из среза
   */
  private static async createDICOMFile(
    sliceData: Uint16Array,
    metadata: OneVolumeMetadata,
    sliceIndex: number,
    dimensions: { width: number; height: number; depth: number }
  ): Promise<ArrayBuffer> {
    // Создаем базовую DICOM структуру
    const dicomBuffer = new ArrayBuffer(1024 + sliceData.byteLength)
    const view = new Uint8Array(dicomBuffer)
    
    // DICOM префикс (128 байт нулей)
    for (let i = 0; i < 128; i++) {
      view[i] = 0
    }
    
    // DICOM сигнатура "DICM"
    const dicomSignature = new TextEncoder().encode('DICM')
    view.set(dicomSignature, 128)
    
    // Добавляем основные DICOM теги
    let offset = 132
    
    // Transfer Syntax UID
    offset = this.writeDICOMTag(view, offset, 0x0002, 0x0010, 'UI', '1.2.840.10008.1.2')
    
    // Patient Name
    offset = this.writeDICOMTag(view, offset, 0x0010, 0x0010, 'PN', metadata.patientName)
    
    // Patient ID
    offset = this.writeDICOMTag(view, offset, 0x0010, 0x0020, 'LO', metadata.patientId)
    
    // Patient Birth Date
    offset = this.writeDICOMTag(view, offset, 0x0010, 0x0030, 'DA', metadata.birthDay)
    
    // Patient Sex
    offset = this.writeDICOMTag(view, offset, 0x0010, 0x0040, 'CS', metadata.sex)
    
    // Study Date
    offset = this.writeDICOMTag(view, offset, 0x0008, 0x0020, 'DA', metadata.photoDate.substring(0, 8))
    
    // Study Time
    offset = this.writeDICOMTag(view, offset, 0x0008, 0x0030, 'TM', metadata.photoDate.substring(8))
    
    // Modality
    offset = this.writeDICOMTag(view, offset, 0x0008, 0x0060, 'CS', 'CT')
    
    // Image Type
    offset = this.writeDICOMTag(view, offset, 0x0008, 0x0008, 'CS', 'ORIGINAL\\PRIMARY\\AXIAL')
    
    // Samples per Pixel
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0002, 'US', '1')
    
    // Photometric Interpretation
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0004, 'CS', 'MONOCHROME2')
    
    // Rows
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0010, 'US', dimensions.height.toString())
    
    // Columns
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0011, 'US', dimensions.width.toString())
    
    // Bits Allocated
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0100, 'US', '16')
    
    // Bits Stored
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0101, 'US', '16')
    
    // High Bit
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0102, 'US', '15')
    
    // Pixel Representation
    offset = this.writeDICOMTag(view, offset, 0x0028, 0x0103, 'US', '0')
    
    // Pixel Data
    offset = this.writeDICOMTag(view, offset, 0x7FE0, 0x0010, 'OW', sliceData)
    
    // Обрезаем буфер до реального размера
    return dicomBuffer.slice(0, offset)
  }

  /**
   * Записывает DICOM тег в буфер
   */
  private static writeDICOMTag(
    view: Uint8Array,
    offset: number,
    group: number,
    element: number,
    vr: string,
    value: string | Uint16Array
  ): number {
    // Group ID (2 bytes, little endian)
    view[offset] = group & 0xFF
    view[offset + 1] = (group >> 8) & 0xFF
    
    // Element ID (2 bytes, little endian)
    view[offset + 2] = element & 0xFF
    view[offset + 3] = (element >> 8) & 0xFF
    
    // VR (2 bytes)
    const vrBytes = new TextEncoder().encode(vr)
    view[offset + 4] = vrBytes[0]
    view[offset + 5] = vrBytes[1]
    
    // Value Length (2 bytes, little endian)
    let valueLength: number
    let valueBytes: Uint8Array
    
    if (typeof value === 'string') {
      valueBytes = new TextEncoder().encode(value)
      valueLength = valueBytes.length
    } else {
      valueBytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
      valueLength = valueBytes.length
    }
    
    view[offset + 6] = valueLength & 0xFF
    view[offset + 7] = (valueLength >> 8) & 0xFF
    
    // Value
    view.set(valueBytes, offset + 8)
    
    return offset + 8 + valueLength
  }

  /**
   * Создает ZIP архив с DICOM файлами
   */
  static async createDICOMArchive(dicomSeries: DICOMSeries): Promise<Blob> {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      // Добавляем DICOM файлы
      dicomSeries.files.forEach((file, index) => {
        const fileName = `slice_${String(index).padStart(4, '0')}.dcm`
        zip.file(fileName, file)
      })
      
      // Добавляем метаданные
      const metadataText = JSON.stringify(dicomSeries.metadata, null, 2)
      zip.file('metadata.json', metadataText)
      
      return await zip.generateAsync({ type: 'blob' })
    } catch (error) {
      console.error('❌ Ошибка создания DICOM архива:', error)
      throw new Error('Не удалось создать DICOM архив')
    }
  }

  /**
   * Парсит метаданные из OneVolumeViewer файлов
   */
  static parseMetadata(volumeXmlText: string, verCtrlText: string): OneVolumeMetadata {
    // Парсим VolumeId.xml
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(volumeXmlText, 'application/xml')
    
    const volumeElement = xmlDoc.querySelector('V0')
    const volumeRadius = parseFloat(volumeElement?.querySelector('dmmVolumeRadius')?.getAttribute('value') || '44')
    const voxelSize = parseFloat(volumeElement?.querySelector('dmmVoxelSize')?.getAttribute('value') || '0.125')
    const reconstructionFilter = volumeElement?.querySelector('strReconstructionFilterSetName')?.getAttribute('value') || ''
    
    // Парсим ver_ctrl.txt
    const lines = verCtrlText.split('\n')
    const metadata: any = {}
    
    lines.forEach(line => {
      const match = line.match(/^(\w+)\s*=\s*"([^"]*)"/)
      if (match) {
        metadata[match[1]] = match[2]
      }
    })
    
    // Извлекаем технические параметры из комментария
    const comment = metadata.Comment || ''
    const kvMatch = comment.match(/kV:(\d+\.?\d*)/)
    const maMatch = comment.match(/mA:(\d+\.?\d*)/)
    const sliceIntervalMatch = comment.match(/SliceInterval:(\d+\.?\d*)mm/)
    const sliceThicknessMatch = comment.match(/SliceThickness:(\d+\.?\d*)mm/)
    const pixelSpacingMatch = comment.match(/PIXEL:(\d+\.?\d*)um/)
    
    return {
      volumeRadius,
      voxelSize,
      reconstructionFilter,
      patientId: metadata.PatientID || '',
      patientName: metadata.PatientName || '',
      birthDay: metadata.BirthDay || '',
      sex: metadata.Sex || '',
      ctTaskId: metadata.CTTaskID || '',
      photoDate: metadata.PhotoDate || '',
      kv: kvMatch ? parseFloat(kvMatch[1]) : 0,
      ma: maMatch ? parseFloat(maMatch[1]) : 0,
      sliceInterval: sliceIntervalMatch ? parseFloat(sliceIntervalMatch[1]) : 0,
      sliceThickness: sliceThicknessMatch ? parseFloat(sliceThicknessMatch[1]) : 0,
      pixelSpacing: pixelSpacingMatch ? parseFloat(pixelSpacingMatch[1]) : 0
    }
  }
} 