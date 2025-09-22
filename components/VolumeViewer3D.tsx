'use client'

import React, { useRef, useEffect, useState } from 'react'
import { VolumeViewer3D } from '../lib/engines/VolumeViewer3D'
import { 
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface VolumeViewer3DProps {
  volumeData?: {
    width: number
    height: number
    depth: number
    data: ArrayBuffer
  }
  onError?: (error: Error) => void
  className?: string
}

export default function VolumeViewer3DComponent({
  volumeData,
  onError,
  className = ''
}: VolumeViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<VolumeViewer3D | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedFile, setLoadedFile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    windowLevel: 0.5,
    windowWidth: 1.0,
    opacity: 0.8,
    slice: 0
  })

  useEffect(() => {
    if (containerRef.current && !viewerRef.current) {
      try {
        setIsLoading(true)
        const viewer = new VolumeViewer3D(containerRef.current)
        viewerRef.current = viewer
        console.log('✅ VolumeViewer3D успешно создан')
      } catch (error) {
        console.error('❌ Ошибка инициализации VolumeViewer3D:', error)
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
        onError?.(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose()
        viewerRef.current = null
      }
    }
  }, [onError])

  useEffect(() => {
    if (viewerRef.current && volumeData) {
      try {
        viewerRef.current.setVolumeData(volumeData)
        viewerRef.current.render()
        setLoadedFile(`Volume ${volumeData.width}×${volumeData.height}×${volumeData.depth}`)
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error)
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка')
        onError?.(error as Error)
      }
    }
  }, [volumeData, onError])

  const handleExportImage = () => {
    if (viewerRef.current) {
      try {
        const imageData = viewerRef.current.exportImage()
        const link = document.createElement('a')
        link.href = imageData
        link.download = 'volume-view.png'
        link.click()
      } catch (error) {
        console.error('Ошибка экспорта изображения:', error)
      }
    }
  }

  const handleExportData = () => {
    if (viewerRef.current) {
      try {
        const data = viewerRef.current.exportData()
        if (data) {
          const blob = new Blob([data.data], { type: 'application/octet-stream' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = 'volume-data.bin'
          link.click()
        }
      } catch (error) {
        console.error('Ошибка экспорта данных:', error)
      }
    }
  }

  const handleSettingsChange = (key: string, value: number) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    if (viewerRef.current) {
      if (key === 'windowLevel') {
        viewerRef.current.setWindowLevel(value)
      } else if (key === 'windowWidth') {
        viewerRef.current.setWindowWidth(value)
      } else if (key === 'slice') {
        viewerRef.current.setSlice(value)
      }
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            Volume Viewer 3D
            {loadedFile && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {loadedFile}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Ошибка:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Viewer Container */}
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <div
              ref={containerRef}
              className="w-full h-96"
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Уровень окна: {settings.windowLevel.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.windowLevel}
                onChange={(e) => handleSettingsChange('windowLevel', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Ширина окна: {settings.windowWidth.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={settings.windowWidth}
                onChange={(e) => handleSettingsChange('windowWidth', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {volumeData && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Срез: {settings.slice} / {volumeData.depth - 1}
              </label>
              <input
                type="range"
                min="0"
                max={volumeData.depth - 1}
                value={settings.slice}
                onChange={(e) => handleSettingsChange('slice', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Настройки
            </Button>
            <Button
              onClick={handleExportImage}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <PhotoIcon className="h-4 w-4" />
              Экспорт изображения
            </Button>
            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Экспорт данных
            </Button>
            <Button
              onClick={() => viewerRef.current?.resetView()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <EyeIcon className="h-4 w-4" />
              Сбросить вид
            </Button>
          </div>

          {/* Volume Info */}
          {volumeData && (
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
          )}

          {!volumeData && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔬</div>
              <p className="text-lg">Нет данных для просмотра</p>
              <p className="text-sm">Загрузите объемные данные для 3D визуализации</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}