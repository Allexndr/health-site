'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { apiClient, ImageShare, Image } from '@/lib/api'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShareIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

export default function SharedImagesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'shared'>('incoming')
  const [incomingShares, setIncomingShares] = useState<ImageShare[]>([])
  const [outgoingShares, setOutgoingShares] = useState<ImageShare[]>([])
  const [sharedImages, setSharedImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'incoming') {
        const response = await apiClient.getImageShares('incoming')
        if (response.data) {
          setIncomingShares(response.data)
        }
      } else if (activeTab === 'outgoing') {
        const response = await apiClient.getImageShares('outgoing')
        if (response.data) {
          setOutgoingShares(response.data)
        }
      } else {
        const response = await apiClient.getSharedImages()
        if (response.data) {
          setSharedImages(response.data)
        }
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (shareId: string, status: 'approved' | 'rejected', message?: string) => {
    try {
      setResponding(shareId)
      const response = await apiClient.respondToShare(shareId, {
        shareId,
        status,
        responseMessage: message,
      })

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success(`Request ${status} successfully!`)
      loadData() // Reload data
    } catch (error) {
      toast.error('Failed to respond to request')
    } finally {
      setResponding(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'expired': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="h-5 w-5" />
      case 'rejected': return <XCircleIcon className="h-5 w-5" />
      case 'pending': return <ClockIcon className="h-5 w-5" />
      default: return <ClockIcon className="h-5 w-5" />
    }
  }

  const getShareTypeLabel = (type: string) => {
    switch (type) {
      case 'view': return 'View Only'
      case 'consultation': return 'Consultation'
      case 'transfer': return 'Patient Transfer'
      default: return type
    }
  }

  const getImagePreview = (image: Image) => {
    if (image.file_path.includes('cloudinary')) {
      return image.file_path.replace('/upload/', '/upload/w_200,h_150,c_fit/')
    }
    return 'https://placehold.co/200x150/e2e8f0/475569?text=Medical+Image'
  }

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Shared Images</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage image sharing requests and access shared images from other clinics
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('incoming')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'incoming'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Incoming Requests
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'outgoing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Outgoing Requests
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shared'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shared with Me
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Incoming Requests */}
              {activeTab === 'incoming' && (
                <div className="space-y-4">
                  {incomingShares.length === 0 ? (
                    <div className="text-center py-12">
                      <ShareIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No incoming requests</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        When other clinics share images with you, they will appear here.
                      </p>
                    </div>
                  ) : (
                    incomingShares.map((share) => (
                      <div key={share.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                Share Request from Clinic {share.fromClinicId}
                              </h3>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(share.status)}`}>
                                {getStatusIcon(share.status)}
                                <span className="ml-1">{share.status}</span>
                              </span>
                            </div>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Type:</span> {getShareTypeLabel(share.shareType)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Image ID:</span> {share.imageId}
                              </p>
                              {share.requestMessage && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Message:</span> {share.requestMessage}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                Requested on {new Date(share.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {share.status === 'pending' && (
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => handleResponse(share.id, 'approved')}
                                disabled={responding === share.id}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleResponse(share.id, 'rejected')}
                                disabled={responding === share.id}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                <XCircleIcon className="mr-1.5 h-4 w-4" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Outgoing Requests */}
              {activeTab === 'outgoing' && (
                <div className="space-y-4">
                  {outgoingShares.length === 0 ? (
                    <div className="text-center py-12">
                      <ShareIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No outgoing requests</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Share images with other clinics from the Images page.
                      </p>
                    </div>
                  ) : (
                    outgoingShares.map((share) => (
                      <div key={share.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                Shared with Clinic {share.toClinicId}
                              </h3>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(share.status)}`}>
                                {getStatusIcon(share.status)}
                                <span className="ml-1">{share.status}</span>
                              </span>
                            </div>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Type:</span> {getShareTypeLabel(share.shareType)}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Image ID:</span> {share.imageId}
                              </p>
                              {share.requestMessage && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Your message:</span> {share.requestMessage}
                                </p>
                              )}
                              {share.responseMessage && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Response:</span> {share.responseMessage}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                Sent on {new Date(share.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Shared Images */}
              {activeTab === 'shared' && (
                <div>
                  {sharedImages.length === 0 ? (
                    <div className="text-center py-12">
                      <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No shared images</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Images shared with you by other clinics will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {sharedImages.map((image) => (
                        <div key={image.id} className="relative overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow">
                          <div className="aspect-w-3 aspect-h-3">
                            <img
                              src={getImagePreview(image)}
                              alt={image.filename}
                              className="h-48 w-full object-cover"
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
                              {image.modality && (
                                <div className="col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">Modality</dt>
                                  <dd className="mt-1 text-sm text-gray-900">{image.modality}</dd>
                                </div>
                              )}
                              <div className="col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Shared from</dt>
                                <dd className="mt-1 text-sm text-gray-900">Clinic {(image as any).sharedFrom}</dd>
                              </div>
                            </dl>
                            <div className="mt-4 flex space-x-2">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              >
                                <EyeIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                                View
                              </button>
                              {(image as any).shareType === 'consultation' && (
                                <button
                                  type="button"
                                  className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-50"
                                >
                                  <ChatBubbleLeftIcon className="mr-1.5 h-4 w-4 text-blue-500" />
                                  Consult
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 