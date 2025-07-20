'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8">
<<<<<<< HEAD
              <div className="bg-blue-600 rounded-lg p-2">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
=======
            <div className="bg-blue-600 rounded-lg p-2">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
            <span className="text-xl font-bold text-gray-900">DentalCloud</span>
          </div>

          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
<<<<<<< HEAD
              Вход в систему
            </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите данные вашей стоматологической клиники для доступа к защищённому хранилищу рентгеновских снимков
            </p>
          </div>
=======
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите данные вашей стоматологической клиники для доступа к защищённому хранилищу рентгеновских снимков
          </p>
        </div>
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Suspense fallback={<div className="text-center p-8">Загрузка формы...</div>}>
            <LoginForm />
          </Suspense>

          {/* Демо данные для тестирования */}
<<<<<<< HEAD
            <div className="mt-8">
=======
          <div className="mt-8">
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
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
<<<<<<< HEAD
              </h1>
          <p className="text-xl mb-8 text-blue-100">
            Безопасная облачная платформа для хранения и обмена рентгеновскими снимками между главной клиникой и 50 филиалами.
              </p>
=======
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Безопасная облачная платформа для хранения и обмена рентгеновскими снимками между главной клиникой и 50 филиалами.
          </p>
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
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