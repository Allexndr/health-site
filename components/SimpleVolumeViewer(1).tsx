'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface VolumeData {
  data: Uint16Array
  width: number
  height: number
  depth: number
  metadata: {
    patientName: string
    patientId: string
    studyDate: string
  }
}

export default function SimpleVolumeViewer() {
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [windowLevel, setWindowLevel] = useState(1000)
  const [windowWidth, setWindowWidth] = useState(2000)
  const [threshold, setThreshold] = useState(500)
  const [opacity, setOpacity] = useState(0.8)
  const [is3DMode, setIs3DMode] = useState(true)
  const [currentSlice, setCurrentSlice] = useState(0)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Загружаем файл:', file.name, 'Размер:', file.size, 'байт')
      
      if (file.name.toLowerCase().endsWith('.vol')) {
        // OneVolumeViewer .vol файл
        console.log('📁 Обрабатываем .vol файл')
        await loadOneVolumeFile(file)
      } else if (file.name.toLowerCase().endsWith('.zip')) {
        // ZIP архив с OneVolumeViewer файлами
        console.log('📦 Обрабатываем ZIP архив')
        await loadOneVolumeArchive(file)
      } else {
        throw new Error('Неподдерживаемый формат файла. Поддерживаются .vol и .zip архивы OneVolumeViewer')
      }
      
      toast.success('Файл успешно загружен', {
        description: `Объем: ${volumeData?.width}×${volumeData?.height}×${volumeData?.depth}`,
        duration: 3000
      })
      
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error)
      toast.error('Ошибка загрузки файла', {
        description: error.message,
        duration: 5000
      })
      setError(error.message)
    } finally {
      setIsLoading(false)
      // Clear the input to allow re-uploading the same file
      event.target.value = ''
    }
  }

  const loadOneVolumeFile = async (file: File) => {
    console.log('📁 Загружаем .vol файл:', file.name, 'Размер:', file.size, 'байт')
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('📊 ArrayBuffer размер:', arrayBuffer.byteLength, 'байт')
    
    // Ensure the buffer length is even for Uint16Array
    const bufferLength = arrayBuffer.byteLength
    const alignedLength = Math.floor(bufferLength / 2) * 2
    
    if (alignedLength !== bufferLength) {
      console.warn(`⚠️ Buffer length ${bufferLength} is not even, truncating to ${alignedLength}`)
    }
    
    // Create a properly aligned buffer for Uint16Array
    const alignedBuffer = arrayBuffer.slice(0, alignedLength)
    const volumeArray = new Uint16Array(alignedBuffer)
    
    console.log('🔢 Uint16Array размер:', volumeArray.length, 'элементов')
    
    // Предполагаем кубический объем (типично для OneVolumeViewer)
    const totalVoxels = volumeArray.length
    const size = Math.cbrt(totalVoxels)
    
    console.log('📐 Вычисленный размер куба:', size)
    
    if (Math.abs(size - Math.round(size)) > 0.1) {
      throw new Error(`Некорректный размер объема данных. Ожидается кубический объем, получено: ${totalVoxels} вокселей (${size.toFixed(2)}³)`)
    }
    
    const dimensions = Math.round(size)
    console.log('✅ Размеры объема:', dimensions, '×', dimensions, '×', dimensions)
    
    // Вычисляем оптимальный порог на основе данных
    const sortedData = [...volumeArray].sort((a, b) => a - b)
    const percentile95 = sortedData[Math.floor(sortedData.length * 0.95)]
    const percentile5 = sortedData[Math.floor(sortedData.length * 0.05)]
    const optimalThreshold = Math.max(percentile5, 100) // Минимум 100
    
    console.log('🎯 Оптимальный порог:', optimalThreshold, '(95-й процентиль:', percentile95, ')')
    
    // Обновляем порог автоматически
    setThreshold(optimalThreshold)
    
    setVolumeData({
      data: volumeArray,
      width: dimensions,
      height: dimensions,
      depth: dimensions,
      metadata: {
        patientName: 'Пациент',
        patientId: 'ID',
        studyDate: new Date().toISOString().split('T')[0]
      }
    })
  }

  const loadOneVolumeArchive = async (file: File) => {
    console.log('📦 Загружаем ZIP архив:', file.name, 'Размер:', file.size, 'байт')
    
    // Простая обработка ZIP архива
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(file)
    
    console.log('📋 Файлы в архиве:', Object.keys(zipContent.files))
    
    // Ищем .vol файл
    const volFile = Object.values(zipContent.files).find(f => 
      f.name.toLowerCase().endsWith('.vol')
    )
    
    if (!volFile) {
      throw new Error('Файл .vol не найден в архиве')
    }
    
    console.log('📁 Найден .vol файл:', volFile.name, 'Размер:', volFile._data.uncompressedSize, 'байт')
    
    const volData = await volFile.async('uint8array')
    console.log('📊 VolData размер:', volData.length, 'байт')
    
    // Ensure the buffer length is even for Uint16Array
    const bufferLength = volData.length
    const alignedLength = Math.floor(bufferLength / 2) * 2
    
    if (alignedLength !== bufferLength) {
      console.warn(`⚠️ Buffer length ${bufferLength} is not even, truncating to ${alignedLength}`)
    }
    
    // Create a properly aligned buffer for Uint16Array
    const alignedBuffer = volData.slice(0, alignedLength)
    const volumeArray = new Uint16Array(alignedBuffer.buffer, alignedBuffer.byteOffset, alignedBuffer.byteLength / 2)
    
    console.log('🔢 Uint16Array размер:', volumeArray.length, 'элементов')
    
    // Аналогично loadOneVolumeFile
    const totalVoxels = volumeArray.length
    const size = Math.cbrt(totalVoxels)
    const dimensions = Math.round(size)
    console.log('✅ Размеры объема:', dimensions, '×', dimensions, '×', dimensions)
    
    // Вычисляем оптимальный порог на основе данных
    const sortedData = [...volumeArray].sort((a, b) => a - b)
    const percentile95 = sortedData[Math.floor(sortedData.length * 0.95)]
    const percentile5 = sortedData[Math.floor(sortedData.length * 0.05)]
    const optimalThreshold = Math.max(percentile5, 100) // Минимум 100
    
    console.log('🎯 Оптимальный порог:', optimalThreshold, '(95-й процентиль:', percentile95, ')')
    
    // Обновляем порог автоматически
    setThreshold(optimalThreshold)
    
    setVolumeData({
      data: volumeArray,
      width: dimensions,
      height: dimensions,
      depth: dimensions,
      metadata: {
        patientName: 'Пациент',
        patientId: 'ID',
        studyDate: new Date().toISOString().split('T')[0]
      }
    })
  }

  const init3DScene = async () => {
    if (!volumeData || !containerRef.current) return

    try {
      console.log('🚀 Инициализация 3D сцены...')
      
      const THREE = await import('three')
      console.log('✅ Three.js загружен')
      
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls')
      console.log('✅ OrbitControls загружены')

      // Очищаем предыдущую сцену
      if (sceneRef.current) {
        sceneRef.current.clear()
      }

      // Создаем сцену
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      sceneRef.current = scene

      // Создаем камеру
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      )
      camera.position.set(2, 2, 2)
      cameraRef.current = camera

      // Создаем рендерер
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current,
        antialias: true,
        alpha: true
      })
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      rendererRef.current = renderer

      // Добавляем контролы
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controlsRef.current = controls

      // Создаем 3D модель из объемных данных
      createVolumeModel(scene, volumeData)

      // Добавляем освещение
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(1, 1, 1)
      scene.add(directionalLight)

      // Анимационный цикл
      const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      console.log('✅ 3D сцена инициализирована успешно')

    } catch (error) {
      console.error('❌ Ошибка инициализации 3D сцены:', error)
      setError(`Ошибка инициализации 3D рендерера: ${error.message}`)
    }
  }

  const createVolumeModel = (scene: any, volumeData: VolumeData) => {
    try {
      console.log('🔧 Создание 3D модели...')
      
      const THREE = require('three')
      console.log('✅ Three.js доступен в createVolumeModel')
      
      const { data, width, height, depth } = volumeData
      const geometry = new THREE.BufferGeometry()
      const positions: number[] = []
      const colors: number[] = []
      const indices: number[] = []

      // Находим диапазон значений для нормализации
      let minValue = Infinity
      let maxValue = -Infinity
      for (let i = 0; i < data.length; i++) {
        const value = data[i]
        if (value > threshold) {
          minValue = Math.min(minValue, value)
          maxValue = Math.max(maxValue, value)
        }
      }

      console.log('📊 Диапазон значений:', minValue, '-', maxValue)

      // Ограничиваем количество вокселей для производительности
      const maxVoxels = 100000 // Максимум 100k вокселей
      const step = Math.max(1, Math.floor(Math.cbrt(data.length / maxVoxels)))
      
      console.log('📏 Шаг выборки:', step, 'для ограничения вокселей')

      // Создаем точки для каждого вокселя выше порога с шагом
      let vertexIndex = 0
      let voxelCount = 0
      
      for (let z = 0; z < depth && voxelCount < maxVoxels; z += step) {
        for (let y = 0; y < height && voxelCount < maxVoxels; y += step) {
          for (let x = 0; x < width && voxelCount < maxVoxels; x += step) {
            const index = z * width * height + y * width + x
            const value = data[index]

            if (value > threshold) {
              // Нормализуем значение
              const normalizedValue = (value - minValue) / (maxValue - minValue)
              
              // Создаем куб для каждого вокселя
              const size = 0.02 * step // Размер куба пропорционально шагу
              const xPos = (x - width / 2) * 0.02
              const yPos = (y - height / 2) * 0.02
              const zPos = (z - depth / 2) * 0.02

              // Создаем 8 вершин куба
              const vertices = [
                xPos - size/2, yPos - size/2, zPos - size/2,
                xPos + size/2, yPos - size/2, zPos - size/2,
                xPos + size/2, yPos + size/2, zPos - size/2,
                xPos - size/2, yPos + size/2, zPos - size/2,
                xPos - size/2, yPos - size/2, zPos + size/2,
                xPos + size/2, yPos - size/2, zPos + size/2,
                xPos + size/2, yPos + size/2, zPos + size/2,
                xPos - size/2, yPos + size/2, zPos + size/2,
              ]

              // Добавляем вершины
              for (let i = 0; i < vertices.length; i += 3) {
                positions.push(vertices[i], vertices[i + 1], vertices[i + 2])
                
                // Цвет на основе значения
                const color = new THREE.Color()
                color.setHSL(0.6, 1, 0.3 + normalizedValue * 0.7)
                colors.push(color.r, color.g, color.b)
              }

              // Создаем грани куба (12 треугольников)
              const cubeIndices = [
                0, 1, 2, 0, 2, 3, // передняя грань
                1, 5, 6, 1, 6, 2, // правая грань
                5, 4, 7, 5, 7, 6, // задняя грань
                4, 0, 3, 4, 3, 7, // левая грань
                3, 2, 6, 3, 6, 7, // верхняя грань
                4, 5, 1, 4, 1, 0  // нижняя грань
              ]

              for (let i = 0; i < cubeIndices.length; i++) {
                indices.push(vertexIndex + cubeIndices[i])
              }

              vertexIndex += 8
              voxelCount++
            }
          }
        }
      }

      console.log('🔢 Создано вершин:', positions.length / 3)
      console.log('🔢 Создано индексов:', indices.length)
      console.log('🔢 Создано вокселей:', voxelCount)

      // Проверяем, что у нас есть данные для отображения
      if (positions.length === 0) {
        console.warn('⚠️ Нет данных для отображения. Попробуйте уменьшить порог.')
        return
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      geometry.setIndex(indices)
      geometry.computeVertexNormals()

      const material = new THREE.MeshLambertMaterial({
        vertexColors: true,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      console.log('✅ 3D модель создана успешно')
      
    } catch (error) {
      console.error('❌ Ошибка создания 3D модели:', error)
      setError(`Ошибка создания 3D модели: ${error.message}`)
    }
  }

  const renderSlice = (sliceIndex: number) => {
    if (!volumeData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { data, width, height } = volumeData
    const sliceSize = width * height
    const startIndex = sliceIndex * sliceSize
    const endIndex = startIndex + sliceSize

    // Создаем ImageData
    const imageData = ctx.createImageData(width, height)
    const sliceData = data.slice(startIndex, endIndex)

    // Применяем window/level
    const min = windowLevel - windowWidth / 2
    const max = windowLevel + windowWidth / 2

    for (let i = 0; i < sliceData.length; i++) {
      const value = sliceData[i]
      const normalized = Math.max(0, Math.min(255, ((value - min) / (max - min)) * 255))
      
      const pixelIndex = i * 4
      imageData.data[pixelIndex] = normalized     // R
      imageData.data[pixelIndex + 1] = normalized // G
      imageData.data[pixelIndex + 2] = normalized // B
      imageData.data[pixelIndex + 3] = 255       // A
    }

    // Очищаем canvas и рисуем
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.putImageData(imageData, 0, 0)
  }

  useEffect(() => {
    if (volumeData) {
      if (is3DMode) {
        init3DScene()
      } else {
        renderSlice(Math.floor(volumeData.depth / 2))
      }
    }
  }, [volumeData, is3DMode, threshold, opacity])

  useEffect(() => {
    if (isPlaying && volumeData && !is3DMode) {
      const animate = () => {
        setCurrentSlice(prev => {
          const next = (prev + 1) % volumeData.depth
          if (next === 0) setIsPlaying(false)
          return next
        })
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, volumeData, is3DMode])

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    setCurrentSlice(value)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const exportSlice = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `slice_${currentSlice}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <CubeIcon className="w-8 h-8 mr-3 text-blue-600" />
          3D Просмотрщик OneVolumeViewer
        </h2>
        <div className="text-sm text-gray-500">
          Поддерживает OneVolumeViewer архивы
        </div>
      </div>

      {/* Загрузка файла */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Загрузить OneVolumeViewer архив
        </label>
        <input
          type="file"
          accept=".vol,.zip"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          Поддерживаемые форматы: .vol файлы и .zip архивы OneVolumeViewer
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <CogIcon className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Загрузка файла...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {volumeData && (
        <div className="space-y-6">
          {/* Информация о файле */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Информация о файле</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Размеры:</span>
                <span className="ml-2 font-medium">{volumeData.width}×{volumeData.height}×{volumeData.depth}</span>
              </div>
              <div>
                <span className="text-gray-500">Пациент:</span>
                <span className="ml-2 font-medium">{volumeData.metadata.patientName}</span>
              </div>
              <div>
                <span className="text-gray-500">Режим:</span>
                <span className="ml-2 font-medium">{is3DMode ? '3D Модель' : '2D Срезы'}</span>
              </div>
              <div>
                <span className="text-gray-500">Дата исследования:</span>
                <span className="ml-2 font-medium">{volumeData.metadata.studyDate}</span>
              </div>
            </div>
          </div>

          {/* Переключатель режимов */}
          <div className="flex gap-4">
            <button
              onClick={() => setIs3DMode(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                is3DMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <CubeIcon className="w-5 h-5 inline mr-2" />
              3D Модель
            </button>
            <button
              onClick={() => setIs3DMode(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                !is3DMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <EyeIcon className="w-5 h-5 inline mr-2" />
              2D Срезы
            </button>
          </div>

          {/* Canvas для отображения */}
          <div 
            ref={containerRef}
            className="flex justify-center bg-black rounded-lg overflow-hidden"
            style={{ height: '500px' }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
          </div>

          {/* Управление 3D моделью */}
          {is3DMode && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Порог отображения: {threshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Прозрачность: {opacity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetView}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                >
                  <ArrowsPointingOutIcon className="w-4 h-4 mr-2" />
                  Сбросить вид
                </button>
              </div>
            </div>
          )}

          {/* Управление 2D срезами */}
          {!is3DMode && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Срез: {currentSlice + 1} / {volumeData.depth}
                </label>
                <input
                  type="range"
                  min="0"
                  max={volumeData.depth - 1}
                  value={currentSlice}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={togglePlay}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                    isPlaying 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <PauseIcon className="w-4 h-4 mr-2" />
                      Остановить
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Воспроизвести
                    </>
                  )}
                </button>

                <button
                  onClick={exportSlice}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  Экспорт среза
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Уровень окна: {windowLevel}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  value={windowLevel}
                  onChange={(e) => setWindowLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ширина окна: {windowWidth}
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  value={windowWidth}
                  onChange={(e) => setWindowWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Инструкция */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Как использовать 3D просмотрщик
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>3D Модель:</strong> Отображает объемные данные как 3D модель. Используйте мышь для вращения, масштабирования и перемещения.</li>
              <li>• <strong>Порог отображения:</strong> Настройте минимальное значение для отображения вокселей.</li>
              <li>• <strong>Прозрачность:</strong> Измените прозрачность 3D модели для лучшего обзора.</li>
              <li>• <strong>2D Срезы:</strong> Просматривайте отдельные срезы объемных данных.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 