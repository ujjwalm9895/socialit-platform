from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.api.schemas.blog import BlogCreate, BlogList, BlogOut, BlogUpdate
from app.api.services.blog import (
    BlogNotFoundError,
    BlogSlugExistsError,
    create_blog,
    delete_blog,
    get_blog_by_id,
    get_blog_by_slug,
    list_blogs,
    update_blog,
)
from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.enums import ContentStatus
from app.models.user import User

router = APIRouter(prefix="/cms/blogs", tags=["blogs"])
optional_security = HTTPBearer(auto_error=False)


def require_admin_or_editor(current_user: User = Depends(get_current_user)) -> User:
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required",
        )
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(optional_security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if credentials is None:
        return None
    try:
        from app.auth.security import decode_token
        from sqlalchemy import select
        from sqlalchemy.orm import joinedload
        from app.models.rbac import UserRole
        from app.models.user import User
        
        payload = decode_token(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            return None
        
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            return None
        
        user = db.scalar(
            select(User)
            .options(joinedload(User.user_roles).joinedload(UserRole.role))
            .where(User.id == user_uuid)
        )
        
        if user and user.is_active:
            return user
        return None
    except (HTTPException, ValueError, Exception):
        return None


@router.post("", response_model=BlogOut, status_code=status.HTTP_201_CREATED)
async def create_blog_endpoint(
    data: BlogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_editor),
):
    try:
        blog = create_blog(
            db=db,
            data=data.model_dump(),
            user=current_user
        )
        return blog
    except BlogSlugExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.get("", response_model=List[BlogList])
async def list_blogs_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ContentStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    user_role_names = set()
    if current_user:
        user_role_names = {ur.role.name for ur in current_user.user_roles}
    
    is_admin_or_editor = "admin" in user_role_names or "editor" in user_role_names
    
    if not is_admin_or_editor:
        if status is None:
            status = ContentStatus.PUBLISHED
        elif status != ContentStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only published blogs are accessible to public"
            )
    
    blogs = list_blogs(db=db, skip=skip, limit=limit, status=status)
    return blogs


@router.get("/{blog_id}", response_model=BlogOut)
async def get_blog_endpoint(
    blog_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        blog = get_blog_by_id(db=db, blog_id=blog_id)
        
        user_role_names = set()
        if current_user:
            user_role_names = {ur.role.name for ur in current_user.user_roles}
        
        is_admin_or_editor = "admin" in user_role_names or "editor" in user_role_names
        
        if not is_admin_or_editor and blog.status != ContentStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        
        return blog
    except BlogNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/slug/{slug}", response_model=BlogOut)
async def get_blog_by_slug_endpoint(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        blog = get_blog_by_slug(db=db, slug=slug)
        
        user_role_names = set()
        if current_user:
            user_role_names = {ur.role.name for ur in current_user.user_roles}
        
        is_admin_or_editor = "admin" in user_role_names or "editor" in user_role_names
        
        if not is_admin_or_editor and blog.status != ContentStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        
        return blog
    except BlogNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.put("/{blog_id}", response_model=BlogOut)
async def update_blog_endpoint(
    blog_id: UUID,
    data: BlogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_editor),
):
    try:
        blog = update_blog(
            db=db,
            blog_id=blog_id,
            data=data.model_dump(exclude_unset=True),
            user=current_user
        )
        return blog
    except BlogNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except BlogSlugExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_endpoint(
    blog_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_editor),
):
    try:
        delete_blog(db=db, blog_id=blog_id)
    except BlogNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
