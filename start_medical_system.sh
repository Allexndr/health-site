#!/bin/bash

echo "🚀 Запуск медицинской системы визуализации..."

# Проверяем наличие OneVolumeViewer.exe
if [ ! -f "OneVolumeViewer.exe" ]; then
    echo "❌ OneVolumeViewer.exe не найден в текущей директории!"
    echo "📁 Убедитесь, что OneVolumeViewer.exe находится в папке проекта"
    exit 1
fi

echo "✅ OneVolumeViewer.exe найден"

# Устанавливаем зависимости Python
echo "📦 Установка Python зависимостей..."
pip install -r requirements.txt

# Запускаем OneVolumeViewer сервер в фоне
echo "🔧 Запуск OneVolumeViewer Integration Server..."
python backend/onevolume_server.py &
OVV_PID=$!

# Ждем немного для запуска сервера
sleep 3

# Запускаем Next.js приложение
echo "🌐 Запуск веб-приложения..."
npm run dev &
NEXT_PID=$!

echo ""
echo "🎉 Система запущена!"
echo ""
echo "📱 Веб-интерфейс: http://localhost:3000"
echo "🔧 OneVolumeViewer API: http://localhost:8001"
echo "📁 3D Viewer: http://localhost:3000/dashboard/3d-viewer"
echo ""
echo "💡 Для остановки нажмите Ctrl+C"

# Функция для корректного завершения
cleanup() {
    echo ""
    echo "🛑 Остановка системы..."
    kill $OVV_PID 2>/dev/null
    kill $NEXT_PID 2>/dev/null
    exit 0
}

# Перехватываем Ctrl+C
trap cleanup SIGINT

# Ждем завершения
wait 