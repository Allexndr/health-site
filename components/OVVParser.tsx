'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface OVVVolumeInfo {
  radius: number
  voxelSize: number
  center: { x: number, y: number, z: number }
  filterName: string
  guid: string
}

interface OVVData {
  volumeInfo: OVVVolumeInfo
  volumeData: ArrayBuffer
  patientInfo: {
    name: string
    id: string
    birthDate: string
    sex: string
    scanDate: string
  }
}

export default function OVVParser({ onDataLoaded }: { onDataLoaded: (data: OVVData) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseVolumeXml = (xmlText: string): OVVVolumeInfo => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')
    
    const v0 = doc.querySelector('V0')
    if (!v0) throw new Error('Не найден элемент V0 в VolumeId.xml')

    const radius = parseFloat(v0.querySelector('dmmVolumeRadius')?.getAttribute('value') || '44')
    const voxelSize = parseFloat(v0.querySelector('dmmVoxelSize')?.getAttribute('value') || '0.125')
    const guid = v0.getAttribute('strGuid') || ''
    const filterName = v0.querySelector('strReconstructionFilterSetName')?.getAttribute('value') || ''
    
    const centerEl = v0.querySelector('dmmVolumeCenter')
    const center = {
      x: parseFloat(centerEl?.getAttribute('X') || '0'),
      y: parseFloat(centerEl?.getAttribute('Y') || '0'),
      z: parseFloat(centerEl?.getAttribute('Z') || '0')
    }

    return { radius, voxelSize, center, filterName, guid }
  }

  const parseVerCtrl = (text: string) => {
    const lines = text.split('\n')
    const data: Record<string, string> = {}
    
    for (const line of lines) {
      const match = line.match(/(\w+)\s*=\s*"([^"]*)"/)
      if (match) {
        data[match[1]] = match[2]
      }
    }
    
    return {
      name: data.PatientName || '',
      id: data.PatientID || '',
      birthDate: data.BirthDay || '',
      sex: data.Sex || '',
      scanDate: data.PhotoDate || ''
    }
  }

  const calculateVolumeDimensions = (fileSize: number, voxelSize: number, radius: number) => {
    // CT_0.vol содержит 16-битные данные
    const numVoxels = fileSize / 2
    const volumeDiameter = radius * 2
    const dimInVoxels = Math.round(volumeDiameter / voxelSize)
    
    // Проверяем, соответствует ли размер файла кубическому объему
    const expectedSize = dimInVoxels ** 3
    const actualDim = Math.round(Math.cbrt(numVoxels))
    
    console.log(`Радиус: ${radius}мм, Размер вокселя: ${voxelSize}мм`)
    console.log(`Ожидаемые размеры: ${dimInVoxels}³ = ${expectedSize} вокселей`)
    console.log(`Фактические размеры: ${actualDim}³ = ${actualDim ** 3} вокселей`)
    
    return { x: actualDim, y: actualDim, z: actualDim }
  }

  const loadOVVData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Создаем input для выбора папки
      const input = document.createElement('input')
      input.type = 'file'
      input.webkitdirectory = true
      input.multiple = true

      const files = await new Promise<FileList | null>((resolve) => {
        input.onchange = (e) => resolve((e.target as HTMLInputElement).files)
        input.click()
      })

      if (!files) {
        setIsLoading(false)
        return
      }

      // Ищем нужные файлы
      const fileMap = new Map<string, File>()
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const name = file.name
        fileMap.set(name, file)
      }

      // Проверяем наличие обязательных файлов
      const volFile = Array.from(fileMap.values()).find(f => f.name.endsWith('.vol'))
      const volumeXmlFile = fileMap.get('VolumeId.xml')
      const verCtrlFile = fileMap.get('ver_ctrl.txt')

      if (!volFile) throw new Error('Не найден файл .vol')
      if (!volumeXmlFile) throw new Error('Не найден файл VolumeId.xml')
      if (!verCtrlFile) throw new Error('Не найден файл ver_ctrl.txt')

      // Читаем файлы
      const [volumeXmlText, verCtrlText, volumeData] = await Promise.all([
        volumeXmlFile.text(),
        verCtrlFile.text(),
        volFile.arrayBuffer()
      ])

      // Парсим данные
      const volumeInfo = parseVolumeXml(volumeXmlText)
      const patientInfo = parseVerCtrl(verCtrlText)
      
      // Вычисляем размеры
      const dimensions = calculateVolumeDimensions(volumeData.byteLength, volumeInfo.voxelSize, volumeInfo.radius)
      
      console.log('Загружены данные OneVolumeViewer:', {
        volumeInfo,
        patientInfo,
        dimensions,
        dataSize: volumeData.byteLength
      })

      onDataLoaded({
        volumeInfo: {
          ...volumeInfo,
          dimensions
        },
        volumeData,
        patientInfo
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      console.error('Ошибка загрузки данных OVV:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded bg-blue-50">
      <h3 className="text-lg font-semibold mb-3">Загрузка данных OneVolumeViewer</h3>
      
      {error && (
        <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          Ошибка: {error}
        </div>
      )}
      
      <div className="mb-3 text-sm text-gray-600">
        Выберите папку с данными CT сканирования (например, "CT_20250718102232")
      </div>
      
      <Button 
        onClick={loadOVVData} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Загрузка...' : 'Загрузить данные OVV'}
      </Button>
      
      <div className="mt-3 text-xs text-gray-500">
        Поддерживаемые файлы: CT_*.vol, VolumeId.xml, ver_ctrl.txt
      </div>
    </div>
  )
} 
 
 
 
 
 
 
 
 
 