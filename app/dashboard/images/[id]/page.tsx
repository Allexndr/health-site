'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ImageViewer } from '@/components/ImageViewer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StorageService } from '@/lib/services/storage'
import { formatDate } from '@/lib/utils'

export default function ImagePage() {
  const params = useParams()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // For MVP, we'll use a placeholder image
        setImageUrl('https://placehold.co/1200x800/e2e8f0/475569?text=X-Ray+Image')
        setMetadata({
          patientId: 'P123456',
          patientName: 'John Doe',
          studyDate: new Date().toISOString(),
          modality: 'X-Ray',
          uploadedBy: 'Dr. Smith',
        })
      } catch (error) {
        console.error('Failed to fetch image:', error)
      }
    }

    fetchImage()
  }, [params.id])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const storageService = new StorageService()
      await storageService.deleteFile(imageUrl!)
      // TODO: Redirect to images list
    } catch (error) {
      console.error('Failed to delete image:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!imageUrl || !metadata) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Image Viewer</h1>
            <p className="mt-2 text-sm text-gray-700">
              View and analyze medical images
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Image
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{metadata.patientId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Patient Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{metadata.patientName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Study Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(new Date(metadata.studyDate))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Modality</dt>
                    <dd className="mt-1 text-sm text-gray-900">{metadata.modality}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{metadata.uploadedBy}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Image Viewer */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <ImageViewer src={imageUrl} alt="Medical image" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Image"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this image? This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
} 