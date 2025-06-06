from sqlalchemy import Boolean, Column, Integer, String, Enum as SQLEnum
import enum
from app.models.base_model import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.OPERATOR)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    def __repr__(self):
        return f"<User {self.username}>" 