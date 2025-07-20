import JSZip from 'jszip'

export interface VolumeMetadata {
  dimensions: [number, number, number]
  spacing: [number, number, number]
  origin: [number, number, number]
  dataType: 'uint8' | 'uint16' | 'float32'
  minValue: number
  maxValue: number
}

export interface DicomSlice {
  data: Uint8Array
  metadata: {
    rows: number
    columns: number
    bitsAllocated: number
    bitsStored: number
    highBit: number
    pixelRepresentation: number
    photometricInterpretation: string
    samplesPerPixel: number
    planarConfiguration: number
    pixelSpacing: [number, number]
    imagePosition: [number, number, number]
    imageOrientation: [number, number, number, number, number, number]
    sliceLocation: number
    instanceNumber: number
  }
}

export class VolumeConverter {
  private metadata: VolumeMetadata | null = null
  private volumeData: Uint8Array | Uint16Array | null = null

  /**
   * Загружает и анализирует OneVolumeViewer .vol файл
   */
  async loadVolFile(arrayBuffer: ArrayBuffer): Promise<VolumeMetadata> {
    const dataView = new DataView(arrayBuffer)
    const dataSize = dataView.byteLength
    
    // Пытаемся определить размер заголовка и размеры объема
    let headerSize = 1024 // Стандартный размер заголовка
    let dimensions: [number, number, number] = [256, 256, 256] // Значения по умолчанию
    
    // Анализируем данные для определения размеров
    const remainingData = dataSize - headerSize
    const possibleSideLength = Math.cbrt(remainingData / 2) // Предполагаем 16-bit данные
    
    if (Number.isInteger(possibleSideLength) && possibleSideLength > 0) {
      dimensions = [possibleSideLength, possibleSideLength, possibleSideLength]
    } else {
      // Пытаемся найти другие возможные размеры
      const possibleSizes = this.findPossibleDimensions(remainingData)
      if (possibleSizes.length > 0) {
        dimensions = possibleSizes[0]
      }
    }
    
    // Извлекаем данные объема
    const volumeData = new Uint16Array(arrayBuffer, headerSize)
    
    // Определяем диапазон значений
    let minValue = Infinity
    let maxValue = -Infinity
    
    for (let i = 0; i < volumeData.length; i++) {
      const value = volumeData[i]
      if (value < minValue) minValue = value
      if (value > maxValue) maxValue = value
    }
    
    this.metadata = {
      dimensions,
      spacing: [0.125, 0.125, 0.125], // Стандартное разрешение для стоматологических снимков
      origin: [0, 0, 0],
      dataType: 'uint16',
      minValue,
      maxValue
    }
    
    this.volumeData = volumeData
    
    return this.metadata
  }

  /**
   * Ищет возможные размеры объема на основе размера данных
   */
  private findPossibleDimensions(dataSize: number): [number, number, number][] {
    const possibleSizes: [number, number, number][] = []
    
    // Проверяем различные комбинации размеров
    const factors = this.getFactors(dataSize / 2) // Для 16-bit данных
    
    for (const factor1 of factors) {
      for (const factor2 of factors) {
        const factor3 = (dataSize / 2) / (factor1 * factor2)
        if (Number.isInteger(factor3) && factor3 > 0) {
          possibleSizes.push([factor1, factor2, factor3])
        }
      }
    }
    
    // Сортируем по близости к кубической форме
    possibleSizes.sort((a, b) => {
      const ratioA = Math.max(a[0], a[1], a[2]) / Math.min(a[0], a[1], a[2])
      const ratioB = Math.max(b[0], b[1], b[2]) / Math.min(b[0], b[1], b[2])
      return ratioA - ratioB
    })
    
    return possibleSizes
  }

