from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.dependencies.auth import get_current_user
from app.schemas.managed_alert import (
    ManagedAlertCreate,
    ManagedAlertUpdate,
    ManagedAlertResponse,
    ManagedAlertInDB
)
from app.schemas.alert_note import AlertNoteCreate, AlertNoteUpdate, AlertNoteInDB
from app.models.user import User
from app.models.managed_alert import AlertState
from app.services.review_service import review_service

router = APIRouter()

@router.post("", response_model=ManagedAlertInDB)
async def create_managed_alert(
    *,
    alert: ManagedAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea una alerta gestionada (la marca como "abierta").
    Solo operadores autenticados pueden crear alertas gestionadas.
    """
    result = await review_service.create_managed_alert(db=db, alert=alert)
    if not result:
        raise HTTPException(
            status_code=400,
            detail="Esta alerta ya está siendo gestionada"
        )
    return result

@router.get("", response_model=ManagedAlertResponse)
async def get_managed_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Tamaño de página"),
    state: Optional[str] = Query(None, description="Filtrar por estado (abierta/cerrada)")
):
    """
    Obtiene la lista de alertas gestionadas con paginación.
    Opcionalmente se puede filtrar por estado.
    """
    if state and state not in [AlertState.OPEN.value, AlertState.CLOSED.value]:
        raise HTTPException(
            status_code=400,
            detail="Estado no válido. Debe ser 'abierta' o 'cerrada'"
        )
    
    return await review_service.get_managed_alerts(
        db=db,
        page=page,
        size=size,
        state=state
    )

@router.get("/{alert_id}", response_model=ManagedAlertInDB)
async def get_managed_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene el detalle de una alerta gestionada específica.
    """
    alert = await review_service.get_managed_alert(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alert

@router.put("/{alert_id}", response_model=ManagedAlertInDB)
async def update_managed_alert(
    *,
    alert_id: int,
    alert_update: ManagedAlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza el estado de una alerta gestionada.
    """
    if alert_update.state not in [AlertState.OPEN.value, AlertState.CLOSED.value]:
        raise HTTPException(
            status_code=400,
            detail="Estado no válido. Debe ser 'abierta' o 'cerrada'"
        )

    alert = await review_service.update_managed_alert(
        db=db,
        alert_id=alert_id,
        alert_update=alert_update
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return alert

@router.post("/{alert_id}/notes", response_model=AlertNoteInDB)
async def create_alert_note(
    *,
    alert_id: int,
    note: AlertNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Agrega una nota a una alerta gestionada.
    """
    result = await review_service.create_alert_note(
        db=db,
        alert_id=alert_id,
        note=note,
        author_id=current_user.id
    )
    if not result:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    return result

@router.get("/{alert_id}/notes", response_model=list[AlertNoteInDB])
async def get_alert_notes(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene todas las notas de una alerta gestionada.
    """
    # Verificar que la alerta existe
    alert = await review_service.get_managed_alert(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    return await review_service.get_alert_notes(db=db, alert_id=alert_id)

@router.put("/{alert_id}/notes/{note_id}", response_model=AlertNoteInDB)
async def update_alert_note(
    *,
    alert_id: int,
    note_id: int,
    note: AlertNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza una nota de una alerta gestionada.
    Solo el autor original puede modificar la nota.
    """
    result = await review_service.update_alert_note(
        db=db,
        alert_id=alert_id,
        note_id=note_id,
        note_update=note,
        author_id=current_user.id
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Nota no encontrada o no tienes permiso para modificarla"
        )
    return result 