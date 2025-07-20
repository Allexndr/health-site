'use client'

import { useState } from 'react'

export default function Test3DPage() {
  const [message, setMessage] = useState('Тестирование...')

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Тест 3D компонента</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Статус: {message}</h2>
          
          <div className="bg-black rounded-lg p-4 mb-4" style={{ height: '400px' }}>
            <div className="text-white text-center pt-40">
              3D Viewer будет здесь
            </div>
          </div>
          
          <button 
            onClick={() => setMessage('Компонент работает!')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Тест кнопки
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Консоль логи:</h3>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono">
            {typeof window !== 'undefined' ? 'Клиентский компонент загружен' : 'Серверный рендеринг'}
          </div>
        </div>
      </div>
    </div>
  )
} 