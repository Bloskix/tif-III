from datetime import datetime
from typing import Any, Dict
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    __name__: str
    __table__: Any

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """Genera el nombre de la tabla automáticamente"""
        return cls.__name__.lower()
    
    def dict(self) -> Dict[str, Any]:
        """Convierte el modelo a un diccionario"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}