'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { toast } from 'sonner'

interface VolumeData {
  width: number
  height: number
  depth: number
  data: Uint8Array | Uint16Array
}

interface SimpleVolumeViewerProps {
  onVolumeLoaded?: (volume: VolumeData) => void
  onError?: (error: Error) => void
  className?: string
}

export default function SimpleVolumeViewer({
  onVolumeLoaded,
  onError,
  className = ''
}: SimpleVolumeViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [windowLevel, setWindowLevel] = useState(128)
  const [windowWidth, setWindowWidth] = useState(256)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      // Симуляция загрузки и обработки файла
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Создаем тестовые данные
      const mockVolumeData: VolumeData = {
        width: 256,
        height: 256,
        depth: 128,
        data: new Uint8Array(256 * 256 * 128)
      }
      
      setVolumeData(mockVolumeData)
      onVolumeLoaded?.(mockVolumeData)
      
      toast.success('Объем загружен', {
        description: `Размер: ${mockVolumeData.width}×${mockVolumeData.height}×${mockVolumeData.depth}`,
        duration: 3000
      })
      
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      toast.error('Ошибка загрузки файла', {
        description: errorMessage,
        duration: 5000
      })
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      // Clear the input to allow re-uploading the same file
      event.target.value = ''
    }
  }

  const renderSlice = useCallback(() => {
    if (!volumeData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Устанавливаем размеры canvas
    canvas.width = volumeData.width
    canvas.height = volumeData.height

    // Создаем изображение
    const imageData = ctx.createImageData(volumeData.width, volumeData.height)
    const data = imageData.data

    // Генерируем тестовое изображение
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % volumeData.width
      const y = Math.floor((i / 4) / volumeData.width)
      const intensity = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 128 + 128
      
      data[i] = intensity     // R
      data[i + 1] = intensity // G
      data[i + 2] = intensity // B
      data[i + 3] = 255      // A
    }

    ctx.putImageData(imageData, 0, 0)
  }, [volumeData])

  React.useEffect(() => {
    renderSlice()
  }, [renderSlice, currentSlice, windowLevel, windowWidth])

  const handleSliceChange = (newSlice: number) => {
    if (volumeData) {
      setCurrentSlice(Math.max(0, Math.min(newSlice, volumeData.depth - 1)))
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            Simple Volume Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".vol,.zip,.dcm,.nii"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Загрузка...
                </>
              ) : (
                <>
                  <span>📁</span>
                  Загрузить файл
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Ошибка:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Volume Viewer */}
          {volumeData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Просмотр объема</h3>
                <div className="text-sm text-gray-600">
                  Срез {currentSlice + 1} из {volumeData.depth}
                </div>
              </div>

              {/* Canvas */}
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <canvas
                  ref={canvasRef}
                  className="w-full h-64 object-contain"
                  style={{ maxHeight: '400px' }}
                />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Срез</label>
                  <input
                    type="range"
                    min="0"
                    max={volumeData.depth - 1}
                    value={currentSlice}
                    onChange={(e) => handleSliceChange(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Уровень окна</label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={windowLevel}
                    onChange={(e) => setWindowLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ширина окна</label>
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={windowWidth}
                    onChange={(e) => setWindowWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Volume Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">Ширина</div>
                  <div className="text-gray-600">{volumeData.width}px</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">Высота</div>
                  <div className="text-gray-600">{volumeData.height}px</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">Глубина</div>
                  <div className="text-gray-600">{volumeData.depth} срезов</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">Размер данных</div>
                  <div className="text-gray-600">{(volumeData.data.length / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
            </div>
          )}

          {!volumeData && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔬</div>
              <p className="text-lg">Загрузите файл для просмотра</p>
              <p className="text-sm">Поддерживаются форматы: .vol, .zip, .dcm, .nii</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}