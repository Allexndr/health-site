from pydantic import BaseModel
from functools import lru_cache
import os
from typing import List

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Medical Imaging System")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")  # В продакшене использовать безопасный ключ
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "11520"))  # 8 дней
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = os.getenv("BACKEND_CORS_ORIGINS", '["*"]').strip('[]').replace('"', '').split(',')

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings() 