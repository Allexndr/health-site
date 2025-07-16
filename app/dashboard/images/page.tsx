'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/providers/AuthProvider'
import { apiClient, Image, Clinic } from '@/lib/api'
import { 
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  TrashIcon,
  EyeIcon 
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

export default function ImagesPage() {
  const { user } = useAuth()
  const [images, setImages] = useState<Image[]>([])
  const [filteredImages, setFilteredImages] = useState<Image[]>([])
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModality, setSelectedModality] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [shareImage, setShareImage] = useState<Image | null>(null)
  const [shareType, setShareType] = useState<'view' | 'consultation' | 'transfer'>('view')
  const [shareMessage, setShareMessage] = useState('')
  const [selectedClinic, setSelectedClinic] = useState('')
  const [sharing, setSharing] = useState(false)
  const [clinics, setClinics] = useState<Clinic[]>([])

  useEffect(() => {
    if (user) {
      loadImages()
      loadClinics()
    }
  }, [user])

  useEffect(() => {
    filterImages()
  }, [images, searchTerm, selectedModality])

  const loadImages = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await apiClient.getClinicImages(user._id)
      
      if (response.error) {
        toast.error(response.error)
        return
      }

      setImages(response.data || [])
    } catch (error) {
      toast.error('Не удалось загрузить снимки')
    } finally {
      setLoading(false)
    }
  }

  const filterImages = () => {
    let filtered = images

    if (searchTerm) {
      filtered = filtered.filter(image => 
        image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedModality) {
      filtered = filtered.filter(image => image.modality === selectedModality)
    }

    setFilteredImages(filtered)
  }

  const loadClinics = async () => {
    try {
      const response = await apiClient.getClinics()
      if (response.data) {
        // Фильтруем свою клинику из списка
        const otherClinics = response.data.filter(clinic => clinic._id !== user?._id)
        setClinics(otherClinics)
      }
    } catch (error) {
      console.error('Не удалось загрузить клиники:', error)
    }
  }

  const handleShareImage = async () => {
    if (!shareImage || !selectedClinic) {
      toast.error('Выберите клинику для обмена')
      return
    }

    try {
      setSharing(true)
      const response = await apiClient.shareImage({
        imageId: shareImage.id,
        toClinicId: selectedClinic,
        shareType,
        requestMessage: shareMessage || undefined,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success(`Share request sent successfully!`)
      setShareImage(null)
      setShareMessage('')
      setSelectedClinic('')
      setShareType('view')
    } catch (error) {
      toast.error('Failed to share image')
    } finally {
      setSharing(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await apiClient.deleteImage(imageId)
      
      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success('Image deleted successfully')
      setImages(images.filter(img => img.id !== imageId))
      setDeleteConfirm(null)
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const getImagePreview = (image: Image) => {
    // For Cloudinary URLs, we can generate thumbnails
    if (image.file_path?.includes('cloudinary')) {
      return image.file_path.replace('/upload/', '/upload/w_300,h_300,c_fill/')
    }
    // Fallback to original image
    return image.file_path || 'https://placehold.co/300x300/e2e8f0/475569?text=No+Preview'
  }

  const modalities = Array.from(new Set(images.map(img => img.modality).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Images</h1>
            <p className="mt-2 text-sm text-gray-700">
              Medical images for {user?.name || 'your clinic'} ({filteredImages.length} images)
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/dashboard/images/upload"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
              Upload Image
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Search images, patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Modality Filter */}
          <div>
            <select
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
            >
              <option value="">All Modalities</option>
              {modalities.map(modality => (
                <option key={modality} value={modality}>{modality}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedModality) && (
            <div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedModality('')
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Image Grid */}
        <div className="mt-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {images.length === 0 ? 'No images uploaded yet' : 'No images match your filters'}
              </div>
              {images.length === 0 && (
                <Link
                  href="/dashboard/images/upload"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                  Upload your first image
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
                >
                  <div className="aspect-w-3 aspect-h-3">
                    <img
                      src={getImagePreview(image)}
                      alt={image.filename}
                      className="h-48 w-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{image.filename}</h3>
                    <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      {image.patient_name && (
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Patient</dt>
                          <dd className="mt-1 text-sm text-gray-900">{image.patient_name}</dd>
                        </div>
                      )}
                      {image.study_date && (
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{new Date(image.study_date).toLocaleDateString()}</dd>
                        </div>
                      )}
                      {image.modality && (
                        <div className="col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Modality</dt>
                          <dd className="mt-1 text-sm text-gray-900">{image.modality}</dd>
                        </div>
                      )}
                      <div className="col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(image.created_at).toLocaleDateString()}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        <EyeIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareImage(image)}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-50"
                      >
                        <ShareIcon className="mr-1.5 h-4 w-4 text-blue-500" />
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(image.id)}
                        className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                      >
                        <TrashIcon className="mr-1.5 h-4 w-4 text-red-500" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedImage(null)}
            />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 sm:align-middle">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedImage.filename}</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={selectedImage.file_path}
                  alt={selectedImage.filename}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                {selectedImage.patient_name && (
                  <div>
                    <span className="font-medium text-gray-500">Patient:</span> {selectedImage.patient_name}
                  </div>
                )}
                {selectedImage.patient_id && (
                  <div>
                    <span className="font-medium text-gray-500">Patient ID:</span> {selectedImage.patient_id}
                  </div>
                )}
                {selectedImage.modality && (
                  <div>
                    <span className="font-medium text-gray-500">Modality:</span> {selectedImage.modality}
                  </div>
                )}
                {selectedImage.study_date && (
                  <div>
                    <span className="font-medium text-gray-500">Study Date:</span> {new Date(selectedImage.study_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Delete Image
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this image? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteImage(deleteConfirm)}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Image Modal */}
      {shareImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShareImage(null)}
            />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ShareIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Share &quot;{shareImage.filename}&quot;
                  </h3>
                  <div className="mt-4 space-y-4">
                    {/* Clinic Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Share with clinic
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={selectedClinic}
                        onChange={(e) => setSelectedClinic(e.target.value)}
                      >
                        <option value="">Select a clinic...</option>
                        {clinics.map((clinic) => (
                          <option key={clinic._id} value={clinic._id}>
                            {clinic.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Share Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Share type
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={shareType}
                        onChange={(e) => setShareType(e.target.value as 'view' | 'consultation' | 'transfer')}
                      >
                        <option value="view">View only</option>
                        <option value="consultation">Request consultation</option>
                        <option value="transfer">Transfer patient</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Message (optional)
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Add a message for the receiving clinic..."
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleShareImage}
                  disabled={!selectedClinic || sharing}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {sharing ? 'Sharing...' : 'Send Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShareImage(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 