  /**
   * Получает все делители числа
   */
  private getFactors(n: number): number[] {
    const factors: number[] = []
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push(i)
        if (i !== n / i) {
          factors.push(n / i)
        }
      }
    }
    return factors.sort((a, b) => a - b)
  }

  /**
   * Конвертирует объем в DICOM срезы
   */
  async convertToDicomSlices(): Promise<DicomSlice[]> {
    if (!this.metadata || !this.volumeData) {
      throw new Error('Сначала загрузите .vol файл')
    }

    const { dimensions, spacing } = this.metadata
    const [width, height, depth] = dimensions
    const slices: DicomSlice[] = []

    for (let z = 0; z < depth; z++) {
      const sliceData = new Uint8Array(width * height)
      
      // Извлекаем срез
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const volumeIndex = z * width * height + y * width + x
          const sliceIndex = y * width + x
          
          // Нормализуем 16-bit данные в 8-bit
          const value = this.volumeData[volumeIndex]
          sliceData[sliceIndex] = Math.round((value / 65535) * 255)
        }
      }

      // Создаем метаданные DICOM для среза
      const metadata = {
        rows: height,
        columns: width,
        bitsAllocated: 8,
        bitsStored: 8,
        highBit: 7,
        pixelRepresentation: 0, // Unsigned
        photometricInterpretation: 'MONOCHROME2',
        samplesPerPixel: 1,
        planarConfiguration: 0,
        pixelSpacing: [spacing[0], spacing[1]] as [number, number],
        imagePosition: [0, 0, z * spacing[2]] as [number, number, number],
        imageOrientation: [1, 0, 0, 0, 1, 0] as [number, number, number, number, number, number],
        sliceLocation: z * spacing[2],
        instanceNumber: z + 1
      }

      slices.push({
        data: sliceData,
        metadata
      })
    }

    return slices
  }

  /**
   * Создает ZIP архив с DICOM файлами
   */
  async createDicomZip(): Promise<Blob> {
    const slices = await this.convertToDicomSlices()
    const zip = new JSZip()
    
    // Создаем DICOM файлы для каждого среза
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i]
      const dicomData = this.createDicomFile(slice)
      
      zip.file(`slice_${String(i + 1).padStart(3, '0')}.dcm`, dicomData)
    }
    
    // Добавляем метаданные
    if (this.metadata) {
      zip.file('metadata.json', JSON.stringify(this.metadata, null, 2))
    }
    
    return await zip.generateAsync({ type: 'blob' })
  }

  /**
   * Создает DICOM файл из среза
   */
  private createDicomFile(slice: DicomSlice): Uint8Array {
    // Простая реализация DICOM файла
    // В реальном приложении здесь должна быть полная DICOM структура
    
    const { data, metadata } = slice
    const dicomData = new Uint8Array(data.length + 128) // + заголовок DICOM
    
    // DICOM префикс
    const dicomPrefix = new TextEncoder().encode('DICM')
    dicomData.set(dicomPrefix, 0)
    
    // Добавляем данные изображения
    dicomData.set(data, 128)
    
    return dicomData
  }

  /**
   * Получает статистику объема
   */
  getVolumeStats(): { 
    totalVoxels: number
    nonZeroVoxels: number
    dataSize: string
    dimensions: string
  } {
    if (!this.metadata || !this.volumeData) {
      throw new Error('Сначала загрузите .vol файл')
    }

    const { dimensions } = this.metadata
    const totalVoxels = dimensions[0] * dimensions[1] * dimensions[2]
    
    let nonZeroVoxels = 0
    for (let i = 0; i < this.volumeData.length; i++) {
      if (this.volumeData[i] > 0) {
        nonZeroVoxels++
      }
    }

    const dataSizeMB = (this.volumeData.byteLength / (1024 * 1024)).toFixed(2)
    const dimensionsStr = `${dimensions[0]}×${dimensions[1]}×${dimensions[2]}`

    return {
      totalVoxels,
      nonZeroVoxels,
      dataSize: `${dataSizeMB} MB`,
      dimensions: dimensionsStr
    }
  }

  /**
   * Экспортирует объем в RAW формат
   */
  exportToRaw(): Uint8Array {
    if (!this.volumeData) {
      throw new Error('Сначала загрузите .vol файл')
    }

    return new Uint8Array(this.volumeData.buffer)
  }

  /**
   * Экспортирует метаданные
   */
  exportMetadata(): VolumeMetadata | null {
    return this.metadata
  }
}

/**
 * Утилитарная функция для быстрой конвертации файла
 */
export async function convertVolToDicom(file: File): Promise<Blob> {
  const converter = new VolumeConverter()
  const arrayBuffer = await file.arrayBuffer()
  await converter.loadVolFile(arrayBuffer)
  return await converter.createDicomZip()
}

/**
 * Утилитарная функция для анализа файла
 */
export async function analyzeVolFile(file: File): Promise<{
  metadata: VolumeMetadata
  stats: ReturnType<VolumeConverter['getVolumeStats']>
}> {
  const converter = new VolumeConverter()
  const arrayBuffer = await file.arrayBuffer()
  const metadata = await converter.loadVolFile(arrayBuffer)
  const stats = converter.getVolumeStats()
  
  return { metadata, stats }
} 