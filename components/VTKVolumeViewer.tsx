'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume'
import * as vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper'
import * as vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction'
import * as vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction'
import * as vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData'
import * as vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray'
import * as vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer'
import * as vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow'
import * as vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor'
import * as vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera'
import * as vtkAxesActor from '@kitware/vtk.js/Rendering/Core/AxesActor'
import * as vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper'
import * as vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice'
import * as vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice'
import * as vtkMath from '@kitware/vtk.js/Common/Core/Math'
import * as vtkOrientationMarkerWidget from '@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget'

interface VolumeData {
  data: Uint8Array | Uint16Array
  dimensions: [number, number, number]
  spacing: [number, number, number]
  origin: [number, number, number]
}

interface VTKVolumeViewerProps {
  onVolumeDataChange?: (data: VolumeData, stats: { min: number; max: number }) => void
}

export default function VTKVolumeViewer({ onVolumeDataChange }: VTKVolumeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [volumeStats, setVolumeStats] = useState<{ min: number; max: number } | null>(null)
  const [activeView, setActiveView] = useState<'3d' | 'axial' | 'coronal' | 'sagittal'>('3d')
  const [windowLevel, setWindowLevel] = useState(2000)
  const [windowWidth, setWindowWidth] = useState(4000)
  const [sliceIndex, setSliceIndex] = useState({ axial: 0, coronal: 0, sagittal: 0 })
  
  // VTK.js references
  const renderWindowRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const volumeActorRef = useRef<any>(null)
  const volumeMapperRef = useRef<any>(null)
  const interactorRef = useRef<any>(null)
  const imageDataRef = useRef<any>(null)
  const sliceActorsRef = useRef<any>({ axial: null, coronal: null, sagittal: null })
  const sliceMappersRef = useRef<any>({ axial: null, coronal: null, sagittal: null })

  // Initialize VTK.js
  const initializeVTK = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Create render window
    const renderWindow = vtkRenderWindow.newInstance()
    renderWindowRef.current = renderWindow

    // Create renderer
    const renderer = vtkRenderer.newInstance()
    renderer.setBackground(0.1, 0.1, 0.1)
    renderWindow.addRenderer(renderer)
    rendererRef.current = renderer

    // Create camera
    const camera = vtkCamera.newInstance()
    camera.setPosition(0, 0, 5)
    camera.setFocalPoint(0, 0, 0)
    camera.setViewUp(0, 1, 0)
    renderer.setActiveCamera(camera)

    // Create interactor
    const interactor = vtkRenderWindowInteractor.newInstance()
    interactor.setView(renderWindow.getView())
    interactor.initialize()
    interactor.bindEvents(container)
    interactorRef.current = interactor

    // Add axes for orientation
    const axes = vtkAxesActor.newInstance()
    axes.setTotalLength(1.5, 1.5, 1.5)
    axes.setShaftType(0)
    axes.setAxisLabels(0)
    renderer.addActor(axes)

    // Start rendering
    renderWindow.render()
  }, [])

  // Process .vol file
  const processVolFile = async (arrayBuffer: ArrayBuffer): Promise<VolumeData> => {
    const headerSizes = [0, 512, 1024, 2048, 4096]
    let volumeData: Uint16Array | null = null
    let dimensions: [number, number, number] = [256, 256, 256]
    let spacing: [number, number, number] = [1, 1, 1]
    let origin: [number, number, number] = [0, 0, 0]

    for (const headerSize of headerSizes) {
      try {
        const dataSize = arrayBuffer.byteLength - headerSize
        const expectedVoxels = dataSize / 2

        const possibleDimensions = [
          [256, 256, 256],
          [512, 512, 256],
          [512, 512, 512],
          [256, 256, 512],
          [128, 128, 128],
          [64, 64, 64]
        ]

        for (const [w, h, d] of possibleDimensions) {
          if (w * h * d === expectedVoxels) {
            dimensions = [w, h, d]
            break
          }
        }

        volumeData = new Uint16Array(arrayBuffer, headerSize, expectedVoxels)
        
        if (volumeData.length > 0 && !isNaN(volumeData[0])) {
          let min = volumeData[0]
          let max = volumeData[0]
          for (let i = 1; i < volumeData.length; i++) {
            if (volumeData[i] < min) min = volumeData[i]
            if (volumeData[i] > max) max = volumeData[i]
          }
          
          console.log(`Successfully loaded .vol file with header size ${headerSize}:`, {
            dimensions,
            totalVoxels: volumeData.length,
            dataRange: [min, max]
          })
          break
        }
      } catch (err) {
        console.log(`Failed with header size ${headerSize}:`, err)
        continue
      }
    }

    if (!volumeData) {
      throw new Error('Could not parse .vol file format')
    }

    return {
      data: volumeData,
      dimensions,
      spacing,
      origin
    }
  }

  // Process ZIP archive
  const processZipArchive = async (arrayBuffer: ArrayBuffer): Promise<VolumeData> => {
    try {
      const JSZipModule = await import('jszip')
      const JSZip = JSZipModule.default
      const zip = new JSZip()
      await zip.loadAsync(arrayBuffer)
      
      const volFile = Object.values(zip.files).find((file: any) => 
        file.name.toLowerCase().endsWith('.vol')
      )
      
      if (!volFile) {
        throw new Error('ZIP архив не содержит .vol файлов')
      }
      
      const volData = await (volFile as any).async('arraybuffer')
      return processVolFile(volData)
    } catch (err) {
      console.error('Error processing ZIP archive:', err)
      throw new Error('Ошибка обработки ZIP архива')
    }
  }

  // Create MPR slice
  const createMPRSlice = useCallback((viewType: 'axial' | 'coronal' | 'sagittal', imageData: any) => {
    if (!rendererRef.current) return

    // Clear existing slice
    if (sliceActorsRef.current[viewType]) {
      rendererRef.current.removeActor(sliceActorsRef.current[viewType])
    }

    // Create image reslice
    const reslice = vtkImageReslice.newInstance()
    reslice.setInputData(imageData)

    // Set orientation based on view type
    const cosines = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    if (viewType === 'axial') {
      // XY plane
      cosines[0] = 1; cosines[1] = 0; cosines[2] = 0
      cosines[3] = 0; cosines[4] = 1; cosines[5] = 0
      cosines[6] = 0; cosines[7] = 0; cosines[8] = 1
    } else if (viewType === 'coronal') {
      // XZ plane
      cosines[0] = 1; cosines[1] = 0; cosines[2] = 0
      cosines[3] = 0; cosines[4] = 0; cosines[5] = 1
      cosines[6] = 0; cosines[7] = -1; cosines[8] = 0
    } else if (viewType === 'sagittal') {
      // YZ plane
      cosines[0] = 0; cosines[1] = 0; cosines[2] = 1
      cosines[3] = 0; cosines[4] = 1; cosines[5] = 0
      cosines[6] = -1; cosines[7] = 0; cosines[8] = 0
    }

    reslice.setResliceAxesDirectionCosines(cosines)
    reslice.setOutputExtent(0, 255, 0, 255, 0, 0)
    reslice.setOutputSpacing(1, 1, 1)
    reslice.setOutputOrigin(0, 0, 0)

    // Create image mapper
    const mapper = vtkImageMapper.newInstance()
    mapper.setInputConnection(reslice.getOutputPort())
    mapper.setSlicingMode(2) // XY plane
    mapper.setSlice(sliceIndex[viewType])
    sliceMappersRef.current[viewType] = mapper

    // Create image slice
    const slice = vtkImageSlice.newInstance()
    slice.setMapper(mapper)

    // Set window/level
    const property = slice.getProperty()
    property.setColorWindow(windowWidth)
    property.setColorLevel(windowLevel)

    sliceActorsRef.current[viewType] = slice
    rendererRef.current.addActor(slice)

    return slice
  }, [sliceIndex, windowLevel, windowWidth])

  // Create VTK volume
  const createVTKVolume = useCallback((volumeData: VolumeData) => {
    if (!rendererRef.current || !renderWindowRef.current) return

    // Clear existing volume and slices
    if (volumeActorRef.current) {
      rendererRef.current.removeVolume(volumeActorRef.current)
    }
    Object.values(sliceActorsRef.current).forEach(actor => {
      if (actor) rendererRef.current.removeActor(actor)
    })

    // Create image data
    const imageData = vtkImageData.newInstance()
    imageData.setDimensions(volumeData.dimensions)
    imageData.setSpacing(volumeData.spacing)
    imageData.setOrigin(volumeData.origin)

    // Create data array
    const dataArray = vtkDataArray.newInstance({
      numberOfComponents: 1,
      values: volumeData.data
    })
    imageData.getPointData().setScalars(dataArray)
    imageDataRef.current = imageData

    // Create volume mapper
    const volumeMapper = vtkVolumeMapper.newInstance()
    volumeMapper.setInputData(imageData)
    volumeMapperRef.current = volumeMapper

    // Create color transfer function
    const colorFunction = vtkColorTransferFunction.newInstance()
    colorFunction.addRGBPoint(0, 0.0, 0.0, 0.0)      // Air
    colorFunction.addRGBPoint(500, 0.2, 0.2, 0.2)    // Soft tissue
    colorFunction.addRGBPoint(1000, 0.8, 0.8, 0.8)   // Bone
    colorFunction.addRGBPoint(1500, 0.9, 0.7, 0.5)   // Dense bone
    colorFunction.addRGBPoint(2000, 1.0, 1.0, 0.8)   // Enamel
    colorFunction.addRGBPoint(3000, 1.0, 1.0, 1.0)   // Metal

    // Create opacity transfer function
    const opacityFunction = vtkPiecewiseFunction.newInstance()
    opacityFunction.addPoint(0, 0.0)
    opacityFunction.addPoint(500, 0.1)
    opacityFunction.addPoint(1000, 0.3)
    opacityFunction.addPoint(1500, 0.6)
    opacityFunction.addPoint(2000, 0.8)
    opacityFunction.addPoint(3000, 1.0)

    // Create volume
    const volume = vtkVolume.newInstance()
    volume.setMapper(volumeMapper)
    volume.getProperty().setRGBTransferFunction(0, colorFunction)
    volume.getProperty().setScalarOpacity(0, opacityFunction)
    volume.getProperty().setInterpolationTypeToLinear()
    volume.getProperty().setShade(true)
    volume.getProperty().setAmbient(0.4)
    volume.getProperty().setDiffuse(0.6)
    volume.getProperty().setSpecular(0.2)
    volume.getProperty().setSpecularPower(10.0)
    volumeActorRef.current = volume

    // Add volume to renderer
    rendererRef.current.addVolume(volume)

    // Create MPR slices
    createMPRSlice('axial', imageData)
    createMPRSlice('coronal', imageData)
    createMPRSlice('sagittal', imageData)

    // Reset camera to fit volume
    const camera = rendererRef.current.getActiveCamera()
    const bounds = imageData.getBounds()
    const center = [
      (bounds[1] + bounds[0]) / 2,
      (bounds[3] + bounds[2]) / 2,
      (bounds[5] + bounds[4]) / 2
    ]
    const size = Math.max(
      bounds[1] - bounds[0],
      bounds[3] - bounds[2],
      bounds[5] - bounds[4]
    )
    
    camera.setFocalPoint(center[0], center[1], center[2])
    camera.setPosition(
      center[0] + size * 2,
      center[1] + size * 2,
      center[2] + size * 2
    )
    camera.setViewUp(0, 1, 0)

    // Render
    renderWindowRef.current.render()

    console.log('Created VTK volume with professional rendering and MPR slices')
  }, [createMPRSlice])

  // Update view
  const updateView = useCallback(() => {
    if (!rendererRef.current || !imageDataRef.current) return

    // Clear all actors
    if (volumeActorRef.current) {
      rendererRef.current.removeVolume(volumeActorRef.current)
    }
    Object.values(sliceActorsRef.current).forEach(actor => {
      if (actor) rendererRef.current.removeActor(actor)
    })

    if (activeView === '3d') {
      // Show volume rendering
      if (volumeActorRef.current) {
        rendererRef.current.addVolume(volumeActorRef.current)
      }
    } else {
      // Show MPR slice
      createMPRSlice(activeView, imageDataRef.current)
    }

    renderWindowRef.current?.render()
  }, [activeView, createMPRSlice])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        let volumeData: VolumeData

        if (file.name.toLowerCase().endsWith('.zip')) {
          volumeData = await processZipArchive(arrayBuffer)
        } else {
          volumeData = await processVolFile(arrayBuffer)
        }

        // Calculate stats
        let min = volumeData.data[0]
        let max = volumeData.data[0]
        for (let i = 1; i < volumeData.data.length; i++) {
          if (volumeData.data[i] < min) min = volumeData.data[i]
          if (volumeData.data[i] > max) max = volumeData.data[i]
        }
        
        setVolumeStats({ min, max })
        setVolumeData(volumeData)
        createVTKVolume(volumeData)
        onVolumeDataChange?.(volumeData, { min, max })
      } catch (err) {
        console.error('Error processing file:', err)
        setError(err instanceof Error ? err.message : 'Ошибка обработки файла')
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const input = document.getElementById('file-upload') as HTMLInputElement
      input.files = event.dataTransfer.files
      handleFileUpload({ target: { files: event.dataTransfer.files } } as any)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // Initialize VTK on mount
  useEffect(() => {
    initializeVTK()
  }, [initializeVTK])

  // Update view when activeView changes
  useEffect(() => {
    updateView()
  }, [updateView])

  return (
    <div className="w-full h-full flex flex-col">
      {/* File upload area */}
      <div className="p-4 border-b border-gray-200">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".vol,.zip"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-gray-600">
            <p className="text-lg font-medium">Загрузите файл .vol или .zip</p>
            <p className="text-sm">Перетащите файл сюда или нажмите для выбора</p>
            <p className="text-xs text-gray-500 mt-2">
              Профессиональный VTK.js рендерер с MPR срезами
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Загрузка и обработка данных...</p>
          </div>
        )}

        {volumeStats && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg m-4">
            <h4 className="font-medium text-blue-800 mb-2">Статистика данных:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Мин. значение:</strong> {volumeStats.min}</p>
                <p><strong>Макс. значение:</strong> {volumeStats.max}</p>
              </div>
              <div>
                <p><strong>Размеры:</strong> {volumeData?.dimensions.join(' x ')}</p>
                <p><strong>Всего вокселей:</strong> {volumeData?.data.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View controls */}
      {volumeData && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('3d')}
                className={`px-4 py-2 rounded ${activeView === '3d' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
              >
                3D Объем
              </button>
              <button
                onClick={() => setActiveView('axial')}
                className={`px-4 py-2 rounded ${activeView === 'axial' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
              >
                Axial
              </button>
              <button
                onClick={() => setActiveView('coronal')}
                className={`px-4 py-2 rounded ${activeView === 'coronal' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
              >
                Coronal
              </button>
              <button
                onClick={() => setActiveView('sagittal')}
                className={`px-4 py-2 rounded ${activeView === 'sagittal' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border'}`}
              >
                Sagittal
              </button>
            </div>

            {activeView !== '3d' && (
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Window Level: {windowLevel}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4000"
                    value={windowLevel}
                    onChange={(e) => setWindowLevel(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Window Width: {windowWidth}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="8000"
                    value={windowWidth}
                    onChange={(e) => setWindowWidth(Number(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VTK Viewer */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-900 relative"
        style={{ minHeight: '600px' }}
      />

      {/* Instructions */}
      {volumeData && (
        <div className="p-4 bg-white border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Управление VTK.js рендерером</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Навигация:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• ЛКМ + перетаскивание: Вращение</li>
                <li>• СКМ + перетаскивание: Панорамирование</li>
                <li>• Колесо мыши: Масштабирование</li>
                <li>• ПКМ: Контекстное меню</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Возможности:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Объемный рендеринг с ray casting</li>
                <li>• MPR срезы (Axial, Coronal, Sagittal)</li>
                <li>• Transfer functions для цветов</li>
                <li>• Window/Level настройки</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 