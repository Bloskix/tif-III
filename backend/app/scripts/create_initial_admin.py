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
        hashed_password = get_password_hash(ADMIN_PASSWORD)
        new_admin = User(
            email=ADMIN_EMAIL,
            username=ADMIN_USERNAME,
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            is_superuser=True,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print(f"INFO:     Usuario admin creado: {ADMIN_EMAIL} / {ADMIN_USERNAME}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_admin() 