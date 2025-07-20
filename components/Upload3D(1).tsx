'use client'

import React, { useState, useRef } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import OneVolumeLoader from './OneVolumeLoader'
import { OneVolumeViewerParser, OVVData, OneVolumeData } from '../lib/parsers/OneVolumeViewer'

interface PatientInfo {
  id: string
  name: string
  familyName: string
  middleName: string
  givenName: string
  birthDay: string
  sex: string
  photoDate: string
  ctTaskId: string
}

interface VolumeInfo {
  radius: number
  center: { x: number; y: number; z: number }
  voxelSize: number
  reconstructionFilter: string
  dimensions?: { x: number; y: number; z: number }
}

interface Upload3DProps {
  onFilesSelected: (data: OneVolumeData) => void
}

export default function Upload3D({ onFilesSelected }: Upload3DProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Обработка реальных файлов OneVolumeViewer
  const handleOVVFiles = async (files: File[]) => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)

    try {
      // Создаем объект файлов для парсера
      const fileMap: { [filename: string]: File } = {}
      files.forEach(file => {
        fileMap[file.name] = file
      })

      setProcessingProgress(25)

      // Парсим данные OVV
      const ovvData = await OneVolumeViewerParser.parseOVVArchive(fileMap)
      
      setProcessingProgress(75)

      if (!ovvData.isValid) {
        throw new Error('Не удалось обработать файлы OneVolumeViewer')
      }

      // Конвертируем в формат нашего приложения
      const appData = OneVolumeViewerParser.convertToAppFormat(ovvData)
      
      setProcessingProgress(100)
      onFilesSelected(appData)
      
    } catch (err) {
      console.error('Ошибка обработки OVV файлов:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleOVVFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleOVVFiles(files)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б'
    const k = 1024
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
  }

  // Создает реалистичную 3D модель моляра для демонстрации
  const createDemoData = (): OneVolumeData => {
    const dimensions = { x: 256, y: 256, z: 256 };
    const volume = new Uint16Array(dimensions.x * dimensions.y * dimensions.z);

    const DENSITY = {
      AIR: 0,
      PULP: 1050,       // Пульпа (мягкая ткань)
      DENTIN: 1900,     // Дентин
      ENAMEL: 2900,     // Эмаль (самая плотная)
      BONE: 1500,       // Альвеолярная кость
      GUM: 900          // Десна
    };

    const center = { x: dimensions.x / 2, y: dimensions.y / 2, z: dimensions.z / 2 };

    // Генерация альвеолярной кости
    for (let z = 0; z < dimensions.z; z++) {
      for (let y = 0; y < dimensions.y; y++) {
        for (let x = 0; x < dimensions.x; x++) {
          if (z < center.z + 40) {
            const index = z * dimensions.x * dimensions.y + y * dimensions.x + x;
            volume[index] = DENSITY.BONE + Math.random() * 50 - 25; // Небольшая вариативность
          }
        }
      }
    }

    // Параметры коронки
    const crownHeight = 40;
    const crownRadius = 35;

    // Генерация коронки (Эмаль и Дентин)
    for (let z = center.z; z < center.z + crownHeight; z++) {
      for (let y = center.y - crownRadius; y < center.y + crownRadius; y++) {
        for (let x = center.x - crownRadius; x < center.x + crownRadius; x++) {
          const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
          if (distance < crownRadius - (z - center.z) * 0.5) {
            const index = z * dimensions.x * dimensions.y + y * dimensions.x + x;
            const enamelThickness = 5;
            if (distance > crownRadius - (z - center.z) * 0.5 - enamelThickness) {
              volume[index] = DENSITY.ENAMEL;
            } else {
              volume[index] = DENSITY.DENTIN;
            }
          }
        }
      }
    }

    // Параметры корней (3 корня)
    const roots = [
      { offset: { x: -15, y: -15 }, height: 60, radius: 12 },
      { offset: { x: 15, y: -15 }, height: 65, radius: 13 },
      { offset: { x: 0, y: 20 }, height: 60, radius: 12 }
    ];

    // Генерация корней (Дентин)
    roots.forEach(root => {
      for (let z = center.z - root.height; z < center.z; z++) {
        for (let y = -root.radius; y < root.radius; y++) {
          for (let x = -root.radius; x < root.radius; x++) {
            const rootX = center.x + root.offset.x;
            const rootY = center.y + root.offset.y;
            if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(root.radius * (1 - (center.z - z) / root.height), 2)) {
              const index = z * dimensions.x * dimensions.y + (rootY + y) * dimensions.x + (rootX + x);
              volume[index] = DENSITY.DENTIN;
            }
          }
        }
      }
    });

    // Генерация пульпы и корневых каналов
    const pulpChamberHeight = 20;
    const pulpChamberRadius = 15;
    
    // Пульпарная камера
    for (let z = center.z; z < center.z + pulpChamberHeight; z++) {
      for (let y = center.y - pulpChamberRadius; y < center.y + pulpChamberRadius; y++) {
        for (let x = center.x - pulpChamberRadius; x < center.x + pulpChamberRadius; x++) {
          if (Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)) < pulpChamberRadius * 0.5) {
            const index = z * dimensions.x * dimensions.y + y * dimensions.x + x;
            if (volume[index] === DENSITY.DENTIN) {
              volume[index] = DENSITY.PULP;
            }
          }
        }
      }
    }
    
    // Корневые каналы
    roots.forEach(root => {
      const canalRadius = root.radius * 0.3;
      for (let z = center.z - root.height; z < center.z; z++) {
        for (let y = -canalRadius; y < canalRadius; y++) {
          for (let x = -canalRadius; x < canalRadius; x++) {
            const rootX = center.x + root.offset.x;
            const rootY = center.y + root.offset.y;
            if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(canalRadius * (1 - (center.z - z) / root.height), 2)) {
              const index = z * dimensions.x * dimensions.y + (rootY + y) * dimensions.x + (rootX + x);
              if(volume[index] === DENSITY.DENTIN) {
                volume[index] = DENSITY.PULP;
              }
            }
          }
        }
      }
    });


    const patientInfo: PatientInfo = {
      id: 'DEMO-001',
      name: 'Molar, Demo',
      familyName: 'Demo',
      middleName: 'Molar',
      givenName: 'Test',
      birthDay: '19900101',
      sex: 'O',
      photoDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      ctTaskId: 'CBCT-DEMO'
    };

    const volumeInfo: VolumeInfo = {
      radius: 40,
      center: { x: 0, y: 0, z: 0 },
      voxelSize: 0.125,
      reconstructionFilter: 'SMOOTH',
      dimensions: dimensions
    };

    return {
      patientInfo,
      volumeInfo,
      volumeData: volume.buffer,
      isValid: true
    };
  }

  const handleDemoLoad = () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)
    
    // Симулируем процесс загрузки
    const steps = [
      { progress: 20, message: 'Создание демо данных...' },
      { progress: 50, message: 'Генерация объёма...' },
      { progress: 80, message: 'Настройка параметров...' },
      { progress: 100, message: 'Завершение...' }
    ]
    
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProcessingProgress(steps[currentStep].progress)
        console.log(steps[currentStep].message)
        currentStep++
      } else {
        clearInterval(interval)
        
        // Создаем и передаем демо данные
        try {
          const demoData = createDemoData()
          onFilesSelected(demoData)
        } catch (error) {
          console.error('Ошибка создания демо данных:', error)
          setError('Не удалось создать демо данные')
        } finally {
          setIsProcessing(false)
          setProcessingProgress(0)
        }
      }
    }, 500)
  }

  // Загружает реальные данные OneVolumeViewer
  const loadOneVolumeViewerData = async () => {
    try {
      setIsProcessing(true)
      setProcessingProgress(0)
      
      // Загружаем метаданные
      const verCtrlResponse = await fetch('/Anel%20Aiyanovna%20Ibragimova_20250718102232.CT/ver_ctrl.txt')
      const verCtrlText = await verCtrlResponse.text()
      setProcessingProgress(20)
      
      const volumeXmlResponse = await fetch('/Anel%20Aiyanovna%20Ibragimova_20250718102232.CT/CT_20250718102232/VolumeId.xml')
      const volumeXmlText = await volumeXmlResponse.text()
      setProcessingProgress(40)
      
      // Парсим метаданные
      const metadata = OneVolumeViewerParser.parseOneVolumeMetadata(verCtrlText, volumeXmlText)
      setProcessingProgress(60)
      
      // Загружаем объемные данные
      const volumeResponse = await fetch('/Anel%20Aiyanovna%20Ibragimova_20250718102232.CT/CT_20250718102232/CT_0.vol')
      const volumeBuffer = await volumeResponse.arrayBuffer()
      setProcessingProgress(80)
      
      // Вычисляем размеры
      const dimensions = OneVolumeViewerParser.calculateDimensionsFromMetadata(metadata)
      
      const oneVolumeData: OneVolumeData = {
        volumeData: volumeBuffer,
        volumeInfo: {
          patientName: metadata.patientName,
          studyDate: metadata.photoDate,
          voxelSize: metadata.voxelSize,
          dimensions: dimensions
        },
        isValid: true
      }
      
      setProcessingProgress(100)
      onFilesSelected(oneVolumeData)
      setSelectedFiles([new File([''], 'ver_ctrl.txt')]) // Simulate a single file for display
      
    } catch (error) {
      console.error('Ошибка загрузки OneVolumeViewer данных:', error)
      setError('Не удалось загрузить данные OneVolumeViewer')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Загрузка 3D данных</h3>
            <p className="text-gray-600 mb-4">
              Выберите файлы OneVolumeViewer или загрузите демо-данные
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={loadOneVolumeViewerData}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Загрузка...' : 'Загрузить OneVolumeViewer данные'}
            </Button>
            
            <Button
              onClick={handleDemoLoad}
              disabled={isProcessing}
              variant="outline"
            >
              Демо: 3D модель моляра
            </Button>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>• ZIP архивы OneVolumeViewer (до 2 ГБ)</p>
            <p>• Файлы .CT формата</p>
            <p>• Автоматическое извлечение данных пациента</p>
            <p className="text-blue-600 font-medium mt-2">
              💡 Демо показывает детальную 3D модель моляра с корнями, каналами и эмалью
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,.ct,.CT"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">Ошибка загрузки:</p>
          </div>
          <p className="text-red-600">{error}</p>
          <details className="mt-2">
            <summary className="text-red-600 cursor-pointer text-sm hover:text-red-800">
              Показать техническую информацию
            </summary>
            <div className="mt-2 text-xs text-red-500 font-mono bg-red-100 p-2 rounded">
              <p>Откройте консоль браузера (F12) для подробных логов</p>
              <p>Проверьте структуру архива:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Должен содержать файлы .vol</li>
                <li>Желательно наличие ver_ctrl.txt</li>
                <li>Максимальный размер: 2 ГБ</li>
              </ul>
            </div>
          </details>
        </Card>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Выбранные файлы ({selectedFiles.length})
          </h4>
          <div className="text-sm text-gray-600 mb-2">
            Общий размер: {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                    {file.name.toLowerCase().endsWith('.ct') ? 'CT' : 'ZIP'}
                  </span>
                  <span className="font-medium text-gray-900">{file.name}</span>
                  <span className="text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Удалить файл"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
} 