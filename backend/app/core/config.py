from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    APP_NAME: str = "BlackScanner"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./blackscanner.db"
    
    # AI Configuration (mock by default)
    AI_PROVIDER: str = "mock"  # "openai" | "mock"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"
    
    # Scanner Configuration
    MAX_CRAWL_DEPTH: int = 3
    MAX_PAGES: int = 500
    REQUEST_TIMEOUT: int = 30
    CONCURRENT_REQUESTS: int = 10
    
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
