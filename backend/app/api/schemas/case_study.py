from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ContentStatus


class CaseStudyBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    client_name: Optional[str] = Field(None, max_length=255)
    client_logo_url: Optional[str] = None
    excerpt: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    industry: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class CaseStudyCreate(CaseStudyBase):
    pass


class CaseStudyUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    client_name: Optional[str] = Field(None, max_length=255)
    client_logo_url: Optional[str] = None
    excerpt: Optional[str] = None
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    industry: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class CaseStudyOut(CaseStudyBase):
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


class CaseStudyList(BaseModel):
    id: UUID
    slug: str
    title: str
    client_name: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image_url: Optional[str] = None
    industry: Optional[str] = None
    tags: Optional[List[str]] = None
    status: ContentStatus
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
