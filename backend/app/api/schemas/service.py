from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ContentStatus


class ServiceBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    subtitle: Optional[str] = None
    description: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    featured_image_url: Optional[str] = None
    icon_url: Optional[str] = None
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    subtitle: Optional[str] = None
    description: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    featured_image_url: Optional[str] = None
    icon_url: Optional[str] = None
    status: Optional[ContentStatus] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class ServiceOut(ServiceBase):
    id: UUID
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    created_by: UUID
    updated_by: Optional[UUID] = None
    published_by: Optional[UUID] = None
    is_deleted: bool = False

    class Config:
        from_attributes = True


class ServiceList(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    featured_image_url: Optional[str] = None
    icon_url: Optional[str] = None
    status: ContentStatus
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
