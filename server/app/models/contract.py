from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)  # Local storage path
    file_size = Column(String(50))
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="uploading")  # uploading, analyzing, analyzed, failed
    contract_type = Column(String(100), nullable=True) # e.g., "Service Agreement"
    
    # Analysis summary stored as JSON (e.g., {"high": 1, "medium": 2, "low": 0})
    risk_summary = Column(JSON, default={})
    
    # Full analysis results
    analysis_results = Column(JSON, default=[])

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="contracts")

# Update User model to include relationship
from app.models.user import User
User.contracts = relationship("Contract", back_populates="owner")
