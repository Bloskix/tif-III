from typing import Optional, List, Sequence, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from app.models.managed_alert import ManagedAlert, AlertState
from app.models.alert_note import AlertNote
from app.schemas.managed_alert import ManagedAlertCreate, ManagedAlertUpdate, ManagedAlertResponse, ManagedAlertInDB
from app.schemas.alert_note import AlertNoteCreate, AlertNoteUpdate

class ReviewService:
    def _serialize_datetime(self, obj: Any) -> Any:
        """Convierte objetos datetime a strings ISO en un diccionario anidado"""
        if isinstance(obj, dict):
            return {key: self._serialize_datetime(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_datetime(item) for item in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return obj

    async def create_managed_alert(self, db: Session, alert: ManagedAlertCreate) -> Optional[ManagedAlert]:
        """Crea una nueva alerta gestionada"""
        # Verificar si la alerta ya existe
        existing_alert = db.query(ManagedAlert).filter(
            ManagedAlert.alert_id == alert.alert_id
        ).first()
        if existing_alert:
            return None

        # Crear la alerta gestionada
        alert_data = alert.alert_data.model_dump()
        # Serializar los datetime en alert_data
        alert_data = self._serialize_datetime(alert_data)
        
        db_alert = ManagedAlert()
        for key, value in {
            "alert_id": alert.alert_id,
            "state": AlertState.OPEN.value,
            "timestamp": alert.alert_data.timestamp,
            "agent_id": alert.alert_data.agent.id,
            "agent_name": alert.alert_data.agent.name,
            "rule_id": alert.alert_data.rule.id,
            "rule_level": alert.alert_data.rule.level,
            "rule_description": alert.alert_data.rule.description,
            "alert_data": alert_data
        }.items():
            setattr(db_alert, key, value)

        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert

    async def get_managed_alerts(
        self,
        db: Session,
        page: int = 1,
        size: int = 10,
        state: Optional[str] = None
    ) -> ManagedAlertResponse:
        """Obtiene la lista de alertas gestionadas con paginación"""
        query = db.query(ManagedAlert)
        
        # Aplicar filtro por estado si se especifica
        if state and state in [AlertState.OPEN.value, AlertState.CLOSED.value]:
            query = query.filter(ManagedAlert.state == state)
        
        # Obtener total de registros
        total = query.count()
        
        # Aplicar paginación
        alerts: Sequence[ManagedAlert] = query.order_by(desc(ManagedAlert.created_at))\
            .offset((page - 1) * size)\
            .limit(size)\
            .all()
        
        return ManagedAlertResponse(
            total=total,
            alerts=alerts,  # type: ignore
            page=page,
            size=size
        )

    async def get_managed_alert(self, db: Session, alert_id: int) -> Optional[ManagedAlert]:
        """Obtiene una alerta gestionada por su ID"""
        return db.query(ManagedAlert).filter(ManagedAlert.id == alert_id).first()

    async def update_managed_alert(
        self,
        db: Session,
        alert_id: int,
        alert_update: ManagedAlertUpdate
    ) -> Optional[ManagedAlert]:
        """Actualiza el estado de una alerta gestionada"""
        db_alert = await self.get_managed_alert(db, alert_id)
        if not db_alert or alert_update.state not in [AlertState.OPEN.value, AlertState.CLOSED.value]:
            return None

        # Actualizar el estado
        setattr(db_alert, 'state', alert_update.state)
        db.commit()
        db.refresh(db_alert)
        return db_alert

    async def create_alert_note(
        self,
        db: Session,
        alert_id: int,
        note: AlertNoteCreate,
        author_id: int
    ) -> Optional[AlertNote]:
        """Crea una nueva nota para una alerta gestionada"""
        # Verificar que la alerta existe
        db_alert = await self.get_managed_alert(db, alert_id)
        if not db_alert:
            return None

        # Crear la nota
        db_note = AlertNote()
        for key, value in {
            "alert_id": alert_id,
            "content": note.content,
            "author_id": author_id
        }.items():
            setattr(db_note, key, value)

        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

    async def get_alert_notes(
        self,
        db: Session,
        alert_id: int
    ) -> List[AlertNote]:
        """Obtiene todas las notas de una alerta gestionada"""
        return db.query(AlertNote)\
            .filter(AlertNote.alert_id == alert_id)\
            .order_by(desc(AlertNote.created_at))\
            .all()

    async def update_alert_note(
        self,
        db: Session,
        alert_id: int,
        note_id: int,
        note_update: AlertNoteUpdate,
        author_id: int
    ) -> Optional[AlertNote]:
        """Actualiza una nota de una alerta gestionada"""
        # Verificar que la nota existe y pertenece a la alerta
        db_note = db.query(AlertNote)\
            .filter(AlertNote.id == note_id, AlertNote.alert_id == alert_id)\
            .first()
        
        if not db_note:
            return None

        # Actualizar la nota
        for key, value in note_update.model_dump().items():
            setattr(db_note, key, value)
        
        # Actualizar el autor al último usuario que modificó la nota
        setattr(db_note, 'author_id', author_id)

        db.commit()
        db.refresh(db_note)
        return db_note

# Instancia global del servicio
review_service = ReviewService() 