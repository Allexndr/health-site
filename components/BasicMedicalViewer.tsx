'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { 
  EyeIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon,
  CogIcon,
  InformationCircleIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'
interface VolumeData {
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

interface BasicMedicalViewerProps {
  volumeData?: VolumeData
  onError?: (error: string) => void
}

export default function BasicMedicalViewer({ volumeData, onError }: BasicMedicalViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [windowLevel, setWindowLevel] = useState(1000)
  const [windowWidth, setWindowWidth] = useState(2000)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'axial' | 'coronal' | 'sagittal'>('axial')
  const [loadedVolumeData, setLoadedVolumeData] = useState<VolumeData | undefined>(volumeData)

  // Обработка загрузки файла
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('📁 Загрузка файла:', file.name)
      
      // Простая обработка .vol файла
      if (file.name.toLowerCase().endsWith('.vol')) {
        const arrayBuffer = await file.arrayBuffer()
        const uint16Array = new Uint16Array(arrayBuffer)
        
        // Определяем размеры (предполагаем кубический объем)
        const totalPixels = uint16Array.length
        const cubeRoot = Math.cbrt(totalPixels)
        const width = Math.floor(cubeRoot)
        const height = Math.floor(cubeRoot)
        const depth = Math.floor(totalPixels / (width * height))
        
        const volumeData: VolumeData = {
          data: uint16Array,
          width,
          height,
          depth,
          spacing: [0.1, 0.1, 0.1],
          metadata: {
            modality: 'CT',
            description: 'OneVolumeViewer CT Data'
          }
        }
        
        setLoadedVolumeData(volumeData)
        console.log('✅ .vol файл успешно загружен')
      } else {
        throw new Error('Поддерживаются только .vol файлы')
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки файла:', err)
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Обработка drag & drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files
      handleFileUpload({ target: { files: event.dataTransfer.files } } as any)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // Рендеринг среза
  const renderSlice = useCallback((sliceIndex: number) => {
    if (!canvasRef.current || !loadedVolumeData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const { data, width, height, depth } = loadedVolumeData
      let sliceData: Uint16Array
      let imageWidth: number
      let imageHeight: number

      // Выбираем срез в зависимости от типа вида
      if (viewType === 'axial') {
        imageWidth = width
        imageHeight = height
        const sliceSize = width * height
        const startIndex = sliceIndex * sliceSize
        sliceData = data.slice(startIndex, startIndex + sliceSize)
      } else if (viewType === 'coronal') {
        imageWidth = width
        imageHeight = depth
        sliceData = new Uint16Array(width * depth)
        for (let z = 0; z < depth; z++) {
          for (let x = 0; x < width; x++) {
            const sourceIndex = z * width * height + sliceIndex * width + x
            const targetIndex = z * width + x
            sliceData[targetIndex] = data[sourceIndex]
          }
        }
      } else { // sagittal
        imageWidth = height
        imageHeight = depth
        sliceData = new Uint16Array(height * depth)
        for (let z = 0; z < depth; z++) {
          for (let y = 0; y < height; y++) {
            const sourceIndex = z * width * height + y * width + sliceIndex
            const targetIndex = z * height + y
            sliceData[targetIndex] = data[sourceIndex]
          }
        }
      }

      // Устанавливаем размер canvas с учетом зума
      canvas.width = imageWidth * zoom
      canvas.height = imageHeight * zoom

      // Создаем ImageData
      const imageData = ctx.createImageData(imageWidth, imageHeight)
      
      // Применяем window/level
      const windowMin = windowLevel - windowWidth / 2
      const windowMax = windowLevel + windowWidth / 2

      for (let i = 0; i < sliceData.length; i++) {
        const value = sliceData[i]
        let normalized = (value - windowMin) / (windowMax - windowMin)
        normalized = Math.max(0, Math.min(1, normalized))
        
        const pixelValue = Math.floor(normalized * 255)
        
        const pixelIndex = i * 4
        imageData.data[pixelIndex] = pixelValue     // R
        imageData.data[pixelIndex + 1] = pixelValue // G
        imageData.data[pixelIndex + 2] = pixelValue // B
        imageData.data[pixelIndex + 3] = 255        // A
      }

      // Очищаем canvas и рисуем
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Масштабируем изображение
      ctx.save()
      ctx.scale(zoom, zoom)
      ctx.putImageData(imageData, 0, 0)
      ctx.restore()

    } catch (err) {
      console.error('Ошибка рендеринга среза:', err)
      setError('Ошибка отображения изображения')
      onError?.('Ошибка отображения изображения')
    }
  }, [volumeData, viewType, windowLevel, windowWidth, zoom, onError])

  // Обновляем изображение при изменении параметров
  useEffect(() => {
    if (loadedVolumeData) {
      renderSlice(currentSlice)
    }
  }, [loadedVolumeData, currentSlice, windowLevel, windowWidth, zoom, viewType, renderSlice])

  // Обработчики управления
  const handleSliceChange = (newSlice: number) => {
    const maxSlice = viewType === 'axial' ? loadedVolumeData?.depth - 1 : 
                    viewType === 'coronal' ? loadedVolumeData?.height - 1 : 
                    loadedVolumeData?.width - 1
    if (maxSlice !== undefined) {
      setCurrentSlice(Math.max(0, Math.min(newSlice, maxSlice)))
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 4))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1))
  const handleResetZoom = () => setZoom(1)

