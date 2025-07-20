'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { OneVolumeData } from '@/lib/parsers/OneVolumeViewer'

interface Viewer3DProps {
  data: OneVolumeData | null
  onVolumeLoad?: (volume: any) => void
  onError?: (error: string) => void
  windowLevel?: number
  windowWidth?: number
  currentSlice?: number
  brightness?: number
  contrast?: number
}

export default function Viewer3D({ 
  data, 
  onVolumeLoad, 
  onError, 
  windowLevel = 1800, 
  windowWidth = 3000,
  currentSlice = 0,
  brightness = 50,
  contrast = 50
}: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [viewerInstance, setViewerInstance] = useState<any>(null)
  const [totalSlices, setTotalSlices] = useState(256)

  // Инициализация WebGL контекста
  const initializeWebGL = (canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      throw new Error('WebGL не поддерживается в этом браузере')
    }
    return gl
  }

  // Создание текстуры для объемных данных
  const createVolumeTexture = (gl: WebGLRenderingContext, data: Uint16Array, dimensions: { x: number, y: number, z: number }) => {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_3D || gl.TEXTURE_2D_ARRAY, texture)
    
    // Конвертируем 16-bit данные в 8-bit для WebGL
    const normalizedData = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i++) {
      // Нормализуем значения с учетом window/level
      const value = data[i]
      const windowMin = windowLevel - windowWidth / 2
      const windowMax = windowLevel + windowWidth / 2
      
      let normalized = (value - windowMin) / (windowMax - windowMin)
      normalized = Math.max(0, Math.min(1, normalized))
      normalizedData[i] = normalized * 255
    }

    if (gl.TEXTURE_3D) {
      gl.texImage3D(
        gl.TEXTURE_3D,
        0,
        gl.R8,
        dimensions.x,
        dimensions.y,
        dimensions.z,
        0,
        gl.RED,
        gl.UNSIGNED_BYTE,
        normalizedData
      )
    }

    gl.texParameteri(gl.TEXTURE_3D || gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_3D || gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_3D || gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_3D || gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_3D || gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)

    return texture
  }

  // Простой рендеринг слайса
  const renderSlice = useCallback((sliceIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas || !data || !data.isValid || !data.volumeData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const dimensions = data.volumeInfo.dimensions
      if (!dimensions) return

      // Создаем ImageData для слайса
      const imageData = ctx.createImageData(dimensions.x, dimensions.y)
      const volumeArray = new Uint16Array(data.volumeData)
      
      // Вычисляем offset для текущего слайса
      const sliceSize = dimensions.x * dimensions.y
      const sliceOffset = Math.floor(sliceIndex) * sliceSize
      
      // Применяем window/level к данным
      const windowMin = windowLevel - windowWidth / 2
      const windowMax = windowLevel + windowWidth / 2
      
      for (let i = 0; i < sliceSize; i++) {
        if (sliceOffset + i >= volumeArray.length) break
        
        const value = volumeArray[sliceOffset + i]
        let normalized = (value - windowMin) / (windowMax - windowMin)
        normalized = Math.max(0, Math.min(1, normalized))
        
        // Применяем яркость и контраст
        normalized = normalized * (contrast / 50) * (brightness / 50)
        normalized = Math.max(0, Math.min(1, normalized))
        
        const pixelValue = Math.floor(normalized * 255)
        
        const pixelIndex = i * 4
        imageData.data[pixelIndex] = pixelValue     // R
        imageData.data[pixelIndex + 1] = pixelValue // G
        imageData.data[pixelIndex + 2] = pixelValue // B
        imageData.data[pixelIndex + 3] = 255        // A
      }
      
      ctx.putImageData(imageData, 0, 0)
    } catch (err) {
      console.error('Ошибка рендеринга слайса:', err)
    }
  }, [data, windowLevel, windowWidth, brightness, contrast])

  // Инициализация viewer
  const initializeViewer = useCallback(async () => {
    if (!data || !data.isValid || !data.volumeData || !canvasRef.current) {
      setError('Некорректные данные для отображения')
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)
    setError(null)

    try {
      const canvas = canvasRef.current
      const dimensions = data.volumeInfo.dimensions
      
      if (!dimensions) {
        throw new Error('Не удалось определить размеры тома')
      }

      // Устанавливаем размер canvas
      canvas.width = dimensions.x
      canvas.height = dimensions.y
      
      setLoadingProgress(50)
      
      // Создаем Uint16Array из данных
      let volumeArray: Uint16Array
      if (data.volumeData.byteLength % 2 !== 0) {
        // Добавляем padding если нужно
        const paddedBuffer = new ArrayBuffer(data.volumeData.byteLength + 1)
        new Uint8Array(paddedBuffer).set(new Uint8Array(data.volumeData))
        volumeArray = new Uint16Array(paddedBuffer)
      } else {
        volumeArray = new Uint16Array(data.volumeData)
      }

      setTotalSlices(dimensions.z)
      setLoadingProgress(100)
      
      // Рендерим начальный слайс
      renderSlice(currentSlice)
      
    } catch (err) {
      console.error('Ошибка инициализации viewer:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      onError?.(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setIsLoading(false)
    }
  }, [data, currentSlice, renderSlice, onError])

  // Эффект для инициализации
  useEffect(() => {
    if (!data || !data.isValid || !data.volumeData) {
      setError('Некорректные данные для отображения')
      return
    }

    initializeViewer()
  }, [data, initializeViewer])

  // Эффект для перерисовки при изменении настроек
  useEffect(() => {
    if (viewerInstance && !isLoading && data?.isValid) {
      renderSlice(currentSlice)
    }
  }, [currentSlice, windowLevel, windowWidth, brightness, contrast, viewerInstance, isLoading, data, renderSlice])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-10">
          <div className="text-white mb-4">Загрузка 3D данных...</div>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="text-white text-sm mt-2">{loadingProgress}%</div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-10">
          <div className="text-red-800 text-center">
            <div className="font-medium">Ошибка загрузки</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {!isLoading && !error && data?.isValid && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          Слайс: {currentSlice + 1} / {totalSlices}
        </div>
      )}
    </div>
  )
} 
 
 
 
 
 
 
 
 
 