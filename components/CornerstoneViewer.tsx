'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneTools from 'cornerstone-tools'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'

interface VolumeData {
  data: Uint8Array | Uint16Array
  dimensions: [number, number, number]
  spacing: [number, number, number]
  origin: [number, number, number]
}

interface CornerstoneViewerProps {
  volumeData?: VolumeData
}

export default function CornerstoneViewer({ volumeData }: CornerstoneViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'axial' | 'coronal' | 'sagittal'>('axial')
  const [sliceIndex, setSliceIndex] = useState(0)
  const [windowLevel, setWindowLevel] = useState(2000)
  const [windowWidth, setWindowWidth] = useState(4000)

  // Initialize Cornerstone
  const initializeCornerstone = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const element = canvas

    // Enable Cornerstone
    cornerstone.enable(element)

    // Initialize tools
    cornerstoneTools.init({
      mouseEnabled: true,
      touchEnabled: true,
      globalToolStateManagerEnabled: true
    })

    // Add tools
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool)
    cornerstoneTools.addTool(cornerstoneTools.PanTool)
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool)
    cornerstoneTools.addTool(cornerstoneTools.LengthTool)
    cornerstoneTools.addTool(cornerstoneTools.AngleTool)
    cornerstoneTools.addTool(cornerstoneTools.ProbeTool)

    // Set active tool
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 })
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 })
    cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 })

    console.log('Cornerstone initialized')
  }, [])

  // Convert volume data to DICOM-like format
  const convertVolumeToDICOM = useCallback((volumeData: VolumeData, viewType: 'axial' | 'coronal' | 'sagittal') => {
    const [width, height, depth] = volumeData.dimensions
    let sliceData: Uint16Array
    let imageWidth: number
    let imageHeight: number

    if (viewType === 'axial') {
      // XY plane
      imageWidth = width
      imageHeight = height
      const startIndex = sliceIndex * width * height
      sliceData = volumeData.data.slice(startIndex, startIndex + width * height)
    } else if (viewType === 'coronal') {
      // XZ plane
      imageWidth = width
      imageHeight = depth
      sliceData = new Uint16Array(width * depth)
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
          const sourceIndex = z * width * height + sliceIndex * width + x
          const targetIndex = z * width + x
          sliceData[targetIndex] = volumeData.data[sourceIndex]
        }
      }
    } else {
      // YZ plane
      imageWidth = height
      imageHeight = depth
      sliceData = new Uint16Array(height * depth)
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
          const sourceIndex = z * width * height + y * width + sliceIndex
          const targetIndex = z * height + y
          sliceData[targetIndex] = volumeData.data[sourceIndex]
        }
      }
    }

    // Create DICOM-like image object
    const image = {
      imageId: `volume-${viewType}-${sliceIndex}`,
      minPixelValue: Math.min(...Array.from(sliceData)),
      maxPixelValue: Math.max(...Array.from(sliceData)),
      slope: 1,
      intercept: 0,
      windowCenter: windowLevel,
      windowWidth: windowWidth,
      getPixelData: () => sliceData,
      getImageData: () => ({
        width: imageWidth,
        height: imageHeight,
        data: sliceData
      }),
      rows: imageHeight,
      columns: imageWidth,
      color: false,
      columnPixelSpacing: volumeData.spacing[0],
      rowPixelSpacing: volumeData.spacing[1],
      sizeInBytes: sliceData.byteLength
    }

    return image
  }, [sliceIndex, windowLevel, windowWidth])

  // Load image into Cornerstone
  const loadImage = useCallback(async (image: any) => {
    if (!canvasRef.current) return

    try {
      const element = canvasRef.current
      await cornerstone.loadImage(image)
      cornerstone.displayImage(element, image)
      cornerstone.resize(element)
    } catch (err) {
      console.error('Error loading image:', err)
      setError('Ошибка загрузки изображения')
    }
  }, [])

  // Update view when volume data or settings change
  useEffect(() => {
    if (!volumeData) return

    setIsLoading(true)
    try {
      const image = convertVolumeToDICOM(volumeData, activeView)
      loadImage(image)
    } catch (err) {
      console.error('Error updating view:', err)
      setError('Ошибка обновления вида')
    } finally {
      setIsLoading(false)
    }
  }, [volumeData, activeView, sliceIndex, windowLevel, windowWidth, convertVolumeToDICOM, loadImage])

  // Initialize on mount
  useEffect(() => {
    initializeCornerstone()
  }, [initializeCornerstone])

  // Get max slice index for current view
  const getMaxSliceIndex = () => {
    if (!volumeData) return 0
    const [width, height, depth] = volumeData.dimensions
    if (activeView === 'axial') return depth - 1
    if (activeView === 'coronal') return height - 1
    return width - 1
  }

  const maxSliceIndex = getMaxSliceIndex()

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
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

          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slice: {sliceIndex} / {maxSliceIndex}
              </label>
              <input
                type="range"
                min="0"
                max={maxSliceIndex}
                value={sliceIndex}
                onChange={(e) => setSliceIndex(Number(e.target.value))}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
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
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка изображения...</p>
        </div>
      )}

      {/* Cornerstone canvas */}
      <div className="flex-1 bg-gray-900 relative" style={{ minHeight: '600px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: 'crosshair' }}
        />
      </div>

      {/* Instructions */}
      <div className="p-4 bg-white border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4">Управление Cornerstone3D</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Навигация:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• ЛКМ + перетаскивание: Window/Level</li>
              <li>• СКМ + перетаскивание: Панорамирование</li>
              <li>• Колесо мыши: Масштабирование</li>
              <li>• Двойной клик: Сброс вида</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Инструменты:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Length Tool: Измерение расстояния</li>
              <li>• Angle Tool: Измерение угла</li>
              <li>• Probe Tool: Значение пикселя</li>
              <li>• MPR срезы: Axial, Coronal, Sagittal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 