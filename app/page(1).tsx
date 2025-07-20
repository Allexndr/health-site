import Link from 'next/link'
import { 
  ShieldCheckIcon, 
  CloudArrowUpIcon, 
  EyeIcon,
  UsersIcon,
  ServerIcon,
  LockClosedIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Безопасное хранение снимков',
    description: 'Рентгеновские снимки зубов и панорамные снимки защищены современным шифрованием и хранятся в облачной инфраструктуре.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Быстрая загрузка',
    description: 'Загружайте стоматологические снимки до 1ГБ за считанные секунды. Поддержка DICOM, JPEG, PNG форматов.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Удобный просмотр',
    description: 'Интуитивная галерея с фильтрами по пациентам, типам снимков и датам. Увеличение для детального осмотра.',
    icon: EyeIcon,
  },
  {
    name: 'Многоклиничный доступ',
    description: 'Индивидуальные аккаунты для каждой стоматологической клиники с защищённым доступом только к своим пациентам.',
    icon: UsersIcon,
  },
  {
    name: 'Надёжная инфраструктура',
    description: 'Облачное хранилище с резервным копированием и 99.9% доступности для бесперебойной работы клиник.',
    icon: ServerIcon,
  },
  {
    name: 'Медицинская конфиденциальность',
    description: 'Каждая клиника видит только снимки своих пациентов. Строгое соблюдение медицинской тайны.',
    icon: LockClosedIcon,
  },
]

const stats = [
  { id: 1, name: 'Стоматологических клиник', value: '50+' },
  { id: 2, name: 'Рентгеновских снимков', value: '25,000+' },
  { id: 3, name: 'Объём данных', value: '8+ ТБ' },
  { id: 4, name: 'Доступность сервиса', value: '99.9%' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="relative backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
                  DentalCloud 3D
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Профессиональная медицинская визуализация
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/auth/login" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Вход
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Панель управления
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-12">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                    3D Медицинская
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Визуализация
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Профессиональный просмотр CT сканов и стоматологических снимков 
                  с использованием передовых технологий <strong>VTK.js</strong> для объемного рендеринга
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href="/dashboard/3d-viewer"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <span className="text-2xl">🔬</span>
                    <span>Открыть 3D Вьювер</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
                
                <Link 
                  href="/dashboard"
                  className="group px-10 py-5 rounded-2xl text-lg font-bold border-2 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <span>Панель управления</span>
                  </span>
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
              <div className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">ZIP & RAR Поддержка</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Автоматическое извлечение медицинских файлов из архивов
                </p>
              </div>

              <div className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🏥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">OneVolumeViewer</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Полная поддержка формата OneVolumeViewer с точностью до 0.125мм
                </p>
              </div>

              <div className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">VTK.js Рендеринг</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Профессиональный объемный рендеринг с WebGL ускорением
                </p>
              </div>

              <div className="group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🦷</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Стоматологические Пресеты</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Специализированные настройки для костей, зубов, мягких тканей
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Technology Stack */}
      <section className="relative py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Технологический стек
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {[
              { name: 'VTK.js', version: '32.7.1' },
              { name: 'WebGL', version: '2.0' },
              { name: 'TypeScript', version: '5.0' },
              { name: 'React', version: '18' },
              { name: 'Next.js', version: '15.4.1' },
              { name: 'Tailwind', version: '3.0' },
              { name: 'Medical DICOM', version: 'Full' },
              { name: 'OneVolumeViewer', version: 'Support' }
            ].map((tech, index) => (
              <div key={index} className="group flex flex-col items-center space-y-2 p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                  {tech.name.slice(0, 2)}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {tech.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tech.version}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section */}
      <div className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-base leading-7 text-gray-600 dark:text-gray-300">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Цифровая стоматология</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Всё, что нужно для работы с рентгеновскими снимками зубов
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Наша платформа обеспечивает безопасное хранение, быстрый доступ и удобное управление стоматологическими снимками 
              для всей сети клиник.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col items-start">
                  <div className="rounded-md bg-blue-600/10 p-2 ring-1 ring-blue-600/20">
                    <feature.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <dt className="mt-4 font-semibold text-gray-900 dark:text-white">{feature.name}</dt>
                  <dd className="mt-2 leading-7 text-gray-600 dark:text-gray-300">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Готовы подключить свою клинику?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Получите доступ к современной системе хранения стоматологических снимков. 
              Зарегистрируйте свою клинику или войдите в существующий аккаунт.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 transform hover:scale-105"
              >
                Регистрация клиники
              </Link>
              <Link
                href="/auth/login"
                className="rounded-md border-2 border-white px-6 py-3 text-lg font-semibold text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Войти в систему
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-400">Статистика обновляется в реальном времени</span>
            </div>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="bg-blue-600 rounded-lg p-1">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm text-gray-400">
                &copy; 2025 DentalCloud. Цифровые решения для стоматологических клиник.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 