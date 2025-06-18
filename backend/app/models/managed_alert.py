from sqlalchemy import Column, String, Integer, JSON, Enum, DateTime
from enum import Enum as PyEnum
from .base_model import Base

class AlertState(str, PyEnum):
    """Estados posibles para una alerta gestionada"""
    OPEN = "abierta"
    CLOSED = "cerrada"

class ManagedAlert(Base):
    """Modelo para alertas que han sido gestionadas (abiertas o cerradas)"""
    
    # ID primario
    id = Column(Integer, primary_key=True, index=True)
    
    # ID único de la alerta en OpenSearch
    alert_id = Column(String, unique=True, nullable=False, index=True)
    
    # Estado de la alerta
    state = Column(String, nullable=False, default=AlertState.OPEN)
    
    # Datos de la alerta de OpenSearch (para referencia rápida)
    timestamp = Column(DateTime, nullable=False)
    agent_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    rule_id = Column(String, nullable=False)
    rule_level = Column(Integer, nullable=False)
    rule_description = Column(String, nullable=False)
    
    # Datos completos de la alerta (opcional, para no tener que consultar OpenSearch)
    alert_data = Column(JSON, nullable=True) 