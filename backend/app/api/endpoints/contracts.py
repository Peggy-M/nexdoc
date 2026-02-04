from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List
import time
import shutil
import os
import uuid
from app.schemas.contract import UploadResponse, ContractAnalysisResponse, AnalysisResult
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()

# Mock Database (In-memory storage)
mock_contracts = {}

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def get_file_size(size_in_bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.2f} TB"

def process_contract_background(contract_id: int, file_path: str):
    """
    Background task to parse file and run AI analysis.
    """
    try:
        print(f"Starting analysis for contract {contract_id}...")
        mock_contracts[contract_id]["status"] = "analyzing"
        
        # Now we delegate the entire process (parsing + analysis) to the AI Service Agent
        results = ai_service.process_file(file_path)
        
        if not results and "API Key" not in str(results):
             # If empty results and not the mock fallback, mark as failed? 
             # Or maybe just no risks found. 
             pass

        # Save Results
        mock_contracts[contract_id]["results"] = results
        mock_contracts[contract_id]["status"] = "completed"
        print(f"Analysis completed for contract {contract_id}")
        
    except Exception as e:
        print(f"Error processing contract {contract_id}: {e}")
        mock_contracts[contract_id]["status"] = "failed"

@router.post("/upload", response_model=UploadResponse)
async def upload_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a contract file for analysis.
    """
    file_id = int(time.time())
    
    # Save file
    file_location = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    file_size_bytes = os.path.getsize(file_location)
    file_size_str = get_file_size(file_size_bytes)
    
    # Init DB record
    mock_contracts[file_id] = {
        "name": file.filename,
        "path": file_location,
        "status": "uploaded",
        "results": []
    }
    
    # Trigger background analysis
    background_tasks.add_task(process_contract_background, file_id, file_location)
    
    return {
        "id": file_id,
        "name": file.filename,
        "size": file_size_str,
        "status": "uploading"
    }

@router.get("/{contract_id}/analysis", response_model=ContractAnalysisResponse)
async def get_analysis(contract_id: int):
    """
    Get the analysis results for a contract.
    """
    contract = mock_contracts.get(contract_id)
    
    if not contract:
        # Fallback for demo if ID not found (e.g. server restarted)
        raise HTTPException(status_code=404, detail="Contract not found")

    return {
        "contract_id": contract_id,
        "status": contract["status"],
        "results": contract["results"]
    }
