export interface VolumeSettings {
  windowWidth: number
  windowLevel: number
  opacity: number
  slice: number
  renderMode: 'volume' | 'slice' | 'mip'
  preset: string
}

export interface DentalPreset {
  name: string
  windowWidth: number
  windowLevel: number
  colorTransfer: Array<[number, number, number, number]>
  opacityTransfer: Array<[number, number]>
  description: string
}

class VTKEngine {
  private renderer: any
  private renderWindow: any
  private volumeActor: any
  private imageData: any
  private container: HTMLElement | null = null
  private isInitialized = false
  private vtkModules: any = {}
  private initializationAttempts = 0
  private maxAttempts = 3

  private dentalPresets: DentalPreset[] = [
    {
      name: 'Bone',
      windowWidth: 2000,
      windowLevel: 400,
      colorTransfer: [
        [0, 0.0, 0.0, 0.0],
        [400, 0.8, 0.8, 0.9],
        [1000, 1.0, 1.0, 1.0],
        [2000, 1.0, 1.0, 1.0]
      ],
      opacityTransfer: [
        [0, 0.0],
        [400, 0.1],
        [800, 0.8],
        [2000, 1.0]
      ],
      description: 'Оптимизировано для костной ткани и зубов'
    },
    {
      name: 'Soft Tissue',
      windowWidth: 400,
      windowLevel: 40,
      colorTransfer: [
        [-100, 0.0, 0.0, 0.0],
        [0, 0.5, 0.3, 0.3],
        [100, 0.9, 0.7, 0.6],
        [300, 1.0, 1.0, 1.0]
      ],
      opacityTransfer: [
        [-100, 0.0],
        [0, 0.3],
        [100, 0.7],
        [300, 1.0]
      ],
      description: 'Оптимизировано для мягких тканей'
    }
  ]

  constructor() {
    console.log('🔧 VTKEngine constructor called')
  }

  private async loadVTKModulesSafely(): Promise<boolean> {
    try {
      console.log(`🚀 VTK.js загрузка (попытка ${this.initializationAttempts + 1}/${this.maxAttempts})...`)
      
      // Последовательная загрузка модулей с детальной диагностикой
      console.log('📦 Загружаем FullScreenRenderWindow...')
      const vtkFullScreenRenderWindow = await import('@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow')
      if (!vtkFullScreenRenderWindow.default) {
        throw new Error('FullScreenRenderWindow module failed to load')
      }
      console.log('✅ FullScreenRenderWindow загружен')

      console.log('📦 Загружаем ImageData...')
      const vtkImageData = await import('@kitware/vtk.js/Common/DataModel/ImageData')
      if (!vtkImageData.default) {
        throw new Error('ImageData module failed to load')
      }
      console.log('✅ ImageData загружен')

      console.log('📦 Загружаем DataArray...')
      const vtkDataArray = await import('@kitware/vtk.js/Common/Core/DataArray')
      if (!vtkDataArray.default) {
        throw new Error('DataArray module failed to load')
      }
      console.log('✅ DataArray загружен')

      console.log('📦 Загружаем Volume...')
      const vtkVolume = await import('@kitware/vtk.js/Rendering/Core/Volume')
      if (!vtkVolume.default) {
        throw new Error('Volume module failed to load')
      }
      console.log('✅ Volume загружен')

      console.log('📦 Загружаем VolumeMapper...')
      const vtkVolumeMapper = await import('@kitware/vtk.js/Rendering/Core/VolumeMapper')
      if (!vtkVolumeMapper.default) {
        throw new Error('VolumeMapper module failed to load')
      }
      console.log('✅ VolumeMapper загружен')

      console.log('📦 Загружаем ColorTransferFunction...')
      const vtkColorTransferFunction = await import('@kitware/vtk.js/Rendering/Core/ColorTransferFunction')
      if (!vtkColorTransferFunction.default) {
        throw new Error('ColorTransferFunction module failed to load')
      }
      console.log('✅ ColorTransferFunction загружен')

      console.log('📦 Загружаем PiecewiseFunction...')
      const vtkPiecewiseFunction = await import('@kitware/vtk.js/Common/DataModel/PiecewiseFunction')
      if (!vtkPiecewiseFunction.default) {
        throw new Error('PiecewiseFunction module failed to load')
      }
      console.log('✅ PiecewiseFunction загружен')

      // Сохраняем модули
      this.vtkModules = {
        vtkFullScreenRenderWindow: vtkFullScreenRenderWindow.default,
        vtkImageData: vtkImageData.default,
        vtkDataArray: vtkDataArray.default,
        vtkVolume: vtkVolume.default,
        vtkVolumeMapper: vtkVolumeMapper.default,
        vtkColorTransferFunction: vtkColorTransferFunction.default,
        vtkPiecewiseFunction: vtkPiecewiseFunction.default
      }

      // Дополнительная проверка критических функций
      console.log('🔍 Валидация VTK модулей...')
      
      if (typeof this.vtkModules.vtkFullScreenRenderWindow?.newInstance !== 'function') {
        throw new Error('vtkFullScreenRenderWindow.newInstance не найден или не является функцией')
      }
      
      if (typeof this.vtkModules.vtkImageData?.newInstance !== 'function') {
        throw new Error('vtkImageData.newInstance не найден или не является функцией')
      }
      
      if (typeof this.vtkModules.vtkDataArray?.newInstance !== 'function') {
        throw new Error('vtkDataArray.newInstance не найден или не является функцией')
      }

      // Небольшая задержка для полной инициализации модулей
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('✅ Все VTK модули успешно загружены и валидированы')
      return true

    } catch (error) {
      console.error(`❌ Ошибка загрузки VTK модулей (попытка ${this.initializationAttempts + 1}):`, error)
      return false
    }
  }

