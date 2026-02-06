from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.models.rbac import UserRole
from app.models.role import Role
from app.auth.security import hash_password


class UserNotFoundError(Exception):
    pass


class UserEmailExistsError(Exception):
    pass


class UserUsernameExistsError(Exception):
    pass


class RoleNotFoundError(Exception):
    pass


def create_user(
    db: Session,
    data: dict,
    created_by_user: User
) -> User:
    """Create a new user with roles."""
    # Check email uniqueness
    existing = db.scalar(select(User).where(User.email == data["email"]))
    if existing:
        raise UserEmailExistsError(f"User with email {data['email']} already exists")
    
    # Check username uniqueness
    existing = db.scalar(select(User).where(User.username == data["username"]))
    if existing:
        raise UserUsernameExistsError(f"User with username {data['username']} already exists")
    
    # Hash password
    password_hash = hash_password(data["password"])
    
    # Create user
    user = User(
        email=data["email"],
        username=data["username"],
        password_hash=password_hash,
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        avatar_url=data.get("avatar_url"),
        is_active=data.get("is_active", True),
        is_email_verified=data.get("is_email_verified", False),
        created_by=created_by_user.id,
        updated_by=created_by_user.id,
    )
    
    db.add(user)
    db.flush()  # Flush to get user.id
    
    # Assign roles
    role_ids = data.get("role_ids", [])
    if role_ids:
        roles = db.scalars(
            select(Role).where(Role.id.in_(role_ids))
        ).all()
        
        if len(roles) != len(role_ids):
            raise RoleNotFoundError("One or more roles not found")
        
        for role in roles:
            user_role = UserRole(
                user_id=user.id,
                role_id=role.id,
                assigned_by=created_by_user.id,
            )
            db.add(user_role)
    
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise UserEmailExistsError(f"User with email {data['email']} or username {data['username']} already exists")
    
    # Load roles
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: UUID) -> User:
    """Get user by ID with roles."""
    user = db.scalar(
        select(User)
        .options(joinedload(User.user_roles).joinedload(UserRole.role))
        .where(User.id == user_id)
    )
    
    if not user:
        raise UserNotFoundError(f"User with ID {user_id} not found")
    
    return user


def list_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None
) -> List[User]:
    """List users with pagination and optional filtering."""
    query = select(User).options(
        joinedload(User.user_roles).joinedload(UserRole.role)
    )
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    users = db.scalars(query).unique().all()
    return list(users)


def update_user(
    db: Session,
    user_id: UUID,
    data: dict,
    updated_by_user: User
) -> User:
    """Update user and roles."""
    user = get_user_by_id(db, user_id)
    
    # Check email uniqueness if changing
    if "email" in data and data["email"] != user.email:
        existing = db.scalar(select(User).where(User.email == data["email"]))
        if existing:
            raise UserEmailExistsError(f"User with email {data['email']} already exists")
        user.email = data["email"]
    
    # Check username uniqueness if changing
    if "username" in data and data["username"] != user.username:
        existing = db.scalar(select(User).where(User.username == data["username"]))
        if existing:
            raise UserUsernameExistsError(f"User with username {data['username']} already exists")
        user.username = data["username"]
    
    # Update password if provided
    if "password" in data and data["password"]:
        user.password_hash = hash_password(data["password"])
    
    # Update other fields
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    if "avatar_url" in data:
        user.avatar_url = data["avatar_url"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    if "is_email_verified" in data:
        user.is_email_verified = data["is_email_verified"]
    
    user.updated_by = updated_by_user.id
    
    # Update roles if provided
    if "role_ids" in data and data["role_ids"] is not None:
        # Remove existing roles
        db.query(UserRole).filter(UserRole.user_id == user_id).delete()
        
        # Add new roles
        if data["role_ids"]:
            roles = db.scalars(
                select(Role).where(Role.id.in_(data["role_ids"]))
            ).all()
            
            if len(roles) != len(data["role_ids"]):
                raise RoleNotFoundError("One or more roles not found")
            
            for role in roles:
                user_role = UserRole(
                    user_id=user.id,
                    role_id=role.id,
                    assigned_by=updated_by_user.id,
                )
                db.add(user_role)
    
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise UserEmailExistsError(f"User with email {data.get('email', user.email)} or username {data.get('username', user.username)} already exists")
    
    return user


def delete_user(db: Session, user_id: UUID) -> None:
    """Soft delete user (set is_active=False)."""
    user = get_user_by_id(db, user_id)
    user.is_active = False
    db.commit()
