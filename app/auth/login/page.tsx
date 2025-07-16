'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeSlashIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/lib/providers/AuthProvider'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    // Проверяем, есть ли параметр registered для показа уведомления
    if (searchParams.get('registered') === 'true') {
      setSuccess('Клиника успешно зарегистрирована! Войдите в систему, используя созданные данные.')
      
      // Автозаполнение логина если передан
      const username = searchParams.get('username')
      if (username) {
        setFormData(prev => ({ ...prev, username }))
      }
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData)
      
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Ошибка входа в систему')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="bg-blue-600 rounded-lg p-2">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DentalCloud</span>
          </div>

          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите данные вашей стоматологической клиники для доступа к защищённому хранилищу рентгеновских снимков
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Логин клиники
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите логин клиники"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Пароль
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Вход в систему...' : 'Войти в систему'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Нет аккаунта?{' '}
                  <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Зарегистрировать клинику
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Демо данные для тестирования */}
          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Данные для демо-доступа
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Логин:</strong> dental_clinic_1</p>
                    <p><strong>Пароль:</strong> demo123</p>
                    <p className="mt-1 text-xs">*Используйте эти данные для демонстрации системы</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-6">
            Централизованное хранение{' '}
            <span className="text-cyan-300">стоматологических снимков</span>
          </h1>
          
          <p className="text-xl mb-8 text-blue-100">
            Безопасная облачная платформа для хранения и обмена рентгеновскими снимками между главной клиникой и 50 филиалами.
          </p>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Статистика платформы</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-300">50+</div>
                  <div className="text-sm text-blue-200">Стоматологических клиник</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-300">25,000+</div>
                  <div className="text-sm text-blue-200">Рентгеновских снимков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-300">99.9%</div>
                  <div className="text-sm text-blue-200">Надёжность</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-300">8+ ТБ</div>
                  <div className="text-sm text-blue-200">Данных</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span>Быстрая загрузка стоматологических снимков</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span>Доступ к истории пациентов</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span>Обмен снимками между клиниками</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span>Соответствие медицинским стандартам</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 