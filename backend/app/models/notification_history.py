from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from .base_model import Base

class NotificationHistory(Base):
    """Modelo para almacenar el historial de notificaciones enviadas"""
    id = Column(Integer, primary_key=True, index=True)
    
    # Relaciones con otros modelos
    alert_id = Column(Integer, ForeignKey("managedalert.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Información de la notificación
    recipients = Column(JSON, nullable=False)  # Lista de correos a los que se envió
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)  # Mensaje personalizado opcional
    
    # Estado del envío
    is_success = Column(Boolean, default=False, nullable=False)
    error_message = Column(Text, nullable=True)  # Si hubo error, aquí se guarda
    
    # Relaciones
    alert = relationship("ManagedAlert", backref="notifications")
    user = relationship("User", backref="sent_notifications") 