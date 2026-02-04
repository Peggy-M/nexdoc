from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.api import deps
from app.models.user import User
from app.models.contract import Contract
from app.models.activity import Activity
from app.core.security import get_password_hash
import random

router = APIRouter()

@router.get("/members")
def get_members(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    users = db.query(User).all()
    members_data = []
    
    for user in users:
        # Count contracts for this user
        contract_count = db.query(Contract).filter(Contract.user_id == user.id).count()
        
        # Format last active
        last_active_str = "从未登录"
        if user.last_active:
            diff = datetime.utcnow() - user.last_active
            if diff.days > 0:
                last_active_str = f"{diff.days} 天前"
            elif diff.seconds > 3600:
                last_active_str = f"{diff.seconds // 3600} 小时前"
            elif diff.seconds > 60:
                last_active_str = f"{diff.seconds // 60} 分钟前"
            else:
                last_active_str = "刚刚"

        members_data.append({
            "id": user.id,
            "name": user.full_name or user.email.split('@')[0],
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "status": user.status,
            "contracts": contract_count,
            "lastActive": last_active_str,
            "avatar": user.avatar
        })
    
    return members_data

@router.get("/stats")
def get_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    total_members = db.query(User).count()
    pending_review = db.query(User).filter(User.status == "pending").count()
    admins = db.query(User).filter(User.role == "admin").count()
    
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    active_this_month = db.query(User).filter(User.last_active >= month_start).count()
    
    return [
        { "name": '团队成员', "value": total_members, "color": 'blue' },
        { "name": '待审核', "value": pending_review, "color": 'orange' },
        { "name": '管理员', "value": admins, "color": 'purple' },
        { "name": '本月活跃', "value": active_this_month, "color": 'green' },
    ]

@router.get("/activities")
def get_activities(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    activities = db.query(Activity).order_by(Activity.timestamp.desc()).limit(10).all()
    result = []
    for act in activities:
        # Format time
        diff = datetime.utcnow() - act.timestamp
        if diff.days > 0:
            time_str = f"{diff.days} 天前"
        elif diff.seconds > 3600:
            time_str = f"{diff.seconds // 3600} 小时前"
        elif diff.seconds > 60:
            time_str = f"{diff.seconds // 60} 分钟前"
        else:
            time_str = "刚刚"
            
        result.append({
            "id": act.id,
            "user": act.user_name,
            "action": act.action,
            "target": act.target,
            "time": time_str
        })
        
    return result

@router.post("/invite")
def invite_member(
    email: str = Body(...),
    role: str = Body(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create pending user
    # Default password '123456' hashed
    hashed_password = get_password_hash("123456")
    
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=email.split('@')[0],
        role=role,
        department="法务部", # Default
        status="pending",
        last_active=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity
    activity = Activity(
        user_id=current_user.id,
        user_name=current_user.full_name or current_user.email,
        action="邀请了",
        target=email
    )
    db.add(activity)
    db.commit()
    
    return {"message": "Invitation sent (simulated). User created with status pending."}
