'use client'

import React, { useRef, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { 
  EyeIcon,
  CubeIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface Med3WebViewerProps {
  onFileLoaded?: (fileName: string) => void
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    Med3Web: any
    jQuery: any
    $: any
  }
}

export default function Med3WebViewer({ onFileLoaded, onError }: Med3WebViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadedFile, setLoadedFile] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [viewer, setViewer] = useState<any>(null)
  const [isMed3WebLoaded, setIsMed3WebLoaded] = useState(false)

  useEffect(() => {
    // Загружаем Med3Web скрипт
    const loadMed3Web = async () => {
      try {
        // Проверяем, не загружен ли уже Med3Web
        if (window.Med3Web) {
          console.log('✅ Med3Web уже загружен')
          setIsMed3WebLoaded(true)
          initializeViewer()
          return
        }

        console.log('🔄 Загрузка Med3Web...')
        
        // Загружаем Med3Web wrapper
        const script = document.createElement('script')
        script.src = '/med3web/med3web-wrapper.js'
        script.onload = () => {
          console.log('✅ Med3Web wrapper загружен')
          
          // Ждем события готовности
          const handleReady = () => {
            console.log('✅ Med3Web готов к использованию')
            setIsMed3WebLoaded(true)
            initializeViewer()
            window.removeEventListener('med3web-ready', handleReady)
          }
          
          window.addEventListener('med3web-ready', handleReady)
          
          // Если событие уже произошло
          if (window.Med3Web) {
            handleReady()
          }
        }
        script.onerror = (error) => {
          console.error('❌ Ошибка загрузки Med3Web wrapper:', error)
          onError?.(new Error('Не удалось загрузить Med3Web'))
        }
        document.head.appendChild(script)
      } catch (error) {
        console.error('❌ Ошибка инициализации Med3Web:', error)
        onError?.(error as Error)
      }
    }

    // Функция для загрузки обычных скриптов
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }

    loadMed3Web()
  }, [])

  const initializeViewer = () => {
    if (!containerRef.current || !window.Med3Web) return

    try {
      console.log('🎯 Инициализация Med3Web viewer...')
      
      // Очищаем контейнер
      containerRef.current.innerHTML = ''
      
      // Создаем контейнеры для Med3Web
      const viewerContainer = document.createElement('div')
      viewerContainer.id = 'med3web-container'
      viewerContainer.style.width = '100%'
      viewerContainer.style.height = '100%'
      
      // Создаем контейнеры для 2D и 3D рендеринга
      const container2d = document.createElement('div')
      container2d.id = 'med3web-container-2d'
      container2d.style.width = '100%'
      container2d.style.height = '100%'
      
      const container3d = document.createElement('div')
      container3d.id = 'med3web-container-3d'
      container3d.style.width = '100%'
      container3d.style.height = '100%'
      
      viewerContainer.appendChild(container2d)
      viewerContainer.appendChild(container3d)
      containerRef.current.appendChild(viewerContainer)

      // Инициализируем Med3Web wrapper
      const med3webViewer = window.Med3Web
      med3webViewer.init(container2d, container3d)
      
      setViewer(med3webViewer)

      console.log('✅ Med3Web viewer инициализирован')
    } catch (error) {
      console.error('❌ Ошибка инициализации viewer:', error)
      onError?.(error as Error)
    }
  }

  const checkFileFormat = (file: File): string => {
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop()
    
    console.log('🔍 Анализ файла:', fileName, 'Расширение:', fileExtension)
    
    // Проверяем OneVolumeViewer форматы
    if (fileName.includes('.ct') || fileName.includes('onevolumeviewer') || fileName.includes('.vol')) {
      return 'onevolumeviewer'
    }
    
    // Проверяем DICOM форматы
    if (fileExtension === 'dcm' || fileExtension === 'dicom' || fileName.includes('dicom')) {
      return 'dicom'
    }
    
    // Проверяем NIfTI форматы
    if (fileExtension === 'nii' || fileExtension === 'nifti' || fileName.includes('nifti')) {
      return 'nifti'
    }
    
    // Проверяем Analyze форматы
    if (fileExtension === 'hdr' || fileExtension === 'img' || fileName.includes('analyze')) {
      return 'analyze'
    }
    
    // Проверяем KTX форматы
    if (fileExtension === 'ktx' || fileName.includes('ktx')) {
      return 'ktx'
    }
    
    // Проверяем архивы
    if (fileExtension === 'zip' || fileExtension === 'rar' || fileExtension === '7z') {
      return 'archive'
    }
    
    // Если расширение не распознано, попробуем определить по MIME типу
    if (file.type) {
      console.log('📋 MIME тип файла:', file.type)
      
      if (file.type.includes('dicom') || file.type.includes('medical')) {
        return 'dicom'
      }
      
      if (file.type.includes('zip') || file.type.includes('archive')) {
        return 'archive'
      }
    }
    
    console.log('❓ Неизвестный формат файла')
    return 'unknown'
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !viewer) return

    setIsLoading(true)
    try {
      console.log('🦷 Загрузка файла в Med3Web:', file.name)
      
      const fileFormat = checkFileFormat(file)
      console.log('📁 Формат файла:', fileFormat)
      
      // Показываем информацию о формате
      if (fileFormat === 'onevolumeviewer') {
        toast.info('Обнаружен архив OneVolumeViewer', {
          description: 'Med3Web может не поддерживать этот формат напрямую. Попробуйте извлечь DICOM файлы из архива.',
          duration: 5000
        })
      }
      
      // Определяем тип загрузки для Med3Web
      let loadType = 'not assigned'
      switch (fileFormat) {
        case 'dicom':
          loadType = 'local dicom'
          break
        case 'nifti':
          loadType = 'local nifti'
          break
        case 'analyze':
          loadType = 'local hdr'
          break
        case 'ktx':
          loadType = 'local ktx'
          break
        default:
          loadType = 'not assigned'
      }
      
      // Загружаем файл в Med3Web используя wrapper API
      if (fileFormat === 'dicom' || fileFormat === 'nifti' || fileFormat === 'analyze' || fileFormat === 'ktx') {
        // Для всех поддерживаемых медицинских форматов используем единый метод
        console.log('📁 Загрузка файла формата:', fileFormat)
        viewer.loadDicomFiles([file])
      } else if (fileFormat === 'archive') {
        // Для архивов показываем подсказку
        toast.info('Обнаружен архив', {
          description: 'Используйте вкладку "Извлечение архивов" для обработки архивных файлов.',
          duration: 5000
        })
        throw new Error('Архивы должны быть обработаны через извлечение')
      } else if (fileFormat === 'onevolumeviewer') {
        // Для OneVolumeViewer файлов показываем подсказку
        toast.info('Обнаружен файл OneVolumeViewer', {
          description: 'Используйте вкладку "Извлечение архивов" для конвертации в DICOM.',
          duration: 5000
        })
        throw new Error('OneVolumeViewer файлы требуют конвертации в DICOM')
      } else {
        // Для неизвестных форматов показываем подробную информацию
        console.log('❌ Неподдерживаемый формат:', fileFormat, 'Файл:', file.name)
        throw new Error(`Неподдерживаемый формат файла: ${fileFormat || 'неизвестно'}`)
      }
      
      setLoadedFile(file.name)
      onFileLoaded?.(file.name)
      
      toast.success(`Файл "${file.name}" загружен в Med3Web`, {
        description: 'Используйте инструменты для навигации и анализа',
        duration: 3000
      })
    } catch (error) {
      console.error('❌ Ошибка загрузки файла:', error)
      
      // Показываем более информативное сообщение об ошибке
      let errorMessage = 'Ошибка загрузки файла'
      let errorDescription = error instanceof Error ? error.message : 'Неизвестная ошибка'
      
      if (errorDescription.includes('format') || errorDescription.includes('unsupported')) {
        errorMessage = 'Неподдерживаемый формат файла'
        errorDescription = 'Med3Web поддерживает DICOM, NIfTI, Analyze и KTX форматы. OneVolumeViewer архивы требуют предварительной обработки.'
      }
      
      onError?.(error as Error)
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlLoad = async () => {
    const url = prompt('Введите URL к DICOM файлам:')
    if (!url || !viewer) return

    setIsLoading(true)
    try {
      console.log('🌐 Загрузка данных по URL:', url)
      
      // Используем wrapper метод для загрузки по URL
      viewer.loadScene(url, 'dicom')
      
      setLoadedFile(`URL: ${url}`)
      onFileLoaded?.(`URL: ${url}`)
      
      toast.success('Данные загружены по URL', {
        description: 'Используйте инструменты для навигации',
        duration: 3000
      })
    } catch (error) {
      console.error('❌ Ошибка загрузки по URL:', error)
      onError?.(error as Error)
      toast.error('Ошибка загрузки по URL', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoData = async () => {
    if (!viewer) return

    setIsLoading(true)
    try {
      console.log('🎮 Загрузка демо данных...')
      
      // Загружаем демо данные из папки public
      const demoUrl = '/med3web/demo/'
      viewer.loadScene(demoUrl, 'dicom')
      
      setLoadedFile('Демо данные')
      onFileLoaded?.('Демо данные')
      
      toast.success('Демо данные загружены', {
        description: 'Используйте инструменты для навигации',
        duration: 3000
      })
    } catch (error) {
      console.error('❌ Ошибка загрузки демо данных:', error)
      toast.error('Демо данные недоступны', {
        description: 'Попробуйте загрузить собственный файл',
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Med3Web Container */}
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
            <span className="text-sm">Загрузить файл</span>
            <input
              type="file"
              accept=".dcm,.dicom,.nii,.nifti,.hdr,.img,.ktx,.zip,.rar,.7z,.vol,.ct"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading || !isMed3WebLoaded}
            />
          </label>
        </div>

        {/* URL Load */}
        <button
          onClick={handleUrlLoad}
          disabled={isLoading || !isMed3WebLoaded}
          className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white hover:text-blue-400 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <PhotoIcon className="w-5 h-5" />
          <span className="text-sm">Загрузить по URL</span>
        </button>

        {/* Demo Data */}
        <button
          onClick={handleDemoData}
          disabled={isLoading || !isMed3WebLoaded}
          className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white hover:text-green-400 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <CubeIcon className="w-5 h-5" />
          <span className="text-sm">Демо данные</span>
        </button>

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

        {/* Loading Status */}
        {!isMed3WebLoaded && (
          <div className="bg-yellow-900/80 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Загрузка Med3Web...</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Загрузка данных...</span>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white min-w-[320px] max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <EyeIcon className="w-5 h-5" />
            Настройки Med3Web
          </h3>

          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              <p className="mb-2 font-medium">Поддерживаемые форматы:</p>
              <ul className="space-y-1 text-xs">
                <li>• DICOM (.dcm, .dicom)</li>
                <li>• NIfTI (.nii, .nifti)</li>
                <li>• Analyze (.hdr, .img)</li>
                <li>• KTX (.ktx)</li>
                <li>• Архивы (.zip, .rar, .7z)</li>
                <li>• OneVolumeViewer (.vol, .ct)</li>
              </ul>
            </div>

            <div className="text-sm text-gray-300">
              <p className="mb-2 font-medium">Возможности:</p>
              <ul className="space-y-1 text-xs">
                <li>• 2D срезы (аксиальный, сагиттальный, корональный)</li>
                <li>• 3D объемный рендеринг</li>
                <li>• MIP (Maximum Intensity Projection)</li>
                <li>• Настройка Window/Level</li>
                <li>• Измерения и аннотации</li>
                <li>• Поддержка множественных форматов</li>
                <li>• Автоматическое определение типа файла</li>
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-200">
                  <p className="font-medium mb-1">OneVolumeViewer архивы</p>
                  <p>Med3Web не поддерживает архивы OneVolumeViewer напрямую. Для работы с ними используйте кастомный 3D viewer.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-200">
                  <p className="font-medium mb-1">Совет</p>
                  <p>Для лучшего качества 3D рендеринга используйте DICOM файлы с высоким разрешением.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 