from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

def get_auth_headers():
    """Вспомогательная функция для получения токена авторизации"""
    # Регистрация пользователя
    client.post(
        "/auth/register",
        json={
            "email": "clinic_test@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    
    # Вход
    response = client.post(
        "/auth/token",
        data={
            "username": "clinic_test@example.com",
            "password": "testpassword"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_clinic():
    headers = get_auth_headers()
    response = client.post(
        "/clinics/",
        headers=headers,
        json={
            "name": "Test Clinic",
            "address": "123 Test St"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Clinic"
    assert data["address"] == "123 Test St"
    assert "id" in data

def test_get_clinics():
    headers = get_auth_headers()
    
    # Создаем несколько клиник
    for i in range(3):
        client.post(
            "/clinics/",
            headers=headers,
            json={
                "name": f"Test Clinic {i}",
                "address": f"{i} Test St"
            }
        )
    
    # Получаем список клиник
    response = client.get("/clinics/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert all(isinstance(clinic["id"], int) for clinic in data)

def test_get_clinic():
    headers = get_auth_headers()
    
    # Создаем клинику
    create_response = client.post(
        "/clinics/",
        headers=headers,
        json={
            "name": "Test Clinic Detail",
            "address": "456 Test St"
        }
    )
    clinic_id = create_response.json()["id"]
    
    # Получаем информацию о клинике
    response = client.get(f"/clinics/{clinic_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Clinic Detail"
    assert data["address"] == "456 Test St"
    assert data["id"] == clinic_id

def test_add_clinic_user():
    headers = get_auth_headers()
    
    # Создаем клинику
    create_response = client.post(
        "/clinics/",
        headers=headers,
        json={
            "name": "Test Clinic Users",
            "address": "789 Test St"
        }
    )
    clinic_id = create_response.json()["id"]
    
    # Регистрируем нового пользователя
    client.post(
        "/auth/register",
        json={
            "email": "new_user@example.com",
            "password": "testpassword",
            "full_name": "New User"
        }
    )
    
    # Добавляем пользователя в клинику
    response = client.post(
        f"/clinics/{clinic_id}/users",
        headers=headers,
        json={
            "user_id": 2,  # ID второго пользователя
            "clinic_id": clinic_id,
            "role": "doctor"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "doctor"
    assert data["clinic_id"] == clinic_id

def test_get_clinic_users():
    headers = get_auth_headers()
    
    # Создаем клинику
    create_response = client.post(
        "/clinics/",
        headers=headers,
        json={
            "name": "Test Clinic List Users",
            "address": "101 Test St"
        }
    )
    clinic_id = create_response.json()["id"]
    
    # Получаем список пользователей клиники
    response = client.get(f"/clinics/{clinic_id}/users", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Должен быть как минимум один пользователь (создатель клиники)
    assert len(data) >= 1 