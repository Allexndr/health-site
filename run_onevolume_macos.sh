#!/bin/bash

# Скрипт для запуска OneVolumeViewer на macOS через Wine
# Автор: AI Assistant
# Дата: 2025-07-19

echo "🍷 OneVolumeViewer Launcher для macOS"
echo "======================================="

# Проверяем наличие Wine
if ! command -v wine &> /dev/null; then
    echo "❌ Wine не установлен. Установите его командой:"
    echo "   brew install --cask wine-stable"
    exit 1
fi

# Проверяем наличие OneVolumeViewer.exe
if [ ! -f "OneVolumeViewer.exe" ]; then
    echo "❌ OneVolumeViewer.exe не найден в текущей директории"
    exit 1
fi

# Настройка Wine
export WINEPREFIX=~/.wine
export WINEARCH=win64
export DISPLAY=:0

echo "🔧 Настройка Wine..."
echo "   WINEPREFIX: $WINEPREFIX"
echo "   WINEARCH: $WINEARCH"
echo "   DISPLAY: $DISPLAY"

# Проверяем, есть ли файл
if [ $# -eq 0 ]; then
    echo "📁 Запуск OneVolumeViewer без файла..."
    wine OneVolumeViewer.exe
else
    file_path="$1"
    echo "📁 Запуск OneVolumeViewer с файлом: $file_path"
    
    # Проверяем, что файл существует
    if [ ! -f "$file_path" ]; then
        echo "❌ Файл не найден: $file_path"
        exit 1
    fi
    
    # Если это ZIP файл, извлекаем .vol
    if [[ "$file_path" == *.zip ]]; then
        echo "📦 Извлечение .vol файла из архива..."
        temp_dir=$(mktemp -d)
        unzip -q "$file_path" -d "$temp_dir"
        
        # Ищем .vol файл
        vol_file=$(find "$temp_dir" -name "*.vol" -type f | head -1)
        
        if [ -n "$vol_file" ]; then
            echo "✅ Найден .vol файл: $vol_file"
            wine OneVolumeViewer.exe "$vol_file"
        else
            echo "❌ .vol файл не найден в архиве"
            exit 1
        fi
    else
        # Прямой запуск
        wine OneVolumeViewer.exe "$file_path"
    fi
fi

echo "✅ OneVolumeViewer запущен!" 