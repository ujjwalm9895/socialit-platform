from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RoleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_email_verified: bool = False


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role_ids: Optional[List[UUID]] = []


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_email_verified: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)
    role_ids: Optional[List[UUID]] = None


class UserOut(UserBase):
    id: UUID
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    roles: List[RoleOut] = []

    class Config:
        from_attributes = True


class UserList(BaseModel):
    id: UUID
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    roles: List[RoleOut] = []

    class Config:
        from_attributes = True
