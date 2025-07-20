'use client'

import React, { useState, useEffect } from 'react'
import { 
  CubeIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import SimpleVolumeViewer from '../../../components/SimpleVolumeViewer'
import AdvancedVolumeViewer from '../../../components/AdvancedVolumeViewer'
import VTKVolumeViewer from '../../../components/VTKVolumeViewer'
import CornerstoneViewer from '../../../components/CornerstoneViewer'
import VolumeConverter from '../../../components/VolumeConverter'

export default function VolumeViewer3DPage() {
  const [activeTab, setActiveTab] = useState('vtk')
  const [volumeData, setVolumeData] = useState<any>(null)
  const [volumeStats, setVolumeStats] = useState<{ min: number; max: number } | null>(null)

  // Предотвращаем кэширование
  useEffect(() => {
    // Добавляем случайный параметр к URL для предотвращения кэширования
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('_t', Date.now().toString())
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const tabs = [
    {
      id: 'vtk',
      name: 'VTK.js Профессиональный',
      description: 'VTK.js с объемным рендерингом и transfer functions',
      icon: SparklesIcon,
      component: VTKVolumeViewer
    },
    {
      id: 'cornerstone',
      name: 'Cornerstone3D 2D',
      description: 'Cornerstone3D для профессиональной 2D DICOM визуализации',
      icon: ComputerDesktopIcon,
      component: CornerstoneViewer
    },
    {
      id: 'advanced',
      name: 'Three.js 3D',
      description: 'Three.js для базовой 3D визуализации',
      icon: CubeIcon,
      component: AdvancedVolumeViewer
    },
    {
      id: 'simple',
      name: 'Базовый просмотрщик',
      description: 'Простая 3D визуализация OneVolumeViewer архивов',
      icon: EyeIcon,
      component: SimpleVolumeViewer
    },
    {
      id: 'converter',
      name: 'Конвертер',
      description: 'Конвертация OneVolumeViewer в DICOM формат',
      icon: ArrowPathIcon,
      component: VolumeConverter
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            3D Визуализатор стоматологических снимков
          </h1>
          <p className="text-gray-600">
            Профессиональный инструмент для просмотра и анализа объемных CT данных в 3D
          </p>
            </div>

        {/* Информационная панель */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <SparklesIcon className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Профессиональная VTK.js визуализация
              </h3>
              <p className="text-blue-700 mb-3">
                Теперь доступен профессиональный VTK.js рендерер с объемным рендерингом, transfer functions, 
                и интерактивными виджетами. Качество визуализации соответствует профессиональным медицинским приложениям.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white bg-opacity-50 rounded p-3">
                  <strong>VTK.js:</strong> Профессиональный объемный рендеринг
                </div>
                <div className="bg-white bg-opacity-50 rounded p-3">
                  <strong>Transfer Functions:</strong> Настройка цветов и прозрачности
                </div>
                <div className="bg-white bg-opacity-50 rounded p-3">
                  <strong>Volume Controller:</strong> Интерактивные виджеты управления
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Табы */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Контент таба */}
          <div className="p-6">
            {tabs.map((tab) => {
              if (activeTab === tab.id) {
                const Component = tab.component
                return (
                  <Component 
                    key={tab.id} 
                    volumeData={tab.id === 'cornerstone' ? volumeData : undefined}
                    onVolumeDataChange={tab.id === 'vtk' ? (data: any, stats: any) => {
                      setVolumeData(data)
                      setVolumeStats(stats)
                    } : undefined}
                  />
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Инструкция */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2 text-blue-600" />
            Инструкция по использованию
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Как загрузить файл:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Нажмите "Выберите файл" в разделе загрузки</li>
                <li>Выберите .vol файл или .zip архив OneVolumeViewer</li>
                <li>Дождитесь загрузки и обработки файла</li>
                <li>Используйте 3D контролы для навигации</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Возможности профессионального режима:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Полноценная 3D модель с WebGL ускорением</li>
                <li>2D срезы с настройкой окна/уровня</li>
                <li>Интерактивные контролы камеры</li>
                <li>Цветовое кодирование по значениям</li>
                <li>Оптимизированная производительность</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Поддерживаемые форматы */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Поддерживаемые форматы</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">OneVolumeViewer .vol</h4>
              <p className="text-sm text-gray-600">
                Прямая загрузка .vol файлов с объемными данными
              </p>
                </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">ZIP архивы</h4>
              <p className="text-sm text-gray-600">
                ZIP архивы, содержащие .vol файлы OneVolumeViewer
              </p>
              </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">DICOM конвертация</h4>
              <p className="text-sm text-gray-600">
                Конвертация в стандартный DICOM формат
              </p>
            </div>
          </div>
                </div>
                
        {/* Технические особенности */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Технические особенности</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">VTK.js Профессиональный:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Объемный рендеринг с ray casting</li>
                <li>Transfer functions для цветов и прозрачности</li>
                <li>Интерактивные виджеты Volume Controller</li>
                <li>Профессиональное освещение и материалы</li>
                <li>Поддержка больших объемов данных</li>
                <li>Медицинские алгоритмы рендеринга</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Three.js 3D:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>WebGL ускорение рендеринга</li>
                <li>Точечная визуализация объемов</li>
                <li>Интерактивные контролы камеры</li>
                <li>Цветовое кодирование по значениям</li>
                <li>Настройка порога и прозрачности</li>
                <li>Оптимизированная производительность</li>
              </ul>
            </div>
          </div>
        </div>
                
        {/* Рекомендации */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Рекомендации по использованию
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
                    <div>
              <h4 className="font-medium text-green-900 mb-2">Для лучшей производительности:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Используйте современный браузер с поддержкой WebGL 2.0</li>
                <li>Закройте другие вкладки для освобождения памяти</li>
                <li>Для больших файлов используйте профессиональный режим</li>
                <li>Настройте порог отображения для оптимизации</li>
              </ul>
            </div>
                <div>
              <h4 className="font-medium text-green-900 mb-2">Для качественной визуализации:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                <li>Используйте 2D срезы для детального анализа</li>
                <li>Настройте окно/уровень для лучшего контраста</li>
                <li>Экспериментируйте с прозрачностью в 3D режиме</li>
                <li>Используйте орбитальные контролы для осмотра</li>
                  </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
