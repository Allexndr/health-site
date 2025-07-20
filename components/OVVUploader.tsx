'use client'

import React, { useState, useRef } from 'react'
import { Button } from './ui/Button'

interface OVVUploaderProps {
  onFilesLoaded: (files: FileList) => void
}

interface FileAnalysis {
  type: 'medical_data' | 'program_archive' | 'mixed' | 'unknown' | 'archive'
  medicalFiles: string[]
  programFiles: string[]
  archiveFiles: string[]
  totalSize: number
}

export default function OVVUploader({ onFilesLoaded }: OVVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedFiles, setLoadedFiles] = useState<string[]>([])
  const [fileAnalysis, setFileAnalysis] = useState<FileAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    setIsProcessing(true)
    setError(null)
    setLoadedFiles([])
    setFileAnalysis(null)

    try {
      // Импортируем функцию анализа
      const { analyzeUploadedFiles } = await import('../lib/parsers/OneVolumeViewer')
      
      // Анализируем загруженные файлы
      const analysis = analyzeUploadedFiles(files as FileList)
      setFileAnalysis(analysis)
      
      console.log('📊 Анализ файлов:', analysis)
      
      // Предоставляем подробную обратную связь пользователю
      if (analysis.type === 'program_archive') {
        setError(`Загружен архив программы OneVolumeViewer! Найдено ${analysis.programFiles.length} файлов программы, но НЕТ медицинских данных.`)
        return
      }
      
      if (analysis.type === 'unknown') {
        setError(`Неизвестный тип файлов! Загружено ${fileArray.length} файлов, но среди них не найдены медицинские данные OneVolumeViewer.`)
        return
      }
      
      if (analysis.medicalFiles.length === 0 && analysis.archiveFiles.length === 0) {
        setError('Медицинские файлы не найдены. Проверьте содержимое.')
        return
      }

      console.log(`✅ Найдено медицинских файлов: ${analysis.medicalFiles.length}`)
      setLoadedFiles(fileArray.map(f => f.name))

      // Передаем файлы родительскому компоненту
      onFilesLoaded(files as FileList)

    } catch (err) {
      console.error('❌ Ошибка обработки файлов:', err)
      setError(err instanceof Error ? err.message : 'Ошибка обработки файлов')
    } finally {
      setIsProcessing(false)
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
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Главная зона загрузки */}
      <div
        className={`
          relative overflow-hidden rounded-2xl transition-all duration-300 ease-out
          ${isDragging 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50 border-2 border-blue-400 shadow-lg shadow-blue-500/25 scale-105' 
            : 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
          }
          ${isProcessing ? 'opacity-75 pointer-events-none' : 'hover:shadow-xl hover:shadow-blue-500/10'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Фоновый паттерн */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        
        <div className="relative p-12 text-center">
          {!isProcessing ? (
            <div className="space-y-8">
              {/* Иконка */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Заголовок */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                  Загрузка медицинских данных
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Перетащите файлы или нажмите для выбора
                </p>
              </div>

              {/* Кнопки */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                  size="lg"
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10">📁 Выбрать файлы</span>
                </Button>
                
                <Button
                  onClick={() => folderInputRef.current?.click()}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 text-base font-semibold border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  📂 Выбрать папку
                </Button>
              </div>

              {/* Поддерживаемые форматы */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                  ⚡ Поддерживаемые форматы
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Архивы */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-medium">
                      <span className="text-lg">📦</span>
                      <span>Архивы</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span><strong>ZIP архивы</strong> - полная поддержка</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        <span><strong>RAR архивы</strong> - преобразуйте в ZIP</span>
                      </div>
                    </div>
                  </div>

                  {/* Файлы */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="text-lg">🏥</span>
                      <span>Медицинские файлы</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <div>• <strong>CT_0.vol</strong> (~640MB)</div>
                      <div>• <strong>VolumeId.xml</strong> (метаданные)</div>
                      <div>• <strong>ver_ctrl.txt</strong> (пациент)</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium text-center">
                    ✨ Поддержка: .vol, .xml, .txt, .zip • Максимум: 1GB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Обработка данных...
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Анализ и извлечение медицинских файлов
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Результаты анализа */}
      {fileAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <span>📊</span>
            <span>Анализ файлов</span>
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                Общий размер
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {(fileAnalysis.totalSize / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                Медицинские файлы
              </div>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {fileAnalysis.medicalFiles.length}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                Тип загрузки
              </div>
              <div className="text-lg font-semibold">
                {fileAnalysis.type === 'medical_data' && (
                  <span className="text-emerald-600 dark:text-emerald-400">✅ Медицинские данные</span>
                )}
                {fileAnalysis.type === 'archive' && (
                  <span className="text-blue-600 dark:text-blue-400">📦 Архив</span>
                )}
                {fileAnalysis.type === 'program_archive' && (
                  <span className="text-red-600 dark:text-red-400">🚫 Архив программы</span>
                )}
                {fileAnalysis.type === 'mixed' && (
                  <span className="text-yellow-600 dark:text-yellow-400">⚠️ Смешанные файлы</span>
                )}
                {fileAnalysis.type === 'unknown' && (
                  <span className="text-gray-600 dark:text-gray-400">❓ Неизвестно</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Файлы */}
          {(fileAnalysis.medicalFiles.length > 0 || (fileAnalysis.archiveFiles && fileAnalysis.archiveFiles.length > 0)) && (
            <div className="space-y-4">
              {fileAnalysis.archiveFiles && fileAnalysis.archiveFiles.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    📦 Архивы ({fileAnalysis.archiveFiles.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fileAnalysis.archiveFiles.map((filename, index) => (
                      <span key={index} className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                        {filename}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {fileAnalysis.medicalFiles.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
                    🏥 Медицинские файлы ({fileAnalysis.medicalFiles.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fileAnalysis.medicalFiles.map((filename, index) => (
                      <span key={index} className="inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-sm px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-700">
                        {filename}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ошибки */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-200 text-lg mb-2">
                Ошибка загрузки
              </h4>
              <div className="text-red-700 dark:text-red-300 whitespace-pre-line">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Скрытые input элементы */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".vol,.xml,.txt,.rar,.zip"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
} 
 
 
 
 
 
 
 
 
 