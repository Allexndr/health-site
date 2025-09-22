import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  CloudArrowUpIcon, 
  EyeIcon,
  UsersIcon,
  ServerIcon,
  LockClosedIcon,
  SparklesIcon,
  ChartBarIcon,
  HeartIcon,
  BeakerIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartPieIcon,
  CogIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Безопасное хранение данных',
    description: 'Медицинские снимки и документы защищены современным шифрованием AES-256 и хранятся в облачной инфраструктуре с 99.9% доступностью.',
    icon: ShieldCheckIcon,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Быстрая загрузка файлов',
    description: 'Загружайте медицинские файлы до 2ГБ за считанные секунды. Поддержка DICOM, JPEG, PNG, PDF форматов с автоматической оптимизацией.',
    icon: CloudArrowUpIcon,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Удобный просмотр',
    description: 'Интуитивная галерея с фильтрами по пациентам, типам исследований и датам. Увеличение для детального осмотра с инструментами измерения.',
    icon: EyeIcon,
    color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Многоклиничный доступ',
    description: 'Индивидуальные аккаунты для каждой клиники с защищённым доступом только к своим пациентам. Роли и права доступа.',
    icon: UsersIcon,
    color: 'from-indigo-500 to-blue-600',
  },
  {
    name: 'Надёжная инфраструктура',
    description: 'Облачное хранилище с резервным копированием, мониторингом 24/7 и 99.9% доступности для бесперебойной работы клиник.',
    icon: ServerIcon,
    color: 'from-orange-500 to-red-600',
  },
  {
    name: 'Медицинская конфиденциальность',
    description: 'Каждая клиника видит только данные своих пациентов. Строгое соблюдение медицинской тайны и GDPR соответствие.',
    icon: LockClosedIcon,
    color: 'from-gray-500 to-slate-600',
  },
]

const stats = [
  { id: 1, name: 'Медицинских клиник', value: '150+', icon: '🏥' },
  { id: 2, name: 'Медицинских снимков', value: '500,000+', icon: '📸' },
  { id: 3, name: 'Объём данных', value: '25+ ТБ', icon: '💾' },
  { id: 4, name: 'Доступность сервиса', value: '99.9%', icon: '⚡' },
  { id: 5, name: 'Активных врачей', value: '2,500+', icon: '👨‍⚕️' },
  { id: 6, name: 'Сохранённых жизней', value: '10,000+', icon: '❤️' },
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { name: 'Пациенты', href: '/patients', icon: '👥', color: 'hover:bg-green-50 hover:text-green-600' },
  { name: 'Исследования', href: '/studies', icon: '🔬', color: 'hover:bg-purple-50 hover:text-purple-600' },
  { name: 'Записи', href: '/appointments', icon: '📅', color: 'hover:bg-orange-50 hover:text-orange-600' },
  { name: 'Отчеты', href: '/reports', icon: '📋', color: 'hover:bg-red-50 hover:text-red-600' },
  { name: 'Аналитика', href: '/analytics', icon: '📈', color: 'hover:bg-indigo-50 hover:text-indigo-600' },
  { name: 'Настройки', href: '/settings', icon: '⚙️', color: 'hover:bg-gray-50 hover:text-gray-600' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-400/15 rounded-full blur-2xl animate-bounce animation-delay-3000"></div>
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
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 rounded-lg"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                🚀 Новое поколение медицинских технологий
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Цифровая медицина
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">будущего</span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Современная платформа для безопасного хранения, анализа и управления медицинскими данными. 
              Искусственный интеллект, облачные технологии и передовые алгоритмы для улучшения качества медицинской помощи.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/auth/register"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl hover:shadow-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300 transform hover:scale-105 rounded-xl flex items-center space-x-2"
              >
                <span>Начать работу</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
              <Link
                href="#features"
                className="group bg-white dark:bg-gray-800 px-8 py-4 text-lg font-semibold text-gray-900 dark:text-white shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 transition-all duration-300 transform hover:scale-105 rounded-xl flex items-center space-x-2 border border-gray-200 dark:border-gray-700"
              >
                <span>Узнать больше</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">↓</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Наши достижения в цифрах
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Платформа, которой доверяют тысячи медицинских специалистов
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.id} className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <dt className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  {stat.value}
                </dt>
                <dd className="text-base text-gray-600 dark:text-gray-300 text-center font-medium">
                  {stat.name}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-24 sm:py-32 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Всё необходимое для современной медицины
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Инновационные решения для хранения, анализа и управления медицинскими данными с использованием 
              передовых технологий искусственного интеллекта и облачных вычислений.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.name} className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  <span>Подробнее</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-8">
              Готовы революционизировать свою медицинскую практику?
            </h2>
            <p className="mx-auto text-xl leading-8 text-blue-100 max-w-3xl mb-12">
              Присоединяйтесь к тысячам медицинских специалистов, которые уже используют MediCloud 
              для улучшения качества медицинской помощи и повышения эффективности работы.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/auth/register"
                className="group bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-2xl hover:shadow-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-300 transform hover:scale-105 rounded-xl flex items-center space-x-2"
              >
                <span>Начать бесплатно</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">🚀</span>
              </Link>
              <Link
                href="/auth/login"
                className="group border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 rounded-xl flex items-center space-x-2"
              >
                <span>Войти в систему</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-16 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Статистика обновляется в реальном времени</span>
            </div>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-sm text-gray-400">
                  &copy; 2025 MediCloud. Инновационные решения для современной медицины.
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Сделано с ❤️ для медицинских специалистов
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}