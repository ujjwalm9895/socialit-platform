from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ContentStatus
from app.models.case_study import CaseStudy
from app.models.user import User


class CaseStudyNotFoundError(Exception):
    pass


class CaseStudySlugExistsError(Exception):
    pass


def create_case_study(
    db: Session,
    data: dict,
    user: User
) -> CaseStudy:
    existing = db.scalar(
        select(CaseStudy).where(CaseStudy.slug == data["slug"])
    )
    if existing:
        raise CaseStudySlugExistsError(f"Case study with slug '{data['slug']}' already exists")
    
    case_study = CaseStudy(
        slug=data["slug"],
        title=data["title"],
        client_name=data.get("client_name"),
        client_logo_url=data.get("client_logo_url"),
        excerpt=data.get("excerpt"),
        challenge=data.get("challenge"),
        solution=data.get("solution"),
        results=data.get("results"),
        content=data.get("content"),
        featured_image_url=data.get("featured_image_url"),
        gallery_images=data.get("gallery_images"),
        industry=data.get("industry"),
        tags=data.get("tags"),
        status=data.get("status", ContentStatus.DRAFT),
        meta_title=data.get("meta_title"),
        meta_description=data.get("meta_description"),
        meta_keywords=data.get("meta_keywords"),
        og_image_url=data.get("og_image_url"),
        created_by=user.id,
        is_deleted=False
    )
    
    if case_study.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        case_study.published_at = datetime.now(timezone.utc)
        case_study.published_by = user.id
    
    db.add(case_study)
    db.commit()
    db.refresh(case_study)
    return case_study


def get_case_study_by_id(db: Session, case_study_id: UUID) -> CaseStudy:
    case_study = db.scalar(
        select(CaseStudy).where(CaseStudy.id == case_study_id, CaseStudy.is_deleted == False)
    )
    if not case_study:
        raise CaseStudyNotFoundError(f"Case study with id '{case_study_id}' not found")
    return case_study


def get_case_study_by_slug(db: Session, slug: str) -> CaseStudy:
    case_study = db.scalar(
        select(CaseStudy).where(CaseStudy.slug == slug, CaseStudy.is_deleted == False)
    )
    if not case_study:
        raise CaseStudyNotFoundError(f"Case study with slug '{slug}' not found")
    return case_study


def list_case_studies(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContentStatus] = None
) -> List[CaseStudy]:
    query = select(CaseStudy).where(CaseStudy.is_deleted == False)
    
    if status:
        query = query.where(CaseStudy.status == status)
    
    query = query.offset(skip).limit(limit).order_by(CaseStudy.created_at.desc())
    
    return list(db.scalars(query).all())


def update_case_study(
    db: Session,
    case_study_id: UUID,
    data: dict,
    user: User
) -> CaseStudy:
    case_study = get_case_study_by_id(db, case_study_id)
    
    old_status = case_study.status
    
    if "slug" in data and data["slug"] != case_study.slug:
        existing = db.scalar(
            select(CaseStudy).where(CaseStudy.slug == data["slug"], CaseStudy.id != case_study_id)
        )
        if existing:
            raise CaseStudySlugExistsError(f"Case study with slug '{data['slug']}' already exists")
        case_study.slug = data["slug"]
    
    if "title" in data:
        case_study.title = data["title"]
    if "client_name" in data:
        case_study.client_name = data.get("client_name")
    if "client_logo_url" in data:
        case_study.client_logo_url = data.get("client_logo_url")
    if "excerpt" in data:
        case_study.excerpt = data.get("excerpt")
    if "challenge" in data:
        case_study.challenge = data.get("challenge")
    if "solution" in data:
        case_study.solution = data.get("solution")
    if "results" in data:
        case_study.results = data.get("results")
    if "content" in data:
        case_study.content = data.get("content")
    if "featured_image_url" in data:
        case_study.featured_image_url = data.get("featured_image_url")
    if "gallery_images" in data:
        case_study.gallery_images = data.get("gallery_images")
    if "industry" in data:
        case_study.industry = data.get("industry")
    if "tags" in data:
        case_study.tags = data.get("tags")
    if "status" in data:
        case_study.status = data["status"]
    if "meta_title" in data:
        case_study.meta_title = data.get("meta_title")
    if "meta_description" in data:
        case_study.meta_description = data.get("meta_description")
    if "meta_keywords" in data:
        case_study.meta_keywords = data.get("meta_keywords")
    if "og_image_url" in data:
        case_study.og_image_url = data.get("og_image_url")
    
    case_study.updated_by = user.id
    
    if old_status != ContentStatus.PUBLISHED and case_study.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        case_study.published_at = datetime.now(timezone.utc)
        case_study.published_by = user.id
    elif case_study.status != ContentStatus.PUBLISHED:
        case_study.published_at = None
        case_study.published_by = None
    
    db.commit()
    db.refresh(case_study)
    return case_study


def delete_case_study(db: Session, case_study_id: UUID) -> None:
    case_study = get_case_study_by_id(db, case_study_id)
    case_study.is_deleted = True
    db.commit()
