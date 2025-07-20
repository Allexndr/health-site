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