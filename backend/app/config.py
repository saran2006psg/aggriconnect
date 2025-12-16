from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Database
    DATABASE_URL: str = ""
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "AgriConnect Backend"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Business Logic
    PLATFORM_COMMISSION_RATE: float = 12.5  # percentage
    
    # OAuth/Frontend
    FRONTEND_CALLBACK_URL: str = "http://localhost:5173/auth/callback"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Global settings instance
settings = Settings()
