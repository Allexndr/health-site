'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Upload, Eye, Download, Trash2 } from 'lucide-react'

interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

export default function Viewer3DPage() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const viewerRef = useRef<HTMLIFrameElement>(null)

  // Загрузка списка файлов при монтировании
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await loadFiles()
        alert('Файл успешно загружен!')
      } else {
        alert('Ошибка загрузки файла')
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      alert('Ошибка загрузки файла')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewFile = async (fileName: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/launch-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: fileName })
      })

      if (response.ok) {
        setSelectedFile(fileName)
        // Создаем URL для встроенного просмотра
        const viewerPath = `/viewer?file=${encodeURIComponent(fileName)}`
        setViewerUrl(viewerPath)
      } else {
        alert('Ошибка запуска просмотра')
      }
    } catch (error) {
      console.error('Ошибка запуска:', error)
      alert('Ошибка запуска просмотра')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Удалить файл "${fileName}"?`)) return

    try {
      const response = await fetch(`/api/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadFiles()
        if (selectedFile === fileName) {
          setSelectedFile(null)
          setViewerUrl(null)
        }
        alert('Файл удален')
      } else {
        alert('Ошибка удаления файла')
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
      alert('Ошибка удаления файла')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ru-RU')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          3D Просмотр Рентгеновских Снимков
        </h1>
        <p className="text-gray-600">
          Загружайте CT архивы и просматривайте 3D модели зубов прямо в браузере
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Панель файлов */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Файлы</h2>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Загрузить
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.ct,.vol"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Нет загруженных файлов</p>
                  <p className="text-sm">Загрузите CT архив для просмотра</p>
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFile === file.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewFile(file.name)}
                          disabled={isLoading}
                          className="p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFile(file.name)}
                          disabled={isLoading}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Область просмотра */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedFile ? `Просмотр: ${selectedFile}` : '3D Просмотр'}
              </h2>
              {selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setViewerUrl(null)
                  }}
                >
                  Закрыть
                </Button>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Загрузка просмотра...</p>
                </div>
              ) : viewerUrl ? (
                <iframe
                  ref={viewerRef}
                  src={viewerUrl}
                  className="w-full h-full rounded-lg border-0"
                  title="3D Viewer"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Выберите файл для просмотра</p>
                  <p className="text-sm">
                    Нажмите на кнопку "Просмотр" рядом с файлом
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Инструкции по просмотру:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Используйте мышь для вращения 3D модели</li>
                  <li>• Колесико мыши для масштабирования</li>
                  <li>• Перетаскивание для перемещения</li>
                  <li>• Переключайтесь между срезами в панели инструментов</li>
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
} 
