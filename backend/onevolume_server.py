#!/usr/bin/env python3
"""
OneVolumeViewer Integration Server
Запускает OneVolumeViewer.exe и управляет им через API
"""

import os
import sys
import json
import subprocess
import threading
import time
import shutil
import zipfile
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tempfile
import logging

app = Flask(__name__)
CORS(app)

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OneVolumeViewerManager:
    def __init__(self):
        self.ovv_process = None
        self.ovv_path = None
        self.temp_dir = None
        self.current_file = None
        
    def find_onevolumeviewer(self):
        """Ищет OneVolumeViewer.exe в системе"""
        possible_paths = [
            "OneVolumeViewer.exe",
            "bin/OneVolumeViewer.exe",
            "../OneVolumeViewer.exe",
            "C:/Program Files/OneVolumeViewer/OneVolumeViewer.exe",
            "C:/OneVolumeViewer/OneVolumeViewer.exe"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                self.ovv_path = os.path.abspath(path)
                logger.info(f"Найден OneVolumeViewer: {self.ovv_path}")
                return True
                
        logger.error("OneVolumeViewer.exe не найден!")
        return False
    
    def extract_archive(self, file_path):
        """Извлекает ZIP архив с CT данными"""
        try:
            temp_dir = tempfile.mkdtemp(prefix="ovv_")
            self.temp_dir = temp_dir
            
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Ищем .vol файл
            vol_files = list(Path(temp_dir).rglob("*.vol"))
            if vol_files:
                vol_path = str(vol_files[0])
                logger.info(f"Найден .vol файл: {vol_path}")
                return vol_path
            else:
                logger.error("Файл .vol не найден в архиве")
                return None
                
        except Exception as e:
            logger.error(f"Ошибка извлечения архива: {e}")
            return None
    
    def start_onevolumeviewer(self, file_path):
        """Запускает OneVolumeViewer с файлом"""
        try:
            if not self.find_onevolumeviewer():
                return False, "OneVolumeViewer.exe не найден"
            
            # Останавливаем предыдущий процесс
            self.stop_onevolumeviewer()
            
            # Запускаем OneVolumeViewer
            cmd = [self.ovv_path, file_path]
            logger.info(f"Запуск команды: {' '.join(cmd)}")
            
            self.ovv_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
            )
            
            self.current_file = file_path
            logger.info(f"OneVolumeViewer запущен с PID: {self.ovv_process.pid}")
            return True, f"OneVolumeViewer запущен (PID: {self.ovv_process.pid})"
            
        except Exception as e:
            logger.error(f"Ошибка запуска OneVolumeViewer: {e}")
            return False, str(e)
    
    def stop_onevolumeviewer(self):
        """Останавливает OneVolumeViewer"""
        if self.ovv_process:
            try:
                self.ovv_process.terminate()
                self.ovv_process.wait(timeout=5)
                logger.info("OneVolumeViewer остановлен")
            except subprocess.TimeoutExpired:
                self.ovv_process.kill()
                logger.warning("OneVolumeViewer принудительно остановлен")
            except Exception as e:
                logger.error(f"Ошибка остановки OneVolumeViewer: {e}")
            finally:
                self.ovv_process = None
                self.current_file = None
    
    def cleanup_temp_files(self):
        """Очищает временные файлы"""
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir)
                logger.info("Временные файлы очищены")
            except Exception as e:
                logger.error(f"Ошибка очистки временных файлов: {e}")

# Глобальный менеджер
ovv_manager = OneVolumeViewerManager()

@app.route('/api/status', methods=['GET'])
def get_status():
    """Получает статус OneVolumeViewer"""
    status = {
        'running': ovv_manager.ovv_process is not None,
        'pid': ovv_manager.ovv_process.pid if ovv_manager.ovv_process else None,
        'current_file': ovv_manager.current_file,
        'ovv_path': ovv_manager.ovv_path
    }
    return jsonify(status)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Загружает и открывает файл в OneVolumeViewer"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Файл не найден'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Файл не выбран'}), 400
        
        # Сохраняем файл
        temp_path = tempfile.mktemp(suffix=os.path.splitext(file.filename)[1])
        file.save(temp_path)
        
        # Обрабатываем файл
        if file.filename.lower().endswith('.zip'):
            vol_path = ovv_manager.extract_archive(temp_path)
            if not vol_path:
                return jsonify({'error': 'Не удалось извлечь .vol файл из архива'}), 400
            file_path = vol_path
        else:
            file_path = temp_path
        
        # Запускаем OneVolumeViewer
        success, message = ovv_manager.start_onevolumeviewer(file_path)
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'file': file.filename
            })
        else:
            return jsonify({'error': message}), 500
            
    except Exception as e:
        logger.error(f"Ошибка загрузки файла: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stop', methods=['POST'])
def stop_viewer():
    """Останавливает OneVolumeViewer"""
    try:
        ovv_manager.stop_onevolumeviewer()
        ovv_manager.cleanup_temp_files()
        return jsonify({'success': True, 'message': 'OneVolumeViewer остановлен'})
    except Exception as e:
        logger.error(f"Ошибка остановки: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/files', methods=['GET'])
def list_files():
    """Список доступных файлов"""
    try:
        files = []
        for file_path in Path('.').glob('**/*.zip'):
            files.append({
                'name': file_path.name,
                'path': str(file_path),
                'size': file_path.stat().st_size
            })
        return jsonify({'files': files})
    except Exception as e:
        logger.error(f"Ошибка получения списка файлов: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/open/<filename>', methods=['POST'])
def open_file(filename):
    """Открывает файл по имени"""
    try:
        file_path = Path(filename)
        if not file_path.exists():
            return jsonify({'error': 'Файл не найден'}), 404
        
        success, message = ovv_manager.start_onevolumeviewer(str(file_path))
        
        if success:
            return jsonify({
                'success': True,
                'message': message,
                'file': filename
            })
        else:
            return jsonify({'error': message}), 500
            
    except Exception as e:
        logger.error(f"Ошибка открытия файла: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Запуск OneVolumeViewer Integration Server...")
    
    # Проверяем наличие OneVolumeViewer
    if not ovv_manager.find_onevolumeviewer():
        logger.error("OneVolumeViewer.exe не найден! Убедитесь, что файл находится в текущей директории.")
        sys.exit(1)
    
    # Запускаем сервер
    app.run(host='0.0.0.0', port=8001, debug=True) 