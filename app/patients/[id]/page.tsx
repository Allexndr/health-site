'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  UserIcon,
  HeartIcon,
  CalendarIcon,
  BeakerIcon,
  PillIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  IdentificationIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface Patient {
  id: number
  first_name: string
  last_name: string
  middle_name?: string
  date_of_birth?: string
  gender?: string
  blood_type?: string
  phone?: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  insurance_provider?: string
  insurance_policy_number?: string
  primary_doctor_id?: number
  notes?: string
  created_at: string
  updated_at: string
  allergies?: Allergy[]
  chronic_diseases?: Diagnosis[]
  vitals?: Vital[]
  prescriptions?: Prescription[]
  appointments?: Appointment[]
  encounters?: Encounter[]
  documents?: Document[]
  lab_orders?: LabOrder[]
}

interface Allergy {
  id: number
  allergen: string
  severity?: string
  reaction_description?: string
}

interface Diagnosis {
  id: number
  code: string
  name: string
  is_chronic: boolean
}

interface Vital {
  id: number
  recorded_at: string
  temperature?: number
  heart_rate?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  oxygen_saturation?: number
  weight_kg?: number
  height_cm?: number
  bmi?: number
}

interface Prescription {
  id: number
  medication: { name: string }
  dosage: string
  frequency: string
  status: string
  prescribed_date: string
  doctor?: { full_name: string }
}

interface Appointment {
  id: number
  appointment_date: string
  appointment_time?: string
  type?: string
  status: string
  priority: string
  doctor?: { full_name: string }
}

interface Encounter {
  id: number
  encounter_date: string
  encounter_type?: string
  chief_complaint?: string
  status: string
  doctor?: { full_name: string }
}

interface LabOrder {
  id: number
  order_date: string
  test_name: string
  status: string
  priority: string
}

interface Document {
  id: number
  document_type: string
  title: string
  uploaded_at: string
}

