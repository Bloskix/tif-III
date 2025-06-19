from sqlalchemy import Column, Integer, String, Boolean
from .base_model import Base

class NotificationConfig(Base):
    """Modelo para almacenar la configuración global de notificaciones"""
    id = Column(Integer, primary_key=True, index=True)
    alert_threshold = Column(Integer, nullable=False, default=0)  # Nivel de alerta a partir del cual se envían notificaciones
    is_enabled = Column(Boolean, default=True, nullable=False)  # Para activar/desactivar todo el sistema de notificaciones
    smtp_host = Column(String(255), nullable=False, default="smtp.gmail.com")
    smtp_port = Column(Integer, nullable=False, default=587)
    smtp_username = Column(String(255), nullable=False)
    smtp_password = Column(String(255), nullable=False)  # Debería estar encriptado en producción
    sender_email = Column(String(255), nullable=False)  # Correo desde el cual se envían las notificaciones 