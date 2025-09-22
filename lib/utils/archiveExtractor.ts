/**
 * Утилита для извлечения DICOM файлов из OneVolumeViewer архивов
 */

export interface ExtractedFile {
  name: string
  data: ArrayBuffer
  type: string
}

export interface ArchiveInfo {
  totalFiles: number
  dicomFiles: number
  otherFiles: number
  archiveType: string
}

export class ArchiveExtractor {
  /**
   * Извлекает файлы из OneVolumeViewer архива
   */
  static async extractFromArchive(file: File): Promise<{
    files: ExtractedFile[]
    info: ArchiveInfo
  }> {
    try {
      console.log('🔍 Анализ архива:', file.name)
      
      const buffer = await file.arrayBuffer()
      const files: ExtractedFile[] = []
      
      // Проверяем, является ли это ZIP архивом
      if (this.isZipArchive(buffer)) {
        return await this.extractFromZip(buffer, file.name)
      }
      
      // Проверяем, является ли это OneVolumeViewer архивом
      if (this.isOneVolumeViewerArchive(buffer)) {
        return await this.extractFromOneVolumeViewer(buffer, file.name)
      }
      
      // Если это одиночный файл
      return await this.extractSingleFile(file)
      
    } catch (error) {
      console.error('❌ Ошибка извлечения из архива:', error)
      throw new Error(`Не удалось извлечь файлы из архива: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    }
  }

  /**
   * Проверяет, является ли файл ZIP архивом
   */
  private static isZipArchive(buffer: ArrayBuffer): boolean {
    const view = new Uint8Array(buffer)
    // ZIP файлы начинаются с PK\x03\x04
    return view.length >= 4 && 
           view[0] === 0x50 && view[1] === 0x4B && 
           view[2] === 0x03 && view[3] === 0x04
  }

  /**
   * Проверяет, является ли файл OneVolumeViewer архивом
   */
  private static isOneVolumeViewerArchive(buffer: ArrayBuffer): boolean {
    const view = new Uint8Array(buffer)
    const decoder = new TextDecoder()
    const header = decoder.decode(view.slice(0, 100))
    
    return header.includes('OneVolumeViewer') || 
           header.includes('CT') ||
           header.includes('DICOM')
  }

  /**
   * Извлекает файлы из ZIP архива
   */
  private static async extractFromZip(buffer: ArrayBuffer, fileName: string): Promise<{
    files: ExtractedFile[]
    info: ArchiveInfo
  }> {
    try {
      // Используем JSZip для извлечения
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(buffer)
      
      const files: ExtractedFile[] = []
      let dicomCount = 0
      let otherCount = 0
      
      for (const [name, zipEntry] of Object.entries(zipContent.files)) {
        if (zipEntry.dir) continue
        
        const data = await zipEntry.async('arraybuffer')
        const type = this.getFileType(name, data)
        
        files.push({
          name,
          data,
          type
        })
        
        if (type === 'dicom') {
          dicomCount++
        } else {
          otherCount++
        }
      }
      
      return {
        files,
        info: {
          totalFiles: files.length,
          dicomFiles: dicomCount,
          otherFiles: otherCount,
          archiveType: 'ZIP'
        }
      }
    } catch (error) {
      console.error('❌ Ошибка извлечения из ZIP:', error)
      throw new Error('Не удалось извлечь файлы из ZIP архива')
    }
  }

  /**
   * Извлекает файлы из OneVolumeViewer архива
   */
  private static async extractFromOneVolumeViewer(buffer: ArrayBuffer, fileName: string): Promise<{
    files: ExtractedFile[]
    info: ArchiveInfo
  }> {
    try {
      // Простая реализация для OneVolumeViewer архивов
      // В реальном проекте здесь должна быть более сложная логика парсинга
      
      const files: ExtractedFile[] = []
      const view = new Uint8Array(buffer)
      
      // Ищем DICOM файлы в архиве
      const dicomFiles = this.findDicomFilesInBuffer(view)
      
      for (const dicomFile of dicomFiles) {
        files.push({
          name: `extracted_${files.length + 1}.dcm`,
          data: dicomFile.data,
          type: 'dicom'
        })
      }
      
      return {
        files,
        info: {
          totalFiles: files.length,
          dicomFiles: files.length,
          otherFiles: 0,
          archiveType: 'OneVolumeViewer'
        }
      }
    } catch (error) {
      console.error('❌ Ошибка извлечения из OneVolumeViewer:', error)
      throw new Error('Не удалось извлечь файлы из OneVolumeViewer архива')
    }
  }

  /**
   * Обрабатывает одиночный файл
   */
  private static async extractSingleFile(file: File): Promise<{
    files: ExtractedFile[]
    info: ArchiveInfo
  }> {
    const buffer = await file.arrayBuffer()
    const type = this.getFileType(file.name, buffer)
    
    const files: ExtractedFile[] = [{
      name: file.name,
      data: buffer,
      type
    }]
    
    return {
      files,
      info: {
        totalFiles: 1,
        dicomFiles: type === 'dicom' ? 1 : 0,
        otherFiles: type === 'dicom' ? 0 : 1,
        archiveType: 'Single File'
      }
    }
  }

  /**
   * Определяет тип файла
   */
  private static getFileType(fileName: string, data: ArrayBuffer): string {
    const name = fileName.toLowerCase()
    const view = new Uint8Array(data)
    
    // Проверяем DICOM файлы (начинаются с DICM или имеют специфичную структуру)
    if (name.endsWith('.dcm') || name.endsWith('.dicom')) {
      return 'dicom'
    }
    
    // Проверяем DICOM по сигнатуре
    if (view.length >= 132) {
      const dicomSignature = new TextDecoder().decode(view.slice(128, 132))
      if (dicomSignature === 'DICM') {
        return 'dicom'
      }
    }
    
    // Проверяем другие форматы
    if (name.endsWith('.nii') || name.endsWith('.nifti')) {
      return 'nifti'
    }
    
    if (name.endsWith('.hdr')) {
      return 'analyze'
    }
    
    if (name.endsWith('.ktx')) {
      return 'ktx'
    }
    
    return 'unknown'
  }

  /**
   * Ищет DICOM файлы в буфере
   */
  private static findDicomFilesInBuffer(buffer: Uint8Array): Array<{data: ArrayBuffer, offset: number}> {
    const dicomFiles: Array<{data: ArrayBuffer, offset: number}> = []
    const dicomSignature = new TextEncoder().encode('DICM')
    
    for (let i = 0; i < buffer.length - 132; i++) {
      // Ищем сигнатуру DICOM
      if (buffer[i + 128] === dicomSignature[0] &&
          buffer[i + 129] === dicomSignature[1] &&
          buffer[i + 130] === dicomSignature[2] &&
          buffer[i + 131] === dicomSignature[3]) {
        
        // Извлекаем DICOM файл (упрощенная версия)
        const dicomData = buffer.slice(i, i + 1024 * 1024) // Первый мегабайт
        dicomFiles.push({
          data: dicomData.buffer,
          offset: i
        })
      }
    }
    
    return dicomFiles
  }

  /**
   * Создает ZIP архив с извлеченными DICOM файлами
   */
  static async createDicomArchive(files: ExtractedFile[]): Promise<Blob> {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      for (const file of files) {
        if (file.type === 'dicom') {
          zip.file(file.name, file.data)
        }
      }
      
      return await zip.generateAsync({ type: 'blob' })
    } catch (error) {
      console.error('❌ Ошибка создания DICOM архива:', error)
      throw new Error('Не удалось создать DICOM архив')
    }
  }

  /**
   * Скачивает файл
   */
  static downloadFile(file: ExtractedFile): void {
    const blob = new Blob([file.data])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
} 