#!/usr/bin/env python3
"""
OneVolumeViewer Web Launcher - Запуск OneVolumeViewer.exe через веб
"""

import os
import sys
import json
import zipfile
import tempfile
import shutil
import subprocess
import platform
from pathlib import Path
from flask import Flask, request, jsonify, send_file, render_template_string, send_from_directory
from flask_cors import CORS
import logging
import webbrowser
import time
import threading

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://192.168.0.140:3000', 'http://127.0.0.1:3000'])

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OneVolumeViewerLauncher:
    def __init__(self):
        self.onevolume_path = None
        self.current_file = None
        self.temp_dir = None
        self.process = None
        
        # Ищем OneVolumeViewer.exe
        self.find_onevolume_viewer()
        
        # Очищаем текущий файл при запуске
        self.current_file = None
        
    def find_onevolume_viewer(self):
        """Ищет OneVolumeViewer.exe в проекте"""
        possible_paths = [
            "OneVolumeViewer.exe",
            "bin/OneVolumeViewer.exe",
            "bin/x64/OneVolumeViewer.exe",
            "bin/x86/OneVolumeViewer.exe"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                self.onevolume_path = os.path.abspath(path)
                logger.info(f"Найден OneVolumeViewer: {self.onevolume_path}")
                return
        
        logger.warning("OneVolumeViewer.exe не найден")
        self.onevolume_path = None
    
    def extract_archive(self, zip_path):
        """Извлекает .vol файл из ZIP архива"""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # Ищем .vol файл
                vol_files = [f for f in zip_ref.namelist() if f.endswith('.vol')]
                
                if not vol_files:
                    return None
                
                # Создаем временную директорию
                if self.temp_dir:
                    shutil.rmtree(self.temp_dir, ignore_errors=True)
                
                self.temp_dir = tempfile.mkdtemp(prefix='ovv_')
                
                # Извлекаем .vol файл
                vol_file = vol_files[0]
                zip_ref.extract(vol_file, self.temp_dir)
                
                vol_path = os.path.join(self.temp_dir, vol_file)
                logger.info(f"Найден .vol файл: {vol_path}")
                
                return vol_path
                
        except Exception as e:
            logger.error(f"Ошибка извлечения архива: {e}")
            return None
    
    def launch_onevolume_viewer(self, file_path):
        """Запускает OneVolumeViewer.exe с файлом"""
        try:
            if not self.onevolume_path:
                return False, "OneVolumeViewer.exe не найден"
            
            # Подготавливаем файл
            if file_path.lower().endswith('.zip'):
                vol_path = self.extract_archive(file_path)
                if not vol_path:
                    return False, "Не удалось извлечь .vol файл из архива"
                target_file = vol_path
            else:
                target_file = file_path
            
            # Запускаем OneVolumeViewer.exe
            if platform.system() == "Windows":
                # На Windows запускаем напрямую
                command = [self.onevolume_path, target_file]
            elif platform.system() == "Darwin":  # macOS
                # На macOS используем правильную настройку Wine
                env = os.environ.copy()
                env['WINEPREFIX'] = os.path.expanduser('~/.wine')
                env['WINEARCH'] = 'win64'
                env['DISPLAY'] = ':0'
                
                # Сначала пробуем запустить без файла для инициализации
                try:
                    logger.info("Инициализация OneVolumeViewer...")
                    init_process = subprocess.Popen(
                        ["wine", self.onevolume_path],
                        env=env,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE
                    )
                    time.sleep(3)
                    init_process.terminate()
                except Exception as e:
                    logger.warning(f"Ошибка инициализации: {e}")
                
                # Команды для запуска через Wine
                possible_commands = [
                    ["wine", "start", "/unix", self.onevolume_path, target_file],
                    ["wine", self.onevolume_path, target_file],
                    ["wine", "cmd", "/c", f'start "" "{self.onevolume_path}" "{target_file}"'],
                    ["wine", "explorer", "/select,", target_file, "&&", "wine", self.onevolume_path]
                ]
                
                for i, command in enumerate(possible_commands):
                    try:
                        logger.info(f"Пробуем команду {i+1}: {' '.join(command)}")
                        
                        # Запускаем процесс в фоне
                        self.process = subprocess.Popen(
                            command,
                            env=env,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            preexec_fn=os.setsid if hasattr(os, 'setsid') else None
                        )
                        
                        # Ждем немного для проверки запуска
                        time.sleep(3)
                        
                        # Проверяем, что процесс все еще работает
                        if self.process.poll() is None:
                            logger.info(f"OneVolumeViewer запущен успешно! (способ {i+1})")
                            return True, f"OneVolumeViewer запущен успешно! (способ {i+1})"
                        else:
                            stdout, stderr = self.process.communicate()
                            stderr_str = stderr.decode('utf-8', errors='ignore') if isinstance(stderr, bytes) else str(stderr)
                            logger.warning(f"Способ {i+1} не сработал: {stderr_str.strip()}")
                            
                            # Если процесс завершился, но это может быть нормально для GUI приложений
                            if "err:environ:init_peb" in stderr_str or "fixme:kernelbase" in stderr_str:
                                logger.info(f"OneVolumeViewer запущен (предупреждения Wine игнорируются)")
                                return True, f"OneVolumeViewer запущен! (способ {i+1})"
                            
                    except Exception as e:
                        logger.error(f"Ошибка при запуске способа {i+1}: {e}")
                        continue
                
                # Если все способы не сработали, пробуем через скрипт
                try:
                    script_path = os.path.join(os.getcwd(), "run_onevolume_macos.sh")
                    if os.path.exists(script_path):
                        logger.info(f"Пробуем через скрипт: {script_path}")
                        self.process = subprocess.Popen(
                            [script_path, target_file],
                            env=env,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            preexec_fn=os.setsid if hasattr(os, 'setsid') else None
                        )
                        
                        time.sleep(3)
                        if self.process.poll() is None:
                            logger.info("OneVolumeViewer запущен через скрипт!")
                            return True, "OneVolumeViewer запущен через скрипт!"
                        else:
                            stdout, stderr = self.process.communicate()
                            stderr_str = stderr.decode('utf-8', errors='ignore') if isinstance(stderr, bytes) else str(stderr)
                            logger.warning(f"Скрипт не сработал: {stderr_str.strip()}")
                            
                            # Проверяем на предупреждения Wine
                            if "err:environ:init_peb" in stderr_str or "fixme:kernelbase" in stderr_str:
                                logger.info("OneVolumeViewer запущен через скрипт (предупреждения Wine игнорируются)")
                                return True, "OneVolumeViewer запущен через скрипт!"
                except Exception as e:
                    logger.error(f"Ошибка при запуске через скрипт: {e}")
                
                return False, "Не удалось запустить OneVolumeViewer ни одним способом"
            else:
                # На Linux используем Wine
                command = ["wine", self.onevolume_path, target_file]
            
            logger.info(f"Запуск команды: {' '.join(command)}")
            
            # Запускаем процесс
            self.process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Ждем немного для проверки запуска
            time.sleep(2)
            
            if self.process.poll() is None:
                return True, "OneVolumeViewer запущен успешно!"
            else:
                stdout, stderr = self.process.communicate()
                error_msg = stderr.strip() if stderr else "Неизвестная ошибка"
                return False, f"Ошибка запуска: {error_msg}"
                
        except Exception as e:
            logger.error(f"Ошибка запуска OneVolumeViewer: {e}")
            return False, f"Ошибка запуска: {str(e)}"
    
    def stop_onevolume_viewer(self):
        """Останавливает OneVolumeViewer"""
        try:
            if self.process and self.process.poll() is None:
                self.process.terminate()
                self.process.wait(timeout=5)
                return True, "OneVolumeViewer остановлен"
            return True, "OneVolumeViewer не был запущен"
        except Exception as e:
            logger.error(f"Ошибка остановки OneVolumeViewer: {e}")
            return False, f"Ошибка остановки: {str(e)}"
    
    def get_status(self):
        """Возвращает статус системы"""
        is_running = self.process and self.process.poll() is None
        
        # Проверяем, существует ли текущий файл
        current_file = self.current_file
        if current_file and not os.path.exists(current_file):
            current_file = None
            self.current_file = None
        
        return {
            "onevolume_found": self.onevolume_path is not None,
            "onevolume_path": self.onevolume_path,
            "platform": platform.system(),
            "running": is_running,
            "current_file": current_file,
            "temp_dir": self.temp_dir
        }

# Создаем экземпляр лаунчера
launcher = OneVolumeViewerLauncher()

# HTML шаблон для веб-интерфейса
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ru">
<!-- Версия: 3.0 - Полностью исправлена проблема с кэшем -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 OneVolumeViewer Web Launcher</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .content {
            padding: 30px;
        }
        
        .status-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .status-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #4facfe;
        }
        
        .status-item.success {
            border-left-color: #28a745;
        }
        
        .status-item.error {
            border-left-color: #dc3545;
        }
        
        .upload-section {
            background: #e3f2fd;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .file-input {
            display: none;
        }
        
        .file-label {
            background: #4facfe;
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            cursor: pointer;
            display: inline-block;
            transition: all 0.3s;
        }
        
        .file-label:hover {
            background: #2196f3;
            transform: translateY(-2px);
        }
        
        .controls {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: #28a745;
            color: white;
        }
        
        .btn-primary:hover {
            background: #218838;
            transform: translateY(-2px);
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-danger:hover {
            background: #c82333;
            transform: translateY(-2px);
        }
        
        .files-section {
            background: #fff3cd;
            border-radius: 15px;
            padding: 20px;
        }
        
        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .file-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .file-name {
            font-weight: 600;
            color: #495057;
        }
        
        .btn-sm {
            padding: 8px 15px;
            font-size: 14px;
        }
        
        .message {
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            font-weight: 600;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4facfe;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 OneVolumeViewer Web Launcher</h1>
            <p>Запуск OneVolumeViewer.exe через веб-интерфейс</p>
        </div>
        
        <div class="content">
            <!-- Статус системы -->
            <div class="status-section">
                <h2>📊 Статус системы</h2>
                <div class="status-grid" id="statusGrid">
                    <!-- Статус будет загружен через JavaScript -->
                </div>
            </div>
            
            <!-- Сообщения -->
            <div id="messageContainer"></div>
            
            <!-- Загрузка файлов -->
            <div class="upload-section">
                <h2>📁 Загрузить файл</h2>
                <p>Выберите ZIP архив OneVolumeViewer или .vol файл</p>
                
                <input type="file" id="fileInput" class="file-input" accept=".zip,.vol">
                <label for="fileInput" class="file-label">📂 Выбрать файл</label>
                
                <div class="controls">
                    <button class="btn btn-primary" onclick="launchOneVolume()">
                        🚀 Запустить OneVolumeViewer
                    </button>
                    <button class="btn btn-danger" onclick="stopOneVolume()">
                        🛑 Остановить OneVolumeViewer
                    </button>
                </div>
            </div>
            
            <!-- Доступные файлы -->
            <div class="files-section">
                <h2>📋 Доступные файлы</h2>
                <div class="files-grid" id="filesGrid">
                    <!-- Файлы будут загружены через JavaScript -->
                </div>
            </div>
            
            <!-- Индикатор загрузки -->
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Обработка...</p>
            </div>
        </div>
    </div>

    <script>
        // Принудительное обновление при загрузке страницы
        if (performance.navigation.type === 1) {
            console.log('Страница обновлена - очищаем кэш');
        }
        
        // Очищаем localStorage при загрузке
        localStorage.removeItem('selectedFile');
        localStorage.removeItem('currentStatus');
        
        let currentFile = null;
        
        // Загрузка статуса
        async function loadStatus() {
            try {
                const response = await fetch('/api/status', {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                const status = await response.json();
                
                const statusGrid = document.getElementById('statusGrid');
                statusGrid.innerHTML = `
                    <div class="status-item ${status.onevolume_found ? 'success' : 'error'}">
                        <strong>OneVolumeViewer.exe:</strong><br>
                        ${status.onevolume_found ? '✅ Найден' : '❌ Не найден'}
                    </div>
                    <div class="status-item">
                        <strong>🖥️ Платформа:</strong><br>
                        ${status.platform}
                    </div>
                    <div class="status-item ${status.running ? 'success' : ''}">
                        <strong>🔄 Статус:</strong><br>
                        ${status.running ? 'Запущен' : 'Остановлен'}
                    </div>
                    <div class="status-item">
                        <strong>📁 Файл:</strong><br>
                        ${status.current_file || 'Не выбран'}
                    </div>
                `;
            } catch (error) {
                console.error('Ошибка загрузки статуса:', error);
            }
        }
        
        // Загрузка файлов
        async function loadFiles() {
            try {
                const response = await fetch('/api/files', {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                const files = await response.json();
                
                const filesGrid = document.getElementById('filesGrid');
                filesGrid.innerHTML = files.map(file => `
                    <div class="file-item">
                        <span class="file-name">${file}</span>
                        <button class="btn btn-primary btn-sm" onclick="openFile('${file}')">
                            🚀 Открыть
                        </button>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Ошибка загрузки файлов:', error);
            }
        }
        
        // Показать сообщение
        function showMessage(message, type = 'success') {
            const container = document.getElementById('messageContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.textContent = message;
            container.appendChild(messageDiv);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
        
        // Показать/скрыть загрузку
        function toggleLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }
        
        // Запуск OneVolumeViewer
        async function launchOneVolume() {
            if (!currentFile) {
                showMessage('Сначала выберите файл!', 'error');
                return;
            }
            
            toggleLoading(true);
            
            try {
                const response = await fetch('/api/launch-direct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ filename: currentFile })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message, 'success');
                } else {
                    showMessage(result.message, 'error');
                }
                
                loadStatus();
            } catch (error) {
                showMessage('Ошибка запуска: ' + error.message, 'error');
            } finally {
                toggleLoading(false);
            }
        }
        
        // Остановка OneVolumeViewer
        async function stopOneVolume() {
            try {
                const response = await fetch('/api/stop', { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message, 'success');
                } else {
                    showMessage(result.message, 'error');
                }
                
                loadStatus();
            } catch (error) {
                showMessage('Ошибка остановки: ' + error.message, 'error');
            }
        }
        
        // Открытие файла
        async function openFile(filename) {
            currentFile = filename;
            showMessage(`Выбран файл: ${filename}`, 'success');
            loadStatus();
        }
        
        // Обработчик выбора файла
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                currentFile = file.name;
                showMessage(`Выбран файл: ${file.name}`, 'success');
                loadStatus();
            }
        });
        
        // Автоматическое обновление
        setInterval(loadStatus, 5000);
        
        // Начальная загрузка
        loadStatus();
        loadFiles();
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    """Главная страница"""
    response = app.make_response(HTML_TEMPLATE)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/favicon.ico')
def favicon():
    """Favicon для браузера"""
    return '', 204

@app.route('/api/status')
def get_status():
    """Получение статуса системы"""
    response = jsonify(launcher.get_status())
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/api/files')
def get_files():
    """Получение списка доступных файлов"""
    try:
        files = []
        for file in os.listdir('.'):
            if file.endswith('.zip') or file.endswith('.vol'):
                files.append(file)
        response = jsonify(files)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Загрузка файла"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'Файл не выбран'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Файл не выбран'})
        
        # Сохраняем файл
        filename = file.filename
        file.save(filename)
        
        # Запускаем OneVolumeViewer
        success, message = launcher.launch_onevolume_viewer(filename)
        
        if success:
            launcher.current_file = filename
            return jsonify({
                'success': True,
                'message': message,
                'file': filename
            })
        else:
            return jsonify({'success': False, 'message': message})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Ошибка: {str(e)}'})

@app.route('/api/open/<filename>')
def open_file(filename):
    """Открытие файла по имени"""
    try:
        file_path = os.path.join(os.getcwd(), filename)
        
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'message': f'Файл {filename} не найден'})
        
        # Запускаем OneVolumeViewer
        success, message = launcher.launch_onevolume_viewer(file_path)
        
        if success:
            launcher.current_file = filename
            return jsonify({
                'success': True,
                'message': message,
                'file': filename
            })
        else:
            return jsonify({'success': False, 'message': message})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Ошибка: {str(e)}'})

@app.route('/api/launch-direct', methods=['POST'])
def launch_direct():
    """Прямой запуск OneVolumeViewer с файлом"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'success': False, 'message': 'Имя файла не указано'})
        
        file_path = os.path.join(os.getcwd(), filename)
        
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'message': f'Файл {filename} не найден в директории {os.getcwd()}'})
        
        # Запускаем OneVolumeViewer напрямую
        success, message = launcher.launch_onevolume_viewer(file_path)
        
        if success:
            launcher.current_file = filename
            return jsonify({
                'success': True, 
                'message': message,
                'file': filename
            })
        else:
            return jsonify({'success': False, 'message': message})
            
    except Exception as e:
        logger.error(f"Ошибка прямого запуска: {e}")
        return jsonify({'success': False, 'message': f'Ошибка: {str(e)}'})

@app.route('/api/stop', methods=['POST'])
def stop_onevolume():
    """Остановка OneVolumeViewer"""
    try:
        success, message = launcher.stop_onevolume_viewer()
        return jsonify({'success': success, 'message': message})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Ошибка: {str(e)}'})

if __name__ == '__main__':
    print("🚀 Запуск OneVolumeViewer Web Launcher...")
    print(f"✅ OneVolumeViewer найден: {launcher.onevolume_path is not None}")
    print(f"🖥️ Платформа: {platform.system()}")
    print("🌐 Веб-интерфейс: http://localhost:8002")
    print("🔧 API: http://localhost:8002/api/status")
    print("")
    
    app.run(host='0.0.0.0', port=8002, debug=True) 