from fastapi.testclient import TestClient
import pytest
import os
from PIL import Image
import io

from app.main import app

client = TestClient(app)

def get_auth_headers():
    """Вспомогательная функция для получения токена авторизации"""
    # Регистрация пользователя
    client.post(
        "/auth/register",
        json={
            "email": "image_test@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    
    # Вход
    response = client.post(
        "/auth/token",
        data={
            "username": "image_test@example.com",
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def create_test_clinic(headers):
    """Вспомогательная функция для создания тестовой клиники"""
    response = client.post(
        "/clinics/",
        headers=headers,
        json={
            "name": "Test Clinic for Images",
            "address": "123 Test St"
        }
    )
    return response.json()["id"]

def create_test_image():
    """Создает тестовое изображение"""
    image = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

def test_upload_image():
    headers = get_auth_headers()
    clinic_id = create_test_clinic(headers)
    
    # Создаем тестовое изображение
    img_byte_arr = create_test_image()
    
    # Загружаем изображение
    files = {"file": ("test.png", img_byte_arr, "image/png")}
    response = client.post(
        f"/images/upload?clinic_id={clinic_id}",
        headers=headers,
        files=files
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.png"
    assert data["mime_type"] == "image/png"
    assert data["clinic_id"] == clinic_id
    assert "id" in data

def test_get_clinic_images():
    headers = get_auth_headers()
    clinic_id = create_test_clinic(headers)
    
    # Загружаем несколько изображений
    for i in range(3):
        img_byte_arr = create_test_image()
        files = {"file": (f"test_{i}.png", img_byte_arr, "image/png")}
        client.post(
            f"/images/upload?clinic_id={clinic_id}",
            headers=headers,
            files=files
        )
    
    # Получаем список изображений
    response = client.get(f"/images/clinic/{clinic_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert all(isinstance(image["id"], int) for image in data)

def test_get_image():
    headers = get_auth_headers()
    clinic_id = create_test_clinic(headers)
    
    # Загружаем изображение
    img_byte_arr = create_test_image()
    files = {"file": ("test_detail.png", img_byte_arr, "image/png")}
    upload_response = client.post(
        f"/images/upload?clinic_id={clinic_id}",
        headers=headers,
        files=files
    )
    image_id = upload_response.json()["id"]
    
    # Получаем информацию об изображении
    response = client.get(f"/images/{image_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test_detail.png"
    assert data["mime_type"] == "image/png"
    assert "metadata" in data

def test_download_image():
    headers = get_auth_headers()
    clinic_id = create_test_clinic(headers)
    
    # Загружаем изображение
    img_byte_arr = create_test_image()
    files = {"file": ("test_download.png", img_byte_arr, "image/png")}
    upload_response = client.post(
        f"/images/upload?clinic_id={clinic_id}",
        headers=headers,
        files=files
    )
    image_id = upload_response.json()["id"]
    
    # Скачиваем изображение
    response = client.get(f"/images/{image_id}/download", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    
    # Проверяем, что можем открыть скачанное изображение
    img = Image.open(io.BytesIO(response.content))
    assert img.size == (100, 100)

def test_delete_image():
    headers = get_auth_headers()
    clinic_id = create_test_clinic(headers)
    
    # Загружаем изображение
    img_byte_arr = create_test_image()
    files = {"file": ("test_delete.png", img_byte_arr, "image/png")}
    upload_response = client.post(
        f"/images/upload?clinic_id={clinic_id}",
        headers=headers,
        files=files
    )
    image_id = upload_response.json()["id"]
    
    # Удаляем изображение
    response = client.delete(f"/images/{image_id}", headers=headers)
    assert response.status_code == 200
    
    # Проверяем, что изображение удалено
    get_response = client.get(f"/images/{image_id}", headers=headers)
    assert get_response.status_code == 404 