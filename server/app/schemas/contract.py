from pydantic import BaseModel
from typing import List, Optional, Literal, Dict
from datetime import datetime

class AnalysisResult(BaseModel):
    id: int
    title: str
    type: Literal['high', 'medium', 'low']
    description: str
    suggestion: str
    clause: str

class UploadResponse(BaseModel):
    id: int
    name: str
    size: str
    status: str

class ContractAnalysisResponse(BaseModel):
    contract_id: int
    status: str
    results: List[AnalysisResult]

class ContractBase(BaseModel):
    name: str
    contract_type: Optional[str] = None

class ContractCreate(ContractBase):
    pass

class Contract(ContractBase):
    id: int
    file_size: str
    upload_date: datetime
    status: str
    risk_summary: Dict[str, int] = {}
    analysis_results: List[AnalysisResult] = []
    
    class Config:
        from_attributes = True

