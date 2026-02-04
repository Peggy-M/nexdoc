from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

from app.api import deps
from app.models.user import User
from app.models.contract import Contract

router = APIRouter()

@router.get("/")
def get_overview_data(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    contracts = db.query(Contract).filter(Contract.user_id == current_user.id).order_by(Contract.upload_date.desc()).all()
    
    # 1. Stats Calculation
    total_contracts = len(contracts)
    reviewed_contracts = sum(1 for c in contracts if c.status == 'analyzed')
    
    pending_risks_count = 0
    recent_risks_list = []
    
    # Collect risks
    for c in contracts:
        if c.analysis_results and isinstance(c.analysis_results, list):
            for risk in c.analysis_results:
                if isinstance(risk, dict) and risk.get('status', 'pending') == 'pending':
                    pending_risks_count += 1
                    recent_risks_list.append({
                        "id": risk.get('id', 0),
                        "title": risk.get('title', '未知风险'),
                        "level": risk.get('type', 'medium'), # high, medium, low
                        "contract": c.name,
                        "contract_id": c.id
                    })
    
    # Mock comparisons for now (random variations for demo feel)
    # In a real app, we'd query last month's data to compare
    
    stats = [
        { 
            "name": '合同总数', 
            "value": str(total_contracts), 
            "change": '+2', 
            "changeType": 'positive',
            "icon": "FileText",
            "color": 'blue'
        },
        { 
            "name": '待处理风险', 
            "value": str(pending_risks_count), 
            "change": '-1' if pending_risks_count < 5 else '+3', 
            "changeType": 'positive' if pending_risks_count < 5 else 'negative',
            "icon": "AlertTriangle",
            "color": 'orange'
        },
        { 
            "name": '已审核合同', 
            "value": str(reviewed_contracts), 
            "change": '+5', 
            "changeType": 'positive',
            "icon": "CheckCircle",
            "color": 'green'
        },
        { 
            "name": '平均处理时间', 
            "value": '1.5h', 
            "change": '-0.2h', 
            "changeType": 'positive',
            "icon": "Clock",
            "color": 'purple'
        },
    ]
    
    # 2. Recent Contracts (Top 4)
    recent_contracts_data = []
    for c in contracts[:4]:
        risk_count = 0
        if c.risk_summary and isinstance(c.risk_summary, dict):
             risk_count = sum(c.risk_summary.values())
        elif c.analysis_results:
             risk_count = len(c.analysis_results)

        recent_contracts_data.append({
            "id": c.id,
            "name": c.name,
            "status": c.status,
            "risks": risk_count,
            "date": c.upload_date.strftime("%Y-%m-%d %H:%M:%S") if c.upload_date else ""
        })
        
    # 3. Recent Risks (Top 3)
    # Since we collected them from most recent contracts first, just take top 3
    recent_risks_data = recent_risks_list[:3]
    
    return {
        "stats": stats,
        "recentContracts": recent_contracts_data,
        "recentRisks": recent_risks_data
    }
