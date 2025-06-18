from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from .alert import Alert

class ManagedAlertBase(BaseModel):
    """Esquema base para alertas gestionadas"""
    alert_id: str = Field(..., description="ID único de la alerta en OpenSearch")

class ManagedAlertCreate(ManagedAlertBase):
    """Esquema para crear una alerta gestionada"""
    alert_data: Alert = Field(..., description="Datos completos de la alerta de OpenSearch")

class ManagedAlertUpdate(BaseModel):
    """Esquema para actualizar una alerta gestionada"""
    state: str = Field(..., description="Nuevo estado de la alerta (abierta/cerrada)")

class ManagedAlertInDB(ManagedAlertBase):
    """Esquema para representar una alerta gestionada en la base de datos"""
    id: int = Field(..., description="ID de la alerta gestionada")
    state: str = Field(..., description="Estado actual de la alerta")
    timestamp: datetime = Field(..., description="Timestamp de la alerta")
    agent_id: str = Field(..., description="ID del agente")
    agent_name: str = Field(..., description="Nombre del agente")
    rule_id: str = Field(..., description="ID de la regla")
    rule_level: int = Field(..., description="Nivel de severidad de la regla")
    rule_description: str = Field(..., description="Descripción de la regla")
    alert_data: Optional[Dict[str, Any]] = Field(None, description="Datos completos de la alerta")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Fecha de última actualización")

    class Config:
        from_attributes = True

class ManagedAlertResponse(BaseModel):
    """Esquema para la respuesta paginada de alertas gestionadas"""
    total: int = Field(..., description="Total de alertas encontradas")
    alerts: List[ManagedAlertInDB] = Field(..., description="Lista de alertas")
    page: int = Field(1, description="Página actual")
    size: int = Field(..., description="Tamaño de página") 