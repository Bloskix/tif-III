from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.models.notification_email import NotificationEmail
from app.models.managed_alert import ManagedAlert
from app.models.notification_config import NotificationConfig
from app.services.email_service import EmailService
from app.middleware.role_checker import check_roles
from app.schemas.notification import (
    NotificationEmailCreate,
    NotificationEmailUpdate,
    NotificationEmailResponse,
    NotificationConfigUpdate,
    NotificationConfigResponse,
    NotificationConfigCreate,
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
    if not config:
        raise HTTPException(
            status_code=404,
            detail="No existe configuración de notificaciones. Por favor, créela primero."
        )
    return config

@router.post("/notification/config", response_model=NotificationConfigResponse)
@check_roles([UserRole.ADMIN])
def create_notification_config(
    config: NotificationConfigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Crea la configuración inicial de notificaciones"""
    # Verificar si ya existe una configuración
    existing_config = EmailService.get_config(db)
    if existing_config:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una configuración de notificaciones. Use PUT para actualizarla."
        )
    
    # Crear nueva configuración
    config_dict = config.dict()
    config_dict['smtp_username'] = config_dict['sender_email']  # Autocompletar smtp_username
    new_config = NotificationConfig(**config_dict)
    db.add(new_config)
    try:
        db.commit()
        db.refresh(new_config)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Error al crear la configuración: {str(e)}"
        )
    return new_config

@router.put("/notification/config", response_model=NotificationConfigResponse)
@check_roles([UserRole.ADMIN])
def update_notification_config(
    config: NotificationConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualiza la configuración de notificaciones"""
    current_config = EmailService.get_config(db)
    update_data = config.dict(exclude_unset=True)
    
    # Si se actualiza sender_email, actualizar también smtp_username
    if 'sender_email' in update_data:
        update_data['smtp_username'] = update_data['sender_email']
    
    for key, value in update_data.items():
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
    success, error_message = EmailService.send_alert_notification(
        db=db,
        alert=alert,
        user=current_user,
        recipients=[getattr(email, 'email') for email in emails],
        custom_message=request.message
    )
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail=error_message or "Error al enviar la notificación"
        )
    
    return {"message": "Notificación enviada correctamente"} 