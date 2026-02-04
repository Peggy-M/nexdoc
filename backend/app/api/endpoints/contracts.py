from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import time
from app.schemas.contract import UploadResponse, ContractAnalysisResponse, AnalysisResult

router = APIRouter()

# Mock Database
mock_contracts = {}
mock_analysis_results = [
  {
    "id": 1,
    "title": "违约金比例过高",
    "type": "high",
    "description": "第 8.2 条款约定的违约金比例为合同金额的 30%，超过法定合理范围。",
    "suggestion": "建议调整为不超过合同金额的 10%，以符合司法实践标准。",
    "clause": "如乙方违约，应向甲方支付合同金额 30% 的违约金。",
  },
  {
    "id": 2,
    "title": "争议解决条款缺失",
    "type": "medium",
    "description": "合同未明确约定争议解决方式和管辖法院。",
    "suggestion": "建议补充仲裁或诉讼条款，明确管辖地和适用法律。",
    "clause": "本合同未尽事宜，双方协商解决。",
  },
  {
    "id": 3,
    "title": "知识产权归属不明",
    "type": "medium",
    "description": "技术服务成果的知识产权归属约定不够明确。",
    "suggestion": "建议明确约定知识产权的归属、许可范围和使用期限。",
    "clause": "乙方提供的技术成果归双方共同所有。",
  },
  {
    "id": 4,
    "title": "通知送达方式不明确",
    "type": "low",
    "description": "第 12 条约定的通知方式较为笼统。",
    "suggestion": "建议明确电子邮件、快递等具体送达方式和生效时间。",
    "clause": "任何通知应以书面形式送达。",
  },
]

@router.post("/upload", response_model=UploadResponse)
async def upload_contract(file: UploadFile = File(...)):
    """
    Upload a contract file for analysis.
    """
    # Simulate processing time
    # In a real app, we would save the file and start an async task
    file_id = int(time.time())
    file_size = "1.2 MB" # Mock size
    
    mock_contracts[file_id] = {
        "name": file.filename,
        "status": "uploaded",
        "results": []
    }
    
    return {
        "id": file_id,
        "name": file.filename,
        "size": file_size,
        "status": "uploading"
    }

@router.get("/{contract_id}/analysis", response_model=ContractAnalysisResponse)
async def get_analysis(contract_id: int):
    """
    Get the analysis results for a contract.
    """
    # Simulate analysis process
    return {
        "contract_id": contract_id,
        "status": "completed",
        "results": mock_analysis_results
    }
