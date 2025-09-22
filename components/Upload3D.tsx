'use client'

import React, { useState, useRef } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface PatientInfo {
  id: string
  name: string
  birthDate: string
  studyDate: string
  studyDescription: string
}

interface Upload3DProps {
  onUploadComplete?: (data: any) => void
  onError?: (error: Error) => void
  className?: string
}

export default function Upload3D({
  onUploadComplete,
  onError,
  className = ''
}: Upload3DProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    
    try {
      // Симуляция обработки файлов
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setUploadedFiles(files)
      
      // Создаем тестовые данные пациента
      const mockPatientData: PatientInfo = {
        id: 'P' + Math.random().toString(36).substr(2, 9),
        name: 'Тестовый Пациент',
        birthDate: '1985-01-01',
        studyDate: new Date().toISOString().split('T')[0],
        studyDescription: '3D КТ исследование'
      }
      
      onUploadComplete?.({
        patientInfo: mockPatientData,
        files: files,
        volumeData: {
          width: 512,
          height: 512,
          depth: 256,
          dataSize: files.reduce((total, file) => total + file.size, 0)
        }
      })
      
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      onError?.(error as Error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect({ target: { files } } as any)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className={`w-full ${className}`}>
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">3D Upload</h2>
          <p className="text-gray-600">Загрузите медицинские файлы для 3D просмотра</p>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".dcm,.nii,.vol,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600">Обработка файлов...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📁</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Поддерживаются форматы: DICOM, NIfTI, VOL, ZIP
                </p>
              </div>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Загруженные файлы:</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 text-sm">✓ Обработан</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}