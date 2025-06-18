from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .base_model import Base
from .user import User

class AlertNote(Base):
    """Modelo para notas asociadas a alertas gestionadas"""
    
    # ID primario
    id = Column(Integer, primary_key=True, index=True)
    
    # Relación con la alerta gestionada
    alert_id = Column(Integer, ForeignKey("managedalert.id"), nullable=False)
    alert = relationship("ManagedAlert", backref="notes")
    
    # Contenido de la nota
    content = Column(String, nullable=False)
    
    # Autor de la nota (referencia al usuario)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", backref="alert_notes") 