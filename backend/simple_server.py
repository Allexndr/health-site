#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import json
import logging
import platform
import subprocess
import tempfile
import zipfile
from flask import Flask, request, jsonify, send_from_directory
import numpy as np
from PIL import Image
import io

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class OneVolumeViewerLauncher:
    def __init__(self):
        self.onevolume_path = self.find_onevolume_viewer()
        self.current_file = None
        self.process = None
        
    def find_onevolume_viewer(self):
        """Поиск OneVolumeViewer.exe"""
        possible_paths = [
            "OneVolumeViewer.exe",
            os.path.join(os.path.dirname(__file__), "OneVolumeViewer.exe"),
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "OneVolumeViewer.exe")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"Найден OneVolumeViewer: {os.path.abspath(path)}")
                return os.path.abspath(path)
        
        logger.warning("OneVolumeViewer.exe не найден")
        return None
    
    def extract_archive(self, zip_path):
        """Извлечение ZIP архива"""
        try:
            with tempfile.TemporaryDirectory(prefix="ovv_") as temp_dir:
                logger.info(f"Извлекаем архив: {zip_path}")
                
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)
                
                # Ищем .vol файл
                vol_file = None
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        if file.endswith('.vol'):
                            vol_file = os.path.join(root, file)
                            logger.info(f"Найден .vol файл: {vol_file}")
                            break
                    if vol_file:
                        break
                
                if vol_file:
                    return vol_file
                else:
                    logger.error("Файл .vol не найден в архиве")
                    return None
                    
        except Exception as e:
            logger.error(f"Ошибка извлечения архива: {e}")
            return None
    
    def launch_onevolume_viewer(self, file_path):
        """Запуск OneVolumeViewer.exe"""
        try:
            if not self.onevolume_path:
                return False, "OneVolumeViewer.exe не найден"
            
            # Останавливаем предыдущий процесс
            if self.process:
                self.stop_onevolume_viewer()
            
            # Определяем команду в зависимости от платформы
            if platform.system() == "Windows":
                if file_path.endswith('.zip'):
                    # Извлекаем архив
                    vol_file = self.extract_archive(file_path)
                    if not vol_file:
                        return False, "Не удалось извлечь .vol файл из архива"
                    file_path = vol_file
                
                logger.info(f"Запуск команды Windows: {self.onevolume_path} {file_path}")
                self.process = subprocess.Popen([self.onevolume_path, file_path])
            else:
                logger.error("Неподдерживаемая платформа")
                return False, "Неподдерживаемая платформа"
            
            self.current_file = file_path
            return True, "OneVolumeViewer запущен успешно"
            
        except Exception as e:
            logger.error(f"Ошибка запуска OneVolumeViewer: {e}")
            return False, f"Ошибка запуска: {str(e)}"
    
    def stop_onevolume_viewer(self):
        """Остановка OneVolumeViewer"""
        try:
            if self.process:
                self.process.terminate()
                self.process.wait(timeout=5)
                self.process = None
                self.current_file = None
                return True, "OneVolumeViewer остановлен"
            return True, "OneVolumeViewer не был запущен"
        except Exception as e:
            logger.error(f"Ошибка остановки OneVolumeViewer: {e}")
            return False, f"Ошибка остановки: {str(e)}"
    
    def get_status(self):
        """Получение статуса системы"""
        return {
            'onevolume_found': self.onevolume_path is not None,
            'platform': platform.system(),
            'status': 'running' if self.process else 'stopped',
            'current_file': self.current_file
        }

# Создаем экземпляр лаунчера
launcher = OneVolumeViewerLauncher()

