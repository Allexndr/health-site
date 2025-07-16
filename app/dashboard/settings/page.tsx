'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { 
  CogIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  BellIcon,
  PhotoIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    clinicName: 'Стоматологическая клиника №1',
    clinicAddress: 'ул. Медицинская, д. 123',
    clinicPhone: '+7 (495) 123-45-67',
    clinicEmail: 'info@dental-clinic.ru',
    autoBackup: true,
    notifications: true,
    imageQuality: 'high',
    storageLocation: 'cloud'
  })

  const tabs = [
    { id: 'profile', name: 'Профиль клиники', icon: UserIcon },
    { id: 'security', name: 'Безопасность', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Уведомления', icon: BellIcon },
    { id: 'images', name: 'Настройки снимков', icon: PhotoIcon },
    { id: 'backup', name: 'Резервное копирование', icon: ClipboardDocumentListIcon }
  ]

  const handleSave = () => {
    // Simulate saving settings
    alert('Настройки сохранены!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CogIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
          </div>
          <p className="text-gray-600">Управление настройками клиники и системы</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Профиль клиники</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название клиники
                      </label>
                      <Input
                        value={settings.clinicName}
                        onChange={(e) => setSettings({...settings, clinicName: e.target.value})}
                        placeholder="Введите название клиники"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Адрес
                      </label>
                      <Input
                        value={settings.clinicAddress}
                        onChange={(e) => setSettings({...settings, clinicAddress: e.target.value})}
                        placeholder="Введите адрес клиники"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон
                      </label>
                      <Input
                        value={settings.clinicPhone}
                        onChange={(e) => setSettings({...settings, clinicPhone: e.target.value})}
                        placeholder="Введите телефон"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={settings.clinicEmail}
                        onChange={(e) => setSettings({...settings, clinicEmail: e.target.value})}
                        placeholder="Введите email"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Безопасность</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-800">Двухфакторная аутентификация</h3>
                      <p className="text-sm text-green-600 mt-1">Включена и активна</p>
                      <Button variant="outline" className="mt-2 text-green-700 border-green-300">
                        Настроить
                      </Button>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-800">Смена пароля</h3>
                      <p className="text-sm text-gray-600 mt-1">Последняя смена: 15 дней назад</p>
                      <Button variant="outline" className="mt-2">
                        Сменить пароль
                      </Button>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-800">Журнал входов</h3>
                      <p className="text-sm text-blue-600 mt-1">Посмотреть активность входов в систему</p>
                      <Button variant="outline" className="mt-2 text-blue-700 border-blue-300">
                        Посмотреть журнал
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Уведомления</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium">Уведомления о новых снимках</h3>
                        <p className="text-sm text-gray-600">Получать уведомления при загрузке новых снимков</p>
                      </div>
                      <input type="checkbox" checked={settings.notifications} className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium">Email уведомления</h3>
                        <p className="text-sm text-gray-600">Отправлять важные уведомления на email</p>
                      </div>
                      <input type="checkbox" checked={true} className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium">SMS уведомления</h3>
                        <p className="text-sm text-gray-600">Критические уведомления по SMS</p>
                      </div>
                      <input type="checkbox" checked={false} className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Настройки снимков</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Качество изображений
                      </label>
                      <select 
                        value={settings.imageQuality}
                        onChange={(e) => setSettings({...settings, imageQuality: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="low">Низкое (быстрая загрузка)</option>
                        <option value="medium">Среднее (баланс)</option>
                        <option value="high">Высокое (лучшее качество)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Место хранения
                      </label>
                      <select 
                        value={settings.storageLocation}
                        onChange={(e) => setSettings({...settings, storageLocation: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="cloud">Облачное хранилище</option>
                        <option value="local">Локальный сервер</option>
                        <option value="hybrid">Гибридное хранение</option>
                      </select>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-800">Автоматическое сжатие</h3>
                      <p className="text-sm text-blue-600 mt-1">Снимки автоматически оптимизируются для экономии места</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Резервное копирование</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium">Автоматическое резервное копирование</h3>
                        <p className="text-sm text-gray-600">Ежедневное создание резервных копий</p>
                      </div>
                      <input type="checkbox" checked={settings.autoBackup} className="h-4 w-4" />
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-800">Последняя резервная копия</h3>
                      <p className="text-sm text-green-600 mt-1">Создана: сегодня в 03:00</p>
                      <p className="text-sm text-green-600">Размер: 2.4 ГБ</p>
                      <Button variant="outline" className="mt-2 text-green-700 border-green-300">
                        Скачать копию
                      </Button>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-800">Создать резервную копию сейчас</h3>
                      <p className="text-sm text-gray-600 mt-1">Создать внеплановую резервную копию всех данных</p>
                      <Button className="mt-2">
                        Создать копию
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Сохранить настройки
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 