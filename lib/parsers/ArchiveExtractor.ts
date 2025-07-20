import JSZip from 'jszip'

export interface ExtractedFile {
  name: string
  content: ArrayBuffer
  size: number
}

export interface ArchiveAnalysis {
  format: 'zip' | 'rar' | 'folder' | 'unknown'
  totalFiles: number
  medicalFiles: ExtractedFile[]
  programFiles: string[]
  totalSize: number
}

export class ArchiveExtractor {
  
  /**
   * Определяет формат архива по содержимому файла
   */
  static detectArchiveFormat(arrayBuffer: ArrayBuffer): 'zip' | 'rar' | 'unknown' {
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // ZIP signature: PK (0x504B)
    if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B) {
      return 'zip'
    }
    
    // RAR signature: Rar! (0x526172211A0700) или старый формат
    if (uint8Array[0] === 0x52 && uint8Array[1] === 0x61 && uint8Array[2] === 0x72 && uint8Array[3] === 0x21) {
      return 'rar'
    }
    
    return 'unknown'
  }
  
  /**
   * Проверяет является ли файл медицинским OneVolumeViewer файлом
   */
  static isMedicalFile(filename: string): boolean {
    const name = filename.toLowerCase()
    return (
      name.endsWith('.vol') ||
      name.includes('volumeid.xml') ||
      name.includes('ver_ctrl.txt') ||
      name.includes('cmpr_0.xml') ||
      name.includes('constants.csv') ||
      name.includes('ctstatus.csv') ||
      name.includes('cttaskid.jmd')
    )
  }
  
  /**
   * Проверяет является ли файл файлом программы
   */
  static isProgramFile(filename: string): boolean {
    const name = filename.toLowerCase()
    return (
      name.endsWith('.exe') ||
      name.endsWith('.dll') ||
      name.endsWith('.pdf') ||
      name.includes('api-ms-win') ||
      name.includes('mfc140') ||
      name.includes('vcruntime') ||
      name.includes('ucrtbase') ||
      name.includes('.cjstyles') ||
      name.includes('.ini')
    )
  }
  
  /**
   * Извлекает файлы из ZIP архива
   */
  static async extractZip(arrayBuffer: ArrayBuffer): Promise<ExtractedFile[]> {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer)
      const extractedFiles: ExtractedFile[] = []
      
      console.log(`📦 ZIP архив содержит ${Object.keys(zip.files).length} файлов`)
      
      for (const [path, file] of Object.entries(zip.files)) {
        if (!file.dir && this.isMedicalFile(path)) {
          console.log(`🏥 Извлекаем медицинский файл: ${path}`)
          const content = await file.async('arraybuffer')
          
          extractedFiles.push({
            name: path.split('/').pop() || path, // Только имя файла без пути
            content,
            size: content.byteLength
          })
        }
      }
      
      return extractedFiles
    } catch (error) {
      console.error('❌ Ошибка извлечения ZIP:', error)
      throw new Error('Не удалось извлечь ZIP архив')
    }
  }
  
  /**
   * Создает сообщение для RAR файлов (пока не поддерживается полноценно)
   */
  static async extractRar(arrayBuffer: ArrayBuffer): Promise<ExtractedFile[]> {
    console.log('⚠️ RAR архив обнаружен, но полная поддержка пока недоступна')
    console.log('💡 Рекомендация: Конвертируйте RAR в ZIP для полной поддержки')
    
    // Пока возвращаем пустой массив, но не ломаем приложение
    throw new Error(`
📦 RAR архив обнаружен!

К сожалению, полная поддержка RAR архивов пока недоступна в браузере.

🔄 Рекомендации:
1. Конвертируйте RAR в ZIP архив
2. Или извлеките файлы и загрузите папку
3. Или загрузите файлы по отдельности

Поддерживаемые форматы:
✅ ZIP архивы
✅ Отдельные файлы (.vol, .xml, .txt)
✅ Папки с файлами
    `)
  }
  
  /**
   * Анализирует FileList и извлекает медицинские файлы
   */
  static async analyzeAndExtract(files: FileList): Promise<ArchiveAnalysis> {
    console.log(`🔍 Анализ ${files.length} файлов...`)
    
    const analysis: ArchiveAnalysis = {
      format: 'folder',
      totalFiles: files.length,
      medicalFiles: [],
      programFiles: [],
      totalSize: 0
    }
    
    // Проверяем, есть ли архивные файлы
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      analysis.totalSize += file.size
      
      if (file.name.toLowerCase().endsWith('.zip')) {
        console.log('📦 Обнаружен ZIP архив:', file.name)
        analysis.format = 'zip'
        
        try {
          const arrayBuffer = await file.arrayBuffer()
          const extractedFiles = await this.extractZip(arrayBuffer)
          analysis.medicalFiles.push(...extractedFiles)
        } catch (error) {
          console.error('❌ Ошибка обработки ZIP:', error)
          throw error
        }
        
      } else if (file.name.toLowerCase().endsWith('.rar')) {
        console.log('📦 Обнаружен RAR архив:', file.name)
        analysis.format = 'rar'
        
        try {
          const arrayBuffer = await file.arrayBuffer()
          await this.extractRar(arrayBuffer) // Это выбросит информативную ошибку
        } catch (error) {
          throw error // Перепрошу ошибку выше
        }
        
      } else if (this.isMedicalFile(file.name)) {
        console.log('🏥 Обнаружен медицинский файл:', file.name)
        
        const content = await file.arrayBuffer()
        analysis.medicalFiles.push({
          name: file.name,
          content,
          size: content.byteLength
        })
        
      } else if (this.isProgramFile(file.name)) {
        analysis.programFiles.push(file.name)
      }
    }
    
    console.log(`📊 Найдено медицинских файлов: ${analysis.medicalFiles.length}`)
    console.log(`📊 Найдено файлов программы: ${analysis.programFiles.length}`)
    
    return analysis
  }
  
  /**
   * Создает FileList-подобный объект из извлеченных файлов
   */
  static createFileListFromExtracted(extractedFiles: ExtractedFile[]): FileList {
    const files: File[] = []
    
    for (const extracted of extractedFiles) {
      const blob = new Blob([extracted.content])
      const file = new File([blob], extracted.name, {
        type: this.getMimeType(extracted.name)
      })
      files.push(file)
    }
    
    // Создаем FileList-подобный объект
    const fileList = {
      length: files.length,
      item: (index: number) => files[index] || null,
      [Symbol.iterator]: function* () {
        for (let i = 0; i < this.length; i++) {
          yield this.item(i)
        }
      }
    }
    
    // Добавляем файлы как индексированные свойства
    files.forEach((file, index) => {
      Object.defineProperty(fileList, index, {
        value: file,
        enumerable: true
      })
    })
    
    return fileList as FileList
  }
  
  /**
   * Определяет MIME тип по расширению файла
   */
  static getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'vol': return 'application/octet-stream'
      case 'xml': return 'application/xml'
      case 'txt': return 'text/plain'
      case 'csv': return 'text/csv'
      case 'jmd': return 'application/octet-stream'
      default: return 'application/octet-stream'
    }
  }
}

 
 
 
 