  async initialize(container: HTMLElement): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ VTK Engine уже инициализирован')
      return
    }

    this.initializationAttempts++
    
    if (this.initializationAttempts > this.maxAttempts) {
      throw new Error(`Не удалось инициализировать VTK Engine после ${this.maxAttempts} попыток`)
    }

    try {
      console.log(`🚀 Инициализация VTK Engine (попытка ${this.initializationAttempts})...`)
      this.container = container

      // Проверяем WebGL поддержку
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        throw new Error('WebGL не поддерживается в данном браузере')
      }
      console.log('✅ WebGL поддержка подтверждена')

      // Загружаем VTK модули
      const modulesLoaded = await this.loadVTKModulesSafely()
      if (!modulesLoaded) {
        throw new Error('Не удалось загрузить VTK.js модули')
      }

      // Проверяем валидность модулей перед использованием
      console.log('🔍 Проверка модуля vtkFullScreenRenderWindow:', {
        exists: !!this.vtkModules.vtkFullScreenRenderWindow,
        hasNewInstance: this.vtkModules.vtkFullScreenRenderWindow?.newInstance,
        type: typeof this.vtkModules.vtkFullScreenRenderWindow?.newInstance,
        keys: this.vtkModules.vtkFullScreenRenderWindow ? Object.keys(this.vtkModules.vtkFullScreenRenderWindow) : 'no keys'
      })
      
      if (!this.vtkModules.vtkFullScreenRenderWindow || 
          typeof this.vtkModules.vtkFullScreenRenderWindow.newInstance !== 'function') {
        throw new Error(`vtkFullScreenRenderWindow не готов к использованию. Доступные методы: ${this.vtkModules.vtkFullScreenRenderWindow ? Object.keys(this.vtkModules.vtkFullScreenRenderWindow).join(', ') : 'none'}`)
      }

      // Создаем рендер с дополнительными проверками
      console.log('🖥️ Создание VTK рендера...')
      
      // Очищаем контейнер
      container.innerHTML = ''
      
      const fullScreenRenderer = this.vtkModules.vtkFullScreenRenderWindow.newInstance({
        background: [0.1, 0.1, 0.1],
        container: container,
        listenWindowResize: true
      })

      if (!fullScreenRenderer) {
        throw new Error('Не удалось создать FullScreenRenderWindow')
      }

      this.renderer = fullScreenRenderer.getRenderer()
      this.renderWindow = fullScreenRenderer.getRenderWindow()

      if (!this.renderer || !this.renderWindow) {
        throw new Error('Не удалось получить renderer или renderWindow')
      }

      // Создаем volume actor с проверками
      console.log('🧊 Создание volume actor...')
      
      if (!this.vtkModules.vtkVolume || typeof this.vtkModules.vtkVolume.newInstance !== 'function') {
        throw new Error('vtkVolume не готов к использованию')
      }

      this.volumeActor = this.vtkModules.vtkVolume.newInstance()
      const mapper = this.vtkModules.vtkVolumeMapper.newInstance()
      
      if (!this.volumeActor || !mapper) {
        throw new Error('Не удалось создать volume actor или mapper')
      }
      
      mapper.setSampleDistance(1.0)
      this.volumeActor.setMapper(mapper)

      // Добавляем в сцену
      this.renderer.addVolume(this.volumeActor)

      // Первичный рендер для проверки
      this.renderWindow.render()

      this.isInitialized = true
      console.log('✅ VTK Engine успешно инициализирован!')

    } catch (error) {
      console.error(`❌ Ошибка инициализации VTK Engine (попытка ${this.initializationAttempts}):`, error)
      
      // Очищаем состояние для повторной попытки
      this.isInitialized = false
      if (this.container) {
        this.container.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #1a1a1a; color: white; font-family: Arial;">
            <div style="text-align: center; padding: 20px;">
              <div style="color: #ef4444; margin-bottom: 16px;">⚠️ Ошибка инициализации VTK.js</div>
              <div style="font-size: 14px; color: #9ca3af; margin-bottom: 16px;">Попытка ${this.initializationAttempts} из ${this.maxAttempts}</div>
              <div style="font-size: 12px; color: #6b7280;">${error.message}</div>
            </div>
          </div>
        `
      }
      
      if (this.initializationAttempts < this.maxAttempts) {
        console.log(`🔄 Повторная попытка инициализации через 2 секунды...`)
        setTimeout(() => {
          this.initialize(container).catch(console.error)
        }, 2000)
        return
      }
      
      throw new Error(`VTK инициализация провалилась: ${error.message}`)
    }
  }

  async setVolumeData(
    data: Uint16Array,
    dimensions: [number, number, number],
    spacing: [number, number, number] = [1, 1, 1]
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('VTK Engine не инициализирован')
    }

    try {
      console.log('📊 Установка данных объема:', {
        dataLength: data.length,
        dimensions,
        spacing,
        expectedVoxels: dimensions[0] * dimensions[1] * dimensions[2]
      })

      // Создаем VTK ImageData
      this.imageData = this.vtkModules.vtkImageData.newInstance({
        spacing: spacing,
        origin: [0, 0, 0],
        direction: [1, 0, 0, 0, 1, 0, 0, 0, 1]
      })

      this.imageData.setDimensions(dimensions)

      // Создаем DataArray из медицинских данных
      const dataArray = this.vtkModules.vtkDataArray.newInstance({
        name: 'scalars',
        numberOfComponents: 1,
        values: data
      })

      this.imageData.getPointData().setScalars(dataArray)

      // Привязываем к mapper
      const mapper = this.volumeActor.getMapper()
      mapper.setInputData(this.imageData)

      // Применяем стандартный пресет для костей
      this.applyDentalPreset('Bone')

      // Обновляем камеру
      this.renderer.resetCamera()
      this.renderWindow.render()

      console.log('✅ Данные объема успешно установлены')

    } catch (error) {
      console.error('❌ Ошибка установки данных объема:', error)
      throw new Error(`Не удалось установить данные объема: ${error.message}`)
    }
  }

  applyDentalPreset(presetName: string): void {
    const preset = this.dentalPresets.find(p => p.name === presetName)
    if (!preset) {
      console.warn(`Пресет ${presetName} не найден`)
      return
    }

    try {
      // Создаем color transfer function
      const colorFunction = this.vtkModules.vtkColorTransferFunction.newInstance()
      preset.colorTransfer.forEach(([value, r, g, b]) => {
        colorFunction.addRGBPoint(value, r, g, b)
      })

      // Создаем opacity function
      const opacityFunction = this.vtkModules.vtkPiecewiseFunction.newInstance()
      preset.opacityTransfer.forEach(([value, opacity]) => {
        opacityFunction.addPoint(value, opacity)
      })

      // Применяем к актору
      this.volumeActor.getProperty().setRGBTransferFunction(0, colorFunction)
      this.volumeActor.getProperty().setScalarOpacity(0, opacityFunction)

      console.log(`✅ Применен пресет: ${presetName}`)
      
      this.renderWindow.render()
    } catch (error) {
      console.error('❌ Ошибка применения пресета:', error)
    }
  }

  updateSettings(settings: Partial<VolumeSettings>): void {
    if (!this.isInitialized) return

    try {
      if (settings.preset) {
        this.applyDentalPreset(settings.preset)
      }

      this.renderWindow.render()
    } catch (error) {
      console.error('❌ Ошибка обновления настроек:', error)
    }
  }

  resetCamera(): void {
    if (this.renderer) {
      this.renderer.resetCamera()
      this.renderWindow.render()
    }
  }

  render(): void {
    if (this.renderWindow) {
      this.renderWindow.render()
    }
  }

  destroy(): void {
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.isInitialized = false
    this.initializationAttempts = 0
  }

  getIsInitialized(): boolean {
    return this.isInitialized
  }

  getDentalPresets(): DentalPreset[] {
    return this.dentalPresets
  }
}

export default VTKEngine 
 