@app.route('/')
def index():
    """Главная страница"""
    return '''
<!DOCTYPE html>
<html>
<head>
    <title>OneVolumeViewer Web Launcher</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .status-ok { background: #d4edda; color: #155724; }
        .status-error { background: #f8d7da; color: #721c24; }
        .file-item { padding: 15px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
        .btn { padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>OneVolumeViewer Web Launcher</h1>
        
        <div id="status" class="status">Загрузка статуса...</div>
        
        <h2>Доступные файлы</h2>
        <div id="files">Загрузка файлов...</div>
    </div>

    <script>
        function loadStatus() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    const statusDiv = document.getElementById('status');
                    const statusClass = data.onevolume_found ? 'status-ok' : 'status-error';
                    statusDiv.className = `status ${statusClass}`;
                    statusDiv.innerHTML = `
                        <strong>Статус:</strong> ${data.status}<br>
                        <strong>Платформа:</strong> ${data.platform}<br>
                        <strong>OneVolumeViewer:</strong> ${data.onevolume_found ? 'Найден' : 'Не найден'}<br>
                        <strong>Текущий файл:</strong> ${data.current_file || 'Нет'}
                    `;
                });
        }

        function loadFiles() {
            fetch('/api/files')
                .then(response => response.json())
                .then(data => {
                    const filesDiv = document.getElementById('files');
                    if (data.files && data.files.length > 0) {
                        filesDiv.innerHTML = data.files.map(file => `
                            <div class="file-item">
                                <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(1)} МБ)<br>
                                <button class="btn btn-primary" onclick="launchFile('${file.name}')">🚀 Запустить</button>
                                <button class="btn btn-success" onclick="viewFile('${file.name}')">👁️ Просмотр</button>
                            </div>
                        `).join('');
                    } else {
                        filesDiv.innerHTML = '<p>Нет доступных файлов</p>';
                    }
                });
        }

        function launchFile(filename) {
            fetch('/api/launch-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('OneVolumeViewer запущен!');
                    loadStatus();
                } else {
                    alert('Ошибка: ' + data.message);
                }
            });
        }

        function viewFile(filename) {
            window.open('/viewer?file=' + encodeURIComponent(filename), '_blank');
        }

        // Загружаем данные при загрузке страницы
        loadStatus();
        loadFiles();
        setInterval(loadStatus, 5000);
    </script>
</body>
</html>
'''

@app.route('/api/status')
def get_status():
    """Получение статуса системы"""
    return jsonify(launcher.get_status())

@app.route('/api/files')
def get_files():
    """Получение списка файлов"""
    try:
        files = []
        current_dir = os.getcwd()
        parent_dir = os.path.dirname(current_dir)
        
        for search_dir in [current_dir, parent_dir]:
            if os.path.exists(search_dir):
                for file in os.listdir(search_dir):
                    if file.endswith('.zip') or file.endswith('.vol'):
                        file_path = os.path.join(search_dir, file)
                        try:
                            file_stat = os.stat(file_path)
                            files.append({
                                'name': file,
                                'size': file_stat.st_size,
                                'path': file_path
                            })
                        except:
                            continue
        
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e), 'files': []}), 500

