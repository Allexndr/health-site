@echo off
chcp 65001 >nul
echo 🚀 OneVolumeViewer Web Launcher - Windows Setup
echo ================================================
echo.

echo 📋 Проверка Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python не найден!
    echo 💡 Скачайте Python с https://www.python.org/downloads/
    echo 💡 Убедитесь, что отмечен "Add Python to PATH"
    pause
    exit /b 1
) else (
    echo ✅ Python найден
)

echo.
echo 📦 Установка зависимостей...
pip install flask flask-cors pillow numpy scipy

echo.
echo 🔍 Поиск OneVolumeViewer.exe...
if exist "OneVolumeViewer.exe" (
    echo ✅ OneVolumeViewer.exe найден
) else (
    echo ❌ OneVolumeViewer.exe не найден в текущей директории
    echo 💡 Убедитесь, что файл находится в корневой папке проекта
)

echo.
echo 🚀 Запуск OneVolumeViewer Web Launcher...
echo.
echo 🌐 Веб-интерфейс: http://localhost:8002
echo 🔧 API: http://localhost:8002/api/status
echo.
echo 💡 Нажмите Ctrl+C для остановки
echo.

python backend/onevolume_web_launcher.py

pause 