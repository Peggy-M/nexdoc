from pydantic import BaseModel
from typing import List, Optional, Literal

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
