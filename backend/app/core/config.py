from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
import os
from pathlib import Path

# Obtener la ruta base del proyecto (directorio backend)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Cargar variables de entorno desde la ubicación correcta
load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    # Configuración general
    ENV: str = "development"
    PROJECT_NAME: str = "Sistema de Monitoreo de Seguridad"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Configuración de base de datos
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # Configuración JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Configuración OpenSearch
    OPENSEARCH_HOST: str = os.getenv("OPENSEARCH_HOST")
    OPENSEARCH_PORT: int = int(os.getenv("OPENSEARCH_PORT"))
    OPENSEARCH_USER: str = os.getenv("OPENSEARCH_USER")
    OPENSEARCH_PASSWORD: str = os.getenv("OPENSEARCH_PASSWORD")
    OPENSEARCH_USE_SSL: bool = os.getenv("OPENSEARCH_USE_SSL", "true").lower() == "true"
    OPENSEARCH_VERIFY_CERTS: bool = os.getenv("OPENSEARCH_VERIFY_CERTS", "false").lower() == "true"

    # Configuración Email
    SMTP_HOST: str = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT"))
    SMTP_USER: str = os.getenv("SMTP_USER")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "")

    class Config:
        case_sensitive = True
        env_file = str(BASE_DIR / ".env")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._init_database_url()
        self._validate_config()

    def _init_database_url(self) -> None:
        """Inicializa la URL de la base de datos si no está configurada"""
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
            )

    def _validate_config(self) -> None:
        """Valida la configuración crítica"""
        if self.ENV == "production":
            assert self.SECRET_KEY != "your-secret-key-here", "Debe cambiar la SECRET_KEY en producción"
            assert self.POSTGRES_PASSWORD, "La contraseña de PostgreSQL es requerida en producción"
            assert self.OPENSEARCH_PASSWORD != "admin", "Debe cambiar la contraseña de OpenSearch en producción"

settings = Settings()