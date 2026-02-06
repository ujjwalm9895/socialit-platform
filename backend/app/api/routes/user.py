from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.schemas.user import UserCreate, UserList, UserOut, UserUpdate
from app.api.services.user import (
    RoleNotFoundError,
    UserEmailExistsError,
    UserNotFoundError,
    UserUsernameExistsError,
    create_user,
    delete_user,
    get_user_by_id,
    list_users,
    update_user,
)
from app.auth.dependencies import get_current_user, RequireAdmin
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/cms/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireAdmin),
):
    """Create a new user. Admin only."""
    try:
        user = create_user(
            db=db,
            data=data.model_dump(),
            created_by_user=current_user
        )
        return user
    except UserEmailExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except UserUsernameExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except RoleNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("", response_model=List[UserList])
async def list_users_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireAdmin),
):
    """List users. Admin only."""
    users = list_users(db=db, skip=skip, limit=limit, is_active=is_active)
    return users


@router.get("/{user_id}", response_model=UserOut)
async def get_user_endpoint(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireAdmin),
):
    """Get user by ID. Admin only."""
    try:
        user = get_user_by_id(db=db, user_id=user_id)
        return user
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/{user_id}", response_model=UserOut)
async def update_user_endpoint(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireAdmin),
):
    """Update user. Admin only."""
    try:
        user = update_user(
            db=db,
            user_id=user_id,
            data=data.model_dump(exclude_unset=True),
            updated_by_user=current_user
        )
        return user
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except UserEmailExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except UserUsernameExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except RoleNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireAdmin),
):
    """Delete user (soft delete). Admin only."""
    try:
        delete_user(db=db, user_id=user_id)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
