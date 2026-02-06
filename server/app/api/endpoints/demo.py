import os
import shutil
import time
import asyncio
import json
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends, Request
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.api import deps
from app.models.contract import Contract
from app.schemas.contract import UploadResponse, ContractAnalysisResponse
from app.services.ai_service import AIService
from app.utils.log_utils import log
from app.core.redis import get_redis_client
from app.api.endpoints.contracts import process_contract_background, get_file_size, UPLOAD_DIR, SAMPLES_DIR

router = APIRouter()
ai_service = AIService()

@router.get("/samples")
async def get_public_samples():
    """
    List available sample contracts for demo (public).
    """
    if not os.path.exists(SAMPLES_DIR):
        return []
    
    samples = []
    for filename in os.listdir(SAMPLES_DIR):
        if filename.endswith(".pdf"):
            samples.append({
                "filename": filename,
                "name": filename.replace(".pdf", "")
            })
    return samples

@router.post("/upload", response_model=UploadResponse)
async def upload_demo_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db)
):
    """
    Upload a contract file for public demo analysis (no auth required).
    """
    # Save file
    safe_filename = f"demo_{int(time.time())}_{file.filename}"
    file_location = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    file_size_bytes = os.path.getsize(file_location)
    file_size_str = get_file_size(file_size_bytes)
    
    # Create DB record with user_id=None
    db_contract = Contract(
        name=file.filename,
        file_path=file_location,
        file_size=file_size_str,
        status="pending",
        user_id=None, # Public contract
        contract_type="Demo"
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    # Trigger analysis immediately for demo
    background_tasks.add_task(process_contract_background, db_contract.id, file_location, db)
    
    return {
        "id": db_contract.id,
        "name": db_contract.name,
        "size": db_contract.file_size,
        "status": db_contract.status
    }

@router.post("/samples/{filename}/import", response_model=UploadResponse)
async def import_demo_sample(
    filename: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
):
    """
    Import a sample contract for public demo (no auth required).
    """
    sample_path = os.path.join(SAMPLES_DIR, filename)
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample not found")
        
    # Copy to uploads
    safe_filename = f"demo_{int(time.time())}_{filename}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    shutil.copy2(sample_path, dest_path)
    
    file_size_bytes = os.path.getsize(dest_path)
    file_size_str = get_file_size(file_size_bytes)
    
    # Create Contract
    db_contract = Contract(
        name=filename,
        file_path=dest_path,
        file_size=file_size_str,
        status="pending",
        user_id=None,
        contract_type="Demo Sample"
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    # Trigger analysis immediately
    background_tasks.add_task(process_contract_background, db_contract.id, dest_path, db)
    
    return {
        "id": db_contract.id,
        "name": db_contract.name,
        "size": db_contract.file_size,
        "status": db_contract.status
    }

@router.get("/{contract_id}/analysis", response_model=ContractAnalysisResponse)
async def get_demo_analysis(
    contract_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Get the analysis results for a demo contract.
    Only allows accessing contracts with user_id=None.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    if contract.user_id is not None:
        raise HTTPException(status_code=403, detail="Access denied to private contracts")

    return {
        "contract_id": contract.id,
        "status": contract.status,
        "results": contract.analysis_results or []
    }

@router.get("/{contract_id}/analysis/stream")
async def stream_demo_analysis(
    contract_id: int,
    request: Request,
    db: Session = Depends(deps.get_db)
):
    """
    Stream analysis progress for demo contract using SSE.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    # Demo contracts must have user_id=None
    if contract.user_id is not None:
        raise HTTPException(status_code=403, detail="Access denied")

    async def event_generator():
        redis_client = get_redis_client()
        
        while True:
            if await request.is_disconnected():
                break

            # Try to get status from Redis first
            status = None
            progress = 0
            
            if redis_client:
                status_bytes = redis_client.get(f"contract:{contract_id}:status")
                progress_val = redis_client.get(f"contract:{contract_id}:progress")
                
                if status_bytes:
                    status = status_bytes.decode('utf-8') if isinstance(status_bytes, bytes) else status_bytes
                
                if progress_val:
                    progress = int(progress_val)
            
            # Fallback to DB if Redis is empty
            if not status:
                db.refresh(contract)
                status = contract.status
                # Estimate progress based on status if not in Redis
                if status in ["completed", "analyzed"]:
                    progress = 100
                elif status == "analyzing":
                    progress = 50 
                elif status == "failed":
                    progress = 0
                elif status == "cancelled":
                    progress = 0
            
            # Determine stage based on progress
            stage = "准备中..."
            if status == "cancelled":
                stage = "已取消"
            elif progress < 30:
                stage = "解析文档结构..."
            elif progress < 80:
                stage = "识别风险条款..."
            else:
                stage = "生成审查报告..."

            data = {
                "status": status,
                "progress": progress,
                "stage": stage
            }
            
            yield {
                "data": json.dumps(data)
            }

            if status in ["analyzed", "completed", "failed", "cancelled"]:
                break
                
            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())

@router.post("/{contract_id}/cancel")
async def cancel_demo_analysis(
    contract_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Cancel a running analysis for demo contract.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    if contract.user_id is not None:
        raise HTTPException(status_code=403, detail="Access denied")

    redis_client = get_redis_client()
    if redis_client:
        redis_client.set(f"contract:{contract_id}:status", "canceling", ex=3600)
    
    return {"message": "Cancellation requested"}
