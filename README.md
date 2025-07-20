<<<<<<< HEAD
# 🏥 OneVolumeViewer Web Launcher

Профессиональная система для запуска OneVolumeViewer через веб-интерфейс.

## 🚀 Быстрый запуск

### 1. Установка зависимостей
```bash
pip install flask flask-cors
```

### 2. Запуск веб-сервера
```bash
python backend/onevolume_web_launcher.py
```

### 3. Открыть в браузере
```
http://localhost:8002
```

## 📁 Структура проекта

```
health-site-main/
├── backend/
│   └── onevolume_web_launcher.py    # Веб-сервер
├── OneVolumeViewer.exe              # Основное приложение
├── *.zip                            # Медицинские архивы
└── README.md                        # Эта инструкция
```

## 🎯 Как использовать

1. **Откройте браузер** и перейдите по адресу: `http://localhost:8002`
2. **Выберите файл** из списка доступных архивов
3. **Нажмите "🚀 Открыть"** - OneVolumeViewer запустится автоматически

## 📋 Доступные файлы

- `Anel Aiyanovna Ibragimova_20250718102232.CT.zip` - Реальные данные пациента
- `Nurzhan Mavlenovich Akilbaev_20250718101548.CT.zip` - Реальные данные пациента

## 🔧 API Endpoints

- `GET /` - Веб-интерфейс
- `GET /api/status` - Статус системы
- `GET /api/files` - Список файлов
- `POST /api/launch-direct` - Запуск OneVolumeViewer
- `POST /api/stop` - Остановка OneVolumeViewer

## ✅ Готово к использованию!

Система полностью настроена и готова для работы с OneVolumeViewer архивами. 
=======
# health-site

Медицинская система управления изображениями (PACS) на базе Next.js, TypeScript, TailwindCSS, Prisma, NextAuth.js, Cornerstone.js.

## Возможности
- Просмотр DICOM-исследований
- Управление пациентами и клиниками
- Загрузка и просмотр медицинских изображений
- Аутентификация (NextAuth.js)
- Глобальные уведомления (sonner)
- Современный UI (TailwindCSS)

## Стек
- **Next.js** (App Router, SSR)
- **TypeScript**
- **TailwindCSS**
- **Prisma** (PostgreSQL)
- **NextAuth.js**
- **Cornerstone.js** (DICOM Viewer)
- **sonner** (toasts)

## Установка
```bash
git clone https://github.com/Allexndr/health-site.git
cd health-site
cp .env.example .env
npm install
npm run dev
```

## Переменные окружения
- `MONGODB_URI` — строка подключения к MongoDB Atlas
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` — для NextAuth.js

## Деплой
Рекомендуется Vercel или Railway. Подробнее — ниже.

## Скрипты
- `npm run dev` — запуск в dev-режиме
- `npm run build` — сборка
- `npm run start` — запуск production
- `npx prisma migrate dev` — миграции

## Структура проекта
- `/pages` — страницы Next.js
- `/components` — UI-компоненты
- `/lib` — утилиты, Prisma
- `/prisma` — схема и seed-скрипты
- `/public` — статика

## CI/CD
Используется GitHub Actions для проверки и сборки.

## Лицензия
MIT

---

> Проект для демонстрации PACS-системы. Для продакшена требуется аудит безопасности и доработка. 
>>>>>>> 2c0f3f7c8d961fd85f95a431fb293f616442832a
