from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ContentStatus


class BlogBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    featured_image_url: Optional[str] = None
    author_id: UUID
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    status: ContentStatus = ContentStatus.DRAFT
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    excerpt: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    featured_image_url: Optional[str] = None
    author_id: Optional[UUID] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    status: Optional[ContentStatus] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    og_image_url: Optional[str] = None


class BlogOut(BlogBase):
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


class BlogList(BaseModel):
    id: UUID
    slug: str
    title: str
    excerpt: Optional[str] = None
    featured_image_url: Optional[str] = None
    author_id: UUID
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: ContentStatus
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
