from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.base_model import Base

# Crear el motor de SQLAlchemy
engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True)

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