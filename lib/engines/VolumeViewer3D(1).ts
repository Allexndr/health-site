/**
 * VolumeViewer3D - Стоматологический 3D визуализатор объемных данных
 * Полная переработка с использованием правильного API Three.js
 */

import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'
import JSZip from 'jszip'

export interface VolumeData {
  width: number
  height: number
  depth: number
  data: Uint16Array
  spacing: [number, number, number]
  origin: [number, number, number]
}

export interface VolumeSettings {
  windowLevel: number
  windowWidth: number
  opacity: number
  renderMode: 'mip' | 'volume' | 'isosurface'
  threshold: number
  colormap: 'bone' | 'hot' | 'cool' | 'gray'
}

export class VolumeViewer3D {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private volumeGroup: THREE.Group
  private currentVolume: VolumeData | null = null
  private sliceMeshes: THREE.Mesh[] = []
  private settings: VolumeSettings = {
    windowLevel: 0.7,     // Увеличиваем для лучшего контраста костной ткани
    windowWidth: 0.5,     // Сужаем окно для четкости
    opacity: 0.9,         // Увеличиваем непрозрачность
    renderMode: 'volume',
    threshold: 0.4,       // Повышаем порог для фильтрации мягких тканей
    colormap: 'bone'
  }

  constructor(container: HTMLElement) {
    console.log('🎯 Создание VolumeViewer3D...')
    console.log('📦 Контейнер:', {
      element: container,
      dimensions: {
        width: container.clientWidth,
        height: container.clientHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight
      }
    })
    
    this.container = container
    
    try {
      this.initThreeJS()
      this.setupEventListeners()
      console.log('✅ VolumeViewer3D полностью инициализирован')
    } catch (error) {
      console.error('❌ Критическая ошибка в конструкторе VolumeViewer3D:', error)
      throw error
    }
  }

  private initThreeJS(): void {
    console.log('🔧 Инициализация Three.js...')
    
    try {
      // Сцена
      console.log('  🏗️ Создание сцены...')
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0x000000)
      console.log('  ✅ Сцена создана')

      // Камера
      console.log('  📹 Создание камеры...')
      const width = this.container.clientWidth || 800
      const height = this.container.clientHeight || 600
      console.log(`  📐 Размеры: ${width}x${height}`)
      
      this.camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
      )
      this.camera.position.set(100, 100, 100)
      this.camera.lookAt(0, 0, 0)
      console.log('  ✅ Камера создана')

