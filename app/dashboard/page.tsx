'use client'

<<<<<<< HEAD
import React from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Панель управления DentalCloud
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/3d-viewer" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3D Визуализатор</h2>
              <p className="text-gray-600">Профессиональный просмотр CT сканов</p>
            </div>
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Снимки</h2>
            <p className="text-gray-600">Управление рентгеновскими снимками</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Клиники</h2>
            <p className="text-gray-600">Управление клиниками</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Статус:</h3>
          <p className="text-blue-700">✅ Dashboard загружен успешно</p>
          <p className="text-blue-700">✅ Маршрутизация работает</p>
=======
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/providers/AuthProvider'
import { apiClient, Image } from '@/lib/api'
import {
  ArrowUpTrayIcon,
  FolderIcon,
  EyeIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  ServerIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface DashboardStats {
  totalImages: number
  imagesThisWeek: number
  imagesThisMonth: number
  totalStorageUsed: string
  lastUpload: string | null
  topModality: string | null
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    imagesThisWeek: 0,
    imagesThisMonth: 0,
    totalStorageUsed: '0 MB',
    lastUpload: null,
    topModality: null
  })
  const [recentImages, setRecentImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await apiClient.getClinicImages(user._id)
      
      if (response.error) {
        toast.error(response.error)
        return
      }

      const images = response.data || []
      
      // Calculate statistics
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const imagesThisWeek = images.filter(img => 
        new Date(img.created_at) >= oneWeekAgo
      ).length

      const imagesThisMonth = images.filter(img => 
        new Date(img.created_at) >= oneMonthAgo
      ).length

      // Calculate storage used (approximate)
      const averageFileSize = 50 // MB average per image
      const totalStorageMB = images.length * averageFileSize
      const totalStorageUsed = totalStorageMB > 1024 
        ? `${(totalStorageMB / 1024).toFixed(1)} GB` 
        : `${totalStorageMB} MB`

      // Find most common modality
      const modalityCount: { [key: string]: number } = {}
      images.forEach(img => {
        if (img.modality) {
          modalityCount[img.modality] = (modalityCount[img.modality] || 0) + 1
        }
      })
      const topModality = Object.keys(modalityCount).reduce((a, b) => 
        modalityCount[a] > modalityCount[b] ? a : b, 
        Object.keys(modalityCount)[0] || null
      )

      // Get last upload date
      const lastUpload = images.length > 0 
        ? new Date(Math.max(...images.map(img => new Date(img.created_at).getTime())))
        : null

      setStats({
        totalImages: images.length,
        imagesThisWeek,
        imagesThisMonth,
        totalStorageUsed,
        lastUpload: lastUpload?.toISOString() || null,
        topModality
      })

      // Get recent images (last 5)
      const recent = images
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      setRecentImages(recent)

    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000

    if (diffInSeconds < 60) return 'Только что'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дн назад`
    return date.toLocaleDateString('ru-RU')
  }

  const getImagePreview = (image: Image) => {
    if (image.file_path?.includes('cloudinary')) {
      return image.file_path.replace('/upload/', '/upload/w_200,h_200,c_fill/')
    }
    return image.file_path || 'https://placehold.co/200x200/e2e8f0/475569?text=Preview'
  }

  const quickActions = [
    {
      name: 'Загрузить снимки',
      description: 'Добавить новые рентгеновские снимки',
      href: '/dashboard/images/upload',
      icon: ArrowUpTrayIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Галерея снимков',
      description: 'Просмотреть все снимки',
      href: '/dashboard/images',
      icon: PhotoIcon,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Статистика',
      description: 'Подробная аналитика',
      href: '#',
      icon: ChartBarIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Добро пожаловать, {user?.name || 'Клиника'}
              </h1>
              <p className="text-gray-600">
                Обзор активности вашей стоматологической платформы
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PhotoIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Всего снимков
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.totalImages}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      За неделю
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.imagesThisWeek}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ServerIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Использовано
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.totalStorageUsed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Последняя загрузка
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {stats.lastUpload ? formatRelativeTime(stats.lastUpload) : 'Ещё не загружали'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.name}
                      href={action.href}
                      className={`flex items-center p-3 rounded-lg transition-colors ${action.color} text-white group`}
                    >
                      <action.icon className="h-5 w-5 mr-3" />
                      <div>
                        <div className="font-medium">{action.name}</div>
                        <div className="text-sm opacity-90">{action.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о клинике</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Название клиники</span>
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ID входа</span>
                    <span className="text-sm font-medium text-gray-900">{user?.login}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Основной тип снимков</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.topModality || 'Не определен'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Снимков за месяц</span>
                    <span className="text-sm font-medium text-gray-900">{stats.imagesThisMonth}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Images */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Недавние снимки</h3>
                  <Link 
                    href="/dashboard/images"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Смотреть все →
                  </Link>
                </div>
                
                {recentImages.length === 0 ? (
                  <div className="text-center py-12">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Пока нет снимков</h3>
                    <p className="mt-1 text-sm text-gray-500">Начните с загрузки первого снимка.</p>
                    <div className="mt-6">
                      <Link
                        href="/dashboard/images/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                        Загрузить снимок
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {recentImages.map((image) => (
                      <Link
                        key={image.id}
                        href={`/dashboard/images/${image.id}`}
                        className="group relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                      >
                        <div className="flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={getImagePreview(image)}
                            alt={image.filename}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="focus:outline-none">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.filename}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              {image.patient_name && (
                                <span>{image.patient_name}</span>
                              )}
                              {image.modality && (
                                <>
                                  <span>•</span>
                                  <span>{image.modality}</span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(image.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
} 
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
