import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Klyros Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB Config
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "klyros"
    
    # JWT Config
    JWT_SECRET: str = "super-secret-klyros-hackathon-key-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI Provider Selection
    AI_PROVIDER: str = "qwen"
    VISION_PROVIDER: str = "qwen"
    TEXT_PROVIDER: str = "qwen"
    
    # Groq API Config
    GROQ_API_KEY: Optional[str] = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_VISION_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_TEXT_MODEL: str = "llama-3.3-70b-versatile"
    
    # Qwen / Together.ai Config
    QWEN_API_KEY: Optional[str] = None
    QWEN_BASE_URL: str = "https://api.together.xyz/v1"
    QWEN_VISION_MODEL: str = "Qwen/Qwen2.5-VL-7B-Instruct"
    QWEN_TEXT_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    
    # Storage Config
    STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")
    BASE_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

os.makedirs(settings.STORAGE_DIR, exist_ok=True)
