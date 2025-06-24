from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class WazuhAgent(BaseModel):
    """Esquema para la información del agente de Wazuh"""
    id: str = Field(..., description="ID del agente")
    name: str = Field(..., description="Nombre del agente")
    ip: Optional[str] = Field(None, description="IP del agente")

class WazuhRule(BaseModel):
    """Esquema para la información de la regla de Wazuh"""
    id: str = Field(..., description="ID de la regla")
    level: int = Field(..., description="Nivel de severidad")
    description: str = Field(..., description="Descripción de la regla")
    groups: List[str] = Field(default_factory=list, description="Grupos de la regla")

class Alert(BaseModel):
    """Esquema principal para las alertas de Wazuh"""
    id: str = Field(..., description="ID único de la alerta en OpenSearch")
    timestamp: datetime = Field(..., description="Timestamp de la alerta")
    agent: WazuhAgent = Field(..., description="Información del agente")
    rule: WazuhRule = Field(..., description="Información de la regla")
    full_log: str = Field(..., description="Log completo de la alerta")
    location: Optional[str] = Field(None, description="Ubicación de la alerta")
    decoder: Optional[Dict[str, Any]] = Field(None, description="Información del decoder")
    data: Optional[Dict[str, Any]] = Field(None, description="Datos adicionales de la alerta")

class AlertResponse(BaseModel):
    """Esquema para la respuesta paginada de alertas"""
    total: int = Field(..., description="Total de alertas encontradas")
    alerts: List[Alert] = Field(..., description="Lista de alertas")
    page: int = Field(1, description="Página actual")
    size: int = Field(..., description="Tamaño de página")
    
class AlertFilters(BaseModel):
    """Esquema para los filtros de búsqueda de alertas"""
    agent_ids: Optional[List[str]] = Field(None, description="Lista de IDs de agentes")
    rule_levels: Optional[List[int]] = Field(None, description="Lista de niveles de reglas")
    rule_groups: Optional[List[str]] = Field(None, description="Lista de grupos de reglas")
    from_date: Optional[datetime] = Field(None, description="Fecha inicial")
    to_date: Optional[datetime] = Field(None, description="Fecha final")
    search_term: Optional[str] = Field(None, description="Término de búsqueda general")
    alert_id: Optional[str] = Field(None, description="ID específico de una alerta") 