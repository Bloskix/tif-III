from sqlalchemy import Boolean, Column, Integer, String, Enum as SQLEnum
import enum
from sqlalchemy.orm import relationship
from app.models.base_model import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.OPERATOR)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Relación con NotificationSettings
    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False)

    # Puedes agregar relaciones aquí si las necesitas
    # Por ejemplo:
    # items = relationship("Item", back_populates="owner")

    def __repr__(self):
        return f"<User {self.username}>" 