from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate, UserRoleUpdate, UserList
from app.dependencies.auth import get_current_user
from app.middleware.role_checker import check_roles

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_own_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permite a un usuario modificar su propio perfil
    """
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # No permitir cambiar el rol ni el estado de superusuario desde aquí
    update_data = user_update.dict(exclude_unset=True)
    update_data.pop("is_active", None)
    if "role" in update_data:
        update_data.pop("role")
    if "is_superuser" in update_data:
        update_data.pop("is_superuser")
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("", response_model=UserList)
@check_roles([UserRole.ADMIN])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener lista de usuarios (solo admin)
    """
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    return UserList(total=total, users=users)

@router.get("/{user_id}", response_model=UserResponse)
@check_roles([UserRole.ADMIN])
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener un usuario específico por ID (solo admin)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@router.put("/{user_id}", response_model=UserResponse)
@check_roles([UserRole.ADMIN])
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar información de un usuario (solo admin)
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Actualizar campos si están presentes en la solicitud
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/{user_id}/role", response_model=UserResponse)
@check_roles([UserRole.ADMIN])
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar el rol de un usuario (solo admin)
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar que no sea el último admin
    if db_user.role == UserRole.ADMIN and role_update.role != UserRole.ADMIN:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="No se puede cambiar el rol del último administrador"
            )
    
    db_user.role = role_update.role
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@check_roles([UserRole.ADMIN])
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar un usuario (solo admin)
    """
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Verificar que no sea el último admin
    if db_user.role == UserRole.ADMIN:
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar el último administrador"
            )
    
    db.delete(db_user)
    db.commit()
    return None 