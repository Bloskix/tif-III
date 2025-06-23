from typing import List, Optional, Tuple
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.notification_config import NotificationConfig
from app.models.notification_email import NotificationEmail
from app.models.notification_history import NotificationHistory
from app.models.managed_alert import ManagedAlert
from app.models.user import User

class EmailService:
    SMTP_HOST = "smtp.gmail.com"
    SMTP_PORT = 587

    @staticmethod
    def get_config(db: Session) -> Optional[NotificationConfig]:
        """Obtiene la configuración de notificaciones. Retorna None si no existe."""
        stmt = select(NotificationConfig)
        config = db.scalars(stmt).first()
        return config

    @staticmethod
    def validate_config(config: Optional[NotificationConfig]) -> Tuple[bool, Optional[str]]:
        """
        Valida si existe una configuración válida para enviar emails.
        Retorna una tupla (is_valid, error_message).
        """
        if not config:
            return False, "No existe configuración de email. Por favor, configure primero el servicio de notificaciones."
        
        if not getattr(config, 'is_enabled', False):
            return False, "El servicio de notificaciones está deshabilitado."
        
        required_fields = ['sender_email', 'smtp_password', 'sender_name']
        for field in required_fields:
            if not getattr(config, field, None):
                return False, f"Falta configurar el campo {field} en la configuración de email."
        
        return True, None

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
    ) -> Tuple[bool, Optional[str]]:
        """
        Envía una notificación por correo sobre una alerta.
        Retorna una tupla (success, error_message).
        """
        config = EmailService.get_config(db)
        is_valid, error_message = EmailService.validate_config(config)
        
        if not is_valid:
            return False, error_message

        if not recipients:
            return False, "No se especificaron destinatarios para la notificación."

        # Crear el mensaje
        msg = MIMEMultipart()
        sender_email = getattr(config, 'sender_email')
        sender_name = getattr(config, 'sender_name')
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
            server = smtplib.SMTP(EmailService.SMTP_HOST, EmailService.SMTP_PORT)
            server.starttls()
            server.login(
                str(sender_email),  # Usar sender_email como username
                str(getattr(config, 'smtp_password'))
            )
            
            # Enviar el correo
            server.send_message(msg)
            server.quit()
            
            # Registrar éxito
            setattr(history, 'is_success', True)
            db.commit()
            return True, None

        except Exception as e:
            # Registrar error
            error_message = f"Error al enviar el email: {str(e)}"
            setattr(history, 'error_message', error_message)
            db.commit()
            return False, error_message

    @staticmethod
    def should_send_automatic_notification(db: Session, alert: ManagedAlert) -> Tuple[bool, Optional[str]]:
        """
        Determina si una alerta debe generar una notificación automática.
        Retorna una tupla (should_send, reason).
        """
        config = EmailService.get_config(db)
        is_valid, error_message = EmailService.validate_config(config)
        
        if not is_valid:
            return False, error_message

        if getattr(alert, 'rule_level') < getattr(config, 'alert_threshold'):
            return False, f"El nivel de la alerta ({getattr(alert, 'rule_level')}) es menor que el umbral configurado ({getattr(config, 'alert_threshold')})"
        
        return True, None