from typing import List, Optional, Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app.models.notification_config import NotificationConfig
from app.models.notification_email import NotificationEmail
from app.models.notification_history import NotificationHistory
from app.models.managed_alert import ManagedAlert
from app.models.user import User
from app.core.config import settings

class EmailService:
    @staticmethod
    def get_config(db: Session) -> NotificationConfig:
        """Obtiene la configuración de notificaciones, crea una por defecto si no existe"""
        stmt = select(NotificationConfig)
        config = db.scalars(stmt).first()
        
        if not config:
            # Crear configuración por defecto usando variables de entorno
            default_config: Dict[str, Any] = {
                "alert_threshold": 10,
                "is_enabled": True,
                "smtp_host": settings.SMTP_HOST,
                "smtp_port": settings.SMTP_PORT,
                "smtp_username": settings.SMTP_USER,
                "smtp_password": settings.SMTP_PASSWORD,
                "sender_email": settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
            }
            config = NotificationConfig()
            for key, value in default_config.items():
                setattr(config, key, value)
            db.add(config)
            db.commit()
            db.refresh(config)
        return config

    @staticmethod
    def get_active_recipients(db: Session) -> List[NotificationEmail]:
        """Obtiene la lista de correos destinatarios activos"""
        stmt = select(NotificationEmail).where(NotificationEmail.is_active.is_(True))
        return list(db.scalars(stmt).all())

    @staticmethod
    def send_alert_notification(
        db: Session,
        alert: ManagedAlert,
        user: User,
        recipients: List[str],
        custom_message: Optional[str] = None
    ) -> bool:
        """Envía una notificación por correo sobre una alerta"""
        config = EmailService.get_config(db)
        
        if not bool(getattr(config, 'is_enabled')):
            return False

        # Crear el mensaje
        msg = MIMEMultipart()
        sender_name = settings.EMAILS_FROM_NAME or "Sistema de Alertas"
        sender_email = getattr(config, 'sender_email')
        msg["From"] = f"{sender_name} <{sender_email}>"
        msg["To"] = ", ".join(recipients)
        msg["Subject"] = f"Alerta de Seguridad - Nivel {getattr(alert, 'rule_level')}"

        # Contenido del correo
        body = f"""
        Se ha detectado una alerta de seguridad:
        
        Agente: {getattr(alert, 'agent_name')} ({getattr(alert, 'agent_id')})
        Nivel: {getattr(alert, 'rule_level')}
        Descripción: {getattr(alert, 'rule_description')}
        Fecha: {getattr(alert, 'timestamp')}
        
        Estado: {getattr(alert, 'state')}
        """

        if custom_message:
            body += f"\nMensaje adicional:\n{custom_message}"

        msg.attach(MIMEText(body, "plain"))

        # Registrar el intento de notificación
        history = NotificationHistory()
        setattr(history, 'alert_id', getattr(alert, 'id'))
        setattr(history, 'user_id', getattr(user, 'id'))
        setattr(history, 'recipients', recipients)
        setattr(history, 'subject', msg["Subject"])
        setattr(history, 'message', custom_message)
        setattr(history, 'is_success', False)
        setattr(history, 'error_message', None)
        
        db.add(history)
        db.commit()

        try:
            # Conectar al servidor SMTP
            server = smtplib.SMTP(
                str(getattr(config, 'smtp_host')), 
                int(getattr(config, 'smtp_port'))
            )
            server.starttls()
            server.login(
                str(getattr(config, 'smtp_username')), 
                str(getattr(config, 'smtp_password'))
            )
            
            # Enviar el correo
            server.send_message(msg)
            server.quit()
            
            # Registrar éxito
            setattr(history, 'is_success', True)
            db.commit()
            return True

        except Exception as e:
            # Registrar error
            setattr(history, 'error_message', str(e))
            db.commit()
            return False

    @staticmethod
    def should_send_automatic_notification(db: Session, alert: ManagedAlert) -> bool:
        """Determina si una alerta debe generar una notificación automática"""
        config = EmailService.get_config(db)
        return bool(
            getattr(config, 'is_enabled') and
            getattr(alert, 'rule_level') >= getattr(config, 'alert_threshold')
        )