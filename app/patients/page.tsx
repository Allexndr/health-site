import Link from 'next/link'
import { 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  HeartIcon,
  BellIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'

const patients = [
  { 
    id: 1, 
    name: 'Анна Петрова', 
    age: 34, 
    gender: 'Женский',
    phone: '+7 (777) 123-45-67',
    email: 'anna.petrova@email.com',
    lastVisit: '2024-01-15',
    status: 'Активен',
    avatar: '👩',
    diagnosis: 'Артериальная гипертензия II степени',
    nextAppointment: '2024-01-20',
    bloodType: 'A+',
    allergies: 'Пенициллин, пыльца',
    chronicDiseases: ['Гипертония', 'Ожирение I степени'],
    medications: ['Эналаприл 5мг', 'Амлодипин 5мг'],
    insurance: 'ДМС "Альфа-Страхование"',
    policyNumber: 'АС-2024-001234',
    doctor: 'Др. Смирнов А.В.',
    notes: 'Пациентка соблюдает диету, регулярно принимает препараты. Контроль АД 2 раза в день.'
  },
  { 
    id: 2, 
    name: 'Михаил Иванов', 
    age: 45, 
    gender: 'Мужской',
    phone: '+7 (777) 234-56-78',
    email: 'mikhail.ivanov@email.com',
    lastVisit: '2024-01-14',
    status: 'Ожидает',
    avatar: '👨',
    diagnosis: 'Сахарный диабет 2 типа, декомпенсированный',
    nextAppointment: '2024-01-18',
    bloodType: 'B+',
    allergies: 'Нет',
    chronicDiseases: ['СД 2 типа', 'Диабетическая нефропатия'],
    medications: ['Метформин 1000мг', 'Гликлазид 80мг', 'Инсулин гларгин'],
    insurance: 'ОМС + ДМС "СОГАЗ-Мед"',
    policyNumber: 'СМ-2024-005678',
    doctor: 'Др. Козлова Е.И.',
    notes: 'Требуется коррекция дозы инсулина. HbA1c 8.2%. Рекомендована консультация эндокринолога.'
  },
  { 
    id: 3, 
    name: 'Елена Сидорова', 
    age: 28, 
    gender: 'Женский',
    phone: '+7 (777) 345-67-89',
    email: 'elena.sidorova@email.com',
    lastVisit: '2024-01-13',
    status: 'Завершен',
    avatar: '👩',
    diagnosis: 'Бронхиальная астма, контролируемая',
    nextAppointment: '2024-02-01',
    bloodType: 'O+',
    allergies: 'Домашняя пыль, шерсть животных',
    chronicDiseases: ['Бронхиальная астма'],
    medications: ['Сальбутамол ингалятор', 'Будесонид 200мкг'],
    insurance: 'ОМС',
    policyNumber: 'ОМС-2024-003456',
    doctor: 'Др. Петров С.А.',
    notes: 'Астма под контролем. Приступы редкие, только при контакте с аллергенами. Рекомендована аллергодиагностика.'
  },
  { 
    id: 4, 
    name: 'Дмитрий Козлов', 
    age: 52, 
    gender: 'Мужской',
    phone: '+7 (777) 456-78-90',
    email: 'dmitry.kozlov@email.com',
    lastVisit: '2024-01-12',
    status: 'Активен',
    avatar: '👨',
    diagnosis: 'ИБС, стенокардия напряжения II ФК',
    nextAppointment: '2024-01-22',
    bloodType: 'AB+',
    allergies: 'Аспирин',
    chronicDiseases: ['ИБС', 'Атеросклероз', 'Гиперхолестеринемия'],
    medications: ['Аспирин 75мг', 'Аторвастатин 20мг', 'Бисопролол 5мг'],
    insurance: 'ДМС "ВТБ Страхование"',
    policyNumber: 'ВТБ-2024-009876',
    doctor: 'Др. Смирнов А.В.',
    notes: 'Стабильная стенокардия. Перенес инфаркт миокарда в 2022г. Рекомендована коронарография.'
  },
  { 
    id: 5, 
    name: 'Ольга Морозова', 
    age: 41, 
    gender: 'Женский',
    phone: '+7 (777) 567-89-01',
    email: 'olga.morozova@email.com',
    lastVisit: '2024-01-11',
    status: 'Завершен',
    avatar: '👩',
    diagnosis: 'Остеохондроз шейного отдела позвоночника',
    nextAppointment: '2024-01-25',
    bloodType: 'A-',
    allergies: 'Нет',
    chronicDiseases: ['Остеохондроз', 'ВСД'],
    medications: ['Диклофенак 50мг', 'Мидокалм 150мг'],
    insurance: 'ОМС + ДМС "Альфа-Страхование"',
    policyNumber: 'АС-2024-001567',
    doctor: 'Др. Козлова Е.И.',
    notes: 'Боли в шее уменьшились после курса физиотерапии. Рекомендована ЛФК и массаж.'
  },
  { 
    id: 6, 
    name: 'Александр Смирнов', 
    age: 38, 
    gender: 'Мужской',
    phone: '+7 (777) 678-90-12',
    email: 'alexander.smirnov@email.com',
    lastVisit: '2024-01-10',
    status: 'Активен',
    avatar: '👨',
    diagnosis: 'Хронический гастрит с повышенной кислотностью',
    nextAppointment: '2024-01-19',
    bloodType: 'B-',
    allergies: 'Нет',
    chronicDiseases: ['Гастрит', 'Дуоденит'],
    medications: ['Омепразол 20мг', 'Домперидон 10мг'],
    insurance: 'ОМС',
    policyNumber: 'ОМС-2024-002345',
    doctor: 'Др. Петров С.А.',
    notes: 'Соблюдает диету №1. Изжога и боли в эпигастрии купированы. Рекомендована ФГДС через 6 месяцев.'
  },
  { 
    id: 7, 
    name: 'Мария Волкова', 
    age: 29, 
    gender: 'Женский',
    phone: '+7 (777) 789-01-23',
    email: 'maria.volkova@email.com',
    lastVisit: '2024-01-09',
    status: 'Активен',
    avatar: '👩',
    diagnosis: 'Железодефицитная анемия средней степени',
    nextAppointment: '2024-01-17',
    bloodType: 'O-',
    allergies: 'Нет',
    chronicDiseases: ['Анемия', 'Миома матки'],
    medications: ['Сорбифер Дурулес 1 таб 2 раза в день'],
    insurance: 'ДМС "СОГАЗ-Мед"',
    policyNumber: 'СМ-2024-004567',
    doctor: 'Др. Козлова Е.И.',
    notes: 'Hb 95 г/л, ферритин 8 нг/мл. Назначена терапия препаратами железа. Контроль через 1 месяц.'
  },
  { 
    id: 8, 
    name: 'Владимир Новиков', 
    age: 63, 
    gender: 'Мужской',
    phone: '+7 (777) 890-12-34',
    email: 'vladimir.novikov@email.com',
    lastVisit: '2024-01-08',
    status: 'Активен',
    avatar: '👨',
    diagnosis: 'ХОБЛ средней степени тяжести',
    nextAppointment: '2024-01-16',
    bloodType: 'A+',
    allergies: 'Нет',
    chronicDiseases: ['ХОБЛ', 'Эмфизема легких', 'Курение 40 пачек/лет'],
    medications: ['Сальметерол/флутиказон', 'Ипратропия бромид'],
    insurance: 'ОМС + ДМС "ВТБ Страхование"',
    policyNumber: 'ВТБ-2024-005432',
    doctor: 'Др. Петров С.А.',
    notes: 'Курил 40 лет, бросил 2 года назад. Одышка при физической нагрузке. Рекомендована спирометрия.'
  },
  { 
    id: 9, 
    name: 'Татьяна Лебедева', 
    age: 35, 
    gender: 'Женский',
    phone: '+7 (777) 901-23-45',
    email: 'tatyana.lebedeva@email.com',
    lastVisit: '2024-01-07',
    status: 'Ожидает',
    avatar: '👩',
    diagnosis: 'Гипотиреоз, компенсированный',
    nextAppointment: '2024-01-15',
    bloodType: 'AB-',
    allergies: 'Нет',
    chronicDiseases: ['Гипотиреоз', 'Аутоиммунный тиреоидит'],
    medications: ['L-тироксин 75мкг'],
    insurance: 'ДМС "Альфа-Страхование"',
    policyNumber: 'АС-2024-002345',
    doctor: 'Др. Смирнов А.В.',
    notes: 'ТТГ в норме на фоне терапии. Контроль гормонов щитовидной железы каждые 6 месяцев.'
  },
  { 
    id: 10, 
    name: 'Сергей Медведев', 
    age: 47, 
    gender: 'Мужской',
    phone: '+7 (777) 012-34-56',
    email: 'sergey.medvedev@email.com',
    lastVisit: '2024-01-06',
    status: 'Активен',
    avatar: '👨',
    diagnosis: 'Мочекаменная болезнь, камень левой почки 6мм',
    nextAppointment: '2024-01-14',
    bloodType: 'B+',
    allergies: 'Нет',
    chronicDiseases: ['МКБ', 'Хронический пиелонефрит'],
    medications: ['Цистон', 'Канефрон Н'],
    insurance: 'ОМС',
    policyNumber: 'ОМС-2024-003789',
    doctor: 'Др. Козлова Е.И.',
    notes: 'Камень не обтурирующий. Рекомендована литотрипсия. Соблюдение диеты, обильное питье.'
  }
]

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊', color: 'hover:bg-blue-50 hover:text-blue-600' },
  { name: 'Пациенты', href: '/patients', icon: '👥', color: 'bg-green-50 text-green-600' },
  { name: 'Исследования', href: '/studies', icon: '🔬', color: 'hover:bg-purple-50 hover:text-purple-600' },
  { name: 'Записи', href: '/appointments', icon: '📅', color: 'hover:bg-orange-50 hover:text-orange-600' },
  { name: 'Отчеты', href: '/reports', icon: '📋', color: 'hover:bg-red-50 hover:text-red-600' },
  { name: 'Аналитика', href: '/analytics', icon: '📈', color: 'hover:bg-indigo-50 hover:text-indigo-600' },
  { name: 'Настройки', href: '/settings', icon: '⚙️', color: 'hover:bg-gray-50 hover:text-gray-600' },
]

export default function PatientsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Пациенты</h1>
              <p className="text-gray-600 dark:text-gray-300">Управление базой данных пациентов</p>
            </div>
            <Link 
              href="/patients/new"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Добавить пациента</span>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск пациентов по имени, телефону или email..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl">
                      {patient.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{patient.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{patient.age} лет, {patient.gender}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    patient.status === 'Активен' ? 'bg-green-100 text-green-800' :
                    patient.status === 'Ожидает' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Последний визит: {patient.lastVisit}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Группа крови:</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">{patient.bloodType}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Диагноз:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{patient.diagnosis}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Аллергии:</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{patient.allergies}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Лечащий врач:</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{patient.doctor}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Страховка:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{patient.insurance}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">№ {patient.policyNumber}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Следующая запись:</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{patient.nextAppointment}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <Link 
                    href={`/patients/${patient.id}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
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
              Показано 6 из 2,847 пациентов
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Предыдущая
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
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
