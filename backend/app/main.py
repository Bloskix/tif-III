from dotenv import load_dotenv
from pathlib import Path
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings, BASE_DIR

# Cargar variables de entorno al inicio
load_dotenv(BASE_DIR / ".env")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para el sistema de monitoreo de seguridad con Wazuh y OpenSearch",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, esto debe ser más restrictivo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": f"Bienvenido al {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "api_v1_url": settings.API_V1_STR
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "environment": os.getenv("ENV", "development"),
        "database": settings.POSTGRES_DB,
        "opensearch_host": settings.OPENSEARCH_HOST
    }