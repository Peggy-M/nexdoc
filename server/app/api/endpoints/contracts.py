import os
import shutil
import time
import asyncio
import json
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app.api import deps
from app.models.activity import Activity
from app.models.contract import Contract
from app.models.user import User
from app.schemas.contract import UploadResponse, ContractAnalysisResponse, Contract as ContractSchema
from app.services.ai_service import AIService
from app.services.export_service import ExportService
from app.utils.log_utils import log
from app.core.redis import get_redis_client

router = APIRouter()
ai_service = AIService()
export_service = ExportService()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def get_file_size(size_in_bytes):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.2f} TB"

def process_contract_background(contract_id: int, file_path: str, db: Session):
    """
    Background task to parse file and run AI analysis.
    """
    redis_client = get_redis_client()
    try:
        log.info(f"Starting analysis for contract {contract_id}...")
        
        # Update Redis status
        if redis_client:
            redis_client.set(f"contract:{contract_id}:progress", 10)
            redis_client.set(f"contract:{contract_id}:status", "analyzing")
        
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            log.info(f"Contract {contract_id} not found during background processing")
            return

        contract.status = "analyzing"
        db.commit()
        
        # Simulate progress update since AI service is blocking/blackbox
        # In a real scenario, pass a callback to ai_service
        if redis_client:
            redis_client.set(f"contract:{contract_id}:progress", 30)

        # Now we delegate the entire process (parsing + analysis) to the AI Service Agent
        results = ai_service.process_file(file_path)
        
        if redis_client:
            redis_client.set(f"contract:{contract_id}:progress", 90)
        
        # Calculate risk summary
        risk_summary = {"high": 0, "medium": 0, "low": 0}
        if results:
            for result in results:
                if isinstance(result, dict) and "type" in result:
                     r_type = result["type"]
                     if r_type in risk_summary:
                         risk_summary[r_type] += 1

        # Save Results
        contract.analysis_results = results
        contract.risk_summary = risk_summary
        contract.status = "analyzed" # or "completed"
        db.commit()
        
        if redis_client:
            redis_client.set(f"contract:{contract_id}:progress", 100)
            redis_client.set(f"contract:{contract_id}:status", "analyzed")
            # Store results briefly in Redis if needed for fast retrieval, but DB is fine
            
        log.info(f"Analysis completed for contract {contract_id}")
        
    except Exception as e:
        log.info(f"Error processing contract {contract_id}: {e}")
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if contract:
            contract.status = "failed"
            db.commit()
        if redis_client:
            redis_client.set(f"contract:{contract_id}:status", "failed")


@router.get("/", response_model=List[ContractSchema])
async def get_contracts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve contracts for the current user.
    """
    contracts = db.query(Contract).filter(Contract.user_id == current_user.id).offset(skip).limit(limit).all()
    return contracts

@router.post("/upload", response_model=UploadResponse)
async def upload_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Upload a contract file for analysis.
    """
    # Save file
    safe_filename = f"{int(time.time())}_{file.filename}"
    file_location = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    file_size_bytes = os.path.getsize(file_location)
    file_size_str = get_file_size(file_size_bytes)
    
    # Create DB record
    db_contract = Contract(
        name=file.filename,
        file_path=file_location,
        file_size=file_size_str,
        status="pending", # Changed from uploading to pending
        user_id=current_user.id
    )
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    
    # Add Activity Log
    try:
        activity = Activity(
            user_id=current_user.id,
            user_name=current_user.full_name or current_user.email.split('@')[0],
            action="上传了",
            target=db_contract.name
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        log.info(f"Failed to log activity: {e}")

    # Don't trigger background analysis here!
    # background_tasks.add_task(process_contract_background, db_contract.id, file_location, db)
    
    return {
        "id": db_contract.id,
        "name": db_contract.name,
        "size": db_contract.file_size,
        "status": db_contract.status
    }

@router.post("/{contract_id}/analyze")
async def start_contract_analysis(
    contract_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Manually trigger contract analysis.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == current_user.id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    if contract.status in ["analyzing", "analyzed", "completed"]:
         return {"message": "Analysis already started or completed", "status": contract.status}

    # Trigger background analysis
    background_tasks.add_task(process_contract_background, contract.id, contract.file_path, db)
    
    return {"message": "Analysis started", "status": "analyzing"}

@router.get("/{contract_id}/analysis", response_model=ContractAnalysisResponse)
async def get_analysis(
    contract_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Get the analysis results for a contract.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == current_user.id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return {
        "contract_id": contract.id,
        "status": contract.status,
        "results": contract.analysis_results or []
    }

@router.get("/{contract_id}/export/pdf")
async def export_pdf(
    contract_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Export analysis report as PDF.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == current_user.id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    output_filename = f"report_{contract_id}.pdf"
    output_path = os.path.join(UPLOAD_DIR, output_filename)
    
    # Generate PDF
    success = await export_service.generate_pdf(
        contract_name=contract.name,
        analysis_results=contract.analysis_results or [],
        output_path=output_path
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
        
    return FileResponse(
        output_path, 
        media_type='application/pdf', 
        filename=f"审查报告_{contract.name}.pdf"
    )

@router.get("/{contract_id}/download")
async def download_file(
    contract_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Download the original uploaded contract file.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == current_user.id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    if not os.path.exists(contract.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        contract.file_path,
        media_type='application/octet-stream',
        filename=contract.name
    )

@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Delete a contract and its associated file.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == current_user.id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    # Delete file from disk
    if contract.file_path and os.path.exists(contract.file_path):
        try:
            os.remove(contract.file_path)
        except Exception as e:
            log.info(f"Error deleting file {contract.file_path}: {e}")
            # Continue to delete DB record even if file deletion fails
            
    db.delete(contract)
    db.commit()

    # Log Activity
    try:
        activity = Activity(
            user_id=current_user.id,
            user_name=current_user.full_name or current_user.email.split('@')[0],
            action="删除了",
            target=contract.name
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        log.info(f"Failed to log activity: {e}")
    
    return {"message": "Contract deleted successfully"}

@router.get("/{contract_id}/stream")
async def stream_analysis_progress(
    contract_id: int,
    request: Request,
    token: str,
    db: Session = Depends(deps.get_db)
):
    """
    Stream analysis progress using SSE.
    """
    # Simple auth check using the token from query param
    # In production, use proper dependency injection for this
    try:
        user = deps.get_current_user(db=db, token=token)
    except Exception:
        # If auth fails, we return a 401, but for SSE it's tricky. 
        # We'll just close the connection or yield an error.
        raise HTTPException(status_code=401, detail="Invalid token")

    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == user.id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    redis_client = get_redis_client()
    
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break

            status = "pending"
            progress = 0

            if redis_client:
                r_status = redis_client.get(f"contract:{contract_id}:status")
                r_progress = redis_client.get(f"contract:{contract_id}:progress")
                
                if r_status:
                    status = r_status
                    progress = int(r_progress) if r_progress else 0
                else:
                    # Fallback to DB
                    db.refresh(contract)
                    status = contract.status
                    progress = 100 if status in ["analyzed", "completed"] else 0
            else:
                 # Fallback to DB
                db.refresh(contract)
                status = contract.status
                progress = 100 if status in ["analyzed", "completed"] else 0
            
            data = json.dumps({
                "status": status,
                "progress": progress
            })
            
            yield {"event": "message", "data": data}

            if status in ["analyzed", "completed", "failed"]:
                break
            
            await asyncio.sleep(1)

    return EventSourceResponse(event_generator())

