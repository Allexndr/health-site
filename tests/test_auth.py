from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base
from app.routes.auth import get_db

# Создаем тестовую базу данных в памяти
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data

def test_register_duplicate_user():
    # Первая регистрация
    client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    
    # Повторная регистрация
    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login():
    # Регистрация пользователя
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    
    # Попытка входа
    response = client.post(
        "/auth/token",
        data={
            "username": "login@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password():
    # Регистрация пользователя
    client.post(
        "/auth/register",
        json={
            "email": "wrong@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    
    # Попытка входа с неверным паролем
    response = client.post(
        "/auth/token",
        data={
            "username": "wrong@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_get_current_user():
    # Регистрация и вход
    client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "password": "testpassword",
            "full_name": "Test User"
        }
    )
    
    login_response = client.post(
        "/auth/token",
        data={
            "username": "me@example.com",
            "password": "testpassword"
        }
    )
    token = login_response.json()["access_token"]
    
    # Получение информации о текущем пользователе
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["full_name"] == "Test User" 