from typing import List, Optional
from pydantic import BaseModel, EmailStr

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
    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    sender_email: EmailStr

class NotificationConfigUpdate(BaseModel):
    alert_threshold: Optional[int] = None
    is_enabled: Optional[bool] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    sender_email: Optional[EmailStr] = None

class NotificationConfigResponse(NotificationConfigBase):
    id: int

    class Config:
        from_attributes = True

# Esquema para envío de notificaciones
class NotificationSendRequest(BaseModel):
    alert_id: int
    recipient_ids: List[int]
    message: Optional[str] = None 