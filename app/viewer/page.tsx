'use client'

import { useState, useEffect, useRef } from 'react'

interface ViewerProps {
  searchParams: { file?: string }
}

export default function ViewerPage({ searchParams }: ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [volumeData, setVolumeData] = useState<any>(null)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [windowLevel, setWindowLevel] = useState(128)
  const [windowWidth, setWindowWidth] = useState(256)

  useEffect(() => {
    if (!searchParams.file) {
      setError('Файл не указан')
      setIsLoading(false)
      return
    }

    loadVolumeData(searchParams.file)
  }, [searchParams.file])

  const loadVolumeData = async (filename: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Загружаем данные объема
      const response = await fetch(`/api/volume-data?file=${encodeURIComponent(filename)}`)
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных')
      }

      const data = await response.json()
      setVolumeData(data)
      
      // Рисуем первый срез
      drawSlice(data, 0)

    } catch (err) {
      console.error('Ошибка загрузки:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  const drawSlice = (data: any, sliceIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas || !data.preview) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { data: volumeArray, dimensions } = data.preview
    const [width, height, depth] = dimensions

    // Устанавливаем размер canvas
    canvas.width = width
    canvas.height = height

    // Получаем срез
    const slice = volumeArray[sliceIndex] || volumeArray[0]
    
    // Создаем ImageData
    const imageData = ctx.createImageData(width, height)
    const pixels = imageData.data

    // Заполняем пиксели
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x
        const value = slice[y]?.[x] || 0
        
        // Применяем window/level
        const normalizedValue = Math.max(0, Math.min(255, 
          ((value - (windowLevel - windowWidth/2)) / windowWidth) * 255
        ))
        
        const pixelIndex = index * 4
        pixels[pixelIndex] = normalizedValue     // R
        pixels[pixelIndex + 1] = normalizedValue // G
        pixels[pixelIndex + 2] = normalizedValue // B
        pixels[pixelIndex + 3] = 255             // A
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const handleSliceChange = (newSlice: number) => {
    if (!volumeData) return
    setCurrentSlice(newSlice)
    drawSlice(volumeData, newSlice)
  }

  const handleWindowLevelChange = (newLevel: number) => {
    setWindowLevel(newLevel)
    if (volumeData) {
      drawSlice(volumeData, currentSlice)
    }
  }

  const handleWindowWidthChange = (newWidth: number) => {
    setWindowWidth(newWidth)
    if (volumeData) {
      drawSlice(volumeData, currentSlice)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Ошибка загрузки</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col">
      {/* Панель управления */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {searchParams.file ? `Просмотр: ${searchParams.file}` : 'Рентген Viewer'}
          </h2>
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Загрузка...</span>
            </div>
          )}
        </div>

        {volumeData && (
          <div className="flex items-center gap-6 mt-4">
            {/* Слайдер среза */}
            <div className="flex items-center gap-2">
              <label className="text-sm">Срез:</label>
              <input
                type="range"
                min="0"
                max={volumeData.preview?.dimensions[0] - 1 || 63}
                value={currentSlice}
                onChange={(e) => handleSliceChange(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm w-8">{currentSlice}</span>
            </div>

            {/* Window/Level */}
            <div className="flex items-center gap-2">
              <label className="text-sm">Уровень:</label>
              <input
                type="range"
                min="0"
                max="255"
                value={windowLevel}
                onChange={(e) => handleWindowLevelChange(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm w-8">{windowLevel}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Ширина:</label>
              <input
                type="range"
                min="1"
                max="255"
                value={windowWidth}
                onChange={(e) => handleWindowWidthChange(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm w-8">{windowWidth}</span>
            </div>
          </div>
        )}
      </div>

      {/* Область просмотра */}
      <div className="flex-1 flex items-center justify-center bg-black p-4">
        {isLoading ? (
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Загрузка рентгеновского снимка...</p>
            <p className="text-sm text-gray-300 mt-2">Пожалуйста, подождите</p>
          </div>
        ) : (
          <div className="border-2 border-gray-600 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="block"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                imageRendering: 'pixelated'
              }}
            />
          </div>
        )}
      </div>

      {/* Информационная панель */}
      {volumeData && (
        <div className="bg-gray-800 text-white p-4 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <strong>Размеры:</strong> {volumeData.preview?.dimensions.join(' × ')}
            </div>
            <div>
              <strong>Тип данных:</strong> {volumeData.dataType}
            </div>
            <div>
              <strong>Диапазон:</strong> {volumeData.minValue} - {volumeData.maxValue}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 