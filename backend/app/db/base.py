from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.base_model import Base

# Importar todos los modelos para que Alembic los detecte
from app.models.user import User
from app.models.notification_email import NotificationEmail
from app.models.notification_config import NotificationConfig
from app.models.notification_history import NotificationHistory
from app.models.managed_alert import ManagedAlert
from app.models.alert_note import AlertNote

# Crear el motor de SQLAlchemy
if not settings.SQLALCHEMY_DATABASE_URI:
    raise ValueError("Database URL is not set")

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), pool_pre_ping=True)

# Crear la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Función de utilidad para obtener la base de datos
def get_db() -> Generator:
    """
    Función de utilidad para obtener una sesión de base de datos.
    Se usa como dependencia en FastAPI.
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close() 