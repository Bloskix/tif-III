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
            # Obtener el valor escalar de is_active y convertirlo a bool
            is_active_value = current_user.is_active.scalar() if hasattr(current_user.is_active, 'scalar') else current_user.is_active
            if not bool(is_active_value):
                raise HTTPException(
                    status_code=400,
                    detail="Usuario inactivo"
                )
            
            # Obtener el valor escalar del rol
            user_role = current_user.role.scalar() if hasattr(current_user.role, 'scalar') else current_user.role
            # Obtener el valor escalar de is_superuser y convertirlo a bool
            is_superuser_value = current_user.is_superuser.scalar() if hasattr(current_user.is_superuser, 'scalar') else current_user.is_superuser
            
            if str(user_role) not in [str(role) for role in allowed_roles] and not bool(is_superuser_value):
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