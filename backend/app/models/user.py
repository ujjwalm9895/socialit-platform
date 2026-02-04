from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )
    
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    
    first_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    
    last_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    
    avatar_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True
    )
    
    is_email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    
    user_roles: Mapped[List["UserRole"]] = relationship(
        "UserRole",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    created_services: Mapped[List["Service"]] = relationship(
        "Service",
        foreign_keys="Service.created_by",
        back_populates="creator",
        lazy="dynamic"
    )
    
    updated_services: Mapped[List["Service"]] = relationship(
        "Service",
        foreign_keys="Service.updated_by",
        back_populates="updater",
        lazy="dynamic"
    )
    
    published_services: Mapped[List["Service"]] = relationship(
        "Service",
        foreign_keys="Service.published_by",
        back_populates="publisher",
        lazy="dynamic"
    )
    
    authored_blogs: Mapped[List["Blog"]] = relationship(
        "Blog",
        foreign_keys="Blog.author_id",
        back_populates="author",
        lazy="dynamic"
    )
    
    created_blogs: Mapped[List["Blog"]] = relationship(
        "Blog",
        foreign_keys="Blog.created_by",
        back_populates="creator",
        lazy="dynamic"
    )
    
    updated_blogs: Mapped[List["Blog"]] = relationship(
        "Blog",
        foreign_keys="Blog.updated_by",
        back_populates="updater",
        lazy="dynamic"
    )
    
    published_blogs: Mapped[List["Blog"]] = relationship(
        "Blog",
        foreign_keys="Blog.published_by",
        back_populates="publisher",
        lazy="dynamic"
    )
    
    created_pages: Mapped[List["Page"]] = relationship(
        "Page",
        foreign_keys="Page.created_by",
        back_populates="creator",
        lazy="dynamic"
    )
    
    updated_pages: Mapped[List["Page"]] = relationship(
        "Page",
        foreign_keys="Page.updated_by",
        back_populates="updater",
        lazy="dynamic"
    )
    
    published_pages: Mapped[List["Page"]] = relationship(
        "Page",
        foreign_keys="Page.published_by",
        back_populates="publisher",
        lazy="dynamic"
    )
    
    created_case_studies: Mapped[List["CaseStudy"]] = relationship(
        "CaseStudy",
        foreign_keys="CaseStudy.created_by",
        back_populates="creator",
        lazy="dynamic"
    )
    
    updated_case_studies: Mapped[List["CaseStudy"]] = relationship(
        "CaseStudy",
        foreign_keys="CaseStudy.updated_by",
        back_populates="updater",
        lazy="dynamic"
    )
    
    published_case_studies: Mapped[List["CaseStudy"]] = relationship(
        "CaseStudy",
        foreign_keys="CaseStudy.published_by",
        back_populates="publisher",
        lazy="dynamic"
    )
