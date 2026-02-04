from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from typing import List
import time
import shutil
import os
import uuid
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.contract import Contract
from app.schemas.contract import UploadResponse, ContractAnalysisResponse, AnalysisResult, Contract as ContractSchema
from app.services.ai_service import AIService
from app.services.export_service import ExportService
from app.models.activity import Activity

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
    try:
        print(f"Starting analysis for contract {contract_id}...")
        
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            print(f"Contract {contract_id} not found during background processing")
            return

        contract.status = "analyzing"
        db.commit()
        
        # Now we delegate the entire process (parsing + analysis) to the AI Service Agent
        results = ai_service.process_file(file_path)
        
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
        print(f"Analysis completed for contract {contract_id}")
        
    except Exception as e:
        print(f"Error processing contract {contract_id}: {e}")
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if contract:
            contract.status = "failed"
            db.commit()

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
        status="uploading",
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
        print(f"Failed to log activity: {e}")

    # Trigger background analysis
    background_tasks.add_task(process_contract_background, db_contract.id, file_location, db)
    
    return {
        "id": db_contract.id,
        "name": db_contract.name,
        "size": db_contract.file_size,
        "status": db_contract.status
    }

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
    success = export_service.generate_pdf(
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
            print(f"Error deleting file {contract.file_path}: {e}")
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
        print(f"Failed to log activity: {e}")
    
    return {"message": "Contract deleted successfully"}
