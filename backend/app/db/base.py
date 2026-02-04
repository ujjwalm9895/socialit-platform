"""
SQLAlchemy declarative base with reusable mixins.

Provides:
- UUID primary key mixin
- Timestamp mixin (created_at, updated_at)
- Base class for all models
- PostgreSQL compatible
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Set

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    
    Uses the new SQLAlchemy 2.0 style declarative base.
    """
    pass


class UUIDPrimaryKeyMixin:
    """
    Mixin that provides a UUID primary key.
    
    Uses PostgreSQL UUID type with server-side default generation.
    Compatible with uuid-ossp extension.
    """
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=func.gen_random_uuid(),
        nullable=False,
        index=True,
        comment="Primary key UUID"
    )


class TimestampMixin:
    """
    Mixin that provides created_at and updated_at timestamp columns.
    
    - created_at: Set once when record is created
    - updated_at: Automatically updated on every record modification
    """
    
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Record creation timestamp"
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Record last update timestamp"
    )


class BaseModel(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Base model class combining UUID primary key and timestamps.
    
    All models should inherit from this class to get:
    - UUID primary key (id)
    - created_at timestamp
    - updated_at timestamp (auto-updated)
    
    Example:
        class User(BaseModel):
            __tablename__ = "users"
            
            email = Column(String(255), unique=True, nullable=False)
            ...
    """
    
    __abstract__ = True
    
    def __repr__(self) -> str:
        """String representation of the model."""
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def to_dict(self, exclude: Optional[Set[str]] = None) -> Dict[str, Any]:
        """
        Convert model instance to dictionary.
        
        Args:
            exclude: Set of field names to exclude from the dictionary
            
        Returns:
            Dictionary representation of the model
        """
        exclude = exclude or set()
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
            if column.name not in exclude
        }


# Legacy declarative_base for backward compatibility (if needed)
# Use BaseModel instead for new models
declarative_base = Base
