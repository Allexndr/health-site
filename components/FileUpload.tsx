'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { StorageService, FileMetadata } from '@/lib/services/storage'

interface FileUploadProps {
  onUploadComplete: (url: string) => void
  onError: (error: string) => void
  metadata: Omit<FileMetadata, 'filename'>
}

export default function FileUpload({ onUploadComplete, onError, metadata }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const storageService = new StorageService()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)

    try {
      const fileMetadata: FileMetadata = {
        ...metadata,
        filename: file.name,
      }

      const url = await storageService.uploadFile(file, fileMetadata)
      onUploadComplete(url)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [metadata, onUploadComplete, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/dicom': ['.dcm'],
      'image/x-dicom': ['.dcm'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} disabled={uploading} />
      <div className="space-y-4">
        <div className="flex justify-center">
          {uploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          ) : (
            <svg
              className="h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="text-gray-600">
          {uploading ? (
            'Uploading...'
          ) : isDragActive ? (
            'Drop the file here'
          ) : (
            <>
              <p className="text-lg font-medium">
                Drag and drop your file here, or click to select
              </p>
              <p className="text-sm mt-2">
                Supported formats: DICOM, JPEG, PNG (max 100MB)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 