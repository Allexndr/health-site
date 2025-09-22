'use client'

import React, { useRef, useEffect, useState } from 'react'

interface CornerstoneViewerProps {
  imageIds: string[]
  onImageChange?: (imageIndex: number) => void
  className?: string
}

export default function CornerstoneViewer({
  imageIds,
  onImageChange,
  className = ''
}: CornerstoneViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (imageIds.length > 0) {
      setIsLoading(true)
      // Симуляция загрузки
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [imageIds])

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1
      setCurrentImageIndex(newIndex)
      onImageChange?.(newIndex)
    }
  }

  const handleNext = () => {
    if (currentImageIndex < imageIds.length - 1) {
      const newIndex = currentImageIndex + 1
      setCurrentImageIndex(newIndex)
      onImageChange?.(newIndex)
    }
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Загрузка изображения...</p>
          </div>
        </div>
      )}

      {!isLoading && imageIds.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">📷</div>
            <p>Нет изображений для просмотра</p>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      {imageIds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 rounded-lg px-4 py-2">
          <button
            onClick={handlePrevious}
            disabled={currentImageIndex === 0}
            className="text-white hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            ← Предыдущее
          </button>
          <span className="text-white text-sm">
            {currentImageIndex + 1} / {imageIds.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentImageIndex === imageIds.length - 1}
            className="text-white hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Следующее →
          </button>
        </div>
      )}
    </div>
  )
}