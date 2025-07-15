'use client'

import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  TrashIcon 
} from '@heroicons/react/24/outline'

const images = [
  {
    id: 1,
    name: 'chest-xray-001.dcm',
    preview: 'https://placehold.co/300x300/e2e8f0/475569?text=X-Ray+Preview',
    patient: 'John Doe',
    date: '2024-01-15',
    type: 'X-Ray',
  },
  {
    id: 2,
    name: 'mri-scan-123.dcm',
    preview: 'https://placehold.co/300x300/e2e8f0/475569?text=MRI+Preview',
    patient: 'Jane Smith',
    date: '2024-01-14',
    type: 'MRI',
  },
  // Add more sample images here
]

export default function ImagesPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <div className="py-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Images</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all medical images in your account
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
              Upload Image
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Search images..."
            />
          </div>
        </div>

        {/* Image Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-lg bg-white shadow"
            >
              <div className="aspect-w-3 aspect-h-3">
                <img
                  src={image.preview}
                  alt={image.name}
                  className="h-full w-full object-cover"
                  onClick={() => setSelectedImage(image.id)}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{image.name}</h3>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Patient</dt>
                    <dd className="mt-1 text-sm text-gray-900">{image.patient}</dd>
                  </div>
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{image.date}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex space-x-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <ShareIcon className="mr-1.5 h-5 w-5 text-gray-400" />
                    Share
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <TrashIcon className="mr-1.5 h-5 w-5 text-gray-400" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={images.find(img => img.id === selectedImage)?.preview}
                  alt="Selected image"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 