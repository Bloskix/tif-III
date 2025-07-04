from dotenv import load_dotenv
from pathlib import Path
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings, BASE_DIR
from app.api import auth, users, alerts, review, notifications
from app.scripts.create_initial_admin import create_initial_admin
from app.opensearch.client import opensearch_client
from app.services.alert_scheduler import alert_scheduler

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
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verificar conexión con OpenSearch
opensearch_client.check_connection()

# Incluir las rutas de autenticación
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["authentication"]
)

# Incluir las rutas de usuarios
app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}",
    tags=["users"]
)

# Incluir las rutas de alertas
app.include_router(
    alerts.router,
    prefix=f"{settings.API_V1_STR}/alerts",
    tags=["alerts"]
)

# Incluir las rutas de revisión de alertas
app.include_router(
    review.router,
    prefix=f"{settings.API_V1_STR}/review",
    tags=["review"]
)

# Incluir las rutas de notificaciones
app.include_router(
    notifications.router,
    prefix=f"{settings.API_V1_STR}/notifications",
    tags=["notifications"]
)

# Crear admin inicial si no existe
create_initial_admin()

# Iniciar el scheduler de alertas
alert_scheduler.start(app)

@app.get("/")
async def root():
    return {
        "message": f"Bienvenido al {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "api_v1_url": settings.API_V1_STR
    }

@app.get("/health")
async def health_check():
    is_connected = opensearch_client.check_connection()
    return {
        "status": "ok",
        "environment": os.getenv("ENV", "development"),
        "database": settings.POSTGRES_DB,
        "opensearch": {
            "host": settings.OPENSEARCH_HOST,
            "connected": is_connected
        }
    }