from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ContentStatus
from app.models.job import Job
from app.models.user import User


class JobNotFoundError(Exception):
    pass


class JobSlugExistsError(Exception):
    pass


def create_job(db: Session, data: dict, user: User) -> Job:
    existing = db.scalar(select(Job).where(Job.slug == data["slug"]))
    if existing:
        raise JobSlugExistsError(f"Job with slug '{data['slug']}' already exists")

    job = Job(
        slug=data["slug"],
        title=data["title"],
        job_type=data.get("job_type", "permanent"),
        location=data.get("location"),
        employment_type=data.get("employment_type"),
        description=data.get("description"),
        requirements=data.get("requirements"),
        content=data.get("content"),
        status=data.get("status", ContentStatus.DRAFT),
        created_by=user.id,
        is_deleted=False,
    )
    if job.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        job.published_at = datetime.now(timezone.utc)
        job.published_by = user.id

    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job_by_id(db: Session, job_id: UUID) -> Job:
    job = db.scalar(select(Job).where(Job.id == job_id, Job.is_deleted == False))
    if not job:
        raise JobNotFoundError(f"Job with id '{job_id}' not found")
    return job


def get_job_by_slug(db: Session, slug: str) -> Job:
    job = db.scalar(select(Job).where(Job.slug == slug, Job.is_deleted == False))
    if not job:
        raise JobNotFoundError(f"Job with slug '{slug}' not found")
    return job


def list_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContentStatus] = None,
    job_type: Optional[str] = None,
) -> List[Job]:
    query = select(Job).where(Job.is_deleted == False)
    if status:
        query = query.where(Job.status == status)
    if job_type:
        query = query.where(Job.job_type == job_type)
    query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
    return list(db.scalars(query).all())


def update_job(db: Session, job_id: UUID, data: dict, user: User) -> Job:
    job = get_job_by_id(db, job_id)
    if "slug" in data and data["slug"] != job.slug:
        existing = db.scalar(
            select(Job).where(Job.slug == data["slug"], Job.id != job_id)
        )
        if existing:
            raise JobSlugExistsError(f"Job with slug '{data['slug']}' already exists")
        job.slug = data["slug"]
    if "title" in data:
        job.title = data["title"]
    if "job_type" in data:
        job.job_type = data["job_type"]
    if "location" in data:
        job.location = data["location"]
    if "employment_type" in data:
        job.employment_type = data["employment_type"]
    if "description" in data:
        job.description = data["description"]
    if "requirements" in data:
        job.requirements = data["requirements"]
    if "content" in data:
        job.content = data["content"]
    if "status" in data:
        old_status = job.status
        job.status = data["status"]
        if old_status != ContentStatus.PUBLISHED and data["status"] == ContentStatus.PUBLISHED:
            from datetime import datetime, timezone
            if not job.published_at:
                job.published_at = datetime.now(timezone.utc)
            job.published_by = user.id
    job.updated_by = user.id
    db.commit()
    db.refresh(job)
    return job


def delete_job(db: Session, job_id: UUID) -> None:
    job = get_job_by_id(db, job_id)
    job.is_deleted = True
    db.commit()
