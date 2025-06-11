from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from app.schemas.alert import AlertResponse, AlertFilters
from app.services.alert_service import alert_service
from app.dependencies.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=AlertResponse)
async def get_alerts(
    page: int = Query(1, ge=1, description="Número de página"),
    size: int = Query(10, ge=1, le=100, description="Tamaño de página"),
    agent_ids: Optional[List[str]] = Query(None, description="IDs de agentes"),
    rule_levels: Optional[List[int]] = Query(None, description="Niveles de reglas"),
    rule_groups: Optional[List[str]] = Query(None, description="Grupos de reglas"),
    from_date: Optional[datetime] = Query(None, description="Fecha inicial (ISO format)"),
    to_date: Optional[datetime] = Query(None, description="Fecha final (ISO format)"),
    search_term: Optional[str] = Query(None, description="Término de búsqueda general"),
    current_user = Depends(get_current_user)
):
    """
    Obtiene las alertas con paginación y filtros opcionales.
    """
    try:
        filters = AlertFilters(
            agent_ids=agent_ids,
            rule_levels=rule_levels,
            rule_groups=rule_groups,
            from_date=from_date,
            to_date=to_date,
            search_term=search_term
        )
        return await alert_service.get_alerts(page=page, size=size, filters=filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_alert_stats(
    current_user = Depends(get_current_user)
):
    """
    Obtiene estadísticas básicas de las alertas.
    """
    try:
        return await alert_service.get_alert_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 