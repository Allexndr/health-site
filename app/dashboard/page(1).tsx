'use client'

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
        </div>
      </div>
    </div>
  )
}