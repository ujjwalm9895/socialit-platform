from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.enums import ContentStatus


def _normalize_content(v: Any) -> List[Dict[str, Any]]:
    """Ensure content is always a list of section dicts (type, data, id)."""
    if v is None:
        return []
    if isinstance(v, list):
        return [
            {
                "type": item.get("type", "raw") if isinstance(item, dict) else "raw",
                "data": item.get("data", item) if isinstance(item, dict) else {},
                "id": item.get("id", f"section-{i}") if isinstance(item, dict) else f"section-{i}",
            }
            for i, item in enumerate(v)
        ]
    if isinstance(v, dict):
        return [{"type": v.get("type", "raw"), "data": v.get("data", v), "id": v.get("id", "section-0")}]
    return []


class PageBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    content: List[Dict[str, Any]] = Field(..., min_length=0)
    template: Optional[str] = Field(None, max_length=100)
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class PageCreate(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    content: List[Dict[str, Any]] = Field(..., min_length=0)
    template: Optional[str] = Field(None, max_length=100)
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None

    @field_validator("content", mode="before")
    @classmethod
    def normalize_content(cls, v: Any) -> List[Dict[str, Any]]:
        return _normalize_content(v)


class PageUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[List[Dict[str, Any]]] = None
    template: Optional[str] = Field(None, max_length=100)
    status: Optional[ContentStatus] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None

    @field_validator("content", mode="before")
    @classmethod
    def normalize_content(cls, v: Any) -> Optional[List[Dict[str, Any]]]:
        if v is None:
            return None
        return _normalize_content(v)


class PageOut(BaseModel):
    id: UUID
    slug: str
    title: str
    content: List[Dict[str, Any]]
    template: Optional[str] = None
    status: ContentStatus
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("content", mode="before")
    @classmethod
    def normalize_content(cls, v: Any) -> List[Dict[str, Any]]:
        return _normalize_content(v)

    class Config:
        from_attributes = True