@app.route('/api/launch-direct', methods=['POST'])
def launch_direct():
    """Запуск OneVolumeViewer"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'success': False, 'message': 'Имя файла не указано'})
        
        # Ищем файл
        file_path = None
        search_dirs = [os.getcwd(), os.path.dirname(os.getcwd())]
        
        for search_dir in search_dirs:
            potential_path = os.path.join(search_dir, filename)
            if os.path.exists(potential_path):
                file_path = potential_path
                break
        
        if not file_path:
            return jsonify({'success': False, 'message': f'Файл {filename} не найден'})
        
        success, message = launcher.launch_onevolume_viewer(file_path)
        return jsonify({'success': success, 'message': message})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/viewer')
def viewer():
    """Простой просмотрщик"""
    filename = request.args.get('file')
    if not filename:
        return "Файл не указан", 400
    
    return f'''
<!DOCTYPE html>
<html>
<head>
    <title>Просмотр: {filename}</title>
    <style>
        body {{ margin: 0; padding: 20px; background: #000; color: white; font-family: Arial; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .controls {{ margin: 20px 0; }}
        .btn {{ padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }}
        canvas {{ border: 2px solid #333; max-width: 100%; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Просмотр: {filename}</h1>
        
        <div class="controls">
            <button class="btn" onclick="loadVolume()">🔥 ЗАГРУЗИТЬ ВЕСЬ ОБЪЕМ</button>
            <button class="btn" onclick="loadSlice()">📄 Загрузить срез</button>
        </div>
        
        <canvas id="canvas" width="512" height="512"></canvas>
        
        <div id="status" style="margin-top: 20px; padding: 10px; background: #333; border-radius: 5px;">
            Готов к загрузке...
        </div>
    </div>

    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('status');
        
        function updateStatus(text) {{
            status.textContent = text;
        }}
        
        function loadSlice() {{
            updateStatus('Загрузка среза...');
            fetch('/api/volume-slice?file={filename}&slice=0')
                .then(response => response.blob())
                .then(blob => {{
                    const img = new Image();
                    img.onload = () => {{
                        ctx.drawImage(img, 0, 0);
                        updateStatus('Срез загружен!');
                    }};
                    img.src = URL.createObjectURL(blob);
                }})
                .catch(error => {{
                    updateStatus('Ошибка: ' + error.message);
                }});
        }}
        
        function loadVolume() {{
            updateStatus('Загрузка ПОЛНОГО объема...');
            fetch('/api/volume-data?file={filename}')
                .then(response => response.json())
                .then(data => {{
                    updateStatus('Объем загружен! Размер: ' + (data.file_size / 1024 / 1024).toFixed(1) + ' МБ');
                }})
                .catch(error => {{
                    updateStatus('Ошибка: ' + error.message);
                }});
        }}
    </script>
</body>
</html>
'''

@app.route('/api/volume-data')
def get_volume_data():
    """Получение данных объема"""
    filename = request.args.get('file')
    if not filename:
        return jsonify({'error': 'Файл не указан'}), 400
    
    try:
        # Ищем файл
        file_path = None
        search_dirs = [os.getcwd(), os.path.dirname(os.getcwd())]
        
        for search_dir in search_dirs:
            potential_path = os.path.join(search_dir, filename)
            if os.path.exists(potential_path):
                file_path = potential_path
                break
        
        if not file_path:
            return jsonify({'error': f'Файл не найден: {filename}'}), 404
        
        file_size = os.path.getsize(file_path)
        
        return jsonify({
            'filename': filename,
            'file_size': file_size,
            'file_path': file_path
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/volume-slice')
def get_volume_slice():
    """Получение среза объема"""
    filename = request.args.get('file')
    slice_num = int(request.args.get('slice', 0))
    
    if not filename:
        return jsonify({'error': 'Файл не указан'}), 400
    
    try:
        # Ищем файл
        file_path = None
        search_dirs = [os.getcwd(), os.path.dirname(os.getcwd())]
        
        for search_dir in search_dirs:
            potential_path = os.path.join(search_dir, filename)
            if os.path.exists(potential_path):
                file_path = potential_path
                break
        
        if not file_path:
            return jsonify({'error': f'Файл не найден: {filename}'}), 404
        
        # Читаем срез
        with open(file_path, 'rb') as f:
            # Пропускаем заголовок (512 байт)
            f.seek(512 + slice_num * 512 * 512 * 2)
            slice_data = f.read(512 * 512 * 2)
        
        # Конвертируем в изображение
        slice_array = np.frombuffer(slice_data, dtype=np.uint16)
        slice_array = slice_array.reshape(512, 512)
        
        # Нормализуем
        slice_array = ((slice_array - slice_array.min()) / (slice_array.max() - slice_array.min()) * 255).astype(np.uint8)
        
        # Создаем изображение
        img = Image.fromarray(slice_array, mode='L')
        img_io = io.BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_from_directory('.', img_io, mimetype='image/png')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Запуск OneVolumeViewer Web Launcher...")
    print(f"✅ OneVolumeViewer найден: {launcher.onevolume_path is not None}")
    print(f"🖥️ Платформа: {platform.system()}")
    print("🌐 Веб-интерфейс: http://localhost:8002")
    print("🔧 API: http://localhost:8002/api/status")
    print("")
    
    app.run(host='0.0.0.0', port=8002, debug=True) 