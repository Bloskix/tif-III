from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# Esquemas para NotificationEmail
class NotificationEmailBase(BaseModel):
    email: EmailStr
    description: Optional[str] = None
    is_active: bool = True

class NotificationEmailCreate(NotificationEmailBase):
    pass

class NotificationEmailUpdate(BaseModel):
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class NotificationEmailResponse(NotificationEmailBase):
    id: int

    class Config:
        from_attributes = True

# Esquemas para NotificationConfig
class NotificationConfigBase(BaseModel):
    alert_threshold: int
    is_enabled: bool
    sender_email: EmailStr
    smtp_password: str
    sender_name: str

class NotificationConfigUpdate(BaseModel):
    alert_threshold: Optional[int] = None
    is_enabled: Optional[bool] = None
    sender_email: Optional[EmailStr] = None
    smtp_password: Optional[str] = None
    sender_name: Optional[str] = None

class NotificationConfigResponse(NotificationConfigBase):
    id: int
    smtp_host: str
    smtp_port: int
    smtp_username: str

    class Config:
        from_attributes = True

class NotificationConfigCreate(BaseModel):
    """Schema para crear una nueva configuración de notificaciones"""
    alert_threshold: int = Field(default=15, ge=0, le=15)  # Nivel mínimo de alerta para notificar
    is_enabled: bool = True
    sender_email: EmailStr
    smtp_password: str
    sender_name: str = "Sistema de Alertas de Seguridad TIF"

# Esquema para envío de notificaciones
class NotificationSendRequest(BaseModel):
    alert_id: int
    recipient_ids: List[int]
    message: Optional[str] = None 