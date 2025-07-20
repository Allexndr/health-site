#!/bin/bash

echo "🚀 Запуск OneVolumeViewer Web Launcher..."

# Проверяем наличие Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.8+"
    exit 1
fi

# Проверяем наличие OneVolumeViewer.exe
if [ ! -f "OneVolumeViewer.exe" ]; then
    echo "❌ OneVolumeViewer.exe не найден в текущей директории"
    exit 1
fi

# Проверяем наличие Wine на macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v wine &> /dev/null; then
        echo "⚠️  Wine не найден. OneVolumeViewer может не работать на macOS"
        echo "   Установите Wine: brew install --cask wine-stable"
    fi
fi

# Запускаем веб-лаунчер
echo "✅ Запуск сервера на http://localhost:8002"
echo "📖 Откройте браузер и перейдите по адресу выше"
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

python3 backend/onevolume_web_launcher.py 