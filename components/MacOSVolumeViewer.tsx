'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  DocumentArrowUpIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface VolumeInfo {
  shape: number[]
  dtype: string
  min_value: number
  max_value: number
  window_level: number
  window_width: number
  metadata: any
  current_file: string
}

interface SliceData {
  success: boolean
  slice_type: string
  slice_index: number
  image_data: string
  shape: number[]
}

export default function MacOSVolumeViewer() {
  const [volumeInfo, setVolumeInfo] = useState<VolumeInfo | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [sliceType, setSliceType] = useState<'axial' | 'coronal' | 'sagittal'>('axial')
  const [sliceImage, setSliceImage] = useState<string | null>(null)
  const [windowLevel, setWindowLevel] = useState(0)
  const [windowWidth, setWindowWidth] = useState(255)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_BASE = 'http://localhost:8001/api'

  // Получение статуса
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`)
      if (response.ok) {
        const data = await response.json()
        if (data.volume_info) {
          setVolumeInfo(data.volume_info)
          setCurrentSlice(Math.floor(data.volume_info.shape[0] / 2))
          setWindowLevel(data.volume_info.window_level)
          setWindowWidth(data.volume_info.window_width)
        }
      } else {
        setError('Не удалось получить статус сервера')
      }
    } catch (err) {
      setError('Сервер недоступен')
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
        setSuccess(`Файл ${file.name} успешно загружен`)
        setVolumeInfo(data.volume_info)
        setCurrentSlice(Math.floor(data.volume_info.shape[0] / 2))
        setWindowLevel(data.volume_info.window_level)
        setWindowWidth(data.volume_info.window_width)
        fetchSlice()
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
        setSuccess(`Файл ${filename} успешно открыт`)
        setVolumeInfo(data.volume_info)
        setCurrentSlice(Math.floor(data.volume_info.shape[0] / 2))
        setWindowLevel(data.volume_info.window_level)
        setWindowWidth(data.volume_info.window_width)
        fetchSlice()
      } else {
        setError(data.error || 'Ошибка открытия файла')
      }
    } catch (err) {
      setError('Ошибка соединения с сервером')
    } finally {
      setIsLoading(false)
    }
  }

  // Получение среза
  const fetchSlice = async () => {
    if (!volumeInfo) return

    try {
      const response = await fetch(`${API_BASE}/slice/${sliceType}/${currentSlice}`)
      if (response.ok) {
        const data: SliceData = await response.json()
        setSliceImage(data.image_data)
      }
    } catch (err) {
      console.error('Ошибка получения среза:', err)
    }
  }

  // Изменение среза
  const changeSlice = (direction: 'prev' | 'next') => {
    if (!volumeInfo) return

    const maxSlice = volumeInfo.shape[0] - 1
    let newSlice = currentSlice

    if (direction === 'prev') {
      newSlice = Math.max(0, currentSlice - 1)
    } else {
      newSlice = Math.min(maxSlice, currentSlice + 1)
    }

    setCurrentSlice(newSlice)
  }

  // Изменение типа среза
  const changeSliceType = (type: 'axial' | 'coronal' | 'sagittal') => {
    setSliceType(type)
    setCurrentSlice(Math.floor(volumeInfo?.shape[0] / 2) || 0)
  }

  // Обновление настроек окна/уровня
  const updateWindowLevel = async () => {
    if (!volumeInfo) return

    try {
      const response = await fetch(`${API_BASE}/window-level`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          window_level: windowLevel,
          window_width: windowWidth
        })
      })

      if (response.ok) {
        fetchSlice()
      }
    } catch (err) {
      console.error('Ошибка обновления настроек:', err)
    }
  }

  // Обновление среза при изменении параметров
  useEffect(() => {
    if (volumeInfo) {
      fetchSlice()
    }
  }, [currentSlice, sliceType, volumeInfo])

  // Обновление настроек окна/уровня
  useEffect(() => {
    if (volumeInfo) {
      updateWindowLevel()
    }
  }, [windowLevel, windowWidth])

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
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <CubeIcon className="w-6 h-6 mr-2" />
          macOS Volume Viewer
        </h2>
        <p className="text-green-100 text-sm mt-1">
          Просмотрщик объемных данных для macOS
        </p>
      </div>

      {/* Статус */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              volumeInfo ? 'text-green-600' : 'text-red-600'
            }`}>
              {volumeInfo ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <XCircleIcon className="w-5 h-5" />
              )}
              <span className="font-medium">
                {volumeInfo ? 'Объем загружен' : 'Объем не загружен'}
              </span>
            </div>
            
            {volumeInfo && (
              <div className="text-sm text-gray-600">
                Размер: {volumeInfo.shape.join(' × ')} | Тип: {volumeInfo.dtype}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
              Настройки
            </button>
            
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Обновить
            </button>
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
        <div className="p-6 border-b">
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

      {/* Настройки окна/уровня */}
      {showSettings && volumeInfo && (
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки изображения</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень окна: {windowLevel.toFixed(0)}
              </label>
              <input
                type="range"
                min={volumeInfo.min_value}
                max={volumeInfo.max_value}
                value={windowLevel}
                onChange={(e) => setWindowLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ширина окна: {windowWidth.toFixed(0)}
              </label>
              <input
                type="range"
                min={1}
                max={volumeInfo.max_value - volumeInfo.min_value}
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => {
                setWindowLevel(volumeInfo.min_value + (volumeInfo.max_value - volumeInfo.min_value) / 2)
                setWindowWidth(volumeInfo.max_value - volumeInfo.min_value)
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Авто
            </button>
            <button
              onClick={() => {
                setWindowLevel(0)
                setWindowWidth(255)
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Сброс
            </button>
          </div>
        </div>
      )}

      {/* Просмотрщик срезов */}
      {volumeInfo && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Просмотр срезов</h3>
          
          {/* Управление типом среза */}
          <div className="flex space-x-2 mb-4">
            {(['axial', 'coronal', 'sagittal'] as const).map((type) => (
              <button
                key={type}
                onClick={() => changeSliceType(type)}
                className={`px-3 py-1 rounded ${
                  sliceType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'axial' ? 'Аксиальный' : 
                 type === 'coronal' ? 'Корональный' : 'Сагиттальный'}
              </button>
            ))}
          </div>

          {/* Навигация по срезам */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => changeSlice('prev')}
              disabled={currentSlice === 0}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600">
              Срез {currentSlice + 1} из {volumeInfo.shape[0]}
            </span>
            
            <button
              onClick={() => changeSlice('next')}
              disabled={currentSlice === volumeInfo.shape[0] - 1}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Изображение среза */}
          {sliceImage && (
            <div className="flex justify-center">
              <div className="border rounded-lg overflow-hidden shadow-lg">
                <img
                  src={sliceImage}
                  alt={`Срез ${sliceType} ${currentSlice}`}
                  className="max-w-full h-auto"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </div>
          )}

          {/* Информация об объеме */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Информация об объеме</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Размеры:</span>
                <span className="ml-2 font-medium">{volumeInfo.shape.join(' × ')}</span>
              </div>
              <div>
                <span className="text-gray-600">Тип данных:</span>
                <span className="ml-2 font-medium">{volumeInfo.dtype}</span>
              </div>
              <div>
                <span className="text-gray-600">Минимум:</span>
                <span className="ml-2 font-medium">{volumeInfo.min_value.toFixed(0)}</span>
              </div>
              <div>
                <span className="text-gray-600">Максимум:</span>
                <span className="ml-2 font-medium">{volumeInfo.max_value.toFixed(0)}</span>
              </div>
            </div>
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
              <li>Запустите macOS сервер: <code>python3 backend/macos_volume_server.py</code></li>
              <li>Загрузите ZIP архив или .vol файл</li>
              <li>Просматривайте срезы в трех проекциях</li>
              <li>Используйте настройки окна/уровня для улучшения качества</li>
              <li>Навигация по срезам с помощью стрелок</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Возможности:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Просмотр аксиальных, корональных и сагиттальных срезов</li>
              <li>Автоматическое извлечение архивов</li>
              <li>Настройка окна/уровня для улучшения контраста</li>
              <li>Навигация по срезам</li>
              <li>Информация об объемных данных</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 