from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .user import UserBase

class AlertNoteBase(BaseModel):
    """Esquema base para notas de alertas"""
    content: str = Field(..., description="Contenido de la nota")

class AlertNoteCreate(AlertNoteBase):
    """Esquema para crear una nota de alerta"""
    pass

class AlertNoteInDB(AlertNoteBase):
    """Esquema para representar una nota de alerta en la base de datos"""
    id: int = Field(..., description="ID de la nota")
    alert_id: int = Field(..., description="ID de la alerta gestionada")
    author_id: int = Field(..., description="ID del autor")
    author: UserBase = Field(..., description="Información del autor")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: datetime = Field(..., description="Fecha de última actualización")

    class Config:
        from_attributes = True 