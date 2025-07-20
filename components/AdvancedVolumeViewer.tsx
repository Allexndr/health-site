'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'

interface VolumeData {
  data: Uint8Array | Uint16Array
  dimensions: [number, number, number]
  spacing: [number, number, number]
  origin: [number, number, number]
}

interface AdvancedVolumeViewerProps {}

export default function AdvancedVolumeViewer({}: AdvancedVolumeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [volumeStats, setVolumeStats] = useState<{ min: number; max: number } | null>(null)
  const [windowLevel, setWindowLevel] = useState(2000)
  const [windowWidth, setWindowWidth] = useState(4000)
  const [opacity, setOpacity] = useState(0.8)
  const [threshold, setThreshold] = useState(1000)
  
  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<any>(null)
  const volumeMeshRef = useRef<THREE.Points | null>(null)

  // Initialize Three.js
  const initializeThreeJS = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(2, 2, 2)
    cameraRef.current = camera

    // Enhanced renderer for professional quality
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    rendererRef.current = renderer

    // Professional lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    // Main directional light (dental light simulation)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(3, 4, 3)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Fill light for detail
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-2, 2, -2)
    scene.add(fillLight)

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
    rimLight.position.set(0, -2, 0)
    scene.add(rimLight)

    // Controls
    import('three/examples/jsm/controls/OrbitControls').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enableZoom = true
      controls.enablePan = true
      controlsRef.current = controls
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)
  }, [])

  // Process .vol file
  const processVolFile = async (arrayBuffer: ArrayBuffer): Promise<VolumeData> => {
    // Try different header sizes for OneVolumeViewer format
    const headerSizes = [0, 512, 1024, 2048, 4096]
    let volumeData: Uint16Array | null = null
    let dimensions: [number, number, number] = [256, 256, 256]
    let spacing: [number, number, number] = [1, 1, 1]
    let origin: [number, number, number] = [0, 0, 0]

    for (const headerSize of headerSizes) {
      try {
        const dataSize = arrayBuffer.byteLength - headerSize
        const expectedVoxels = dataSize / 2 // 16-bit data
        
        // Try to find reasonable dimensions
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
        
        // Validate data
        if (volumeData.length > 0 && !isNaN(volumeData[0])) {
          // Calculate min/max efficiently
          let min = volumeData[0];
          let max = volumeData[0];
          for (let i = 1; i < volumeData.length; i++) {
            if (volumeData[i] < min) min = volumeData[i];
            if (volumeData[i] > max) max = volumeData[i];
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
      // Import JSZip dynamically
      const JSZipModule = await import('jszip')
      const JSZip = JSZipModule.default
      const zip = new JSZip()
      await zip.loadAsync(arrayBuffer)
      
      // Find .vol file in archive
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

  // Create volume geometry
  const createVolumeGeometry = useCallback((volumeData: VolumeData) => {
    if (!sceneRef.current) return

    // Clear existing volume
    if (volumeMeshRef.current) {
      sceneRef.current.remove(volumeMeshRef.current)
      volumeMeshRef.current.geometry.dispose()
      if (volumeMeshRef.current.material) {
        (volumeMeshRef.current.material as THREE.Material).dispose()
      }
    }

    const { data, dimensions } = volumeData
    const [width, height, depth] = dimensions

    // Create points geometry for volume rendering
    const positions: number[] = []
    const colors: number[] = []
    const sizes: number[] = []

    // Sample points based on threshold
    const step = Math.max(1, Math.floor(Math.cbrt(data.length / 10000))) // Adaptive sampling
    let pointCount = 0

    for (let z = 0; z < depth; z += step) {
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = z * width * height + y * width + x
          if (index < data.length) {
            const value = data[index]
            
            // Apply window/level and threshold
            const normalizedValue = Math.max(0, Math.min(1, (value - (windowLevel - windowWidth/2)) / windowWidth))
            if (normalizedValue > 0 && value > threshold) {
              positions.push(
                (x / width - 0.5) * 2,
                (y / height - 0.5) * 2,
                (z / depth - 0.5) * 2
              )

              // Color based on value (dental tissue mapping)
              const color = getDentalTissueColor(value)
              colors.push(color.r, color.g, color.b)
              sizes.push(normalizedValue * 0.02 + 0.005) // Adaptive point size
              pointCount++
            }
          }
        }
      }
    }

    // Fallback: if no points meet threshold, show some anyway
    if (pointCount === 0) {
      for (let i = 0; i < Math.min(1000, data.length); i += Math.max(1, Math.floor(data.length / 1000))) {
        const value = data[i]
        const x = i % width
        const y = Math.floor(i / width) % height
        const z = Math.floor(i / (width * height))
        
        positions.push(
          (x / width - 0.5) * 2,
          (y / height - 0.5) * 2,
          (z / depth - 0.5) * 2
        )

        const color = getDentalTissueColor(value)
        colors.push(color.r, color.g, color.b)
        sizes.push(0.01)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    // Create shader material for professional rendering
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
          gl_FragColor = vec4(vColor, ${opacity});
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    const points = new THREE.Points(geometry, material)
    sceneRef.current.add(points)
    volumeMeshRef.current = points

    console.log(`Created volume geometry with ${pointCount} points`)
  }, [windowLevel, windowWidth, threshold, opacity])

  // Dental tissue color mapping
  const getDentalTissueColor = (value: number): { r: number, g: number, b: number } => {
    // Dental tissue color mapping
    if (value < 500) return { r: 0.1, g: 0.1, b: 0.1 } // Air
    if (value < 1000) return { r: 0.8, g: 0.8, b: 0.8 } // Soft tissue
    if (value < 1500) return { r: 0.9, g: 0.7, b: 0.5 } // Bone
    if (value < 2000) return { r: 1.0, g: 1.0, b: 0.8 } // Enamel
    return { r: 1.0, g: 1.0, b: 1.0 } // Metal/dense material
  }

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

        // Calculate volume stats
        let min = volumeData.data[0];
        let max = volumeData.data[0];
        for (let i = 1; i < volumeData.data.length; i++) {
          if (volumeData.data[i] < min) min = volumeData.data[i];
          if (volumeData.data[i] > max) max = volumeData.data[i];
        }
        
        setVolumeStats({ min, max });
        setVolumeData(volumeData)
        createVolumeGeometry(volumeData)
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

  // Initialize Three.js on mount
  useEffect(() => {
    initializeThreeJS()
  }, [initializeThreeJS])

  // Update volume when parameters change
  useEffect(() => {
    if (volumeData) {
      createVolumeGeometry(volumeData)
    }
  }, [volumeData, windowLevel, windowWidth, threshold, opacity, createVolumeGeometry])

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
              Поддерживаемые форматы: OneVolumeViewer (.vol), ZIP архивы
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
      </div>

      {/* 3D Viewer */}
      <div
        ref={containerRef}
        className="flex-1 bg-gray-900 relative"
        style={{ minHeight: '600px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Controls */}
      {volumeData && (
        <div className="p-4 bg-white border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Настройки визуализации</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень окна: {windowLevel}
              </label>
              <input
                type="range"
                min="0"
                max="4000"
                value={windowLevel}
                onChange={(e) => setWindowLevel(Number(e.target.value))}
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
                max="8000"
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Порог: {threshold}
              </label>
              <input
                type="range"
                min="0"
                max="3000"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Прозрачность: {opacity}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setWindowLevel(2000)
                setWindowWidth(4000)
                setThreshold(1000)
                setOpacity(0.8)
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Сброс
            </button>
            <button
              onClick={() => {
                setWindowLevel(1500)
                setWindowWidth(2000)
                setThreshold(800)
                setOpacity(0.9)
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Зубы
            </button>
            <button
              onClick={() => {
                setWindowLevel(1000)
                setWindowWidth(3000)
                setThreshold(0)
                setOpacity(0.7)
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Все
            </button>
          </div>
        </div>
      )}

      {/* Info panel */}
      {volumeData && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-2">Информация о данных</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Размеры:</strong> {volumeData.dimensions.join(' × ')}</p>
              <p><strong>Всего вокселей:</strong> {volumeData.data.length.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Мин. значение:</strong> {volumeStats?.min ?? 'N/A'}</p>
              <p><strong>Макс. значение:</strong> {volumeStats?.max ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 