const navItems = [
  { name: 'Дашборд', href: '/dashboard', icon: '📊' },
  { name: 'Пациенты', href: '/patients', icon: '👥' },
  { name: 'Исследования', href: '/studies', icon: '🔬' },
  { name: 'Записи', href: '/appointments', icon: '📅' },
  { name: 'Отчеты', href: '/reports', icon: '📋' },
]

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchPatient()
  }, [patientId])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/patients/${patientId}`)
      if (!response.ok) throw new Error('Failed to fetch patient')
      const data = await response.json()
      setPatient(data)
    } catch (err) {
      setError('Error loading patient data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dob?: string) => {
    if (!dob) return '-'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных пациента...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Пациент не найден'}</p>
          <Link href="/patients" className="text-blue-600 hover:underline">
            ← Вернуться к списку пациентов
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative backdrop-blur-sm bg-white/95 border-b border-gray-200/50 shadow-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/patients" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 shadow-lg">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MediCloud</span>
                <p className="text-xs text-gray-500 -mt-1 font-medium">Electronic Medical Records</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {/* Patient Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl">
                  {patient.gender === 'female' ? '👩' : '👨'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.last_name} {patient.first_name} {patient.middle_name || ''}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>Возраст: {calculateAge(patient.date_of_birth)} лет</span>
                    <span>Группа крови: <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">{patient.blood_type || '-'}</span></span>
                    <span>Пол: {patient.gender === 'female' ? 'Женский' : patient.gender === 'male' ? 'Мужской' : '-'}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <PlusIcon className="h-4 w-4" />
                  <span>Новая запись</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <PencilIcon className="h-4 w-4" />
                  <span>Редактировать</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alert for allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Аллергии:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy) => (
                  <span key={allergy.id} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {allergy.allergen} {allergy.severity && `(${allergy.severity})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chronic conditions */}
          {patient.chronic_diseases && patient.chronic_diseases.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Хронические заболевания:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.chronic_diseases.map((disease) => (
                  <span key={disease.id} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {disease.name} ({disease.code})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Обзор', icon: UserIcon },
                  { id: 'vitals', label: 'Витальные показатели', icon: HeartIcon },
                  { id: 'prescriptions', label: 'Назначения', icon: PillIcon },
                  { id: 'appointments', label: 'Записи', icon: CalendarIcon },
                  { id: 'lab', label: 'Анализы', icon: BeakerIcon },
                  { id: 'documents', label: 'Документы', icon: DocumentTextIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <PhoneIcon className="h-5 w-5 text-blue-600" />
                      <span>Контактная информация</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Телефон:</span>
                        <span className="text-sm font-medium">{patient.phone || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium">{patient.email || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Адрес:</span>
                        <span className="text-sm font-medium">{patient.address || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <span>Экстренный контакт</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Имя:</span>
                        <span className="text-sm font-medium">{patient.emergency_contact_name || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Телефон:</span>
                        <span className="text-sm font-medium">{patient.emergency_contact_phone || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                      <span>Страхование</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <IdentificationIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Страховая:</span>
                        <span className="text-sm font-medium">{patient.insurance_provider || '-'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Полис:</span>
                        <span className="text-sm font-medium">{patient.insurance_policy_number || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Статистика</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{patient.appointments?.length || 0}</p>
                        <p className="text-xs text-gray-600">Визитов</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{patient.prescriptions?.length || 0}</p>
                        <p className="text-xs text-gray-600">Назначений</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{patient.lab_orders?.length || 0}</p>
                        <p className="text-xs text-gray-600">Анализов</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">{patient.documents?.length || 0}</p>
                        <p className="text-xs text-gray-600">Документов</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {patient.notes && (
                    <div className="md:col-span-2 bg-yellow-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Примечания</h3>
                      <p className="text-sm text-gray-700">{patient.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vitals Tab */}
              {activeTab === 'vitals' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Витальные показатели</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4" />
                      <span>Добавить</span>
                    </button>
                  </div>
                  
                  {patient.vitals && patient.vitals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Температура</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пульс</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Давление</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SpO2</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вес/Рост</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ИМТ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {patient.vitals.map((vital) => (
                            <tr key={vital.id}>
                              <td className="px-4 py-3 text-sm">{formatDate(vital.recorded_at)}</td>
                              <td className="px-4 py-3 text-sm">{vital.temperature ? `${vital.temperature}°C` : '-'}</td>
                              <td className="px-4 py-3 text-sm">{vital.heart_rate ? `${vital.heart_rate} уд/мин` : '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                {vital.blood_pressure_systolic && vital.blood_pressure_diastolic 
                                  ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}` 
                                  : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">{vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                {vital.weight_kg && vital.height_cm 
                                  ? `${vital.weight_kg}кг / ${vital.height_cm}см` 
                                  : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">{vital.bmi || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Нет записанных витальных показателей</p>
                  )}
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Назначения</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4" />
                      <span>Новое назначение</span>
                    </button>
                  </div>
                  
                  {patient.prescriptions && patient.prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {patient.prescriptions.map((rx) => (
                        <div key={rx.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{rx.medication?.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{rx.dosage} - {rx.frequency}</p>
                              <p className="text-sm text-gray-500 mt-1">Назначил: {rx.doctor?.full_name || '-'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              rx.status === 'active' ? 'bg-green-100 text-green-800' : 
                              rx.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {rx.status === 'active' ? 'Активно' : rx.status === 'completed' ? 'Завершено' : 'Отменено'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Назначено: {formatDate(rx.prescribed_date)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Нет активных назначений</p>
                  )}
                </div>
              )}

              {/* Appointments Tab */}
              {activeTab === 'appointments' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Записи на прием</h3>
                    <Link 
                      href={`/appointments/new?patient=${patientId}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Новая запись</span>
                    </Link>
                  </div>
                  
                  {patient.appointments && patient.appointments.length > 0 ? (
                    <div className="space-y-4">
                      {patient.appointments.map((appt) => (
                        <div key={appt.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-center">
                                <div>
                                  <p className="text-lg font-bold">{appt.appointment_time?.slice(0, 5) || '--:--'}</p>
                                  <p className="text-xs">{formatDate(appt.appointment_date).slice(0, 5)}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{appt.type || 'Прием'}</h4>
                                <p className="text-sm text-gray-600">Врач: {appt.doctor?.full_name || '-'}</p>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                                  appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  appt.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {appt.status === 'completed' ? 'Завершено' :
                                   appt.status === 'cancelled' ? 'Отменено' :
                                   appt.status === 'in_progress' ? 'В процессе' : 'Запланировано'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Нет записей на прием</p>
                  )}
                </div>
              )}

              {/* Lab Orders Tab */}
              {activeTab === 'lab' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Лабораторные исследования</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4" />
                      <span>Назначить анализ</span>
                    </button>
                  </div>
                  
                  {patient.lab_orders && patient.lab_orders.length > 0 ? (
                    <div className="space-y-4">
                      {patient.lab_orders.map((lab) => (
                        <div key={lab.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{lab.test_name}</h4>
                              <p className="text-sm text-gray-500">Назначено: {formatDate(lab.order_date)}</p>
                            </div>
                            <div className="flex space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                lab.priority === 'high' || lab.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                lab.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {lab.priority === 'urgent' ? 'Срочно' :
                                 lab.priority === 'high' ? 'Высокий' :
                                 lab.priority === 'normal' ? 'Обычный' : 'Низкий'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                lab.status === 'completed' ? 'bg-green-100 text-green-800' :
                                lab.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                lab.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {lab.status === 'completed' ? 'Готово' :
                                 lab.status === 'in_progress' ? 'В работе' :
                                 lab.status === 'cancelled' ? 'Отменено' : 'Назначено'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Нет назначенных анализов</p>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Документы</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <PlusIcon className="h-4 w-4" />
                      <span>Загрузить документ</span>
                    </button>
                  </div>
                  
                  {patient.documents && patient.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patient.documents.map((doc) => (
                        <div key={doc.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                              <p className="text-sm text-gray-500">{doc.document_type}</p>
                              <p className="text-xs text-gray-400 mt-1">Загружено: {formatDate(doc.uploaded_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Нет загруженных документов</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
