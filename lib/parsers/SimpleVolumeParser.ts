export interface VolumeData {
  data: Uint16Array
  width: number
  height: number
  depth: number
  spacing?: [number, number, number]
  metadata?: {
    patientName?: string
    studyDate?: string
    modality?: string
    description?: string
  }
}

export class SimpleVolumeParser {
  
  /**
   * Парсит .vol файл OneVolumeViewer
   */
  static async parseVolFile(arrayBuffer: ArrayBuffer): Promise<VolumeData> {
    try {
      console.log('🔍 Парсинг .vol файла...')
      
      // Предполагаем, что это 16-битные данные
      const uint16Array = new Uint16Array(arrayBuffer)
      
      // Пытаемся определить размеры на основе размера файла
      const totalPixels = uint16Array.length
      
      // Популярные размеры для стоматологических CT
      const possibleDimensions = [
        [256, 256, 256], // 16,777,216 пикселей
        [512, 512, 256], // 67,108,864 пикселей
        [512, 512, 512], // 134,217,728 пикселей
        [256, 256, 128], // 8,388,608 пикселей
        [128, 128, 128], // 2,097,152 пикселей
      ]
      
      let width = 256
      let height = 256
      let depth = 256
      
      // Находим подходящие размеры
      for (const [w, h, d] of possibleDimensions) {
        if (w * h * d === totalPixels) {
          width = w
          height = h
          depth = d
          break
        }
      }
      
      // Если точное совпадение не найдено, используем квадратные размеры
      if (width * height * depth !== totalPixels) {
        const cubeRoot = Math.cbrt(totalPixels)
        width = Math.floor(cubeRoot)
        height = Math.floor(cubeRoot)
        depth = Math.floor(totalPixels / (width * height))
        
        console.log(`⚠️ Точные размеры не найдены, используем: ${width}x${height}x${depth}`)
      }
      
      console.log(`✅ Размеры определены: ${width}x${height}x${depth}`)
      
      return {
        data: uint16Array,
        width,
        height,
        depth,
        spacing: [0.1, 0.1, 0.1], // Предполагаемые размеры вокселей в мм
        metadata: {
          modality: 'CT',
          description: 'OneVolumeViewer CT Data'
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка парсинга .vol файла:', error)
      throw new Error(`Не удалось обработать .vol файл: ${error}`)
    }
  }
  
  /**
   * Парсит ZIP архив с OneVolumeViewer файлами
   */
  static async parseZipArchive(arrayBuffer: ArrayBuffer): Promise<VolumeData> {
    try {
      console.log('🔍 Парсинг ZIP архива...')
      
      // Динамически импортируем JSZip
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      const zipData = await zip.loadAsync(arrayBuffer)
      
      // Ищем .vol файл
      let volFile: any = null
      let metadata: any = {}
      
      for (const [filename, file] of Object.entries(zipData.files)) {
        console.log(`📁 Найден файл: ${filename}`)
        
        if (filename.toLowerCase().endsWith('.vol')) {
          volFile = file
        } else if (filename.toLowerCase().includes('volumeid') || filename.toLowerCase().endsWith('.xml')) {
          // Парсим метаданные
          try {
            const xmlContent = await file.async('text')
            metadata = this.parseXMLMetadata(xmlContent)
          } catch (e) {
            console.warn('⚠️ Не удалось парсить XML метаданные:', e)
          }
        }
      }
      
      if (!volFile) {
        throw new Error('Файл .vol не найден в архиве')
      }
      
      console.log('✅ .vol файл найден в архиве')
      
      // Получаем данные .vol файла
      const volData = await volFile.async('arraybuffer')
      
      // Парсим .vol файл
      const volumeData = await this.parseVolFile(volData)
      
      // Добавляем метаданные из архива
      volumeData.metadata = {
        ...volumeData.metadata,
        ...metadata
      }
      
      return volumeData
      
    } catch (error) {
      console.error('❌ Ошибка парсинга ZIP архива:', error)
      throw new Error(`Не удалось обработать ZIP архив: ${error}`)
    }
  }
  
  /**
   * Парсит XML метаданные
   */
  private static parseXMLMetadata(xmlContent: string): any {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
      
      const metadata: any = {}
      
      // Извлекаем информацию о пациенте
      const patientName = xmlDoc.querySelector('PatientName')?.textContent
      if (patientName) metadata.patientName = patientName
      
      const studyDate = xmlDoc.querySelector('StudyDate')?.textContent
      if (studyDate) metadata.studyDate = studyDate
      
      const modality = xmlDoc.querySelector('Modality')?.textContent
      if (modality) metadata.modality = modality
      
      const description = xmlDoc.querySelector('StudyDescription')?.textContent
      if (description) metadata.description = description
      
      console.log('📋 Извлеченные метаданные:', metadata)
      return metadata
      
    } catch (error) {
      console.warn('⚠️ Ошибка парсинга XML:', error)
      return {}
    }
  }
  
  /**
   * Определяет тип файла и парсит его
   */
  static async parseFile(file: File): Promise<VolumeData> {
    console.log(`📁 Обработка файла: ${file.name} (${file.size} байт)`)
    
    const arrayBuffer = await file.arrayBuffer()
    
    if (file.name.toLowerCase().endsWith('.zip')) {
      return this.parseZipArchive(arrayBuffer)
    } else if (file.name.toLowerCase().endsWith('.vol')) {
      return this.parseVolFile(arrayBuffer)
    } else {
      throw new Error(`Неподдерживаемый формат файла: ${file.name}`)
    }
  }
} 