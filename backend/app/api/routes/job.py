from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.schemas.job import JobCreate, JobList, JobOut, JobUpdate
from app.api.services.job import (
    JobNotFoundError,
    JobSlugExistsError,
    create_job,
    delete_job,
    get_job_by_id,
    get_job_by_slug,
    list_jobs,
    update_job,
)
from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.enums import ContentStatus
from app.models.user import User

router = APIRouter(prefix="/cms/jobs", tags=["jobs"])
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
    db: Session = Depends(get_db),
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
    except Exception:
        return None


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
async def create_job_endpoint(
    data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_editor),
):
    try:
        job = create_job(db=db, data=data.model_dump(), user=current_user)
        return job
    except JobSlugExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("", response_model=List[JobList])
async def list_jobs_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[ContentStatus] = Query(None),
    job_type: Optional[str] = Query(None),
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
                detail="Only published jobs are accessible to public",
            )
    jobs = list_jobs(db=db, skip=skip, limit=limit, status=status, job_type=job_type)
    return jobs


@router.get("/slug/{slug}", response_model=JobOut)
async def get_job_by_slug_endpoint(
    slug: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        job = get_job_by_slug(db=db, slug=slug)
        user_role_names = set()
        if current_user:
            user_role_names = {ur.role.name for ur in current_user.user_roles}
        if "admin" not in user_role_names and "editor" not in user_role_names:
            if job.status != ContentStatus.PUBLISHED:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job not found",
                )
        return job
    except JobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")


@router.get("/{job_id}", response_model=JobOut)
async def get_job_endpoint(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    try:
        job = get_job_by_id(db=db, job_id=job_id)
        user_role_names = set()
        if current_user:
            user_role_names = {ur.role.name for ur in current_user.user_roles}
        if "admin" not in user_role_names and "editor" not in user_role_names:
            if job.status != ContentStatus.PUBLISHED:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Job not found",
                )
        return job
    except JobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")


@router.put("/{job_id}", response_model=JobOut)
async def update_job_endpoint(
    job_id: UUID,
    data: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_editor),
):
    try:
        job = update_job(
            db=db,
            job_id=job_id,
            data=data.model_dump(exclude_unset=True),
            user=current_user,
        )
        return job
    except JobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    except JobSlugExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_endpoint(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_editor),
):
    try:
        delete_job(db=db, job_id=job_id)
    except JobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
