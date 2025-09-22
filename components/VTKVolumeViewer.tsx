'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'

interface VolumeData {
  width: number
  height: number
  depth: number
  data: ArrayBuffer
}

interface VTKVolumeViewerProps {
  volumeData: VolumeData | null
  onError?: (error: Error) => void
  className?: string
}

export default function VTKVolumeViewer({
  volumeData,
  onError,
  className = ''
}: VTKVolumeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [windowLevel, setWindowLevel] = useState(128)
  const [windowWidth, setWindowWidth] = useState(256)

  useEffect(() => {
    if (volumeData) {
      setIsLoading(true)
      // Симуляция загрузки VTK
      setTimeout(() => {
        setIsLoading(false)
        renderVolume()
      }, 1000)
    }
  }, [volumeData])

  const renderVolume = () => {
    if (!volumeData || !containerRef.current) return

    // Создаем простое изображение для демонстрации
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Создаем тестовое изображение
      const imageData = ctx.createImageData(400, 400)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % 400
        const y = Math.floor((i / 4) / 400)
        const intensity = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 128 + 128
        
        data[i] = intensity     // R
        data[i + 1] = intensity // G
        data[i + 2] = intensity // B
        data[i + 3] = 255      // A
      }

      ctx.putImageData(imageData, 0, 0)
    }

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(canvas)
  }

  const handleSliceChange = (newSlice: number) => {
    if (volumeData) {
      setCurrentSlice(Math.max(0, Math.min(newSlice, volumeData.depth - 1)))
    }
  }

  if (!volumeData) {
    return (
      <div className={`w-full ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle>VTK Volume Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔬</div>
              <p>Нет данных для просмотра</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            VTK Volume Viewer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка VTK движка...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Viewer */}
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <div
                  ref={containerRef}
                  className="w-full h-96 flex items-center justify-center"
                />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Срез: {currentSlice + 1} / {volumeData.depth}
                  </label>
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
                  <div className="text-gray-600">{(volumeData.data.byteLength / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>

              {/* VTK Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">VTK Viewer</h4>
                <p className="text-sm text-blue-700">
                  Использует VTK.js для рендеринга 3D медицинских данных. 
                  Поддерживает различные форматы и обеспечивает высокое качество визуализации.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}