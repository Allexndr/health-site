'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as JSZip from 'jszip'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { 
  ArrowUpTrayIcon, 
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Upload3DProps {
  onUploadComplete: (files: File[], metadata: PatientData) => void
}

interface PatientData {
  patientId: string
  patientName: string
  patientFamilyName: string
  patientMiddleName: string
  patientGivenName: string
  birthDay: string
  sex: string
  photoDate: string
  ctTaskId: string
  comment: string
}

function Upload3D({ onUploadComplete }: Upload3DProps) {
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [dicomFiles, setDicomFiles] = useState<File[]>([])
  const [metadata, setMetadata] = useState<PatientData>({
    patientId: '',
    patientName: '',
    patientFamilyName: '',
    patientMiddleName: '',
    patientGivenName: '',
    birthDay: '',
    sex: '',
    photoDate: '',
    ctTaskId: '',
    comment: ''
  })

  // Check if file is DICOM based on extension or content
  const isDicomFile = (filename: string, content?: Uint8Array): boolean => {
    // Check file extension
    const ext = filename.toLowerCase()
    if (ext.endsWith('.dcm') || ext.endsWith('.dicom')) return true
    
    // Check DICOM magic bytes if content is provided
    if (content && content.length >= 132) {
      const magicBytes = content.slice(128, 132)
      const magicString = String.fromCharCode.apply(null, Array.from(magicBytes))
      return magicString === 'DICM'
    }
    
    // Check for common DICOM file patterns
    return /\.(dcm|dicom|ima|img)$/i.test(filename) || 
           /^(CT|MR|US|CR|DX|MG|RF|XA|SC|OT)[\d\-_]/i.test(filename) ||
           /[\d\-_]+\.?\d*$/i.test(filename)
  }

  // Parse ver_ctrl.txt file for OneVolumeViewer metadata
  const parseVerCtrlFile = (content: string): Partial<PatientData> => {
    const metadata: Partial<PatientData> = {}
    
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("'")) continue
      
      const match = trimmed.match(/^(\w+)\s*=\s*"([^"]*)"/)
      if (match) {
        const [, key, value] = match
        switch (key) {
          case 'PatientID':
            metadata.patientId = value
            break
          case 'PatientName':
            metadata.patientName = value
            break
          case 'PatientStdFamilyName':
            metadata.patientFamilyName = value
            break
          case 'PatientStdMiddleName':
            metadata.patientMiddleName = value
            break
          case 'PatientStdGivenName':
            metadata.patientGivenName = value
            break
          case 'BirthDay':
            metadata.birthDay = value
            break
          case 'Sex':
            metadata.sex = value
            break
          case 'PhotoDate':
            metadata.photoDate = value
            break
          case 'CTTaskID':
            metadata.ctTaskId = value
            break
          case 'Comment':
            metadata.comment = value
            break
        }
      }
    }
    
    return metadata
  }

  // Extract DICOM files from ZIP archive
  const extractDicomFromZip = async (file: File): Promise<File[]> => {
    setExtracting(true)
    
    try {
      const zip = new JSZip.default()
      const contents = await zip.loadAsync(file)
      const dicomFiles: File[] = []
      let foundMetadata: Partial<PatientData> = {}
      
      // Process each file in the ZIP
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if ((zipEntry as any).dir) continue // Skip directories
        
        try {
          // Check for ver_ctrl.txt file
          if (filename.toLowerCase().includes('ver_ctrl.txt')) {
            const content = await (zipEntry as any).async('text')
            foundMetadata = parseVerCtrlFile(content)
            console.log('Found OneVolumeViewer metadata:', foundMetadata)
          } else {
            const content = await (zipEntry as any).async('uint8array')
            
            // Check if this is a DICOM file
            if (isDicomFile(filename, content)) {
              const dicomFile = new File([content], filename, {
                type: 'application/dicom'
              })
              dicomFiles.push(dicomFile)
            }
          }
        } catch (err) {
          console.warn(`Error processing file ${filename}:`, err)
        }
      }
      
      if (dicomFiles.length === 0) {
        throw new Error('В архиве не найдено DICOM файлов')
      }
      
      // Update metadata if we found ver_ctrl.txt
      if (Object.keys(foundMetadata).length > 0) {
        setMetadata(prev => ({ ...prev, ...foundMetadata }))
      }
      
      // Sort files by name (basic sorting, could be improved with DICOM tag parsing)
      dicomFiles.sort((a, b) => a.name.localeCompare(b.name))
      
      return dicomFiles
    } finally {
      setExtracting(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    
    try {
      const file = acceptedFiles[0]
      let extractedFiles: File[] = []

      if (file.name.toLowerCase().endsWith('.zip')) {
        // Extract DICOM files from ZIP
        extractedFiles = await extractDicomFromZip(file)
      } else if (isDicomFile(file.name)) {
        // Single DICOM file
        extractedFiles = [file]
      } else {
        // Try to process as DICOM even without proper extension
        const content = new Uint8Array(await file.arrayBuffer())
        if (isDicomFile(file.name, content)) {
          extractedFiles = [file]
        } else {
          throw new Error('Неподдерживаемый формат файла. Загрузите ZIP архив с DICOM файлами или отдельные DICOM файлы.')
        }
      }

      setDicomFiles(extractedFiles)
      
    } catch (error) {
      console.error('Upload error:', error)
      // Show error in component state instead of callback
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/dicom': ['.dcm', '.dicom'],
      'application/octet-stream': ['.dcm', '.dicom', '.ima', '.img']
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    multiple: false,
  })

  const handleSubmit = () => {
    if (dicomFiles.length === 0) {
      alert('Не загружены DICOM файлы')
      return
    }

    if (!metadata.patientName.trim()) {
      alert('Введите имя пациента')
      return
    }

    onUploadComplete(dicomFiles, metadata)
  }

  const handleReset = () => {
    setDicomFiles([])
    setMetadata({
      patientId: '',
      patientName: '',
      patientFamilyName: '',
      patientMiddleName: '',
      patientGivenName: '',
      birthDay: '',
      sex: '',
      photoDate: '',
      ctTaskId: '',
      comment: ''
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Загрузка 3D снимка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading || extracting ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading || extracting ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-lg">
                  {extracting ? 'Извлечение DICOM файлов...' : 'Загрузка файла...'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ArrowUpTrayIcon className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Отпустите файл здесь' : 'Перетащите файл или нажмите для выбора'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Поддерживаются: ZIP архивы с DICOM файлами, отдельные .dcm файлы
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Максимальный размер: 2ГБ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          {dicomFiles.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Загружено {dicomFiles.length} DICOM файлов
                </span>
              </div>
              <div className="text-sm text-green-700">
                <p>Общий размер: {(dicomFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} МБ</p>
                <p>Первый файл: {dicomFiles[0]?.name}</p>
                {dicomFiles.length > 1 && (
                  <p>Последний файл: {dicomFiles[dicomFiles.length - 1]?.name}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Metadata */}
      {dicomFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Информация о пациенте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Имя пациента *
                </label>
                <Input
                  value={metadata.patientName}
                  onChange={(e) => setMetadata({ ...metadata, patientName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID пациента
                </label>
                <Input
                  value={metadata.patientId}
                  onChange={(e) => setMetadata({ ...metadata, patientId: e.target.value })}
                  placeholder="P123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Дата рождения
                </label>
                <Input
                  value={metadata.birthDay}
                  onChange={(e) => setMetadata({ ...metadata, birthDay: e.target.value })}
                  placeholder="YYYYMMDD"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  CT Task ID
                </label>
                <Input
                  value={metadata.ctTaskId}
                  onChange={(e) => setMetadata({ ...metadata, ctTaskId: e.target.value })}
                  placeholder="Идентификатор задачи CT"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Комментарии
              </label>
              <textarea
                value={metadata.comment}
                onChange={(e) => setMetadata({ ...metadata, comment: e.target.value })}
                placeholder="Дополнительная информация об исследовании..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!metadata.patientName.trim()}
                className="flex-1"
              >
                Открыть 3D просмотрщик
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
              >
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <h4 className="font-semibold mb-2">Поддерживаемые форматы:</h4>
            <ul className="space-y-1">
              <li>• <strong>ZIP архивы</strong> с DICOM файлами (как от OneVolumeViewer)</li>
              <li>• <strong>Отдельные DICOM файлы</strong> (.dcm, .dicom)</li>
              <li>• <strong>Файлы без расширения</strong> с DICOM содержимым</li>
            </ul>
            <p className="mt-3 text-xs">
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              Система автоматически определяет DICOM файлы по содержимому и извлекает их из архивов.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { Upload3D }
export default Upload3D 
 

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as JSZip from 'jszip'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { 
  ArrowUpTrayIcon, 
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Upload3DProps {
  onUploadComplete: (files: File[], metadata: PatientData) => void
}

interface PatientData {
  patientId: string
  patientName: string
  patientFamilyName: string
  patientMiddleName: string
  patientGivenName: string
  birthDay: string
  sex: string
  photoDate: string
  ctTaskId: string
  comment: string
}

function Upload3D({ onUploadComplete }: Upload3DProps) {
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [dicomFiles, setDicomFiles] = useState<File[]>([])
  const [metadata, setMetadata] = useState<PatientData>({
    patientId: '',
    patientName: '',
    patientFamilyName: '',
    patientMiddleName: '',
    patientGivenName: '',
    birthDay: '',
    sex: '',
    photoDate: '',
    ctTaskId: '',
    comment: ''
  })

  // Check if file is DICOM based on extension or content
  const isDicomFile = (filename: string, content?: Uint8Array): boolean => {
    // Check file extension
    const ext = filename.toLowerCase()
    if (ext.endsWith('.dcm') || ext.endsWith('.dicom')) return true
    
    // Check DICOM magic bytes if content is provided
    if (content && content.length >= 132) {
      const magicBytes = content.slice(128, 132)
      const magicString = String.fromCharCode.apply(null, Array.from(magicBytes))
      return magicString === 'DICM'
    }
    
    // Check for common DICOM file patterns
    return /\.(dcm|dicom|ima|img)$/i.test(filename) || 
           /^(CT|MR|US|CR|DX|MG|RF|XA|SC|OT)[\d\-_]/i.test(filename) ||
           /[\d\-_]+\.?\d*$/i.test(filename)
  }

  // Parse ver_ctrl.txt file for OneVolumeViewer metadata
  const parseVerCtrlFile = (content: string): Partial<PatientData> => {
    const metadata: Partial<PatientData> = {}
    
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("'")) continue
      
      const match = trimmed.match(/^(\w+)\s*=\s*"([^"]*)"/)
      if (match) {
        const [, key, value] = match
        switch (key) {
          case 'PatientID':
            metadata.patientId = value
            break
          case 'PatientName':
            metadata.patientName = value
            break
          case 'PatientStdFamilyName':
            metadata.patientFamilyName = value
            break
          case 'PatientStdMiddleName':
            metadata.patientMiddleName = value
            break
          case 'PatientStdGivenName':
            metadata.patientGivenName = value
            break
          case 'BirthDay':
            metadata.birthDay = value
            break
          case 'Sex':
            metadata.sex = value
            break
          case 'PhotoDate':
            metadata.photoDate = value
            break
          case 'CTTaskID':
            metadata.ctTaskId = value
            break
          case 'Comment':
            metadata.comment = value
            break
        }
      }
    }
    
    return metadata
  }

  // Extract DICOM files from ZIP archive
  const extractDicomFromZip = async (file: File): Promise<File[]> => {
    setExtracting(true)
    
    try {
      const zip = new JSZip.default()
      const contents = await zip.loadAsync(file)
      const dicomFiles: File[] = []
      let foundMetadata: Partial<PatientData> = {}
      
      // Process each file in the ZIP
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if ((zipEntry as any).dir) continue // Skip directories
        
        try {
          // Check for ver_ctrl.txt file
          if (filename.toLowerCase().includes('ver_ctrl.txt')) {
            const content = await (zipEntry as any).async('text')
            foundMetadata = parseVerCtrlFile(content)
            console.log('Found OneVolumeViewer metadata:', foundMetadata)
          } else {
            const content = await (zipEntry as any).async('uint8array')
            
            // Check if this is a DICOM file
            if (isDicomFile(filename, content)) {
              const dicomFile = new File([content], filename, {
                type: 'application/dicom'
              })
              dicomFiles.push(dicomFile)
            }
          }
        } catch (err) {
          console.warn(`Error processing file ${filename}:`, err)
        }
      }
      
      if (dicomFiles.length === 0) {
        throw new Error('В архиве не найдено DICOM файлов')
      }
      
      // Update metadata if we found ver_ctrl.txt
      if (Object.keys(foundMetadata).length > 0) {
        setMetadata(prev => ({ ...prev, ...foundMetadata }))
      }
      
      // Sort files by name (basic sorting, could be improved with DICOM tag parsing)
      dicomFiles.sort((a, b) => a.name.localeCompare(b.name))
      
      return dicomFiles
    } finally {
      setExtracting(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    
    try {
      const file = acceptedFiles[0]
      let extractedFiles: File[] = []

      if (file.name.toLowerCase().endsWith('.zip')) {
        // Extract DICOM files from ZIP
        extractedFiles = await extractDicomFromZip(file)
      } else if (isDicomFile(file.name)) {
        // Single DICOM file
        extractedFiles = [file]
      } else {
        // Try to process as DICOM even without proper extension
        const content = new Uint8Array(await file.arrayBuffer())
        if (isDicomFile(file.name, content)) {
          extractedFiles = [file]
        } else {
          throw new Error('Неподдерживаемый формат файла. Загрузите ZIP архив с DICOM файлами или отдельные DICOM файлы.')
        }
      }

      setDicomFiles(extractedFiles)
      
    } catch (error) {
      console.error('Upload error:', error)
      // Show error in component state instead of callback
      alert(error instanceof Error ? error.message : 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/dicom': ['.dcm', '.dicom'],
      'application/octet-stream': ['.dcm', '.dicom', '.ima', '.img']
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    multiple: false,
  })

  const handleSubmit = () => {
    if (dicomFiles.length === 0) {
      alert('Не загружены DICOM файлы')
      return
    }

    if (!metadata.patientName.trim()) {
      alert('Введите имя пациента')
      return
    }

    onUploadComplete(dicomFiles, metadata)
  }

  const handleReset = () => {
    setDicomFiles([])
    setMetadata({
      patientId: '',
      patientName: '',
      patientFamilyName: '',
      patientMiddleName: '',
      patientGivenName: '',
      birthDay: '',
      sex: '',
      photoDate: '',
      ctTaskId: '',
      comment: ''
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpTrayIcon className="h-5 w-5" />
            Загрузка 3D снимка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading || extracting ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading || extracting ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-lg">
                  {extracting ? 'Извлечение DICOM файлов...' : 'Загрузка файла...'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <ArrowUpTrayIcon className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Отпустите файл здесь' : 'Перетащите файл или нажмите для выбора'}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Поддерживаются: ZIP архивы с DICOM файлами, отдельные .dcm файлы
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Максимальный размер: 2ГБ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          {dicomFiles.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Загружено {dicomFiles.length} DICOM файлов
                </span>
              </div>
              <div className="text-sm text-green-700">
                <p>Общий размер: {(dicomFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} МБ</p>
                <p>Первый файл: {dicomFiles[0]?.name}</p>
                {dicomFiles.length > 1 && (
                  <p>Последний файл: {dicomFiles[dicomFiles.length - 1]?.name}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Metadata */}
      {dicomFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Информация о пациенте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Имя пациента *
                </label>
                <Input
                  value={metadata.patientName}
                  onChange={(e) => setMetadata({ ...metadata, patientName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID пациента
                </label>
                <Input
                  value={metadata.patientId}
                  onChange={(e) => setMetadata({ ...metadata, patientId: e.target.value })}
                  placeholder="P123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Дата рождения
                </label>
                <Input
                  value={metadata.birthDay}
                  onChange={(e) => setMetadata({ ...metadata, birthDay: e.target.value })}
                  placeholder="YYYYMMDD"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  CT Task ID
                </label>
                <Input
                  value={metadata.ctTaskId}
                  onChange={(e) => setMetadata({ ...metadata, ctTaskId: e.target.value })}
                  placeholder="Идентификатор задачи CT"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Комментарии
              </label>
              <textarea
                value={metadata.comment}
                onChange={(e) => setMetadata({ ...metadata, comment: e.target.value })}
                placeholder="Дополнительная информация об исследовании..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!metadata.patientName.trim()}
                className="flex-1"
              >
                Открыть 3D просмотрщик
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
              >
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <h4 className="font-semibold mb-2">Поддерживаемые форматы:</h4>
            <ul className="space-y-1">
              <li>• <strong>ZIP архивы</strong> с DICOM файлами (как от OneVolumeViewer)</li>
              <li>• <strong>Отдельные DICOM файлы</strong> (.dcm, .dicom)</li>
              <li>• <strong>Файлы без расширения</strong> с DICOM содержимым</li>
            </ul>
            <p className="mt-3 text-xs">
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              Система автоматически определяет DICOM файлы по содержимому и извлекает их из архивов.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { Upload3D }
export default Upload3D 
 
 
 
 
 
 
 
 
 
 
 