import Link from 'next/link'
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  ClipboardDocumentListIcon as DatabaseIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const settingsCategories = [
  {
    id: 'profile',
    title: 'Профиль пользователя',
    description: 'Управление личными данными и настройками аккаунта',
    icon: UserIcon,
    color: 'from-blue-500 to-indigo-600',
    items: [
      { name: 'Личная информация', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Фото профиля', status: 'Настроено', lastUpdate: '2024-01-10' },
      { name: 'Контактные данные', status: 'Требует обновления', lastUpdate: '2023-12-20' },
      { name: 'Настройки уведомлений', status: 'Настроено', lastUpdate: '2024-01-12' }
    ]
  },
  {
    id: 'security',
    title: 'Безопасность',
    description: 'Настройки безопасности и конфиденциальности',
    icon: ShieldCheckIcon,
    color: 'from-red-500 to-pink-600',
    items: [
      { name: 'Пароль', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Двухфакторная аутентификация', status: 'Не настроено', lastUpdate: null },
      { name: 'История входов', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Разрешения API', status: 'Настроено', lastUpdate: '2024-01-08' }
    ]
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    description: 'Настройки уведомлений и оповещений',
    icon: BellIcon,
    color: 'from-yellow-500 to-orange-600',
    items: [
      { name: 'Email уведомления', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Push уведомления', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'SMS уведомления', status: 'Не настроено', lastUpdate: null },
      { name: 'Напоминания о записях', status: 'Настроено', lastUpdate: '2024-01-10' }
    ]
  },
  {
    id: 'appearance',
    title: 'Внешний вид',
    description: 'Настройки интерфейса и темы оформления',
    icon: PaintBrushIcon,
    color: 'from-purple-500 to-pink-600',
    items: [
      { name: 'Тема оформления', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Язык интерфейса', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Размер шрифта', status: 'Настроено', lastUpdate: '2024-01-12' },
      { name: 'Цветовая схема', status: 'Настроено', lastUpdate: '2024-01-10' }
    ]
  },
  {
    id: 'data',
    title: 'Данные и резервное копирование',
    description: 'Управление данными и настройки резервного копирования',
    icon: DatabaseIcon,
    color: 'from-green-500 to-emerald-600',
    items: [
      { name: 'Автоматическое резервное копирование', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Экспорт данных', status: 'Настроено', lastUpdate: '2024-01-12' },
      { name: 'Очистка кэша', status: 'Требует внимания', lastUpdate: '2024-01-05' },
      { name: 'Синхронизация', status: 'Настроено', lastUpdate: '2024-01-15' }
    ]
  },
  {
    id: 'integrations',
    title: 'Интеграции',
    description: 'Настройки интеграций с внешними сервисами',
    icon: GlobeAltIcon,
    color: 'from-cyan-500 to-blue-600',
    items: [
      { name: 'Электронная почта', status: 'Настроено', lastUpdate: '2024-01-15' },
      { name: 'Календарь', status: 'Настроено', lastUpdate: '2024-01-12' },
      { name: 'Облачное хранилище', status: 'Настроено', lastUpdate: '2024-01-10' },
      { name: 'API подключения', status: 'Настроено', lastUpdate: '2024-01-08' }
    ]
  }
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { name: 'Пациенты', href: '/patients', icon: '👥', color: 'hover:bg-green-50 hover:text-green-600' },
  { name: 'Исследования', href: '/studies', icon: '🔬', color: 'hover:bg-purple-50 hover:text-purple-600' },
  { name: 'Записи', href: '/appointments', icon: '📅', color: 'hover:bg-orange-50 hover:text-orange-600' },
  { name: 'Отчеты', href: '/reports', icon: '📋', color: 'hover:bg-red-50 hover:text-red-600' },
  { name: 'Аналитика', href: '/analytics', icon: '📈', color: 'hover:bg-indigo-50 hover:text-indigo-600' },
  { name: 'Настройки', href: '/settings', icon: '⚙️', color: 'bg-gray-50 text-gray-600' },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 shadow-lg">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MediCloud</span>
                <p className="text-xs text-gray-500 -mt-1 font-medium">Medical Solutions Platform</p>
              </div>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-gray-700 dark:text-gray-300 ${item.color} rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 group`}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">Система онлайн</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <BellIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">АС</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Александр Смирнов</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Настройки системы</h1>
            <p className="text-gray-600 dark:text-gray-300">Управление настройками и конфигурацией платформы</p>
          </div>

          {/* Settings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Настроено</p>
                  <p className="text-3xl font-bold text-green-600">18</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Требует внимания</p>
                  <p className="text-3xl font-bold text-yellow-600">3</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Не настроено</p>
                  <p className="text-3xl font-bold text-red-600">3</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-3">
                  <InformationCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Categories */}
          <div className="space-y-6">
            {settingsCategories.map((category) => (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/settings/${category.id}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    Настроить →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'Настроено' ? 'bg-green-500' :
                          item.status === 'Требует внимания' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.lastUpdate ? `Обновлено: ${item.lastUpdate}` : 'Никогда не обновлялось'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Настроено' ? 'bg-green-100 text-green-800' :
                        item.status === 'Требует внимания' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Быстрые действия</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/settings/backup" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <DatabaseIcon className="h-6 w-6" />
                <span className="font-medium">Резервное копирование</span>
              </Link>
              <Link href="/settings/export" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                <span className="font-medium">Экспорт данных</span>
              </Link>
              <Link href="/settings/security" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ShieldCheckIcon className="h-6 w-6" />
                <span className="font-medium">Безопасность</span>
              </Link>
              <Link href="/settings/help" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <InformationCircleIcon className="h-6 w-6" />
                <span className="font-medium">Справка</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
