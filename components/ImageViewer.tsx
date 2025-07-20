'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowPathIcon,
  BeakerIcon 
<<<<<<< HEAD
} from '@heroicons/react/outline'
=======
} from '@heroicons/react/24/outline'
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
import { Button } from '@/components/ui/Button'

interface Point {
  x: number
  y: number
}

interface Measurement {
  start: Point
  end: Point
  distance: number
}

interface ImageViewerProps {
  src: string
  alt?: string
  className?: string
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 })
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<Measurement> | null>(null)

  // Handle zoom
  const handleZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.1, prev + delta), 5))
  }

  // Handle pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMeasuring) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else if (isMeasuring && currentMeasurement?.start) {
      const rect = imageRef.current?.getBoundingClientRect()
      if (rect) {
        const end = {
          x: (e.clientX - rect.left) / scale,
          y: (e.clientY - rect.top) / scale,
        }
        setCurrentMeasurement(prev => ({
          ...prev,
          end,
          distance: calculateDistance(prev?.start!, end),
        }))
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (isMeasuring && currentMeasurement?.start && currentMeasurement?.end) {
      setMeasurements(prev => [...prev, currentMeasurement as Measurement])
      setCurrentMeasurement(null)
    }
  }

  // Handle measurements
  const handleMeasureStart = (e: React.MouseEvent) => {
    if (isMeasuring) {
      const rect = imageRef.current?.getBoundingClientRect()
      if (rect) {
        const start = {
          x: (e.clientX - rect.left) / scale,
          y: (e.clientY - rect.top) / scale,
        }
        setCurrentMeasurement({ start })
      }
    }
  }

  const calculateDistance = (start: Point, end: Point): number => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Reset view
  const resetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setMeasurements([])
    setCurrentMeasurement(null)
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleZoom(0.1)}
          title="Zoom In"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleZoom(-0.1)}
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMeasuring(!isMeasuring)}
          className={isMeasuring ? 'bg-primary-100' : ''}
          title="Measure"
        >
                          <BeakerIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={resetView}
          title="Reset View"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="overflow-hidden bg-gray-900 rounded-lg"
        style={{ height: '600px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMeasureStart}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="max-w-none"
            draggable={false}
          />

          {/* Measurements */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
            }}
          >
            {measurements.map((m, i) => (
              <g key={i}>
                <line
                  x1={m.start.x}
                  y1={m.start.y}
                  x2={m.end.x}
                  y2={m.end.y}
                  stroke="yellow"
                  strokeWidth="2"
                />
                <text
                  x={(m.start.x + m.end.x) / 2}
                  y={(m.start.y + m.end.y) / 2}
                  fill="yellow"
                  fontSize="12"
                >
                  {m.distance.toFixed(1)}px
                </text>
              </g>
            ))}
            {currentMeasurement?.start && currentMeasurement?.end && (
              <line
                x1={currentMeasurement.start.x}
                y1={currentMeasurement.start.y}
                x2={currentMeasurement.end.x}
                y2={currentMeasurement.end.y}
                stroke="yellow"
                strokeWidth="2"
                strokeDasharray="4"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
} 