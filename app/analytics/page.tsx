import Link from 'next/link'
import { 
  ChartBarIcon,
  ChartPieIcon,
  ChartBarIcon as ChartLineIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  HeartIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

const analytics = [
  { 
    id: 1, 
    title: 'Демографический анализ пациентской базы', 
    type: 'Демография',
    date: '2024-01-15',
    status: 'Готов',
    views: 245,
    downloads: 12,
    description: 'Распределение 2,847 пациентов по возрасту, полу, социальному статусу',
    icon: '👥',
    trend: 'up',
    value: '+15%',
    metrics: {
      '0-18 лет': '12% (342 чел)',
      '19-35 лет': '28% (797 чел)',
      '36-50 лет': '32% (911 чел)',
      '51-65 лет': '20% (569 чел)',
      '65+ лет': '8% (228 чел)'
    }
  },
  { 
    id: 2, 
    title: 'Эпидемиологический анализ заболеваний', 
    type: 'Медицинская',
    date: '2024-01-14',
    status: 'Готов',
    views: 189,
    downloads: 8,
    description: 'Топ-10 диагнозов, сезонность, динамика заболеваемости',
    icon: '🏥',
    trend: 'down',
    value: '-5%',
    metrics: {
      'Сердечно-сосудистые': '24% (683 случая)',
      'Эндокринные': '18% (512 случаев)',
      'Дыхательные': '15% (427 случаев)',
      'ЖКТ': '12% (342 случая)',
      'Неврологические': '10% (285 случаев)'
    }
  },
  { 
    id: 3, 
    title: 'Анализ эффективности лечения', 
    type: 'Качество',
    date: '2024-01-13',
    status: 'Готов',
    views: 312,
    downloads: 15,
    description: 'Показатели успешности: 99.7% положительных исходов, 0.3% осложнений',
    icon: '📈',
    trend: 'up',
    value: '+23%',
    metrics: {
      'Полное выздоровление': '78% (956 чел)',
      'Улучшение состояния': '21% (258 чел)',
      'Стабилизация': '1% (12 чел)',
      'Осложнения': '0.3% (4 чел)',
      'Средний срок лечения': '14.2 дня'
    }
  },
  { 
    id: 4, 
    title: 'Финансовая аналитика клиники', 
    type: 'Финансы',
    date: '2024-01-12',
    status: 'Готов',
    views: 156,
    downloads: 6,
    description: 'Доходы 45.2 млн руб, расходы 38.7 млн руб, прибыль 6.5 млн руб',
    icon: '💰',
    trend: 'up',
    value: '+18%',
    metrics: {
      'Доходы': '45.2 млн руб (+18%)',
      'Расходы': '38.7 млн руб (+12%)',
      'Прибыль': '6.5 млн руб (+35%)',
      'Рентабельность': '14.4%',
      'ROI': '22.1%'
    }
  },
  { 
    id: 5, 
    title: 'Анализ загрузки медицинского персонала', 
    type: 'Персонал',
    date: '2024-01-11',
    status: 'Готов',
    views: 278,
    downloads: 9,
    description: '156 сотрудников, 98% укомплектованность, средняя загрузка 87%',
    icon: '👨‍⚕️',
    trend: 'stable',
    value: '0%',
    metrics: {
      'Врачи': '45 чел (100% укомплектованность)',
      'Медсестры': '67 чел (98% укомплектованность)',
      'Администрация': '44 чел (95% укомплектованность)',
      'Средняя загрузка': '87%',
      'Текучесть кадров': '3% в год'
    }
  },
  { 
    id: 6, 
    title: 'Анализ удовлетворенности пациентов', 
    type: 'Качество',
    date: '2024-01-10',
    status: 'Готов',
    views: 203,
    downloads: 11,
    description: '98.2% удовлетворенность, 0.3% жалоб, средняя оценка 4.8/5',
    icon: '⭐',
    trend: 'up',
    value: '+12%',
    metrics: {
      'Очень довольны': '78% (2,220 чел)',
      'Довольны': '20% (569 чел)',
      'Нейтрально': '2% (57 чел)',
      'Не довольны': '0.3% (9 чел)',
      'Средняя оценка': '4.8/5.0'
    }
  },
  { 
    id: 7, 
    title: 'Анализ лабораторных показателей', 
    type: 'Лаборатория',
    date: '2024-01-09',
    status: 'Готов',
    views: 198,
    downloads: 7,
    description: '1,456 анализов: 77% в норме, 23% патология, 15% требуют повтора',
    icon: '🧪',
    trend: 'up',
    value: '+8%',
    metrics: {
      'В норме': '77% (1,121 анализов)',
      'Патология': '23% (335 анализов)',
      'Требуют повтора': '15% (218 анализов)',
      'Средний срок готовности': '2.3 дня',
      'Точность': '99.2%'
    }
  },
  { 
    id: 8, 
    title: 'Анализ инфекционного контроля', 
    type: 'Эпидемиология',
    date: '2024-01-08',
    status: 'Готов',
    views: 167,
    downloads: 5,
    description: '0 случаев ВБИ, 100% соблюдение санрежима, 98% вакцинации персонала',
    icon: '🦠',
    trend: 'stable',
    value: '0%',
    metrics: {
      'ВБИ': '0 случаев',
      'Соблюдение санрежима': '100%',
      'Вакцинация персонала': '98%',
      'Дезинфекция': '100%',
      'Контроль качества': '100%'
    }
  }
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { name: 'Пациенты', href: '/patients', icon: '👥', color: 'hover:bg-green-50 hover:text-green-600' },
  { name: 'Исследования', href: '/studies', icon: '🔬', color: 'hover:bg-purple-50 hover:text-purple-600' },
  { name: 'Записи', href: '/appointments', icon: '📅', color: 'hover:bg-orange-50 hover:text-orange-600' },
  { name: 'Отчеты', href: '/reports', icon: '📋', color: 'hover:bg-red-50 hover:text-red-600' },
  { name: 'Аналитика', href: '/analytics', icon: '📈', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Настройки', href: '/settings', icon: '⚙️', color: 'hover:bg-gray-50 hover:text-gray-600' },
]

export default function AnalyticsPage() {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Аналитика и метрики</h1>
              <p className="text-gray-600 dark:text-gray-300">Глубокий анализ данных и ключевых показателей</p>
            </div>
            <Link 
              href="/analytics/new"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Создать анализ</span>
            </Link>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Всего анализов</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">89</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12%</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Просмотры</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">2,456</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+8%</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-3">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Скачивания</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+15%</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                  <DocumentArrowDownIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Активные пользователи</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">45</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+3%</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-3">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Chart Types */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Типы аналитики</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/analytics/demographics" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ChartPieIcon className="h-6 w-6" />
                <span className="font-medium">Демография</span>
              </Link>
              <Link href="/analytics/medical" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ChartLineIcon className="h-6 w-6" />
                <span className="font-medium">Медицинская</span>
              </Link>
              <Link href="/analytics/financial" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ChartBarIcon className="h-6 w-6" />
                <span className="font-medium">Финансовая</span>
              </Link>
              <Link href="/analytics/quality" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                <span className="font-medium">Качество</span>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск аналитики по названию, типу или описанию..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5" />
                  <span>Фильтры</span>
                </button>
                <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <CalendarIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {analytics.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Готов' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      {item.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : item.trend === 'down' ? (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                      )}
                      <span className={`text-xs font-medium ${
                        item.trend === 'up' ? 'text-green-600' :
                        item.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <EyeIcon className="h-4 w-4" />
                    <span>{item.views} просмотров</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    <span>{item.downloads} скачиваний</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  {item.metrics && (
                    <div className="mt-3 space-y-1">
                      {Object.entries(item.metrics).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                          <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <ShareIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <Link 
                    href={`/analytics/${item.id}`}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                  >
                    Подробнее →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Показано 6 из 89 анализов
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Предыдущая
              </button>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">2</button>
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">3</button>
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Следующая
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
