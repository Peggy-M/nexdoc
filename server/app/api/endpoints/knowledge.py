from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.knowledge import KnowledgeArticle
from app.models.user import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ArticleCreate(BaseModel):
    title: str
    content: str
    category: str = "General"

@router.get("/")
def get_articles(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    category: str = None,
    search: str = None,
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(KnowledgeArticle)
    
    if category and category != "全部":
        query = query.filter(KnowledgeArticle.category == category)
    
    if search:
        query = query.filter(KnowledgeArticle.title.contains(search))
        
    articles = query.order_by(KnowledgeArticle.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "category": a.category,
            "author_name": a.author.full_name if a.author else "Unknown",
            "created_at": a.created_at,
            "views": a.views
        }
        for a in articles
    ]

@router.post("/")
def create_article(
    article_in: ArticleCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    article = KnowledgeArticle(
        title=article_in.title,
        content=article_in.content,
        category=article_in.category,
        author_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    
    return {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "category": article.category,
        "author_name": current_user.full_name,
        "created_at": article.created_at,
        "views": article.views
    }

@router.get("/{article_id}")
def get_article(
    article_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.views += 1
    db.commit()
    
    return {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "category": article.category,
        "author_name": article.author.full_name if article.author else "Unknown",
        "created_at": article.created_at,
        "updated_at": article.updated_at,
        "views": article.views
    }
