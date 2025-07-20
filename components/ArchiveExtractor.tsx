'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { 
  ArchiveBoxIcon,
  DocumentArrowDownIcon,
  FolderArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { ArchiveExtractor, ExtractedFile, ArchiveInfo } from '@/lib/utils/archiveExtractor'
import { OneVolumeConverter, OneVolumeMetadata, DICOMSeries } from '@/lib/utils/oneVolumeConverter'

interface ArchiveExtractorProps {
  onFilesExtracted?: (files: ExtractedFile[]) => void
  onError?: (error: Error) => void
}

export default function ArchiveExtractorComponent({ onFilesExtracted, onError }: ArchiveExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([])
  const [archiveInfo, setArchiveInfo] = useState<ArchiveInfo | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsExtracting(true)
    setShowResults(false)
    setExtractedFiles([])
    setArchiveInfo(null)

    try {
      console.log('🔍 Начинаем извлечение из архива:', file.name)
      
      const result = await ArchiveExtractor.extractFromArchive(file)
      
      setExtractedFiles(result.files)
      setArchiveInfo(result.info)
      setShowResults(true)
      
      onFilesExtracted?.(result.files)
      
      toast.success('Архив успешно обработан', {
        description: `Найдено ${result.info.dicomFiles} DICOM файлов из ${result.info.totalFiles} файлов`,
        duration: 5000
      })
      
    } catch (error) {
      console.error('❌ Ошибка извлечения:', error)
      onError?.(error as Error)
      toast.error('Ошибка обработки архива', {
        description: error.message,
        duration: 5000
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleOneVolumeConversion = async () => {
    if (extractedFiles.length === 0) return

    setIsConverting(true)
    setConversionProgress(0)

    try {
      console.log('🔄 Начинаем конвертацию OneVolumeViewer в DICOM...')
      
      // Ищем файлы OneVolumeViewer
      const volumeFile = extractedFiles.find(f => f.name.toLowerCase().endsWith('.vol'))
      const volumeXmlFile = extractedFiles.find(f => f.name.toLowerCase().includes('volumeid.xml'))
      const verCtrlFile = extractedFiles.find(f => f.name.toLowerCase().includes('ver_ctrl.txt'))
      
      if (!volumeFile) {
        throw new Error('Файл .vol не найден в архиве')
      }
      
      if (!volumeXmlFile || !verCtrlFile) {
        throw new Error('Метаданные OneVolumeViewer не найдены')
      }
      
      setConversionProgress(10)
      
      // Парсим метаданные
      const volumeXmlText = new TextDecoder().decode(volumeXmlFile.data)
      const verCtrlText = new TextDecoder().decode(verCtrlFile.data)
      const metadata = OneVolumeConverter.parseMetadata(volumeXmlText, verCtrlText)
      
      setConversionProgress(20)
      
      // Конвертируем в DICOM
      const dicomSeries = await OneVolumeConverter.convertToDICOM(volumeFile.data, metadata)
      
      setConversionProgress(80)
      
      // Создаем ZIP архив
      const dicomArchive = await OneVolumeConverter.createDICOMArchive(dicomSeries)
      
      setConversionProgress(90)
      
      // Скачиваем архив
      const url = URL.createObjectURL(dicomArchive)
      const a = document.createElement('a')
      a.href = url
      a.download = `converted_dicom_${metadata.patientName.replace(/\s+/g, '_')}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setConversionProgress(100)
      
      toast.success('Конвертация завершена', {
        description: `Создано ${dicomSeries.files.length} DICOM файлов для Med3Web`,
        duration: 5000
      })
      
    } catch (error) {
      console.error('❌ Ошибка конвертации:', error)
      toast.error('Ошибка конвертации', {
        description: error.message,
        duration: 5000
      })
    } finally {
      setIsConverting(false)
      setConversionProgress(0)
    }
  }

  const handleDownloadAll = async () => {
    if (extractedFiles.length === 0) return

    try {
      const dicomFiles = extractedFiles.filter(file => file.type === 'dicom')
      
      if (dicomFiles.length === 0) {
        toast.error('Нет DICOM файлов для скачивания')
        return
      }

      const archive = await ArchiveExtractor.createDicomArchive(dicomFiles)
      const url = URL.createObjectURL(archive)
      const a = document.createElement('a')
      a.href = url
      a.download = 'extracted_dicom_files.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('DICOM файлы скачаны', {
        description: `Скачано ${dicomFiles.length} файлов`,
        duration: 3000
      })
    } catch (error) {
      console.error('❌ Ошибка скачивания:', error)
      toast.error('Ошибка скачивания файлов', {
        description: error.message,
        duration: 5000
      })
    }
  }

  const handleDownloadFile = (file: ExtractedFile) => {
    try {
      ArchiveExtractor.downloadFile(file)
      toast.success(`Файл "${file.name}" скачан`)
    } catch (error) {
      console.error('❌ Ошибка скачивания файла:', error)
      toast.error('Ошибка скачивания файла', {
        description: error.message,
        duration: 3000
      })
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'dicom':
        return <DocumentArrowDownIcon className="w-4 h-4 text-blue-400" />
      case 'nifti':
        return <DocumentArrowDownIcon className="w-4 h-4 text-green-400" />
      case 'analyze':
        return <DocumentArrowDownIcon className="w-4 h-4 text-yellow-400" />
      case 'ktx':
        return <DocumentArrowDownIcon className="w-4 h-4 text-purple-400" />
      default:
        return <DocumentArrowDownIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'dicom':
        return 'DICOM'
      case 'nifti':
        return 'NIfTI'
      case 'analyze':
        return 'Analyze'
      case 'ktx':
        return 'KTX'
      default:
        return 'Неизвестный'
    }
  }

  const hasOneVolumeFiles = extractedFiles.some(f => 
    f.name.toLowerCase().endsWith('.vol') ||
    f.name.toLowerCase().includes('volumeid.xml') ||
    f.name.toLowerCase().includes('ver_ctrl.txt')
  )

  return (
    <div className="space-y-4">
      {/* File Upload */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 transition-colors">
        <label className="cursor-pointer">
          <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <span className="text-lg font-medium text-gray-900">
              Загрузите OneVolumeViewer архив
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Поддерживаются ZIP архивы и OneVolumeViewer файлы
            </p>
          </div>
          <input
            type="file"
            accept=".zip,.ct,.dcm,.dicom"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isExtracting || isConverting}
          />
        </label>
      </div>

      {/* Loading Indicators */}
      {isExtracting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Обработка архива...
              </p>
              <p className="text-xs text-blue-700">
                Извлечение DICOM файлов
              </p>
            </div>
          </div>
        </div>
      )}

      {isConverting && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Конвертация в DICOM...
              </p>
              <p className="text-xs text-green-700">
                Прогресс: {conversionProgress}%
              </p>
              <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && archiveInfo && (
        <div className="space-y-4">
          {/* Archive Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-medium text-green-900">
                Архив обработан успешно
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Тип архива:</span>
                <span className="ml-2 font-medium">{archiveInfo.archiveType}</span>
              </div>
              <div>
                <span className="text-green-700">Всего файлов:</span>
                <span className="ml-2 font-medium">{archiveInfo.totalFiles}</span>
              </div>
              <div>
                <span className="text-green-700">DICOM файлов:</span>
                <span className="ml-2 font-medium">{archiveInfo.dicomFiles}</span>
              </div>
              <div>
                <span className="text-green-700">Других файлов:</span>
                <span className="ml-2 font-medium">{archiveInfo.otherFiles}</span>
              </div>
            </div>
          </div>

          {/* OneVolumeViewer Conversion */}
          {hasOneVolumeFiles && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CogIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Обнаружены файлы OneVolumeViewer
                  </h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Для использования в Med3Web необходимо конвертировать .vol файлы в DICOM формат.
                  </p>
                  <button
                    onClick={handleOneVolumeConversion}
                    disabled={isConverting}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <CogIcon className="w-4 h-4" />
                    Конвертировать в DICOM для Med3Web
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Files List */}
          {extractedFiles.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    Извлеченные файлы ({extractedFiles.length})
                  </h3>
                  {archiveInfo.dicomFiles > 0 && (
                    <button
                      onClick={handleDownloadAll}
                      disabled={isConverting}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <FolderArrowDownIcon className="w-4 h-4" />
                      Скачать все DICOM
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {extractedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {getFileTypeIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileTypeLabel(file.type)} • {(file.data.byteLength / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDownloadFile(file)}
                      disabled={isConverting}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <DocumentArrowDownIcon className="w-3 h-3" />
                      Скачать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for OneVolumeViewer */}
          {archiveInfo.archiveType === 'OneVolumeViewer' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">OneVolumeViewer архив</p>
                  <p>
                    {hasOneVolumeFiles 
                      ? 'Используйте кнопку "Конвертировать в DICOM" для создания файлов, совместимых с Med3Web.'
                      : 'Med3Web не поддерживает архивы OneVolumeViewer напрямую. Для работы с ними используйте кастомный 3D viewer.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No DICOM Files Warning */}
          {archiveInfo.dicomFiles === 0 && !hasOneVolumeFiles && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">DICOM файлы не найдены</p>
                  <p>
                    В архиве не обнаружено DICOM файлов или файлов OneVolumeViewer. Убедитесь, что архив содержит медицинские изображения 
                    в поддерживаемом формате.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 