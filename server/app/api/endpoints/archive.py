from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import re

from app.api import deps
from app.models.user import User
from app.models.contract import Contract

router = APIRouter()

def parse_size(size_str: str) -> float:
    """Parse size string (e.g., '1.2 MB') to bytes."""
    if not size_str:
        return 0
    
    units = {"B": 1, "KB": 1024, "MB": 1024**2, "GB": 1024**3, "TB": 1024**4}
    match = re.match(r"([\d.]+)\s*([A-Za-z]+)", size_str)
    if match:
        value, unit = match.groups()
        return float(value) * units.get(unit.upper(), 1)
    return 0

def format_size(size_bytes: float) -> str:
    """Format bytes to string."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

@router.get("/")
def get_archive_data(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    contracts = db.query(Contract).filter(Contract.user_id == current_user.id).all()
    
    # 1. Stats
    total_bytes = 0
    new_this_month = 0
    total_age_days = 0
    count = len(contracts)
    
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # 2. Folders (Group by Contract Type)
    # If contract_type is None, we can try to guess or put in "Other"
    folders_map = {} # name -> {count, size_bytes}
    
    # 3. Process Contracts
    formatted_contracts = []
    
    for c in contracts:
        # Stats
        size = parse_size(c.file_size)
        total_bytes += size
        
        if c.upload_date and c.upload_date >= month_start:
            new_this_month += 1
            
        if c.upload_date:
            age = (now - c.upload_date).days
            total_age_days += age
            
        # Folders
        ctype = c.contract_type or "未分类"
        if ctype not in folders_map:
            folders_map[ctype] = {"count": 0, "size": 0}
        folders_map[ctype]["count"] += 1
        folders_map[ctype]["size"] += size
        
        # Formatted Contract
        # Generate tags based on status/date
        tags = []
        if c.status == "analyzed":
            tags.append("已完成")
        elif c.status == "uploading":
            tags.append("上传中")
        elif c.status == "analyzing":
            tags.append("分析中")
            
        # Check if "New" (this month)
        if c.upload_date and c.upload_date >= month_start:
            tags.append("本月")
            
        formatted_contracts.append({
            "id": c.id,
            "name": c.name,
            "folder": ctype,
            "date": c.upload_date.strftime("%Y-%m-%d") if c.upload_date else "",
            "size": c.file_size,
            "tags": tags
        })
        
    # Finalize Stats
    avg_age_years = 0
    if count > 0:
        avg_age_years = (total_age_days / count) / 365.0
        
    stats = [
        {"name": "总存储量", "value": format_size(total_bytes)},
        {"name": "合同数量", "value": str(count)},
        {"name": "本月新增", "value": str(new_this_month)},
        {"name": "平均保存", "value": f"{avg_age_years:.1f} 年"},
    ]
    
    # Finalize Folders
    folders_list = []
    for i, (name, data) in enumerate(folders_map.items()):
        folders_list.append({
            "id": i + 1, # Frontend uses ID for selection
            "name": name,
            "count": data["count"],
            "size": format_size(data["size"])
        })
        
    # Available tags (static for now + dynamic ones we used)
    all_tags = ['全部', '已完成', '上传中', '分析中', '本月']
        
    return {
        "stats": stats,
        "folders": folders_list,
        "contracts": formatted_contracts,
        "tags": all_tags
    }
