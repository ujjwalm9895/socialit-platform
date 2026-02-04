from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(Base):
    __tablename__ = "user_roles"
    
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    
    role_id: Mapped[UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    assigned_by: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )
    
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="user_roles"
    )
    
    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="user_roles"
    )
    
    assigner: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[assigned_by]
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"
    
    role_id: Mapped[UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    
    permission_id: Mapped[UUID] = mapped_column(
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    role: Mapped["Role"] = relationship(
        "Role",
        back_populates="role_permissions"
    )
    
    permission: Mapped["Permission"] = relationship(
        "Permission",
        back_populates="role_permissions"
    )
