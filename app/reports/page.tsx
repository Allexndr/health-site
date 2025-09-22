import Link from 'next/link'
import { 
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CalendarIcon,
  HeartIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

const reports = [
  { 
    id: 1, 
    title: 'Ежемесячный отчет по пациентам за январь 2024', 
    type: 'Статистика',
    date: '2024-01-15',
    status: 'Готов',
    author: 'Др. Смирнов А.В.',
    pages: 24,
    size: '4.2 MB',
    description: 'Полная статистика по пациентам: 2,847 активных пациентов, 156 новых поступлений, 1,234 завершенных лечения',
    icon: '📊',
    summary: 'Рост пациентской базы на 12%, снижение среднего времени ожидания на 15%'
  },
  { 
    id: 2, 
    title: 'Отчет по лабораторным исследованиям', 
    type: 'Лаборатория',
    date: '2024-01-14',
    status: 'Готов',
    author: 'Др. Козлова Е.И.',
    pages: 18,
    size: '3.8 MB',
    description: 'Анализ 1,456 лабораторных исследований: ОАК, биохимия, гормоны, онкомаркеры',
    icon: '🧪',
    summary: 'Выявлено 23% патологических результатов, 15% требуют повторного исследования'
  },
  { 
    id: 3, 
    title: 'Финансовый отчет клиники за Q4 2023', 
    type: 'Финансы',
    date: '2024-01-13',
    status: 'Готов',
    author: 'Гл. бухгалтер Петрова И.С.',
    pages: 32,
    size: '6.1 MB',
    description: 'Финансовые показатели: доходы 45.2 млн руб, расходы 38.7 млн руб, прибыль 6.5 млн руб',
    icon: '💰',
    summary: 'Рост доходов на 18% по сравнению с Q3, рентабельность 14.4%'
  },
  { 
    id: 4, 
    title: 'Отчет по качеству медицинских услуг', 
    type: 'Качество',
    date: '2024-01-12',
    status: 'Готов',
    author: 'Др. Смирнов А.В.',
    pages: 16,
    size: '2.9 MB',
    description: 'Анализ качества: 98.2% удовлетворенность пациентов, 0.3% жалоб, 99.7% успешных исходов',
    icon: '⭐',
    summary: 'Показатели качества превышают федеральные стандарты на 15%'
  },
  { 
    id: 5, 
    title: 'Отчет по техническому состоянию оборудования', 
    type: 'Техническое',
    date: '2024-01-11',
    status: 'Готов',
    author: 'Инженер-механик Козлов М.П.',
    pages: 12,
    size: '2.3 MB',
    description: 'Проверка 156 единиц медоборудования: 98% исправны, 2% требуют ремонта',
    icon: '🔧',
    summary: 'Все критически важное оборудование функционирует, запланирован ремонт 3 единиц'
  },
  { 
    id: 6, 
    title: 'Отчет по информационной безопасности', 
    type: 'Безопасность',
    date: '2024-01-10',
    status: 'Готов',
    author: 'IT-директор Волков С.А.',
    pages: 20,
    size: '3.5 MB',
    description: 'Анализ ИБ: 0 инцидентов, 100% шифрование данных, соответствие 152-ФЗ',
    icon: '🔒',
    summary: 'Система ИБ функционирует стабильно, все требования законодательства соблюдены'
  },
  { 
    id: 7, 
    title: 'Отчет по инфекционному контролю', 
    type: 'Эпидемиология',
    date: '2024-01-09',
    status: 'Готов',
    author: 'Эпидемиолог Лебедева Т.В.',
    pages: 14,
    size: '2.7 MB',
    description: 'Мониторинг ВБИ: 0 случаев внутрибольничных инфекций, 100% соблюдение санрежима',
    icon: '🦠',
    summary: 'Отличные показатели инфекционного контроля, все протоколы соблюдены'
  },
  { 
    id: 8, 
    title: 'Отчет по фармакотерапии', 
    type: 'Фармация',
    date: '2024-01-08',
    status: 'Готов',
    author: 'Главный фармацевт Медведева О.И.',
    pages: 22,
    size: '4.8 MB',
    description: 'Анализ лекарственного обеспечения: 98.5% доступность препаратов, 0.2% побочных реакций',
    icon: '💊',
    summary: 'Высокая эффективность фармакотерапии, минимум побочных эффектов'
  },
  { 
    id: 9, 
    title: 'Отчет по диспансеризации населения', 
    type: 'Профилактика',
    date: '2024-01-07',
    status: 'Готов',
    author: 'Др. Петров С.А.',
    pages: 28,
    size: '5.2 MB',
    description: 'Диспансеризация 1,234 человек: 45% здоровы, 35% группа риска, 20% нуждаются в лечении',
    icon: '🏥',
    summary: 'Высокий охват диспансеризацией, раннее выявление заболеваний на 25%'
  },
  { 
    id: 10, 
    title: 'Отчет по кадровому составу', 
    type: 'Персонал',
    date: '2024-01-06',
    status: 'Готов',
    author: 'HR-директор Новикова М.А.',
    pages: 18,
    size: '3.1 MB',
    description: 'Анализ персонала: 156 сотрудников, 98% укомплектованность, 2% вакансий',
    icon: '👥',
    summary: 'Стабильный кадровый состав, низкая текучесть кадров 3% в год'
  }
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { name: 'Пациенты', href: '/patients', icon: '👥', color: 'hover:bg-green-50 hover:text-green-600' },
  { name: 'Исследования', href: '/studies', icon: '🔬', color: 'hover:bg-purple-50 hover:text-purple-600' },
  { name: 'Записи', href: '/appointments', icon: '📅', color: 'hover:bg-orange-50 hover:text-orange-600' },
  { name: 'Отчеты', href: '/reports', icon: '📋', color: 'bg-red-50 text-red-600' },
  { name: 'Аналитика', href: '/analytics', icon: '📈', color: 'hover:bg-indigo-50 hover:text-indigo-600' },
  { name: 'Настройки', href: '/settings', icon: '⚙️', color: 'hover:bg-gray-50 hover:text-gray-600' },
]

export default function ReportsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Отчеты и аналитика</h1>
              <p className="text-gray-600 dark:text-gray-300">Управление отчетами и аналитическими данными</p>
            </div>
            <Link 
              href="/reports/new"
              className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Создать отчет</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Всего отчетов</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-3">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Готово</p>
                  <p className="text-3xl font-bold text-green-600">142</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">В процессе</p>
                  <p className="text-3xl font-bold text-yellow-600">8</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Черновики</p>
                  <p className="text-3xl font-bold text-gray-600">6</p>
                </div>
                <div className="bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl p-3">
                  <PencilIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Быстрые действия</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/reports/patients" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <DocumentTextIcon className="h-6 w-6" />
                <span className="font-medium">Отчет по пациентам</span>
              </Link>
              <Link href="/reports/financial" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ChartBarIcon className="h-6 w-6" />
                <span className="font-medium">Финансовый отчет</span>
              </Link>
              <Link href="/reports/quality" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <ClipboardDocumentListIcon className="h-6 w-6" />
                <span className="font-medium">Отчет по качеству</span>
              </Link>
              <Link href="/reports/export" className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                <DocumentArrowDownIcon className="h-6 w-6" />
                <span className="font-medium">Экспорт данных</span>
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
                    placeholder="Поиск отчетов по названию, типу или автору..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{report.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{report.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'Готов' ? 'bg-green-100 text-green-800' :
                    report.status === 'В процессе' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{report.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Автор:</span>
                    <span>{report.author}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Страниц:</span>
                    <span>{report.pages}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Размер:</span>
                    <span>{report.size}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{report.description}</p>
                  {report.summary && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        📋 {report.summary}
                      </p>
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
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <Link 
                    href={`/reports/${report.id}`}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
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
              Показано 6 из 156 отчетов
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Предыдущая
              </button>
              <button className="px-3 py-2 bg-red-600 text-white rounded-lg">1</button>
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
