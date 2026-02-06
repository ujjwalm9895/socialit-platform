from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.schemas.user import RoleOut
from app.auth.dependencies import RequireAdmin
from app.db.session import get_db
from app.models.role import Role
from app.models.user import User

router = APIRouter(prefix="/cms/roles", tags=["roles"])


@router.get("", response_model=List[RoleOut])
async def list_roles_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireAdmin),
):
    """List all roles. Admin only."""
    roles = db.scalars(select(Role).order_by(Role.name)).all()
    return list(roles)
