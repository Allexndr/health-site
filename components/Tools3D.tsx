'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Tools3DProps {
  onToolSelect?: (tool: string) => void
  onSettingChange?: (setting: string, value: any) => void
  currentSettings: {
    brightness: number
    contrast: number
    windowLevel: number
    windowWidth: number
    slice: number
  }
}

export default function Tools3D({ onToolSelect, onSettingChange, currentSettings }: Tools3DProps) {
  const [activeTool, setActiveTool] = useState<string>('pan')
  
  const { 
    brightness, 
    contrast, 
    windowLevel, 
    windowWidth 
  } = currentSettings;

  const tools = [
    { id: 'pan', name: 'Панорама', icon: '🤚' },
    { id: 'zoom', name: 'Масштаб', icon: '🔍' },
    { id: 'rotate', name: 'Поворот', icon: '🔄' },
    { id: 'measure', name: 'Измерение', icon: '📏' },
    { id: 'crosshair', name: 'Прицел', icon: '➕' }
  ]

  const presets = [
    { name: 'Эмаль', wl: 3200, ww: 1000 },     // Для зубной эмали (высокая плотность)
    { name: 'Дентин', wl: 2500, ww: 800 },     // Для дентина 
    { name: 'Пульпа', wl: 400, ww: 300 },      // Для мягких тканей пульпы
    { name: 'Кость', wl: 1500, ww: 1200 },     // Для альвеолярной кости
    { name: 'Общий', wl: 1800, ww: 3000 }      // Для просмотра всех структур
  ]

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId)
    onToolSelect?.(toolId)
  }

  const handlePresetSelect = (preset: typeof presets[0]) => {
    onSettingChange?.('windowLevel', preset.wl)
    onSettingChange?.('windowWidth', preset.ww)
  }

  const handleSliderChange = (setting: string, value: number) => {
    onSettingChange?.(setting, value)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Инструменты 3D анализа</h3>
        
        {/* Tools */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolSelect(tool.id)}
              className="flex flex-col items-center p-3 h-auto"
            >
              <span className="text-lg mb-1">{tool.icon}</span>
              <span className="text-xs">{tool.name}</span>
            </Button>
          ))}
        </div>

        {/* Window/Level Presets */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Пресеты визуализации</h4>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="text-xs justify-start"
              >
                {preset.name}
                <span className="ml-auto text-gray-500">
                  {preset.wl}/{preset.ww}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Manual Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Яркость: {brightness}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Контраст: {contrast}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Window Level: {windowLevel}
            </label>
            <input
              type="range"
              min="-1024"
              max="3071"
              value={windowLevel}
              onChange={(e) => handleSliderChange('windowLevel', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Window Width: {windowWidth}
            </label>
            <input
              type="range"
              min="1"
              max="4095"
              value={windowWidth}
              onChange={(e) => handleSliderChange('windowWidth', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Срез: {currentSettings.slice}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={currentSettings.slice}
              onChange={(e) => handleSliderChange('slice', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 3D Controls */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">3D режимы</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              Volume Rendering
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Maximum Intensity
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Surface Rendering
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
 
 
 
 
 
 
 
 
 