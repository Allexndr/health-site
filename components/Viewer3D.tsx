'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface VolumeData {
  width: number
  height: number
  depth: number
  data: ArrayBuffer
}

interface PatientInfo {
  name: string
  id: string
  birthDate: string
}

interface OneVolumeData {
  volumeInfo: {
    radius: number
    voxelSize: number
    center: { x: number, y: number, z: number }
    filterName: string
    guid: string
    shape?: [number, number, number]
  }
  volumeData: ArrayBuffer
  patientInfo: PatientInfo
}

interface Viewer3DProps {
  data: OneVolumeData | null
  onError?: (error: Error) => void
  className?: string
}

export default function Viewer3D({
  data,
  onError,
  className = ''
}: Viewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [viewType, setViewType] = useState<'axial' | 'coronal' | 'sagittal'>('axial')

  useEffect(() => {
    if (data) {
      setIsLoading(true)
      // Симуляция загрузки
      setTimeout(() => {
        setIsLoading(false)
        renderVolume()
      }, 1000)
    }
  }, [data])

  const renderVolume = useCallback(() => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Устанавливаем размеры canvas
    const size = 400
    canvas.width = size
    canvas.height = size

    // Создаем тестовое изображение
    const imageData = ctx.createImageData(size, size)
    const pixels = imageData.data

    for (let i = 0; i < pixels.length; i += 4) {
      const x = (i / 4) % size
      const y = Math.floor((i / 4) / size)
      
      // Создаем паттерн для демонстрации
      const intensity = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 128 + 128
      
      pixels[i] = intensity     // R
      pixels[i + 1] = intensity // G
      pixels[i + 2] = intensity // B
      pixels[i + 3] = 255      // A
    }

    ctx.putImageData(imageData, 0, 0)
  }, [data])

  const handleSliceChange = (newSlice: number) => {
    if (data?.volumeInfo.shape) {
      const maxSlice = data.volumeInfo.shape[0] - 1
      setCurrentSlice(Math.max(0, Math.min(newSlice, maxSlice)))
    }
  }

  if (!data) {
    return (
      <div className={`w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🔬</div>
          <p>Нет данных для просмотра</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">3D Viewer</h3>
              <p className="text-sm text-gray-600">
                Пациент: {data.patientInfo.name} (ID: {data.patientInfo.id})
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="axial">Axial</option>
                <option value="coronal">Coronal</option>
                <option value="sagittal">Sagittal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка 3D данных...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Canvas */}
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 object-contain"
                />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срез: {currentSlice + 1} / {data.volumeInfo.shape?.[0] || 1}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={(data.volumeInfo.shape?.[0] || 1) - 1}
                    value={currentSlice}
                    onChange={(e) => handleSliceChange(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    <div>Радиус: {data.volumeInfo.radius.toFixed(2)}</div>
                    <div>Размер вокселя: {data.volumeInfo.voxelSize.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Volume Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Ширина</div>
                  <div className="text-gray-600">{data.volumeInfo.shape?.[0] || 0}px</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Высота</div>
                  <div className="text-gray-600">{data.volumeInfo.shape?.[1] || 0}px</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Глубина</div>
                  <div className="text-gray-600">{data.volumeInfo.shape?.[2] || 0}px</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Размер данных</div>
                  <div className="text-gray-600">{(data.volumeData.byteLength / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}