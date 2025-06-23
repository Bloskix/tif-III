from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.core.config import settings

ADMIN_EMAIL = settings.INITIAL_ADMIN_EMAIL
ADMIN_USERNAME = settings.INITIAL_ADMIN_USERNAME
ADMIN_PASSWORD = settings.INITIAL_ADMIN_PASSWORD


def create_initial_admin():
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin:
            print(f"INFO:     Ya existe un usuario admin: {admin.email}")
            return
        
        # Crear una nueva instancia del modelo User
        new_admin = User()
        
        # Establecer los valores usando setattr
        setattr(new_admin, 'email', ADMIN_EMAIL)
        setattr(new_admin, 'username', ADMIN_USERNAME)
        setattr(new_admin, 'hashed_password', get_password_hash(ADMIN_PASSWORD))
        setattr(new_admin, 'role', UserRole.ADMIN)
        setattr(new_admin, 'is_superuser', True)
        setattr(new_admin, 'is_active', True)
        
        db.add(new_admin)
        db.commit()
        print(f"INFO:     Usuario admin creado: {ADMIN_EMAIL} / {ADMIN_USERNAME}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin() 