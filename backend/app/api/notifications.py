from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.models.notification_email import NotificationEmail
from app.models.managed_alert import ManagedAlert
from app.services.email_service import EmailService
from app.middleware.role_checker import check_roles
from app.schemas.notification import (
    NotificationEmailCreate,
    NotificationEmailUpdate,
    NotificationEmailResponse,
    NotificationConfigUpdate,
    NotificationConfigResponse,
    NotificationSendRequest
)

router = APIRouter()

# Endpoints para administradores

@router.get("/notification/config", response_model=NotificationConfigResponse)
@check_roles([UserRole.ADMIN])
def get_notification_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtiene la configuración actual de notificaciones"""
    config = EmailService.get_config(db)
    return config

@router.put("/notification/config", response_model=NotificationConfigResponse)
@check_roles([UserRole.ADMIN])
def update_notification_config(
    config: NotificationConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualiza la configuración de notificaciones"""
    current_config = EmailService.get_config(db)
    for key, value in config.dict(exclude_unset=True).items():
        setattr(current_config, key, value)
    db.commit()
    db.refresh(current_config)
    return current_config

@router.get("/notification/emails", response_model=List[NotificationEmailResponse])
@check_roles([UserRole.ADMIN])
def get_notification_emails(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todos los correos destinatarios configurados"""
    return db.query(NotificationEmail).all()

@router.post("/notification/emails", response_model=NotificationEmailResponse)
@check_roles([UserRole.ADMIN])
def create_notification_email(
    email: NotificationEmailCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Agrega un nuevo correo destinatario"""
    db_email = NotificationEmail(**email.dict())
    db.add(db_email)
    try:
        db.commit()
        db.refresh(db_email)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="El correo ya existe")
    return db_email

@router.put("/notification/emails/{email_id}", response_model=NotificationEmailResponse)
@check_roles([UserRole.ADMIN])
def update_notification_email(
    email_id: int,
    email: NotificationEmailUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualiza un correo destinatario"""
    db_email = db.query(NotificationEmail).filter(NotificationEmail.id == email_id).first()
    if not db_email:
        raise HTTPException(status_code=404, detail="Correo no encontrado")
    
    for key, value in email.dict(exclude_unset=True).items():
        setattr(db_email, key, value)
    db.commit()
    db.refresh(db_email)
    return db_email

@router.delete("/notification/emails/{email_id}")
@check_roles([UserRole.ADMIN])
def delete_notification_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Elimina un correo destinatario"""
    db_email = db.query(NotificationEmail).filter(NotificationEmail.id == email_id).first()
    if not db_email:
        raise HTTPException(status_code=404, detail="Correo no encontrado")
    
    db.delete(db_email)
    db.commit()
    return {"message": "Correo eliminado"}

# Endpoint para operadores

@router.post("/notification/send")
def send_notification(
    request: NotificationSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Envía una notificación manual para una alerta"""
    # Verificar que la alerta existe
    alert = db.query(ManagedAlert).filter(ManagedAlert.id == request.alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    # Verificar que los correos existen y están activos
    query = db.query(NotificationEmail).filter(
        NotificationEmail.id.in_(request.recipient_ids),
        NotificationEmail.is_active == True
    )
    
    emails = query.all()
    
    if not emails:
        raise HTTPException(status_code=400, detail="No se encontraron correos válidos")
    
    # Enviar la notificación
    success = EmailService.send_alert_notification(
        db=db,
        alert=alert,
        user=current_user,
        recipients=[getattr(email, 'email') for email in emails],
        custom_message=request.message
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Error al enviar la notificación")
    
    return {"message": "Notificación enviada correctamente"} 