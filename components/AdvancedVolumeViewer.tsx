'use client'

import React from 'react'

interface VolumeData {
  data: Uint8Array | Uint16Array
  dimensions: [number, number, number]
  spacing: [number, number, number]
  origin: [number, number, number]
}

interface AdvancedVolumeViewerProps {
  volumeData: VolumeData | null
  onSliceChange?: (slice: number) => void
  onWindowLevelChange?: (level: number, width: number) => void
  className?: string
}

export default function AdvancedVolumeViewer({
  volumeData,
  onSliceChange,
  onWindowLevelChange,
  className = ''
}: AdvancedVolumeViewerProps) {
  return (
    <div className={`w-full h-full bg-gray-900 flex items-center justify-center ${className}`}>
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-bold mb-2">3D Volume Viewer</h3>
        <p className="text-gray-400">Продвинутый просмотр медицинских изображений</p>
        {volumeData && (
          <div className="mt-4 text-sm text-gray-300">
            <p>Размеры: {volumeData.dimensions.join(' × ')}</p>
            <p>Пространство: {volumeData.spacing.join(' × ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}