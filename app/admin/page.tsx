'use client'

import { useState, useEffect } from 'react'
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  EyeIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'

interface Clinic {
  id: string
  clinicName: string
  ownerName: string
  email: string
  phone: string
  city: string
  address: string
  username: string
  status: 'active' | 'pending_approval'
  registeredAt: string
}

interface AdminStats {
  clinics: Clinic[]
  total: number
  pending: number
  active: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const loadClinics = async () => {
    try {
      const response = await fetch(`/api/auth/register?admin_key=${adminKey}`)
      const data = await response.json()

      if (response.ok) {
        setStats(data)
        setIsAuthenticated(true)
      } else {
        setError(data.error || 'Ошибка загрузки данных')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    loadClinics()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="bg-blue-600 rounded-lg p-2">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DentalCloud Admin</span>
          </div>

          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Административная панель
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Управление стоматологическими клиниками
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                  Администраторский ключ
                </label>
                <div className="mt-1">
                  <input
                    id="adminKey"
                    name="adminKey"
                    type="password"
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите админский ключ"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Проверка...' : 'Войти'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  <strong>Демо ключ:</strong> admin_secret_key_2025
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DentalCloud Admin</span>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setAdminKey('')
                setStats(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Управление клиниками</h1>
            <p className="mt-2 text-gray-600">
              Статистика и управление зарегистрированными стоматологическими клиниками
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Всего клиник
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.total || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Активные
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.active || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ожидают одобрения
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.pending || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Сегодня регистраций
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.clinics.filter(c => 
                          new Date(c.registeredAt).toDateString() === new Date().toDateString()
                        ).length || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Список клиник */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Зарегистрированные клиники
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Полный список стоматологических клиник в системе
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {stats?.clinics.map((clinic) => (
                <li key={clinic.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {clinic.clinicName}
                            </p>
                            <div className="ml-2">
                              {clinic.status === 'active' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Активна
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Ожидает одобрения
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {clinic.ownerName} • {clinic.city}
                          </p>
                          <p className="text-sm text-gray-500">
                            {clinic.email} • {clinic.phone}
                          </p>
                          <p className="text-xs text-gray-400">
                            Логин: {clinic.username} • Регистрация: {new Date(clinic.registeredAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {stats?.clinics.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет зарегистрированных клиник</h3>
              <p className="mt-1 text-sm text-gray-500">
                Клиники появятся здесь после регистрации.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 