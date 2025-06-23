from pydantic_settings import BaseSettings
from typing import Optional, List
from dotenv import load_dotenv
import os
from pathlib import Path
import json
from pydantic import EmailStr

BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / ".env")

class Settings(BaseSettings):
    ENV: str = "development"
    PROJECT_NAME: str = "Sistema de Monitoreo de Seguridad"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    BACKEND_CORS_ORIGINS: List[str] = []

    @property
    def BACKEND_CORS_ORIGINS_LIST(self) -> List[str]:
        try:
            return json.loads(os.getenv("BACKEND_CORS_ORIGINS", "[]"))
        except json.JSONDecodeError:
            return []
    
    # Variables de Base de Datos
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # Variables de Seguridad
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Variables de Admin Inicial
    INITIAL_ADMIN_EMAIL: str
    INITIAL_ADMIN_USERNAME: str
    INITIAL_ADMIN_PASSWORD: str

    # Variables de OpenSearch
    OPENSEARCH_HOST: str
    OPENSEARCH_PORT: int
    OPENSEARCH_INDEX: str
    OPENSEARCH_USER: str
    OPENSEARCH_PASSWORD: str
    OPENSEARCH_USE_SSL: bool = True
    OPENSEARCH_VERIFY_CERTS: bool = True
    OPENSEARCH_CA_CERTS: str = str(BASE_DIR / "app" / "opensearch" / "certs" / "opensearch.crt")

    class Config:
        case_sensitive = True
        env_file = str(BASE_DIR / ".env")
        validate_default = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._init_database_url()
        self._validate_config()
        self.BACKEND_CORS_ORIGINS = self.BACKEND_CORS_ORIGINS_LIST

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
            assert self.SECRET_KEY, "SECRET_KEY es requerida en producción"
            assert self.POSTGRES_PASSWORD, "La contraseña de PostgreSQL es requerida en producción"
            assert self.OPENSEARCH_PASSWORD, "La contraseña de OpenSearch es requerida en producción"
            if self.OPENSEARCH_VERIFY_CERTS:
                assert os.path.exists(self.OPENSEARCH_CA_CERTS), "El certificado CA de OpenSearch no existe"

settings = Settings()