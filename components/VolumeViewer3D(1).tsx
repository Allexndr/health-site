'use client'

import React, { useRef, useEffect, useState } from 'react'
import { VolumeViewer3D, VolumeSettings } from '../lib/engines/VolumeViewer3D'
import { 
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

interface VolumeViewer3DProps {
  onFileLoaded?: (fileName: string) => void
  onError?: (error: Error) => void
}

export default function VolumeViewer3DComponent({ onFileLoaded, onError }: VolumeViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<VolumeViewer3D | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedFile, setLoadedFile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<VolumeSettings>({
    windowLevel: 0.5,
    windowWidth: 1.0,
    opacity: 0.8,
    renderMode: 'volume',
    threshold: 0.3,
    colormap: 'bone'
  })

  useEffect(() => {
    if (containerRef.current && !viewer) {
      try {
        console.log('🚀 Инициализация VolumeViewer3D...')
        console.log('📦 Контейнер:', containerRef.current)
        
        const newViewer = new VolumeViewer3D(containerRef.current)
        setViewer(newViewer)
        console.log('✅ VolumeViewer3D успешно создан')
      } catch (error) {
        console.error('❌ Ошибка инициализации VolumeViewer3D:', error)
        console.error('📊 Детали ошибки:', {
          message: error.message,
          stack: error.stack,
          containerExists: !!containerRef.current,
          containerDimensions: containerRef.current ? {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight
          } : null
        })
        onError?.(error as Error)
        
        // Показываем простое сообщение об ошибке в контейнере
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="color: white; padding: 20px; text-align: center;">
              <h3>Ошибка инициализации 3D движка</h3>
              <p>${error.message}</p>
              <p style="font-size: 12px; opacity: 0.7;">Проверьте консоль для подробностей</p>
            </div>
          `
        }
      }
    }

    return () => {
      if (viewer) {
        console.log('🧹 Очистка VolumeViewer3D...')
        try {
          viewer.dispose()
        } catch (error) {
          console.warn('⚠️ Ошибка при очистке:', error)
        }
      }
    }
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !viewer) return

    setIsLoading(true)
    try {
      await viewer.loadVolumeFile(file)
      setLoadedFile(file.name)
      onFileLoaded?.(file.name)
    } catch (error) {
      console.error('Ошибка загрузки файла:', error)
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = (newSettings: Partial<VolumeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    viewer?.updateSettings(updatedSettings)
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* 3D Viewer Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* File Upload */}
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
          <label className="flex items-center gap-2 cursor-pointer text-white hover:text-blue-400 transition-colors">
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span className="text-sm">Загрузить CT снимок</span>
            <input
              type="file"
              accept=".zip,.vol,.raw,.dcm,.dicom"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          <span className="text-sm">Настройки</span>
        </button>

        {/* Current File Info */}
        {loadedFile && (
          <div className="bg-green-900/80 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="flex items-center gap-2 text-sm">
              <CubeIcon className="w-4 h-4" />
              <span>Загружен: {loadedFile}</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white min-w-[280px]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <EyeIcon className="w-5 h-5" />
            Настройки визуализации
          </h3>

          <div className="space-y-4">
            {/* Window Level */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Уровень окна: {(settings.windowLevel * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.windowLevel}
                onChange={(e) => updateSettings({ windowLevel: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Window Width */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Ширина окна: {(settings.windowWidth * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.01"
                value={settings.windowWidth}
                onChange={(e) => updateSettings({ windowWidth: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Прозрачность: {(settings.opacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={settings.opacity}
                onChange={(e) => updateSettings({ opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Threshold */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Порог отсечения: {(settings.threshold * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.threshold}
                onChange={(e) => updateSettings({ threshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Render Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">Режим рендеринга</label>
              <select
                value={settings.renderMode}
                onChange={(e) => updateSettings({ renderMode: e.target.value as any })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="volume">Объемный</option>
                <option value="mip">Максимальная проекция</option>
                <option value="isosurface">Изоповерхность</option>
              </select>
            </div>

            {/* Colormap */}
            <div>
              <label className="block text-sm font-medium mb-2">Цветовая карта</label>
              <select
                value={settings.colormap}
                onChange={(e) => updateSettings({ colormap: e.target.value as any })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="bone">Костная ткань</option>
                <option value="hot">Горячая</option>
                <option value="cool">Холодная</option>
                <option value="gray">Оттенки серого</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
            <p className="text-xs text-blue-200">
              💡 Используйте мышь для вращения, колесо для масштабирования
            </p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-lg">Загрузка CT данных...</p>
            <p className="text-sm text-gray-300">Обработка объемного изображения</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!loadedFile && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/60">
            <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-semibold mb-2">Стоматологический 3D визуализатор</h3>
            <p className="text-sm">Загрузите CT снимок в формате ZIP, VOL, RAW или DICOM</p>
            <p className="text-xs mt-2">Поддерживаются данные OneVolumeViewer и другие стоматологические форматы</p>
          </div>
        </div>
      )}
    </div>
  )
} 