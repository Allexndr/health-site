'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  CloudArrowUpIcon,
  EyeIcon,
  UsersIcon,
  ServerIcon,
  LockClosedIcon,
  HeartIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon
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
  { id: 1, name: 'Клиник', value: '150+', icon: '🏥' },
  { id: 2, name: 'Снимков', value: '500k+', icon: '📸' },
  { id: 3, name: 'Объём', value: '25+ ТБ', icon: '💾' },
  { id: 4, name: 'Доступность', value: '99.9%', icon: '⚡' },
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊' },
  { name: 'Пациенты', href: '/patients', icon: '👥' },
  { name: 'Исследования', href: '/studies', icon: '🔬' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">MediCloud</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg transition-all">
                Войти
              </Link>
              <Link href="/auth/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95">
                Начать работу
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>AI-Усиленная Платформа</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-8">
                Экосистема <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Цифровой Медицины
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-lg">
                Безопасное облачное решение для хранения DICOM снимков, управления пациентами и анализа данных с помощью ИИ.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth/register" className="flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all group">
                  <span>Создать аккаунт</span>
                  <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#demo" className="flex items-center justify-center bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                  Демо-версия
                </Link>
              </div>

              <div className="mt-12 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                  <span>Соответствие GDPR</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500 mr-2" />
                  <span>Шифрование AES-256</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-16 lg:mt-0 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-200 border border-white/20">
                <img
                  src="/medicloud_dashboard_mockup.png"
                  alt="MediCloud Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Floating Cards Mockup */}
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hidden xl:block animate-float">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    <CheckCircleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Статус системы</div>
                    <div className="text-sm font-bold text-gray-900">Все системы активны</div>
                  </div>
                </div>
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-[100%] h-full bg-emerald-500"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center group">
                <div className="text-3xl mb-4 transform transition-transform group-hover:scale-125 duration-300">{stat.icon}</div>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Инструментарий для профессионалов</h2>
            <p className="text-xl text-gray-600">Полный спектр инструментов для управления клиникой и анализа снимков в одном окне.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50 transition-all group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-4">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HeartIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white uppercase tracking-tighter">MediCloud</span>
            </div>
            <p className="max-w-md text-gray-400 mb-8 leading-relaxed">
              Мы создаем технологии, которые помогают врачам спасать жизни. Наша цель — сделать высокотехнологичную диагностику доступной каждой клинике.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Платформа</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Дашборд</Link></li>
              <li><Link href="/viewer" className="hover:text-white transition-colors">DICOM Viewer</Link></li>
              <li><Link href="/studies" className="hover:text-white transition-colors">Архив исследований</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">О компании</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/security" className="hover:text-white transition-colors">Безопасность</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Условия использования</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-20 pt-8 text-center text-xs text-gray-500 uppercase tracking-widest">
          &copy; 2026 MediCloud. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
        </div>
      </footer>
    </div>
  )
}