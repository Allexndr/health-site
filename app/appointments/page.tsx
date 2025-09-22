import Link from 'next/link'
import { 
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const appointments = [
  { 
    id: 1, 
    patient: 'Анна Петрова', 
    time: '10:00',
    date: '2024-01-20',
    type: 'Консультация кардиолога',
    doctor: 'Др. Смирнов А.В.',
    status: 'Запланировано',
    duration: '30 мин',
    notes: 'Контроль АД, коррекция терапии гипертонии',
    priority: 'Обычный',
    room: 'Кабинет 201',
    complaints: 'Головные боли, повышение АД до 150/95',
    diagnosis: 'Артериальная гипертензия II степени',
    treatment: 'Коррекция дозы Эналаприла'
  },
  { 
    id: 2, 
    patient: 'Михаил Иванов', 
    time: '11:30',
    date: '2024-01-20',
    type: 'Консультация эндокринолога',
    doctor: 'Др. Козлова Е.И.',
    status: 'В процессе',
    duration: '45 мин',
    notes: 'Коррекция терапии СД 2 типа, высокий HbA1c',
    priority: 'Высокий',
    room: 'Кабинет 205',
    complaints: 'Жажда, частое мочеиспускание, слабость',
    diagnosis: 'Сахарный диабет 2 типа, декомпенсированный',
    treatment: 'Коррекция дозы инсулина, диета'
  },
  { 
    id: 3, 
    patient: 'Елена Сидорова', 
    time: '14:00',
    date: '2024-01-20',
    type: 'Контрольный осмотр пульмонолога',
    doctor: 'Др. Петров С.А.',
    status: 'Завершено',
    duration: '20 мин',
    notes: 'Контроль астмы, оценка эффективности лечения',
    priority: 'Средний',
    room: 'Кабинет 203',
    complaints: 'Редкие приступы удушья при контакте с аллергенами',
    diagnosis: 'Бронхиальная астма, контролируемая',
    treatment: 'Продолжение базисной терапии'
  },
  { 
    id: 4, 
    patient: 'Дмитрий Козлов', 
    time: '15:30',
    date: '2024-01-20',
    type: 'ЭКГ с нагрузочной пробой',
    doctor: 'Др. Смирнов А.В.',
    status: 'Отменено',
    duration: '60 мин',
    notes: 'Пациент не явился, перенесено на завтра',
    priority: 'Высокий',
    room: 'Функциональная диагностика',
    complaints: 'Боли за грудиной при физической нагрузке',
    diagnosis: 'ИБС, стенокардия напряжения II ФК',
    treatment: 'Назначена коронарография'
  },
  { 
    id: 5, 
    patient: 'Ольга Морозова', 
    time: '16:00',
    date: '2024-01-20',
    type: 'Консультация невролога',
    doctor: 'Др. Козлова Е.И.',
    status: 'Запланировано',
    duration: '30 мин',
    notes: 'Контроль остеохондроза, оценка эффективности ЛФК',
    priority: 'Средний',
    room: 'Кабинет 207',
    complaints: 'Боли в шее, головные боли, онемение рук',
    diagnosis: 'Остеохондроз шейного отдела позвоночника',
    treatment: 'Физиотерапия, массаж, ЛФК'
  },
  { 
    id: 6, 
    patient: 'Александр Смирнов', 
    time: '17:00',
    date: '2024-01-20',
    type: 'Консультация гастроэнтеролога',
    doctor: 'Др. Петров С.А.',
    status: 'Запланировано',
    duration: '30 мин',
    notes: 'Контроль гастрита, обсуждение результатов ФГДС',
    priority: 'Обычный',
    room: 'Кабинет 209',
    complaints: 'Изжога, боли в эпигастрии после еды',
    diagnosis: 'Хронический гастрит с повышенной кислотностью',
    treatment: 'Диета №1, Омепразол 20мг'
  },
  { 
    id: 7, 
    patient: 'Мария Волкова', 
    time: '09:00',
    date: '2024-01-21',
    type: 'Консультация гематолога',
    doctor: 'Др. Козлова Е.И.',
    status: 'Запланировано',
    duration: '40 мин',
    notes: 'Контроль анемии, коррекция терапии препаратами железа',
    priority: 'Высокий',
    room: 'Кабинет 205',
    complaints: 'Слабость, головокружение, бледность кожи',
    diagnosis: 'Железодефицитная анемия средней степени',
    treatment: 'Сорбифер Дурулес, контроль через месяц'
  },
  { 
    id: 8, 
    patient: 'Владимир Новиков', 
    time: '10:30',
    date: '2024-01-21',
    type: 'Консультация пульмонолога',
    doctor: 'Др. Петров С.А.',
    status: 'Запланировано',
    duration: '45 мин',
    notes: 'Контроль ХОБЛ, оценка функции дыхания',
    priority: 'Высокий',
    room: 'Кабинет 203',
    complaints: 'Одышка при физической нагрузке, кашель с мокротой',
    diagnosis: 'ХОБЛ средней степени тяжести',
    treatment: 'Ингаляционная терапия, спирометрия'
  },
  { 
    id: 9, 
    patient: 'Татьяна Лебедева', 
    time: '12:00',
    date: '2024-01-21',
    type: 'Консультация эндокринолога',
    doctor: 'Др. Смирнов А.В.',
    status: 'Запланировано',
    duration: '30 мин',
    notes: 'Контроль гипотиреоза, коррекция дозы L-тироксина',
    priority: 'Обычный',
    room: 'Кабинет 201',
    complaints: 'Слабость, сонливость, прибавка веса',
    diagnosis: 'Гипотиреоз, компенсированный',
    treatment: 'L-тироксин 75мкг, контроль ТТГ'
  },
  { 
    id: 10, 
    patient: 'Сергей Медведев', 
    time: '14:30',
    date: '2024-01-21',
    type: 'Консультация уролога',
    doctor: 'Др. Козлова Е.И.',
    status: 'Запланировано',
    duration: '35 мин',
    notes: 'Обсуждение тактики лечения МКБ, подготовка к литотрипсии',
    priority: 'Средний',
    room: 'Кабинет 205',
    complaints: 'Периодические боли в пояснице, примесь крови в моче',
    diagnosis: 'Мочекаменная болезнь, камень левой почки 6мм',
    treatment: 'Литотрипсия, диета, обильное питье'
  }
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { name: 'Пациенты', href: '/patients', icon: '👥', color: 'hover:bg-green-50 hover:text-green-600' },
  { name: 'Исследования', href: '/studies', icon: '🔬', color: 'hover:bg-purple-50 hover:text-purple-600' },
  { name: 'Записи', href: '/appointments', icon: '📅', color: 'bg-orange-50 text-orange-600' },
  { name: 'Отчеты', href: '/reports', icon: '📋', color: 'hover:bg-red-50 hover:text-red-600' },
  { name: 'Аналитика', href: '/analytics', icon: '📈', color: 'hover:bg-indigo-50 hover:text-indigo-600' },
  { name: 'Настройки', href: '/settings', icon: '⚙️', color: 'hover:bg-gray-50 hover:text-gray-600' },
]

export default function AppointmentsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Записи на прием</h1>
              <p className="text-gray-600 dark:text-gray-300">Управление расписанием и записями пациентов</p>
            </div>
            <Link 
              href="/appointments/new"
              className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Новая запись</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Сегодня</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">6</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-3">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Завершено</p>
                  <p className="text-3xl font-bold text-green-600">1</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">В процессе</p>
                  <p className="text-3xl font-bold text-yellow-600">1</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-3">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Отменено</p>
                  <p className="text-3xl font-bold text-red-600">1</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-3">
                  <XCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
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
                    placeholder="Поиск записей по пациенту, врачу или типу..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5" />
                  <span>Фильтры</span>
                </button>
                <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-2xl">
                      {appointment.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{appointment.patient}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'Завершено' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'В процессе' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'Отменено' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.priority === 'Высокий' ? 'bg-red-100 text-red-800' :
                          appointment.priority === 'Средний' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.priority}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-4 w-4" />
                          <span>{appointment.doctor}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{appointment.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>{appointment.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Кабинет:</span>
                          <span>{appointment.room}</span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Жалобы:</span> {appointment.complaints}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Диагноз:</span> {appointment.diagnosis}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Лечение:</span> {appointment.treatment}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Примечания:</span> {appointment.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar View Toggle */}
          <div className="mt-8 flex items-center justify-center">
            <Link 
              href="/appointments/calendar"
              className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <CalendarIcon className="h-5 w-5" />
              <span>Календарный вид</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
