from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import ContentStatus


class JobBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    job_type: str = Field("permanent", max_length=50)  # internship | permanent
    location: Optional[str] = Field(None, max_length=255)
    employment_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    content: Optional[Dict[str, Any]] = None
    status: ContentStatus = ContentStatus.DRAFT


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    job_type: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=255)
    employment_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    content: Optional[Dict[str, Any]] = None
    status: Optional[ContentStatus] = None


class JobOut(JobBase):
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


class JobList(BaseModel):
    id: UUID
    slug: str
    title: str
    job_type: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    status: ContentStatus
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
