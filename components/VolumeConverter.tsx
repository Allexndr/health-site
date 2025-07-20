'use client'

import React, { useState } from 'react'
import { 
  DocumentArrowUpIcon, 
  DocumentArrowDownIcon,
  CogIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { convertVolToDicom, analyzeVolFile, VolumeMetadata } from '@/lib/utils/volumeConverter'

interface VolumeConverterProps {}

export default function VolumeConverter({}: VolumeConverterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<VolumeMetadata | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [convertedFile, setConvertedFile] = useState<Blob | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setMetadata(null)
    setStats(null)
    setConvertedFile(null)

    try {
      // Проверяем формат файла
      if (!file.name.toLowerCase().endsWith('.vol')) {
        throw new Error('Поддерживаются только .vol файлы OneVolumeViewer')
      }

      // Анализируем файл
      const analysis = await analyzeVolFile(file)
      setMetadata(analysis.metadata)
      setStats(analysis.stats)

      setSuccess('Файл успешно проанализирован. Готов к конвертации.')
    } catch (err) {
      console.error('Error analyzing file:', err)
      setError(err instanceof Error ? err.message : 'Ошибка анализа файла')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvert = async () => {
    const fileInput = document.getElementById('vol-file-input') as HTMLInputElement
    const file = fileInput.files?.[0]
    if (!file) {
      setError('Сначала выберите файл для конвертации')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const dicomZip = await convertVolToDicom(file)
      setConvertedFile(dicomZip)
      setSuccess('Файл успешно конвертирован в DICOM формат!')
    } catch (err) {
      console.error('Error converting file:', err)
      setError(err instanceof Error ? err.message : 'Ошибка конвертации')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!convertedFile) return

    const url = URL.createObjectURL(convertedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted_dicom.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const fileInput = document.getElementById('vol-file-input') as HTMLInputElement
      fileInput.files = event.dataTransfer.files
      await handleFileUpload({ target: { files: event.dataTransfer.files } } as any)
    }
  }

  return (
    <div className="space-y-6">
      {/* Загрузка файла */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-blue-600" />
          Загрузка OneVolumeViewer файла
        </h3>
        
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept=".vol"
            onChange={handleFileUpload}
            className="hidden"
            id="vol-file-input"
          />
          <label htmlFor="vol-file-input" className="cursor-pointer">
            <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Перетащите .vol файл сюда или нажмите для выбора
            </p>
            <p className="text-sm text-gray-500">
              Поддерживаются только .vol файлы OneVolumeViewer
            </p>
          </label>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}
      </div>

      {/* Анализ файла */}
      {metadata && stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
            Анализ файла
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Метаданные:</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Размеры:</dt>
                  <dd className="font-medium">{stats.dimensions}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Размер данных:</dt>
                  <dd className="font-medium">{stats.dataSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Всего вокселей:</dt>
                  <dd className="font-medium">{stats.totalVoxels.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Непустых вокселей:</dt>
                  <dd className="font-medium">{stats.nonZeroVoxels.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Разрешение:</dt>
                  <dd className="font-medium">{metadata.spacing.join(' × ')} мм</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Диапазон значений:</dt>
                  <dd className="font-medium">{metadata.minValue} - {metadata.maxValue}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Информация:</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Формат:</strong> OneVolumeViewer .vol
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Тип данных:</strong> {metadata.dataType.toUpperCase()}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Происхождение:</strong> Стоматологический CT сканер
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Конвертация */}
      {metadata && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CogIcon className="w-5 h-5 mr-2 text-blue-600" />
            Конвертация в DICOM
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-1">
                  Конвертация в DICOM формат
                </h4>
                <p className="text-sm text-yellow-700">
                  Конвертируйте OneVolumeViewer .vol файл в стандартный DICOM формат для совместимости 
                  с профессиональными медицинскими приложениями. Результат будет сохранен как ZIP архив 
                  с DICOM срезами.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CogIcon className="w-4 h-4 mr-2" />
              )}
              Конвертировать в DICOM
            </button>

            {convertedFile && (
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Скачать DICOM ZIP
              </button>
            )}
          </div>

          {convertedFile && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Конвертация завершена!</p>
                  <p className="text-green-700 text-sm">
                    Размер архива: {(convertedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Информация */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Конвертер OneVolumeViewer → DICOM
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Этот инструмент конвертирует проприетарные .vol файлы OneVolumeViewer в стандартный 
              DICOM формат для совместимости с профессиональными медицинскими приложениями.
            </p>
            <div className="text-sm text-blue-700">
              <p><strong>Что происходит при конвертации:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Анализ структуры .vol файла</li>
                <li>Извлечение объемных данных</li>
                <li>Создание DICOM срезов</li>
                <li>Упаковка в ZIP архив</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 