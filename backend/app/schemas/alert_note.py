from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from .user import UserBase

class AlertNoteBase(BaseModel):
    """Esquema base para notas de alertas"""
    content: str = Field(..., description="Contenido de la nota")

class AlertNoteCreate(AlertNoteBase):
    """Esquema para crear una nota de alerta"""
    pass

class AlertNoteUpdate(AlertNoteBase):
    pass

class AlertNoteInDB(AlertNoteBase):
    """Esquema para representar una nota de alerta en la base de datos"""
    id: int
    alert_id: int
    author_id: int
    author: Optional[UserBase] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 