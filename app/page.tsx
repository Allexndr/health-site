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
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 rounded-lg p-1">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DentalCloud</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Войти
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Цифровое хранение стоматологических снимков
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Современная платформа для безопасного хранения, просмотра и управления рентгеновскими снимками зубов. 
              Создана специально для стоматологических клиник.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                Начать работу
              </Link>
              <Link
                href="#features"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Узнать больше <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-gray-50 py-24 sm:py-32 dark:bg-gray-800">
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
            <h2 className="text-base font-semibold leading-7 text-blue-600">Платформа</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Всё необходимое для работы с медицинскими снимками
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