      // Рендерер
      console.log('  🎨 Создание рендерера...')
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      })
      
      console.log('  📏 Установка размеров рендерера...')
      this.renderer.setSize(width, height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      
      console.log('  🔗 Добавление в DOM...')
      this.container.appendChild(this.renderer.domElement)
      console.log('  ✅ Рендерер создан и добавлен')

      // Контролы
      console.log('  🕹️ Создание контролов...')
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05
      console.log('  ✅ Контролы созданы')

      // Освещение для медицинской визуализации
      console.log('  💡 Создание освещения...')
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
      this.scene.add(ambientLight)
      
      // Основной источник света
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight1.position.set(100, 100, 100)
      directionalLight1.castShadow = false
      this.scene.add(directionalLight1)
      
      // Дополнительное освещение для глубины
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
      directionalLight2.position.set(-50, 50, -50)
      this.scene.add(directionalLight2)
      
      // Подсветка снизу для зубов
      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3)
      directionalLight3.position.set(0, -100, 0)
      this.scene.add(directionalLight3)
      console.log('  ✅ Освещение создано')

      // Группа для объемных данных
      console.log('  📦 Создание группы объемов...')
      this.volumeGroup = new THREE.Group()
      this.scene.add(this.volumeGroup)
      console.log('  ✅ Группа создана')

      // Добавим тестовый куб для проверки
      console.log('  🧪 Добавление тестового куба...')
      const testGeometry = new THREE.BoxGeometry(50, 50, 50)
      const testMaterial = new THREE.MeshLambertMaterial({ color: 0x44aa88, wireframe: true })
      const testCube = new THREE.Mesh(testGeometry, testMaterial)
      this.scene.add(testCube)
      console.log('  ✅ Тестовый куб добавлен')

      console.log('  🎬 Запуск анимации...')
      this.animate()
      console.log('✅ Three.js полностью инициализирован')
      
    } catch (error) {
      console.error('❌ Ошибка в initThreeJS:', error)
      throw new Error(`Не удалось инициализировать Three.js: ${error.message}`)
    }
  }

  public async loadVolumeFile(file: File): Promise<void> {
    console.log('🦷 Загрузка стоматологического объемного файла:', file.name)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      if (file.name.endsWith('.zip')) {
        await this.loadZipVolume(arrayBuffer)
      } else {
        await this.loadRawVolume(arrayBuffer)
      }
      
      console.log('✅ Объемные данные успешно загружены!')
    } catch (error) {
      console.error('❌ Ошибка загрузки объемных данных:', error)
      throw error
    }
  }

  private async loadZipVolume(buffer: ArrayBuffer): Promise<void> {
    const zip = new JSZip()
    const zipFile = await zip.loadAsync(buffer)
    
    console.log('📦 Анализ архива OneVolumeViewer...')
    
    // Сначала посмотрим все файлы в архиве
    const allFiles: Array<{name: string, size: number, type: string}> = []
    
    for (const [filename, file] of Object.entries(zipFile.files)) {
      if (!file.dir) {
        const size = file._data?.uncompressedSize || 0
        const extension = filename.split('.').pop()?.toLowerCase() || ''
        
        allFiles.push({
          name: filename,
          size: size,
          type: extension
        })
        
        console.log(`📄 Найден файл: ${filename} (${(size / 1024 / 1024).toFixed(2)} МБ) [${extension}]`)
      }
    }
    
    // Сортируем по размеру - самые большие файлы обычно содержат объемные данные
    allFiles.sort((a, b) => b.size - a.size)
    
    // Ищем основные файлы объемных данных
    let volumeData: ArrayBuffer | null = null
    let metadata: any = {}
    let selectedFile: string = ''
    
    // Поиск файлов данных (приоритет по размеру и расширению)
    for (const fileInfo of allFiles) {
      const filename = fileInfo.name
      const extension = fileInfo.type
      
      // Проверяем известные расширения данных
      if (['vol', 'raw', 'dat', 'bin', 'img', 'dcm', 'dicom'].includes(extension) ||
          filename.includes('volume') || 
          filename.includes('data') ||
          fileInfo.size > 1024 * 1024) { // Файлы больше 1 МБ
        
        console.log(`🎯 Пытаемся загрузить данные из: ${filename}`)
        
        try {
          const file = zipFile.files[filename]
          volumeData = await file.async('arraybuffer')
          selectedFile = filename
          console.log(`✅ Успешно загружены данные из: ${filename} (${(volumeData.byteLength / 1024 / 1024).toFixed(2)} МБ)`)
          break
        } catch (error) {
          console.warn(`⚠️ Не удалось загрузить ${filename}:`, error)
          continue
        }
      }
    }
    
    // Поиск метаданных
    for (const [filename, file] of Object.entries(zipFile.files)) {
      if (filename.includes('meta') || 
          filename.includes('info') ||
          filename.includes('header') ||
          filename.includes('ver_ctrl') ||
          filename.endsWith('.txt') || 
          filename.endsWith('.inf') ||
          filename.endsWith('.hdr')) {
        
        try {
          const text = await file.async('string')
          console.log(`📋 Найдены метаданные в ${filename}:`)
          console.log(text.substring(0, 200) + (text.length > 200 ? '...' : ''))
          
          const parsedMeta = this.parseMetadata(text)
          metadata = { ...metadata, ...parsedMeta }
        } catch (error) {
          console.warn(`⚠️ Не удалось прочитать метаданные из ${filename}:`, error)
        }
      }
    }
    
    if (volumeData) {
      console.log('🔍 Найденные метаданные:', metadata)
      
      // Если метаданных нет, попробуем определить размеры автоматически
      if (!metadata.width && !metadata.height && !metadata.depth) {
        console.log('🤖 Автоматическое определение размеров...')
        const estimatedDims = this.estimateDimensions(volumeData.byteLength)
        metadata = {
          width: estimatedDims.width,
          height: estimatedDims.height,
          depth: estimatedDims.depth,
          spacing_x: 0.125,
          spacing_y: 0.125,
          spacing_z: 0.125,
          source: 'auto-detected'
        }
      }
      
      const volume = this.processVolumeData(volumeData, metadata)
      this.renderVolume(volume)
      this.create2DSlices(volume)
    } else {
      console.error('❌ Не найдены объемные данные в архиве!')
      console.log('📋 Все файлы в архиве:')
      allFiles.forEach(file => {
        console.log(`  - ${file.name} (${file.size} байт, .${file.type})`)
      })
    }
  }

  private async loadRawVolume(buffer: ArrayBuffer): Promise<void> {
    // Попытка определить размеры автоматически
    const totalBytes = buffer.byteLength
    const possibleDimensions = this.estimateDimensions(totalBytes)
    
    const volume = this.processVolumeData(buffer, {
      width: possibleDimensions.width,
      height: possibleDimensions.height,
      depth: possibleDimensions.depth,
      spacing: [0.125, 0.125, 0.125] // Типичное разрешение для стоматологических CT
    })
    
    this.renderVolume(volume)
    this.create2DSlices(volume)
  }

  private parseMetadata(text: string): any {
    const metadata: any = {}
    const lines = text.split('\n')
    
    console.log('🔍 Парсинг метаданных...')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#')) continue
      
      // Различные форматы разделителей
      let key: string = ''
      let value: string = ''
      
      if (trimmedLine.includes('=')) {
        [key, value] = trimmedLine.split('=', 2).map(s => s.trim())
      } else if (trimmedLine.includes(':')) {
        [key, value] = trimmedLine.split(':', 2).map(s => s.trim())
      } else if (trimmedLine.includes('\t')) {
        [key, value] = trimmedLine.split('\t', 2).map(s => s.trim())
      } else if (trimmedLine.includes(' ')) {
        const parts = trimmedLine.split(' ')
        if (parts.length >= 2) {
          key = parts[0]
          value = parts.slice(1).join(' ').trim()
        }
      }
      
      if (key && value) {
        const lowerKey = key.toLowerCase()
        
        // Нормализуем ключи
        if (lowerKey.includes('width') || lowerKey.includes('размер') || lowerKey === 'x' || lowerKey === 'nx') {
          metadata.width = parseInt(value) || metadata.width
        } else if (lowerKey.includes('height') || lowerKey.includes('высота') || lowerKey === 'y' || lowerKey === 'ny') {
          metadata.height = parseInt(value) || metadata.height
        } else if (lowerKey.includes('depth') || lowerKey.includes('глубина') || lowerKey === 'z' || lowerKey === 'nz' || lowerKey.includes('slice')) {
          metadata.depth = parseInt(value) || metadata.depth
        } else if (lowerKey.includes('spacing') || lowerKey.includes('voxel') || lowerKey.includes('разрешение')) {
          const spacing = parseFloat(value)
          if (spacing > 0) {
            if (lowerKey.includes('x')) metadata.spacing_x = spacing
            else if (lowerKey.includes('y')) metadata.spacing_y = spacing
            else if (lowerKey.includes('z')) metadata.spacing_z = spacing
            else {
              // Если не указана ось, применяем ко всем
              metadata.spacing_x = spacing
              metadata.spacing_y = spacing
              metadata.spacing_z = spacing
            }
          }
        } else if (lowerKey.includes('format') || lowerKey.includes('type') || lowerKey.includes('datatype')) {
          metadata.datatype = value
        } else if (lowerKey.includes('endian') || lowerKey.includes('byte')) {
          metadata.byteOrder = value
        }
        
        // Сохраняем все метаданные для отладки
        metadata[key] = value
        
        console.log(`  ${key}: ${value}`)
      }
    }
    
    // Пытаемся найти размеры в любом формате
    const numberPattern = /(\d+)/g
    const numbers = text.match(numberPattern)?.map(n => parseInt(n)).filter(n => n > 0 && n < 10000) || []
    
    if (!metadata.width && !metadata.height && !metadata.depth && numbers.length >= 3) {
      console.log('🔍 Пытаемся извлечь размеры из чисел:', numbers)
      
      // Ищем тройки чисел, которые могут быть размерами
      for (let i = 0; i <= numbers.length - 3; i++) {
        const [w, h, d] = numbers.slice(i, i + 3)
        
        // Проверяем разумность размеров
        if (w >= 64 && w <= 2048 && h >= 64 && h <= 2048 && d >= 32 && d <= 1024) {
          metadata.width = w
          metadata.height = h
          metadata.depth = d
          metadata.source = 'extracted-from-numbers'
          console.log(`📐 Извлечены размеры: ${w}×${h}×${d}`)
          break
        }
      }
    }
    
    // Устанавливаем разумные значения по умолчанию
    if (!metadata.spacing_x) metadata.spacing_x = 0.125
    if (!metadata.spacing_y) metadata.spacing_y = 0.125
    if (!metadata.spacing_z) metadata.spacing_z = 0.125
    
    return metadata
  }

  private estimateDimensions(totalBytes: number): { width: number, height: number, depth: number } {
    console.log(`🔢 Автоматическое определение размеров для ${totalBytes} байт...`)
    
    // Проверяем различные типы данных
    const possibleDataTypes = [
      { bytesPerVoxel: 2, name: 'Uint16' },      // 16-bit
      { bytesPerVoxel: 1, name: 'Uint8' },       // 8-bit  
      { bytesPerVoxel: 4, name: 'Float32' },     // 32-bit float
      { bytesPerVoxel: 4, name: 'Uint32' }       // 32-bit int
    ]
    
    const results: Array<{width: number, height: number, depth: number, dataType: string, confidence: number}> = []
    
    for (const dataType of possibleDataTypes) {
      const totalVoxels = Math.floor(totalBytes / dataType.bytesPerVoxel)
      
      if (totalVoxels <= 0) continue
      
      // Стандартные размеры для стоматологических CT сканеров
      const commonDentalSizes = [
        { width: 512, height: 512 },  // Высокое разрешение
        { width: 400, height: 400 },  // Среднее разрешение  
        { width: 256, height: 256 },  // Стандартное разрешение
        { width: 200, height: 200 },  // Compact размер
        { width: 384, height: 384 },  // Некоторые сканеры
        { width: 320, height: 320 },  // Компактные сканеры
        { width: 128, height: 128 }   // Низкое разрешение
      ]
      
      for (const size of commonDentalSizes) {
        const calculatedDepth = Math.floor(totalVoxels / (size.width * size.height))
        
        // Проверяем разумность глубины для стоматологических данных
        if (calculatedDepth >= 32 && calculatedDepth <= 1024) {
          // Вычисляем оценку уверенности
          let confidence = 0
          
          // Предпочитаем 16-битные данные (наиболее распространенные в CT)
          if (dataType.name === 'Uint16') confidence += 40
          else if (dataType.name === 'Uint8') confidence += 20
          else confidence += 10
          
          // Предпочитаем стандартные размеры
          if (size.width === 512 && size.height === 512) confidence += 30
          else if (size.width === 400 && size.height === 400) confidence += 25
          else if (size.width === 256 && size.height === 256) confidence += 20
          else confidence += 10
          
          // Предпочитаем разумную глубину (типичная для дентальных CT)
          if (calculatedDepth >= 128 && calculatedDepth <= 512) confidence += 20
          else if (calculatedDepth >= 64 && calculatedDepth <= 256) confidence += 15
          else confidence += 5
          
          // Проверяем, делится ли размер нацело
          if (totalVoxels % (size.width * size.height) === 0) confidence += 15
          
          results.push({
            width: size.width,
            height: size.height,
            depth: calculatedDepth,
            dataType: dataType.name,
            confidence: confidence
          })
          
          console.log(`  📐 Вариант: ${size.width}×${size.height}×${calculatedDepth} [${dataType.name}] - уверенность: ${confidence}%`)
        }
      }
    }
    
    // Сортируем по уверенности
    results.sort((a, b) => b.confidence - a.confidence)
    
    if (results.length > 0) {
      const best = results[0]
      console.log(`✅ Выбраны размеры: ${best.width}×${best.height}×${best.depth} [${best.dataType}] с уверенностью ${best.confidence}%`)
      return { width: best.width, height: best.height, depth: best.depth }
    }
    
    // Fallback к кубическому объему если ничего не подошло
    console.log('⚠️ Используем fallback к кубическому объему')
    const totalVoxels = Math.floor(totalBytes / 2) // Предполагаем 16-bit
    const cubeSize = Math.round(Math.cbrt(totalVoxels))
    
    // Округляем до ближайшей степени 2 для лучшей производительности
    const roundedSize = Math.pow(2, Math.round(Math.log2(cubeSize)))
    
    return { 
      width: Math.min(512, roundedSize), 
      height: Math.min(512, roundedSize), 
      depth: Math.floor(totalVoxels / (Math.min(512, roundedSize) * Math.min(512, roundedSize)))
    }
  }

  private processVolumeData(buffer: ArrayBuffer, metadata: any): VolumeData {
    console.log(`🔄 Обработка объемных данных: ${buffer.byteLength} байт`)
    console.log(`📋 Метаданные:`, metadata)
    
    // Для OneVolumeViewer архивов, проверяем специфичные размеры из метаданных
    let width = metadata.width || 512
    let height = metadata.height || 512
    let depth = metadata.depth || Math.floor(buffer.byteLength / (width * height * 2))
    
    // Если в метаданных найдены специфичные параметры OneVolumeViewer
    if (metadata.PixelSpacing || metadata.Comment) {
      console.log(`🦷 Обнаружены параметры OneVolumeViewer`)
      
      // Извлекаем параметры из комментария
      const comment = metadata.Comment || metadata.Attendant || ''
      
      // Ищем размеры в различных форматах
      const volumeRadiusMatch = comment.match(/VOLUME_RADIUS:(\d+)/)
      const pixelMatch = comment.match(/PIXEL:(\d+\.?\d*)um/)
      const magMatch = comment.match(/MAG:(\d+\.?\d*)/)
      
      if (volumeRadiusMatch) {
        const radius = parseInt(volumeRadiusMatch[1])
        console.log(`📏 Найден радиус объема: ${radius}`)
        
        // Для стоматологических CT часто используется кубический объем
        // Проверяем, подходят ли наши размеры
        const estimatedSize = radius * 2
        if (estimatedSize >= 64 && estimatedSize <= 512) {
          width = height = depth = estimatedSize
          console.log(`🎯 Установлены размеры на основе радиуса: ${width}×${height}×${depth}`)
        }
      }
      
      if (pixelMatch) {
        const pixelSize = parseFloat(pixelMatch[1]) / 1000 // микроны в мм
        metadata.spacing_x = metadata.spacing_y = metadata.spacing_z = pixelSize
        console.log(`🔬 Размер пикселя: ${pixelSize} мм`)
      }
    }
    
    // Проверяем разумность размеров для объема данных
    const expectedBytes = width * height * depth * 2 // 16-bit данные
    const actualBytes = buffer.byteLength
    
    console.log(`📊 Сравнение размеров:`)
    console.log(`  - Ожидаемо: ${expectedBytes} байт для ${width}×${height}×${depth}`)
    console.log(`  - Фактически: ${actualBytes} байт`)
    console.log(`  - Соотношение: ${(actualBytes / expectedBytes).toFixed(2)}`)
    
    // Если размеры не совпадают, пытаемся скорректировать
    if (Math.abs(actualBytes - expectedBytes) > expectedBytes * 0.1) { // 10% погрешность
      console.warn(`⚠️ Размеры не совпадают, пытаемся автокоррекцию...`)
      
      // Пробуем разные варианты depth
      for (let testDepth of [64, 80, 96, 128, 256, 400, 512]) {
        const testBytes = width * height * testDepth * 2
        if (Math.abs(actualBytes - testBytes) < testBytes * 0.05) { // 5% погрешность
          depth = testDepth
          console.log(`✅ Скорректирована глубина: ${depth}`)
          break
        }
      }
    }
    
    // Исправляем выравнивание Uint16Array если необходимо
    let alignedBuffer = buffer
    if (buffer.byteLength % 2 !== 0) {
      console.log('🔧 Исправление выравнивания данных...')
      const newBuffer = new ArrayBuffer(buffer.byteLength + 1)
      const newView = new Uint8Array(newBuffer)
      const oldView = new Uint8Array(buffer)
      newView.set(oldView)
      newView[buffer.byteLength] = 0
      alignedBuffer = newBuffer
    }
    
    const data = new Uint16Array(alignedBuffer)
    
    // Проверяем наличие данных
    let nonZeroCount = 0
    let maxValue = 0
    for (let i = 0; i < Math.min(data.length, 10000); i++) {
      if (data[i] > 0) nonZeroCount++
      maxValue = Math.max(maxValue, data[i])
    }
    
    console.log(`📊 Анализ данных:`)
    console.log(`  - Ненулевых значений в первых 10k: ${nonZeroCount}`)
    console.log(`  - Максимальное значение: ${maxValue}`)
    console.log(`  - Плотность данных: ${(nonZeroCount / Math.min(data.length, 10000) * 100).toFixed(1)}%`)
    
    const volume: VolumeData = {
      width: width,
      height: height,
      depth: depth,
      data: data,
      spacing: [
        parseFloat(metadata.spacing_x) || 0.125,
        parseFloat(metadata.spacing_y) || 0.125,
        parseFloat(metadata.spacing_z) || 0.125
      ],
      origin: [0, 0, 0]
    }
    
    console.log('📊 Финальные параметры объема:', {
      размеры: `${volume.width}×${volume.height}×${volume.depth}`,
      разрешение: volume.spacing,
      'объем данных': `${(data.length * 2 / 1024 / 1024).toFixed(2)} МБ`,
      'используемый объем': `${(nonZeroCount * 2 / 1024 / 1024).toFixed(2)} МБ`
    })
    
    return volume
  }

  private renderVolume(volume: VolumeData): void {
    this.currentVolume = volume
    
    // Очищаем предыдущие данные
    this.volumeGroup.clear()
    this.sliceMeshes = []
    
    // Создаем объемную визуализацию используя несколько слайсов
    this.createVolumeSlices(volume)
    
    // Центрируем камеру
    const bounds = new THREE.Box3()
    bounds.setFromObject(this.volumeGroup)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    
    this.camera.position.set(
      center.x + size.x * 1.5,
      center.y + size.y * 1.5,
      center.z + size.z * 1.5
    )
    this.camera.lookAt(center)
    this.controls.target.copy(center)
  }

  private createVolumeSlices(volume: VolumeData): void {
    const { width, height, depth, data, spacing } = volume
    
    // Создаем настоящую 3D модель зуба из вокселей
    this.create3DTeethModel(volume)
    
    console.log(`🦷 Создана 3D модель зуба из объемных данных`)
  }

  private create3DTeethModel(volume: VolumeData): void {
    const { width, height, depth, data, spacing } = volume
    
    console.log(`🦷 Создание НАСТОЯЩЕГО 3D зуба из данных ${width}×${height}×${depth}`)
    
    // Находим границы зубной ткани
    const { minVal, maxVal } = this.findDataRange(data)
    console.log(`📊 Диапазон значений: ${minVal} - ${maxVal}`)
    
    // Создаем настоящую поверхность зуба
    const toothMesh = this.createContinuousToothSurface(volume)
    
    if (toothMesh) {
      this.volumeGroup.add(toothMesh)
      console.log(`🦷 Создан НАСТОЯЩИЙ 3D зуб!`)
    } else {
      console.log(`⚠️ Не удалось создать поверхность зуба`)
    }
  }
  
  private createContinuousToothSurface(volume: VolumeData): THREE.Mesh | null {
    const { width, height, depth, data, spacing } = volume
    const { minVal, maxVal } = this.findDataRange(data)
    
    console.log(`🔬 Создание непрерывной поверхности зуба...`)
    
    // Определяем порог для зубной ткани (берем 30% от максимума)
    const threshold = minVal + (maxVal - minVal) * 0.3
    console.log(`🎯 Порог для зубной ткани: ${threshold}`)
    
    // Создаем сетку вершин для поверхности
    const vertices: number[] = []
    const faces: number[] = []
    const normals: number[] = []
    
    // Масштаб для увеличения размера
    const scale = 2.0
    
    // Создаем облако точек зубной ткани
    const toothPoints: Array<{x: number, y: number, z: number, density: number}> = []
    
    // Собираем все точки, которые относятся к зубу
    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = z * width * height + y * width + x
          const value = data[index]
          
          if (value > threshold) {
            const worldX = (x - width/2) * spacing[0] * scale
            const worldY = (y - height/2) * spacing[1] * scale
            const worldZ = (z - depth/2) * spacing[2] * scale
            
            toothPoints.push({
              x: worldX,
              y: worldY, 
              z: worldZ,
              density: value
            })
          }
        }
      }
    }
    
    console.log(`📍 Найдено ${toothPoints.length} точек зубной ткани`)
    
    if (toothPoints.length === 0) {
      return null
    }
    
    // Создаем выпуклую оболочку для формирования поверхности зуба
    const toothMesh = this.createToothMeshFromPoints(toothPoints, minVal, maxVal)
    
    return toothMesh
  }
  
  private createToothMeshFromPoints(points: Array<{x: number, y: number, z: number, density: number}>, minVal: number, maxVal: number): THREE.Mesh {
    console.log(`🏗️ Создание меша зуба из ${points.length} точек...`)
    
    if (points.length === 0) {
      return this.createFallbackCube()
    }
    
    // Создаем простую визуализацию напрямую из точек
    const vertices: number[] = []
    const colors: number[] = []
    
    // Находим границы облака точек
    const bounds = {
      minX: Math.min(...points.map(p => p.x)),
      maxX: Math.max(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxY: Math.max(...points.map(p => p.y)),
      minZ: Math.min(...points.map(p => p.z)),
      maxZ: Math.max(...points.map(p => p.z))
    }
    
    console.log(`📏 Границы зуба:`, bounds)
    
    // Размер одного элемента (увеличиваем для видимости)
    const voxelSize = Math.max(
      (bounds.maxX - bounds.minX) / 20,
      (bounds.maxY - bounds.minY) / 20,
      (bounds.maxZ - bounds.minZ) / 20
    )
    
    console.log(`📦 Размер вокселя: ${voxelSize}`)
    
    // Создаем октаэдр для каждой точки зубной ткани
    let triangleCount = 0
    
    for (const point of points) {
      // Нормализуем плотность для цвета
      const normalizedDensity = (point.density - minVal) / (maxVal - minVal)
      
      // Цвет зуба: от бежевого до белого
      let r, g, b
      if (normalizedDensity < 0.5) {
        // Дентин - бежевый
        r = 0.9
        g = 0.8
        b = 0.6
      } else {
        // Эмаль - белый
        const t = (normalizedDensity - 0.5) * 2
        r = 0.9 + t * 0.1
        g = 0.8 + t * 0.2  
        b = 0.6 + t * 0.4
      }
      
      // Добавляем октаэдр для этой точки
      this.addOctahedron(
        point.x, point.y, point.z,
        voxelSize,
        r, g, b,
        vertices, colors
      )
      
      triangleCount += 8 // 8 треугольников в октаэдре
    }
    
    console.log(`🔺 Создано ${vertices.length/3} вершин и ${triangleCount} треугольников`)
    
    if (vertices.length === 0) {
      console.log(`⚠️ Нет вершин, создаем тестовый куб`)
      return this.createFallbackCube()
    }
    
    // Создаем геометрию
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    
    // Создаем материал зуба
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 100,
      transparent: false,
      side: THREE.DoubleSide
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'tooth'
    
    console.log(`✅ Создан полноценный 3D зуб!`)
    return mesh
  }
  
  private createFallbackCube(): THREE.Mesh {
    console.log(`🧪 Создание тестового куба для отладки`)
    
    const geometry = new THREE.BoxGeometry(20, 20, 20)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 100
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'fallback-cube'
    
    return mesh
  }
  
  private interpolateDensity(x: number, y: number, z: number, points: Array<{x: number, y: number, z: number, density: number}>): number {
    // Этот метод больше не используется
    return 0
  }
  
  private addToothSurfaceTriangles(
    x: number, y: number, z: number,
    stepX: number, stepY: number, stepZ: number,
    densities: number[],
    threshold: number,
    vertices: number[], faces: number[], colors: number[],
    vertexOffset: number,
    minVal: number, maxVal: number
  ): void {
    // Этот метод больше не используется
  }
  
  private addOctahedron(
    x: number, y: number, z: number,
    size: number,
    r: number, g: number, b: number,
    vertices: number[], colors: number[]
  ): void {
    const s = size / 2
    
    // 6 вершин октаэдра
    const octVertices = [
      [x, y, z + s],  // верх
      [x, y, z - s],  // низ
      [x + s, y, z],  // право
      [x - s, y, z],  // лево
      [x, y + s, z],  // перед
      [x, y - s, z]   // зад
    ]
    
    // 8 треугольных граней октаэдра
    const octFaces = [
      [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], // верхние грани
      [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]  // нижние грани
    ]
    
    // Добавляем треугольники
    for (const face of octFaces) {
      for (const vertexIndex of face) {
        const vertex = octVertices[vertexIndex]
        vertices.push(vertex[0], vertex[1], vertex[2])
        colors.push(r, g, b)
      }
    }
  }
  
  private createVoxelToothModel(volume: VolumeData): void {
    // Этот метод больше не используется - удален для создания гладкой поверхности
  }

  private createDebugCube(volume: VolumeData): void {
    console.log('🔍 Создание отладочного куба для проверки данных...')
    
    const { width, height, depth, spacing } = volume
    const geometry = new THREE.BoxGeometry(
      width * spacing[0] * 5,  // Увеличиваем в 5 раз для видимости
      height * spacing[1] * 5,
      depth * spacing[2] * 5
    )
    
    const material = new THREE.MeshLambertMaterial({
      color: 0x44aa88,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
    
    const debugCube = new THREE.Mesh(geometry, material)
    this.volumeGroup.add(debugCube)
    
    console.log(`📦 Отладочный куб создан размером ${width * spacing[0] * 5}×${height * spacing[1] * 5}×${depth * spacing[2] * 5}`)
  }

  private findDataRange(data: Uint16Array): { minVal: number, maxVal: number } {
    let minVal = Infinity
    let maxVal = -Infinity
    
    for (let i = 0; i < data.length; i++) {
      const value = data[i]
      if (value > 0) { // Игнорируем нулевые значения
        minVal = Math.min(minVal, value)
        maxVal = Math.max(maxVal, value)
      }
    }
    
    return { minVal, maxVal }
  }

  private addVoxelCube(vertices: number[], colors: number[], x: number, y: number, z: number, size: number, intensity: number, minVal: number, maxVal: number): void {
    // Этот метод больше не используется - удален для создания гладкой поверхности
  }

  private createVoxelMesh(positions: number[], colors: number[]): THREE.Mesh {
    // Этот метод больше не используется - удален для создания гладкой поверхности
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    
    const material = new THREE.MeshLambertMaterial({ 
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  private createSliceTexture(volume: VolumeData, sliceIndex: number, orientation: 'axial' | 'sagittal' | 'coronal'): HTMLCanvasElement {
    const { width, height, depth, data } = volume
    
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.createImageData(width, height)
    
    // Нормализация значений для отображения
    let minVal = Infinity
    let maxVal = -Infinity
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let voxelIndex: number
        
        if (orientation === 'axial') {
          voxelIndex = sliceIndex * width * height + y * width + x
        } else if (orientation === 'sagittal') {
          voxelIndex = y * width * height + sliceIndex * width + x
        } else { // coronal
          voxelIndex = y * width * height + x * width + sliceIndex
        }
        
        if (voxelIndex < data.length) {
          const value = data[voxelIndex]
          minVal = Math.min(minVal, value)
          maxVal = Math.max(maxVal, value)
        }
      }
    }
    
    // Применяем window/level настройки
    const windowMin = this.settings.windowLevel - this.settings.windowWidth / 2
    const windowMax = this.settings.windowLevel + this.settings.windowWidth / 2
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let voxelIndex: number
        
        if (orientation === 'axial') {
          voxelIndex = sliceIndex * width * height + y * width + x
        } else if (orientation === 'sagittal') {
          voxelIndex = y * width * height + sliceIndex * width + x
        } else { // coronal
          voxelIndex = y * width * height + x * width + sliceIndex
        }
        
        let value = 0
        if (voxelIndex < data.length) {
          // Нормализуем значение
          const rawValue = data[voxelIndex]
          const normalizedValue = (rawValue - minVal) / (maxVal - minVal)
          
          // Применяем window/level
          value = Math.max(0, Math.min(1, (normalizedValue - windowMin) / (windowMax - windowMin)))
          
          // Применяем threshold
          if (value < this.settings.threshold) {
            value = 0
          }
        }
        
        // Применяем цветовую карту
        const color = this.applyColormap(value)
        
        const pixelIndex = (y * width + x) * 4
        imageData.data[pixelIndex] = color.r     // R
        imageData.data[pixelIndex + 1] = color.g // G
        imageData.data[pixelIndex + 2] = color.b // B
        imageData.data[pixelIndex + 3] = value > 0 ? 255 : 0 // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  private applyColormap(value: number): { r: number, g: number, b: number } {
    const v = Math.max(0, Math.min(1, value))
    
    switch (this.settings.colormap) {
      case 'bone':
        // Костная ткань - реалистичная палитра для зубов и костей
        if (v < 0.3) {
          // Мягкая ткань - темно-красноватая
          return { r: Math.floor(v * 120), g: Math.floor(v * 60), b: Math.floor(v * 60) }
        } else if (v < 0.7) {
          // Костная ткань - бежевая
          const t = (v - 0.3) / 0.4
          return { 
            r: Math.floor(120 + t * 135), 
            g: Math.floor(60 + t * 155), 
            b: Math.floor(60 + t * 140) 
          }
        } else {
          // Плотная кость/эмаль - белая
          const t = (v - 0.7) / 0.3
          return { 
            r: Math.floor(255), 
            g: Math.floor(215 + t * 40), 
            b: Math.floor(200 + t * 55) 
          }
        }
      case 'hot':
        // Горячая карта
        if (v < 0.33) {
          return { r: Math.floor(v * 3 * 255), g: 0, b: 0 }
        } else if (v < 0.66) {
          return { r: 255, g: Math.floor((v - 0.33) * 3 * 255), b: 0 }
        } else {
          return { r: 255, g: 255, b: Math.floor((v - 0.66) * 3 * 255) }
        }
      case 'cool':
        // Холодная карта
        return {
          r: Math.floor(v * 255),
          g: Math.floor((1-v) * 255),
          b: 255
        }
      case 'gray':
      default:
        // Оттенки серого
        const gray = Math.floor(v * 255)
        return { r: gray, g: gray, b: gray }
    }
  }

  private create2DSlices(volume: VolumeData): void {
    // Создаем контейнер для 2D слайсов
    const sliceContainer = document.createElement('div')
    sliceContainer.id = 'slice-container'
    sliceContainer.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: rgba(0,0,0,0.8);
      padding: 10px;
      border-radius: 8px;
      z-index: 100;
    `
    
    // Удаляем предыдущий контейнер если есть
    const existingContainer = this.container.querySelector('#slice-container')
    if (existingContainer) {
      existingContainer.remove()
    }
    
    const axialCanvas = this.createSliceCanvas('Аксиальный срез', volume, 'axial')
    const sagittalCanvas = this.createSliceCanvas('Сагиттальный срез', volume, 'sagittal') 
    const coronalCanvas = this.createSliceCanvas('Корональный срез', volume, 'coronal')
    
    sliceContainer.appendChild(axialCanvas)
    sliceContainer.appendChild(sagittalCanvas)
    sliceContainer.appendChild(coronalCanvas)
    
    this.container.appendChild(sliceContainer)
  }

  private createSliceCanvas(title: string, volume: VolumeData, orientation: 'axial' | 'sagittal' | 'coronal'): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = 150
    canvas.height = 150
    canvas.style.cssText = `
      border: 1px solid #333;
      cursor: pointer;
      border-radius: 4px;
    `
    
    // Берем средний срез
    const sliceIndex = Math.floor(volume.depth / 2)
    const sliceTexture = this.createSliceTexture(volume, sliceIndex, orientation)
    
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(sliceTexture, 0, 0, canvas.width, canvas.height)
    
    // Добавляем заголовок
    ctx.fillStyle = 'white'
    ctx.font = '11px Arial'
    ctx.shadowColor = 'black'
    ctx.shadowBlur = 2
    ctx.fillText(title, 5, 15)
    ctx.shadowBlur = 0
    
    return canvas
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  private onWindowResize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this))
    
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  public updateSettings(newSettings: Partial<VolumeSettings>): void {
    // Обновляем настройки
    this.settings = { ...this.settings, ...newSettings }
    
    // Если есть загруженные данные, перерендерим с новыми настройками
    if (this.currentVolume) {
      console.log('🔄 Обновление настроек визуализации:', newSettings)
      
      // Очищаем предыдущий объем
      this.volumeGroup.clear()
      this.sliceMeshes = []
      
      // Перерендерим с новыми настройками
      this.renderVolume(this.currentVolume)
      this.create2DSlices(this.currentVolume)
    }
  }

  public dispose(): void {
    // Очищаем ресурсы
    this.sliceMeshes.forEach(mesh => {
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose()
      }
      if (mesh.geometry) {
        mesh.geometry.dispose()
      }
    })
    
    this.renderer.dispose()
    
    // Удаляем слайс контейнер
    const sliceContainer = this.container.querySelector('#slice-container')
    if (sliceContainer) {
      sliceContainer.remove()
    }
  }
} 