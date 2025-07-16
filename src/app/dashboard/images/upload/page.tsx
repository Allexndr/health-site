'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { StorageService } from '@/lib/services/storage'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [metadata, setMetadata] = useState({
    patientId: '',
    patientName: '',
    studyDate: new Date().toISOString().split('T')[0],
    modality: 'X-Ray',
  })

  const storageService = new StorageService()

  const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name}: File too large (max 1GB)`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name}: Invalid file type`)
        } else {
          toast.error(`${file.name}: ${error.message}`)
        }
      })
    })

    // Add accepted files
    setFiles(prev => [...prev, ...acceptedFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/dicom': ['.dcm'],
      'image/x-dicom': ['.dcm'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/dicom': ['.dcm'],
    },
    maxSize: 1024 * 1024 * 1024, // 1GB
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    // Clear any associated progress/errors
    const fileName = files[index]?.name
    if (fileName) {
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[fileName]
        return newProgress
      })
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fileName]
        return newErrors
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes('dicom')) {
      return '🩻' // Medical icon for DICOM
    } else if (file.type.includes('image')) {
      return '📷' // Camera icon for images
    }
    return '📄' // Document icon as fallback
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    if (!metadata.patientName.trim()) {
      toast.error('Please enter patient name')
      return
    }

    if (!user) {
      toast.error('User not authenticated')
      return
    }

    setUploading(true)
    setErrors({})
    setUploadedFiles([])

    try {
      for (const file of files) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const currentProgress = prev[file.name] || 0
              if (currentProgress < 90) {
                return { ...prev, [file.name]: currentProgress + 10 }
              }
              return prev
            })
          }, 200)

          const fileMetadata = {
            filename: file.name,
            patientId: metadata.patientId,
            patientName: metadata.patientName,
            studyDate: metadata.studyDate,
            modality: metadata.modality,
            clinicId: user._id,
            uploadedBy: user._id,
          }

          const url = await storageService.uploadFile(file, fileMetadata)

          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          setUploadedFiles(prev => [...prev, file.name])

          toast.success(`${file.name} uploaded successfully!`)
        } catch (error) {
          setErrors(prev => ({
            ...prev,
            [file.name]: error instanceof Error ? error.message : 'Upload failed'
          }))
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      // If all files uploaded successfully, redirect after a delay
      if (Object.keys(errors).length === 0) {
        setTimeout(() => {
          router.push('/dashboard/images')
        }, 2000)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Upload Images</h1>
            <p className="mt-2 text-sm text-gray-700">
              Upload medical images with patient information to your secure storage
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-4xl">
          {/* Patient Information Form */}
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Patient ID <span className="text-gray-400">(optional)</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="patientId"
                    id="patientId"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={metadata.patientId}
                    onChange={(e) => setMetadata({ ...metadata, patientId: e.target.value })}
                    placeholder="e.g., PAT001"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="patientName"
                    id="patientName"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={metadata.patientName}
                    onChange={(e) => setMetadata({ ...metadata, patientName: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="studyDate" className="block text-sm font-medium text-gray-700">
                  Study Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="studyDate"
                    id="studyDate"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={metadata.studyDate}
                    onChange={(e) => setMetadata({ ...metadata, studyDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modality" className="block text-sm font-medium text-gray-700">
                  Modality
                </label>
                <div className="mt-1">
                  <select
                    id="modality"
                    name="modality"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={metadata.modality}
                    onChange={(e) => setMetadata({ ...metadata, modality: e.target.value })}
                  >
                    <option value="X-Ray">X-Ray</option>
                    <option value="CT">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="Mammography">Mammography</option>
                    <option value="PET">PET Scan</option>
                    <option value="Nuclear Medicine">Nuclear Medicine</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Files</h3>
            
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all duration-200 ease-in-out
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} disabled={uploading} />
              <div className="space-y-4">
                <div className="flex justify-center">
                  <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="text-gray-600">
                  {isDragActive ? (
                    <p className="text-lg font-medium text-blue-600">
                      Drop the files here...
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-medium">
                        Drag and drop your files here, or click to select
                      </p>
                      <p className="text-sm mt-2 text-gray-500">
                        Supported formats: DICOM (.dcm), JPEG, PNG • Max size: 1GB per file
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Selected Files ({files.length})
                </h4>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-2xl">{getFileIcon(file)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                          </p>
                          
                          {/* Progress Bar */}
                          {uploadProgress[file.name] !== undefined && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className={
                                  uploadedFiles.includes(file.name) 
                                    ? 'text-green-600' 
                                    : errors[file.name] 
                                      ? 'text-red-600' 
                                      : 'text-gray-600'
                                }>
                                  {uploadedFiles.includes(file.name) 
                                    ? 'Uploaded successfully' 
                                    : errors[file.name] 
                                      ? errors[file.name]
                                      : `Uploading... ${uploadProgress[file.name]}%`
                                  }
                                </span>
                                <span className="text-gray-500">
                                  {uploadProgress[file.name]}%
                                </span>
                              </div>
                              <div className="mt-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    uploadedFiles.includes(file.name)
                                      ? 'bg-green-500'
                                      : errors[file.name]
                                        ? 'bg-red-500'
                                        : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${uploadProgress[file.name] || 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {uploadedFiles.includes(file.name) && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                        {errors[file.name] && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        )}
                        {!uploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  disabled={uploading}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={uploadFiles}
                  disabled={uploading || !metadata.patientName.trim()}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    `Upload ${files.length} file${files.length > 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 