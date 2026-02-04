from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel
from app.models.enums import ContentStatus, ContentStatusEnum


class Blog(BaseModel):
    __tablename__ = "blogs"
    
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
    
    excerpt: Mapped[Optional[str]] = mapped_column(
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
    
    author_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    category: Mapped[Optional[str]] = mapped_column(
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
    
    author: Mapped["User"] = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="authored_blogs"
    )
    
    creator: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_blogs"
    )
    
    updater: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by],
        back_populates="updated_blogs"
    )
    
    publisher: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[published_by],
        back_populates="published_blogs"
    )
