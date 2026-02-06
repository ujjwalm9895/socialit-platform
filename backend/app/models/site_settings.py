from typing import Optional
from sqlalchemy import JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class SiteSettings(BaseModel):
    """
    Site-wide settings including header and footer configurations.
    """
    __tablename__ = "site_settings"
    
    key: Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False,
        index=True
    )
    
    value: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )
    
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
