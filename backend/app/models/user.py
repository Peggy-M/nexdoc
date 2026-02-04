from sqlalchemy import Boolean, Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    full_name = Column(String(255), nullable=True)
    
    # Team fields
    role = Column(String(50), default="member") # admin, member, viewer
    department = Column(String(100), default="法务部")
    status = Column(String(50), default="active") # active, inactive, pending
    avatar = Column(String(512), nullable=True)
    last_active = Column(DateTime, default=datetime.utcnow)
