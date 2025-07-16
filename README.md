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