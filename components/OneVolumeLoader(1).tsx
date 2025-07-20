'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'

interface OneVolumeData {
  isValid: boolean
  volumeData?: ArrayBuffer
  volumeInfo?: {
    dimensions: { x: number; y: number; z: number }
    voxelSize: number
    radius: number
    center: { x: number; y: number; z: number }
    reconstructionFilter: string
    patientInfo?: {
      name: string
      id: string
      birthDate: string
      sex: string
      scanDate: string
    }
  }
  error?: string
}

interface OneVolumeLoaderProps {
  onDataLoaded: (data: OneVolumeData) => void
}

export default function OneVolumeLoader({ onDataLoaded }: OneVolumeLoaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Парсинг XML файла VolumeId.xml
  const parseVolumeXML = (xmlText: string) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml')
    
    const volumeElement = xmlDoc.querySelector('V0')
    if (!volumeElement) return null

    return {
      radius: parseFloat(volumeElement.querySelector('dmmVolumeRadius')?.getAttribute('value') || '44'),
      center: {
        x: parseFloat(xmlDoc.querySelector('dmmVolumeCenter')?.getAttribute('X') || '0'),
        y: parseFloat(xmlDoc.querySelector('dmmVolumeCenter')?.getAttribute('Y') || '0'),
        z: parseFloat(xmlDoc.querySelector('dmmVolumeCenter')?.getAttribute('Z') || '0')
      },
      voxelSize: parseFloat(volumeElement.querySelector('dmmVoxelSize')?.getAttribute('value') || '0.125'),
      reconstructionFilter: volumeElement.querySelector('strReconstructionFilterSetName')?.getAttribute('value') || ''
    }
  }

  // Парсинг файла ver_ctrl.txt для информации о пациенте
  const parseVerCtrl = (text: string) => {
    const lines = text.split('\n')
    const data: any = {}
    
    lines.forEach(line => {
      const match = line.match(/^(\w+)\s*=\s*"([^"]*)"/)
      if (match) {
        data[match[1]] = match[2]
      }
    })

    return {
      name: data.PatientName || '',
      id: data.PatientID || '',
      birthDate: data.BirthDay || '',
      sex: data.Sex || '',
      scanDate: data.PhotoDate || ''
    }
  }

  // Вычисление размеров объема на основе файла .vol
  const calculateVolumeDimensions = (fileSize: number, voxelSize: number) => {
    // OneVolumeViewer обычно использует кубические объемы
    // Размер файла в байтах / 2 (16-бит данные) = общее количество вокселей
    const totalVoxels = fileSize / 2
    const dimensionSize = Math.round(Math.cbrt(totalVoxels))
    
    return {
      x: dimensionSize,
      y: dimensionSize,
      z: dimensionSize
    }
  }

  // Основная функция загрузки OneVolumeViewer данных
  const handleFileLoad = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    setLoadingProgress(0)

    try {
      let volumeFile: File | null = null
      let volumeXmlFile: File | null = null
      let verCtrlFile: File | null = null

      // Ищем нужные файлы
      for (const file of Array.from(files)) {
        if (file.name.endsWith('.vol')) {
          volumeFile = file
        } else if (file.name === 'VolumeId.xml') {
          volumeXmlFile = file
        } else if (file.name === 'ver_ctrl.txt') {
          verCtrlFile = file
        }
      }

      if (!volumeFile) {
        throw new Error('Файл .vol не найден. Пожалуйста, выберите файл CT_0.vol')
      }

      setLoadingProgress(20)

      // Читаем метаданные
      let volumeInfo: any = {}
      let patientInfo: any = {}

      if (volumeXmlFile) {
        const xmlText = await volumeXmlFile.text()
        const xmlData = parseVolumeXML(xmlText)
        if (xmlData) {
          volumeInfo = xmlData
        }
      }

      setLoadingProgress(40)

      if (verCtrlFile) {
        const verCtrlText = await verCtrlFile.text()
        patientInfo = parseVerCtrl(verCtrlText)
      }

      setLoadingProgress(60)

      // Читаем объемные данные
      const volumeBuffer = await volumeFile.arrayBuffer()
      
      setLoadingProgress(80)

      // Вычисляем размеры
      const dimensions = calculateVolumeDimensions(volumeBuffer.byteLength, volumeInfo.voxelSize || 0.125)

      const result: OneVolumeData = {
        isValid: true,
        volumeData: volumeBuffer,
        volumeInfo: {
          dimensions,
          voxelSize: volumeInfo.voxelSize || 0.125,
          radius: volumeInfo.radius || 44,
          center: volumeInfo.center || { x: 0, y: 0, z: 0 },
          reconstructionFilter: volumeInfo.reconstructionFilter || '',
          patientInfo
        }
      }

      setLoadingProgress(100)
      onDataLoaded(result)

    } catch (error) {
      console.error('Ошибка загрузки OneVolumeViewer данных:', error)
      onDataLoaded({
        isValid: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    } finally {
      setIsLoading(false)
    }
  }, [onDataLoaded])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Загрузка данных OneVolumeViewer</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите файлы OneVolumeViewer
          </label>
          <div className="text-sm text-gray-500 mb-3">
            Выберите несколько файлов: CT_0.vol, VolumeId.xml, ver_ctrl.txt
          </div>
          <input
            type="file"
            multiple
            accept=".vol,.xml,.txt"
            onChange={handleFileLoad}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-full file:border-0 
                     file:text-sm file:font-semibold 
                     file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100 
                     disabled:opacity-50"
          />
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Загрузка данных...</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400">
          <p>Поддерживаемые форматы:</p>
          <ul className="list-disc list-inside mt-1">
            <li>CT_0.vol - основной файл с объемными данными</li>
            <li>VolumeId.xml - метаданные объема</li>
            <li>ver_ctrl.txt - информация о пациенте и сканировании</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
 
 
 
 
 
 
 
 
 