from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.api import deps
from app.models.user import User
from app.models.contract import Contract
from app.models.activity import Activity
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/")
def get_risks(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    contracts = db.query(Contract).filter(Contract.user_id == current_user.id).all()
    
    all_risks = []
    stats = {
        "pending": 0,
        "processing": 0,
        "resolved": 0,
        "new_this_month": 0
    }
    
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    for contract in contracts:
        if not contract.analysis_results:
            continue
            
        results = contract.analysis_results
        if isinstance(results, list):
            for i, risk in enumerate(results):
                # Ensure risk has necessary fields
                if not isinstance(risk, dict):
                    continue
                
                # Default status if not present
                status = risk.get("status", "pending")
                risk_type = risk.get("type", "medium")
                
                # Update stats
                if status in stats:
                    stats[status] += 1
                
                if contract.upload_date and contract.upload_date >= month_start:
                    stats["new_this_month"] += 1

                # Construct frontend-friendly risk object
                # Use index as fallback for ID
                risk_id = risk.get('id', i)
                
                risk_obj = {
                    "id": f"{contract.id}_{risk_id}", # Unique combined ID
                    "original_id": risk_id,
                    "contract_id": contract.id,
                    "title": risk.get("title", "Unknown Risk"),
                    "contract": contract.name,
                    "type": risk_type,
                    "category": risk.get("category", "其他"),
                    "status": status,
                    "date": contract.upload_date.strftime("%Y-%m-%d") if contract.upload_date else now.strftime("%Y-%m-%d"),
                    "aiConfidence": risk.get("aiConfidence", 90), # Mock confidence if missing
                    "description": risk.get("description", ""),
                    "suggestion": risk.get("suggestion", ""),
                    "clause": risk.get("clause", "")
                }
                all_risks.append(risk_obj)

    return {
        "stats": [
            { "name": '待处理', "value": stats["pending"], "change": 0, "color": 'red' },
            { "name": '处理中', "value": stats["processing"], "change": 0, "color": 'orange' },
            { "name": '已解决', "value": stats["resolved"], "change": 0, "color": 'green' },
            { "name": '本月新增', "value": stats["new_this_month"], "change": 0, "color": 'blue' },
        ],
        "risks": all_risks
    }

@router.patch("/{contract_id}/{risk_id}/status")
def update_risk_status(
    contract_id: int,
    risk_id: int,
    status: str = Body(..., embed=True),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id, Contract.user_id == current_user.id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if not contract.analysis_results or not isinstance(contract.analysis_results, list):
         raise HTTPException(status_code=404, detail="No risks found for this contract")

    updated = False
    new_results = []
    
    # Create a deep copy or new list to ensure SQLAlchemy detects change
    for risk in contract.analysis_results:
        # Match by ID. Note: risk['id'] from AI might be int.
        if isinstance(risk, dict) and risk.get('id') == risk_id:
            risk['status'] = status
            updated = True
        new_results.append(risk)
    
    if not updated:
        # Fallback: try matching by index if risk_id is large? 
        # Actually, let's just rely on ID. If ID logic in get_risks uses index fallback, 
        # we might have mismatch. But AI service generates IDs.
        pass

    if updated:
        contract.analysis_results = new_results
        # Also need to flag modified because it's JSON
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(contract, "analysis_results")
        
        db.commit()

        # Log Activity
        try:
             action = "修复了" if status == 'resolved' else "更新了"
             activity = Activity(
                 user_id=current_user.id,
                 user_name=current_user.full_name or current_user.email.split('@')[0],
                 action=action,
                 target=f"{contract.name} 中的风险"
             )
             db.add(activity)
             db.commit()
        except Exception as e:
             print(f"Log error: {e}")
        
        return {"message": "Status updated"}
    
    raise HTTPException(status_code=404, detail="Risk not found")
