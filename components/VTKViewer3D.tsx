'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import VTKEngine, { VolumeSettings, DentalPreset } from '@/lib/3d-engines/VTKEngine'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon, CogIcon } from '@heroicons/react/24/outline'

interface VTKViewer3DProps {
  volumeData?: Uint16Array
  dimensions?: [number, number, number]
  spacing?: [number, number, number]
  patientInfo?: {
    name: string
    id: string
    studyDate: string
    modality: string
  }
  className?: string
}

export default function VTKViewer3D({
  volumeData,
  dimensions,
  spacing = [1, 1, 1],
  patientInfo,
  className
}: VTKViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<VTKEngine | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [presets, setPresets] = useState<DentalPreset[]>([])
  const [currentPreset, setCurrentPreset] = useState('Bone')
  const [settings, setSettings] = useState<VolumeSettings>({
    windowWidth: 2000,
    windowLevel: 400,
    opacity: 0.8,
    slice: 0,
    renderMode: 'volume',
    preset: 'Bone'
  })

  // Инициализация VTK Engine
  useEffect(() => {
    if (!containerRef.current) return

    const initializeEngine = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🚀 Инициализация VTK Viewer...')
        const engine = new VTKEngine()
        await engine.initialize(containerRef.current!)
        
        engineRef.current = engine
        setPresets(engine.getDentalPresets())
        setIsInitialized(true)
        
        console.log('✅ VTK Viewer готов к использованию')
      } catch (error) {
        console.error('❌ Критическая ошибка VTK Viewer:', error)
        setError(`Критическая ошибка инициализации: ${error}`)
        
        // Показываем fallback интерфейс
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #1e3a8a, #3730a3); color: white; font-family: Arial, sans-serif;">
              <div style="text-align: center; padding: 40px; max-width: 500px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🦷</div>
                <h2 style="margin: 0 0 16px 0; color: #fbbf24;">3D визуализация временно недоступна</h2>
                <p style="margin: 0 0 20px 0; color: #e5e7eb; line-height: 1.5;">
                  VTK.js движок не смог загрузиться. Это может быть связано с ограничениями браузера или проблемами с WebGL.
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                    <strong>Попробуйте:</strong><br>
                    • Обновить страницу (F5)<br>
                    • Использовать Chrome или Firefox<br>
                    • Проверить поддержку WebGL в браузере
                  </p>
                </div>
                <button onclick="window.location.reload()" style="
                  background: #3b82f6; 
                  color: white; 
                  border: none; 
                  padding: 12px 24px; 
                  border-radius: 6px; 
                  cursor: pointer; 
                  font-size: 16px;
                  transition: background 0.3s;
                " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                  🔄 Перезагрузить
                </button>
              </div>
            </div>
          `
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeEngine()

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
      }
    }
  }, [])

  // Загрузка данных объема при их изменении
  useEffect(() => {
    if (!engineRef.current || !isInitialized || !volumeData || !dimensions) {
      return
    }

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('📊 Loading volume data into VTK...')
        await engineRef.current!.setVolumeData(volumeData, dimensions, spacing)
        
        console.log('✅ Volume data loaded successfully')
      } catch (error) {
        console.error('❌ Failed to load volume data:', error)
        setError(`Data loading failed: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [volumeData, dimensions, spacing, isInitialized])

  // Применение пресета
  const handlePresetChange = useCallback((presetName: string) => {
    if (!engineRef.current) return
    
    engineRef.current.applyDentalPreset(presetName)
    setCurrentPreset(presetName)
    setSettings(prev => ({ ...prev, preset: presetName }))
  }, [])

  // Сброс камеры
  const handleResetCamera = useCallback(() => {
    if (!engineRef.current) return
    
    engineRef.current.resetCamera()
  }, [])

  // Обновление настроек
  const handleSettingsUpdate = useCallback((newSettings: Partial<VolumeSettings>) => {
    if (!engineRef.current) return
    
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    engineRef.current.updateSettings(newSettings)
  }, [settings])

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-red-50", className)}>
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка инициализации 3D вьювера</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Перезагрузить страницу
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-full flex", className)}>
      {/* Основная область 3D рендеринга */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Загрузка 3D данных...</p>
            </div>
          </div>
        )}
        
        {/* Информация о пациенте (если нет данных) */}
        {!volumeData && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Загрузите медицинские данные</h3>
              <p>Выберите архив OneVolumeViewer для начала 3D визуализации</p>
            </div>
          </div>
        )}
      </div>

      {/* Панель управления */}
      {isInitialized && (
        <div className="w-80 bg-gray-900 text-white p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Настройки 3D визуализации</h3>
          
          {/* Пресеты */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Медицинские пресеты</label>
            <select
              value={currentPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              {presets.map((preset) => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {presets.find(p => p.name === currentPreset)?.description}
            </p>
          </div>

          {/* Режим рендеринга */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Режим рендеринга</label>
            <div className="flex space-x-2">
              {(['volume', 'slice', 'mip'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleSettingsUpdate({ renderMode: mode })}
                  className={cn(
                    "px-3 py-1 rounded text-sm",
                    settings.renderMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  )}
                >
                  {mode === 'volume' ? '3D' : mode === 'slice' ? 'Слайсы' : 'MIP'}
                </button>
              ))}
            </div>
          </div>

          {/* Настройки окна */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Ширина окна: {settings.windowWidth}
            </label>
            <input
              type="range"
              min="100"
              max="4000"
              value={settings.windowWidth}
              onChange={(e) => handleSettingsUpdate({ windowWidth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Уровень окна: {settings.windowLevel}
            </label>
            <input
              type="range"
              min="-1000"
              max="2000"
              value={settings.windowLevel}
              onChange={(e) => handleSettingsUpdate({ windowLevel: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Прозрачность: {Math.round(settings.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.opacity}
              onChange={(e) => handleSettingsUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Кнопка сброса камеры */}
          <Button
            onClick={handleResetCamera}
            className="w-full mb-4"
            variant="secondary"
          >
            Сбросить камеру
          </Button>

          {/* Информация о данных */}
          {volumeData && dimensions && (
            <div className="mt-6 p-3 bg-gray-800 rounded">
              <h4 className="text-sm font-medium mb-2">Информация о данных</h4>
              <div className="text-xs text-gray-300 space-y-1">
                <div>Размеры: {Array.isArray(dimensions) ? dimensions.join(' × ') : 'Неизвестно'}</div>
                <div>Вокселей: {volumeData.length.toLocaleString()}</div>
                <div>Разрешение: {spacing[0]}mm</div>
                {patientInfo && (
                  <>
                    <div>Пациент: {patientInfo.name}</div>
                    <div>Дата: {patientInfo.studyDate}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
 
 