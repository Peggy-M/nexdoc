from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name = Column(String(255)) # Snapshot of user name
    action = Column(String(100)) # e.g. "上传了", "审核了"
    target = Column(String(255)) # e.g. "Contract Name"
    timestamp = Column(DateTime, default=datetime.utcnow)
