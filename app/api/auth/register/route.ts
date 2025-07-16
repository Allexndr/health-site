import { NextRequest, NextResponse } from 'next/server'

// Симуляция базы данных клиник
const registeredClinics = new Map<string, any>()

// Начальные демо-данные
registeredClinics.set('dental_clinic_1', {
  id: '1',
  clinicName: 'Стоматология "Белоснежка"',
  ownerName: 'Иванов Иван Иванович',
  email: 'clinic1@dentalcloud.ru',
  phone: '+7 (495) 123-45-67',
  city: 'Москва',
  address: 'ул. Примерная, 123',
  username: 'dental_clinic_1',
  password: 'demo123', // В реальном приложении пароли должны быть захешированы
  status: 'active',
  registeredAt: new Date().toISOString()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      clinicName, 
      ownerName, 
      email, 
      phone, 
      city, 
      address, 
      password 
    } = body

    // Валидация обязательных полей
    if (!clinicName || !ownerName || !email || !phone || !city || !address || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 }
      )
    }

    // Валидация пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверка на существующий email
    for (const [, clinic] of registeredClinics) {
      if (clinic.email === email) {
        return NextResponse.json(
          { error: 'Клиника с таким email уже зарегистрирована' },
          { status: 409 }
        )
      }
    }

    // Генерация уникального username для клиники
    const baseUsername = clinicName
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 20)

    let username = baseUsername
    let counter = 1
    while (registeredClinics.has(username)) {
      username = `${baseUsername}_${counter}`
      counter++
    }

    // Создание новой клиники
    const newClinic = {
      id: (registeredClinics.size + 1).toString(),
      clinicName,
      ownerName,
      email,
      phone,
      city,
      address,
      username,
      password, // В реальном приложении нужно хешировать пароль
      status: 'pending_approval', // Клиника требует одобрения администратора
      registeredAt: new Date().toISOString()
    }

    // Сохранение в "базе данных"
    registeredClinics.set(username, newClinic)

    // Возвращаем данные для входа (без пароля)
    const { password: _, ...clinicData } = newClinic

    return NextResponse.json({
      success: true,
      message: 'Клиника успешно зарегистрирована! Ожидает одобрения администратора.',
      clinic: clinicData,
      loginCredentials: {
        username,
        note: 'Сохраните эти данные для входа в систему после одобрения'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// GET метод для получения списка клиник (только для администраторов)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const adminKey = url.searchParams.get('admin_key')
  
  // Простая проверка администратора (в реальном приложении должна быть более сложная)
  if (adminKey !== 'admin_secret_key_2025') {
    return NextResponse.json(
      { error: 'Доступ запрещён' },
      { status: 403 }
    )
  }

  const clinics = Array.from(registeredClinics.values()).map(clinic => {
    const { password, ...clinicData } = clinic
    return clinicData
  })

  return NextResponse.json({
    clinics,
    total: clinics.length,
    pending: clinics.filter(c => c.status === 'pending_approval').length,
    active: clinics.filter(c => c.status === 'active').length
  })
} 