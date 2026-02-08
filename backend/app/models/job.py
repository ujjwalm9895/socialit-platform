from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel
from app.models.enums import ContentStatus, ContentStatusEnum


class Job(BaseModel):
    __tablename__ = "jobs"

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    job_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        default="permanent",
    )  # internship | permanent
    location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )  # e.g. "Work From Office", "Remote"
    employment_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )  # e.g. "Full Time"
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    requirements: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(Text),
        nullable=True,
    )
    content: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )
    status: Mapped[ContentStatus] = mapped_column(
        ContentStatusEnum,
        default=ContentStatus.DRAFT,
        nullable=False,
        index=True,
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )
    created_by: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    updated_by: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    published_by: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    creator: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_jobs",
    )
    updater: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by],
        back_populates="updated_jobs",
    )
    publisher: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[published_by],
        back_populates="published_jobs",
    )
