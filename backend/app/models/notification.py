from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base_model import Base

class NotificationSettings(Base):
    __tablename__ = "notification_settings"  # type: ignore

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    email_enabled = Column(Boolean, default=True)
    min_alert_level = Column(Integer, default=10)
    notification_frequency = Column(String, default="immediate")
    alert_types = Column(JSON, default=lambda: ["critical", "high"])
    quiet_hours = Column(JSON, default=lambda: {"start": "22:00", "end": "06:00"})
    
    user = relationship("User", back_populates="notification_settings")

    def __repr__(self):
        return f"<NotificationSettings for user_id={self.user_id}>" 