  const handleAutoWindow = () => {
    if (!loadedVolumeData) return
    
    const data = loadedVolumeData.data
    let min = data[0]
    let max = data[0]
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) min = data[i]
      if (data[i] > max) max = data[i]
    }
    
    setWindowLevel((min + max) / 2)
    setWindowWidth(max - min)
  }

  if (!loadedVolumeData) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Заголовок */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Базовый медицинский просмотрщик</h3>
        </div>
        
        {/* Область загрузки */}
        <div 
          className="flex flex-col items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <DocumentArrowUpIcon className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">Загрузите медицинские данные</p>
          <p className="text-gray-500 mb-6 text-center">
            Поддерживаемые форматы: .vol файлы и ZIP архивы OneVolumeViewer
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".vol,.zip"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Выбрать файл
          </button>
          
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Обработка файла...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const maxSlice = viewType === 'axial' ? loadedVolumeData.depth - 1 : 
                  viewType === 'coronal' ? loadedVolumeData.height - 1 : 
                  loadedVolumeData.width - 1

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Заголовок */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Медицинский просмотрщик</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType('axial')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewType === 'axial' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Аксиальный
              </button>
              <button
                onClick={() => setViewType('coronal')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewType === 'coronal' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Корональный
              </button>
              <button
                onClick={() => setViewType('sagittal')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewType === 'sagittal' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Сагиттальный
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Уменьшить"
            >
              <ArrowsPointingInIcon className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Увеличить"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Сбросить масштаб"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Основная область просмотра */}
      <div className="relative bg-black">
        <canvas
          ref={canvasRef}
          className="block mx-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90">
            <div className="text-red-800 text-center">
              <div className="font-medium">Ошибка отображения</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Панель управления */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Навигация по срезам */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Срез: {currentSlice + 1} / {maxSlice + 1}
            </label>
            <input
              type="range"
              min="0"
              max={maxSlice}
              value={currentSlice}
              onChange={(e) => handleSliceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Window Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Уровень: {windowLevel}
            </label>
            <input
              type="range"
              min="0"
              max="4000"
              value={windowLevel}
              onChange={(e) => setWindowLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Window Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ширина: {windowWidth}
            </label>
            <input
              type="range"
              min="100"
              max="8000"
              value={windowWidth}
              onChange={(e) => setWindowWidth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={handleAutoWindow}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Авто настройка
          </button>
          <button
            onClick={() => {
              setWindowLevel(1000)
              setWindowWidth(2000)
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Сброс
          </button>
        </div>
      </div>
    </div>
  )
} 