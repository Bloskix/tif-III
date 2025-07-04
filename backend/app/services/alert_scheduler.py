from typing import Optional, List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from fastapi import FastAPI
from app.services.alert_service import alert_service
from app.services.review_service import review_service
from app.services.email_service import EmailService
from app.models.user import User
from app.db.base import SessionLocal
from app.schemas.alert import AlertFilters
from app.schemas.managed_alert import ManagedAlertCreate
import logging
from datetime import datetime

# Configurar el logger para mostrar timestamp
# logging.basicConfig(
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     level=logging.INFO
# )
logger = logging.getLogger(__name__)

class AlertSchedulerService:
    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self.job = None
        # logger.info("AlertSchedulerService inicializado")

    async def process_new_alerts(self):
        """
        Procesa nuevas alertas de OpenSearch que superen el umbral configurado
        """
        # logger.info("=== Iniciando proceso de nuevas alertas ===")
        start_time = datetime.now()
        
        db: Session = SessionLocal()
        try:
            # logger.info("1. Verificando configuración de email...")
            config = EmailService.get_config(db)
            is_valid, error_message = EmailService.validate_config(config)
            
            if not is_valid:
                # logger.warning(f"❌ Configuración de email inválida: {error_message}")
                return
            # logger.info("✅ Configuración de email válida")
            
            if not hasattr(config, 'alert_threshold'):
                # logger.warning("❌ No se ha configurado el umbral de alertas")
                return
            
            alert_threshold = getattr(config, 'alert_threshold')
            # logger.info(f"✅ Umbral de alertas configurado: {alert_threshold}")
            
            # logger.info("2. Buscando alertas en OpenSearch...")
            filters = AlertFilters(
                rule_levels=[level for level in range(alert_threshold, 16)],
                agent_ids=None,
                rule_groups=None,
                from_date=None,
                to_date=None,
                search_term=None,
                alert_id=None
            )
            
            alerts_response = await alert_service.get_alerts(
                page=1,
                size=20,
                filters=filters
            )
            
            if not alerts_response or not hasattr(alerts_response, 'alerts'):
                # logger.info("❌ No se encontraron alertas nuevas")
                return
            
            total_alerts = len(alerts_response.alerts)
            # logger.info(f"✅ Se encontraron {total_alerts} alertas para procesar")
            
            alerts_processed = 0
            alerts_saved = 0
            emails_sent = 0
            
            # logger.info("3. Procesando alertas encontradas...")
            for idx, alert in enumerate(alerts_response.alerts, 1):
                try:
                    # logger.info(f"\n--- Procesando alerta {idx}/{total_alerts} ---")
                    # logger.info(f"ID: {alert.id}")
                    # logger.info(f"Nivel: {alert.rule.level}")
                    # logger.info(f"Descripción: {alert.rule.description}")
                    
                    alert_create = ManagedAlertCreate(
                        alert_id=alert.id,
                        alert_data=alert
                    )
                    
                    # logger.info("4. Intentando guardar alerta en DB...")
                    managed_alert = await review_service.create_managed_alert(db, alert_create)
                    if not managed_alert:
                        # logger.info("⚠️ La alerta ya existe en la DB, saltando...")
                        continue
                    
                    # logger.info("✅ Alerta guardada exitosamente")
                    alerts_saved += 1
                    
                    # logger.info("5. Obteniendo destinatarios de email...")
                    recipients: List[str] = [str(email.email) for email in EmailService.get_active_recipients(db)]
                    if not recipients:
                        # logger.warning("⚠️ No hay destinatarios configurados para las notificaciones")
                        continue
                    # logger.info(f"✅ Destinatarios encontrados: {len(recipients)}")
                    
                    # logger.info("6. Obteniendo usuario para registro...")
                    user = db.query(User).first()
                    if not user:
                        # logger.error("❌ No se encontró un usuario para registrar la notificación")
                        continue
                    # logger.info(f"✅ Usuario seleccionado: {user.email}")
                    
                    # logger.info("7. Enviando notificación por email...")
                    success, error = EmailService.send_alert_notification(
                        db=db,
                        alert=managed_alert,
                        user=user,
                        recipients=recipients
                    )
                    
                    if not success:
                        # logger.error(f"❌ Error al enviar notificación: {error}")
                        pass
                    else:
                        # logger.info("✅ Email enviado exitosamente")
                        emails_sent += 1
                    
                    alerts_processed += 1
                    
                except Exception as e:
                    # logger.error(f"❌ Error procesando alerta {getattr(alert, 'id', 'unknown')}: {str(e)}")
                    continue

            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            # logger.info("\n=== Resumen de la ejecución ===")
            # logger.info(f"Tiempo de ejecución: {duration:.2f} segundos")
            # logger.info(f"Alertas encontradas: {total_alerts}")
            # logger.info(f"Alertas procesadas: {alerts_processed}")
            # logger.info(f"Alertas guardadas: {alerts_saved}")
            # logger.info(f"Emails enviados: {emails_sent}")
            # logger.info("================================")

        except Exception as e:
            # logger.error(f"❌ Error general en el procesamiento de alertas: {str(e)}")
            pass
        finally:
            db.close()
            # logger.info("Conexión a DB cerrada")

    def start(self, app: Optional[FastAPI] = None):
        """Inicia el scheduler"""
        if self.scheduler:
            # logger.warning("⚠️ Scheduler ya está iniciado")
            return

        self.scheduler = AsyncIOScheduler()
        
        self.job = self.scheduler.add_job(
            self.process_new_alerts,
            trigger=IntervalTrigger(minutes=1),
            id='process_new_alerts',
            name='Procesar nuevas alertas de OpenSearch',
            replace_existing=True
        )
        
        self.scheduler.start()
        # logger.info("✅ Scheduler de alertas iniciado - ejecutando cada 1 minuto")

        if app:
            @app.on_event("shutdown")
            async def shutdown_scheduler():
                self.stop()

    def stop(self):
        """Detiene el scheduler"""
        if self.scheduler:
            self.scheduler.shutdown()
            self.scheduler = None
            # logger.info("🛑 Scheduler de alertas detenido")

alert_scheduler = AlertSchedulerService() 