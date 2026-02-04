from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel
from app.models.enums import ContentStatus, ContentStatusEnum


class CaseStudy(BaseModel):
    __tablename__ = "case_studies"
    
    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )
    
    client_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    client_logo_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    excerpt: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    challenge: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    solution: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    results: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    content: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True
    )
    
    featured_image_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    gallery_images: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(Text),
        nullable=True
    )
    
    industry: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        index=True
    )
    
    tags: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(Text),
        nullable=True
    )
    
    status: Mapped[ContentStatus] = mapped_column(
        ContentStatusEnum,
        default=ContentStatus.DRAFT,
        nullable=False,
        index=True
    )
    
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True
    )
    
    meta_title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )
    
    meta_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    meta_keywords: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True
    )
    
    og_image_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    created_by: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    updated_by: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )
    
    published_by: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )
    
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )
    
    creator: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_case_studies"
    )
    
    updater: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by],
        back_populates="updated_case_studies"
    )
    
    publisher: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[published_by],
        back_populates="published_case_studies"
    )
