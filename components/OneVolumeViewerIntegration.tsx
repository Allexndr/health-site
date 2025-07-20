'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  PlayIcon, 
  StopIcon, 
  DocumentArrowUpIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface OVVStatus {
  running: boolean
  pid?: number
  current_file?: string
  ovv_path?: string
}

interface OVVFile {
  name: string
  path: string
  size: number
}

export default function OneVolumeViewerIntegration() {
  const [status, setStatus] = useState<OVVStatus | null>(null)
  const [files, setFiles] = useState<OVVFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_BASE = 'http://localhost:8001/api'

  // Получение статуса
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        setError('Не удалось получить статус OneVolumeViewer')
      }
    } catch (err) {
      setError('OneVolumeViewer сервер недоступен')
    }
  }

  // Получение списка файлов
  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (err) {
      console.warn('Не удалось получить список файлов')
    }
  }

  // Загрузка файла
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Файл ${file.name} успешно открыт в OneVolumeViewer`)
        fetchStatus()
      } else {
        setError(data.error || 'Ошибка загрузки файла')
      }
    } catch (err) {
      setError('Ошибка соединения с сервером')
    } finally {
      setIsLoading(false)
    }
  }

  // Открытие файла из списка
  const handleOpenFile = async (filename: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${API_BASE}/open/${encodeURIComponent(filename)}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Файл ${filename} успешно открыт в OneVolumeViewer`)
        fetchStatus()
      } else {
        setError(data.error || 'Ошибка открытия файла')
      }
    } catch (err) {
      setError('Ошибка соединения с сервером')
    } finally {
      setIsLoading(false)
    }
  }

  // Остановка OneVolumeViewer
  const handleStop = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/stop`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('OneVolumeViewer остановлен')
        fetchStatus()
      } else {
        setError(data.error || 'Ошибка остановки')
      }
    } catch (err) {
      setError('Ошибка соединения с сервером')
    } finally {
      setIsLoading(false)
    }
  }

  // Обновление статуса каждые 5 секунд
  useEffect(() => {
    fetchStatus()
    fetchFiles()

    const interval = setInterval(() => {
      fetchStatus()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <InformationCircleIcon className="w-6 h-6 mr-2" />
          OneVolumeViewer Integration
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Полноценная интеграция с профессиональным OneVolumeViewer
        </p>
      </div>

      {/* Статус */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              status?.running ? 'text-green-600' : 'text-red-600'
            }`}>
              {status?.running ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <XCircleIcon className="w-5 h-5" />
              )}
              <span className="font-medium">
                {status?.running ? 'OneVolumeViewer запущен' : 'OneVolumeViewer остановлен'}
              </span>
            </div>
            
            {status?.running && (
              <div className="text-sm text-gray-600">
                PID: {status.pid} | Файл: {status.current_file?.split('/').pop()}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Обновить
            </button>
            
            {status?.running && (
              <button
                onClick={handleStop}
                disabled={isLoading}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
              >
                <StopIcon className="w-4 h-4 mr-1" />
                Остановить
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Сообщения */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {success}
          </div>
        </div>
      )}

      {/* Загрузка файла */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Загрузить файл</h3>
        
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.vol"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
            Выбрать файл
          </button>
          
          {isLoading && (
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Обработка...
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          Поддерживаемые форматы: .zip архивы OneVolumeViewer, .vol файлы
        </p>
      </div>

      {/* Список файлов */}
      {files.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Доступные файлы</h3>
          
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{file.name}</div>
                  <div className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                
                <button
                  onClick={() => handleOpenFile(file.name)}
                  disabled={isLoading}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
                >
                  <FolderOpenIcon className="w-4 h-4 mr-1" />
                  Открыть
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инструкция */}
      <div className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Инструкция</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Как использовать:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Убедитесь, что OneVolumeViewer.exe находится в папке проекта</li>
              <li>Запустите Python сервер: <code>python backend/onevolume_server.py</code></li>
              <li>Загрузите ZIP архив или .vol файл</li>
              <li>OneVolumeViewer автоматически откроется с вашим файлом</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Возможности:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Полноценный OneVolumeViewer в отдельном окне</li>
              <li>Автоматическое извлечение архивов</li>
              <li>Управление через веб-интерфейс</li>
              <li>Поддержка всех функций OneVolumeViewer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 