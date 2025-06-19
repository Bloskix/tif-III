from sqlalchemy import Column, String, Boolean, Integer
from .base_model import Base

class NotificationEmail(Base):
    """Modelo para almacenar los correos destinatarios de notificaciones"""
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)  # Descripción opcional del correo (ej: "Correo del equipo de seguridad")
    is_active = Column(Boolean, default=True, nullable=False)  # Para desactivar temporalmente sin eliminar 