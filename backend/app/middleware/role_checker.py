from functools import wraps
from typing import List, Callable
from fastapi import HTTPException, Depends
from app.models.user import User, UserRole
from app.dependencies.auth import get_current_user
import inspect

def check_roles(allowed_roles: List[UserRole]) -> Callable:
    """
    Middleware para verificar si el usuario tiene los roles permitidos
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if not current_user.is_active:
                raise HTTPException(
                    status_code=400,
                    detail="Usuario inactivo"
                )
            
            user_role = current_user.role.scalar_value() if hasattr(current_user.role, 'scalar_value') else current_user.role
            if user_role not in allowed_roles and not current_user.is_superuser:
                raise HTTPException(
                    status_code=403,
                    detail="No tienes permisos suficientes para realizar esta acción"
                )
            
            # Si la función original es asíncrona, la ejecutamos con await
            if inspect.iscoroutinefunction(func):
                return await func(*args, current_user=current_user, **kwargs)
            # Si es síncrona, la ejecutamos normalmente
            return func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator 