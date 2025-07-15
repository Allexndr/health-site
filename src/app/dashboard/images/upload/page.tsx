'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import FileUpload from '@/components/FileUpload'
import type { FileMetadata } from '@/lib/services/storage'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    patientId: '',
    patientName: '',
    studyDate: new Date().toISOString().split('T')[0],
    modality: 'X-Ray',
    clinicId: user?.clinicId || '',
    uploadedBy: user?.id || '',
  })

  const handleUploadComplete = (url: string) => {
    toast.success('Image uploaded successfully!')
    router.push('/dashboard/images')
  }

  const handleError = (error: string) => {
    toast.error(error)
    setError(error)
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Upload Image</h1>
            <p className="mt-2 text-sm text-gray-700">
              Upload a new medical image with patient information
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
          {/* Patient Information Form */}
          <div className="space-y-6 bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Patient ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="patientId"
                    id="patientId"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={metadata.patientId}
                    onChange={(e) => setMetadata({ ...metadata, patientId: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                  Patient Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="patientName"
                    id="patientName"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={metadata.patientName}
                    onChange={(e) => setMetadata({ ...metadata, patientName: e.target.value })}
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
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={metadata.modality}
                    onChange={(e) => setMetadata({ ...metadata, modality: e.target.value })}
                  >
                    <option>X-Ray</option>
                    <option>CT</option>
                    <option>MRI</option>
                    <option>Ultrasound</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white p-6 rounded-lg shadow">
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              metadata={metadata}
            />
            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 