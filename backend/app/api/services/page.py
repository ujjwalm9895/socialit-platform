from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ContentStatus
from app.models.page import Page
from app.models.user import User


class PageNotFoundError(Exception):
    pass


class PageSlugExistsError(Exception):
    pass


def create_page(
    db: Session,
    data: dict,
    user: User
) -> Page:
    existing = db.scalar(
        select(Page).where(Page.slug == data["slug"])
    )
    if existing:
        raise PageSlugExistsError(f"Page with slug '{data['slug']}' already exists")
    
    page = Page(
        slug=data["slug"],
        title=data["title"],
        content=data["content"],
        template=data.get("template"),
        status=data.get("status", ContentStatus.DRAFT),
        meta_title=data.get("meta_title"),
        meta_description=data.get("meta_description"),
        meta_keywords=data.get("meta_keywords"),
        og_image_url=data.get("og_image_url"),
        created_by=user.id,
        is_deleted=False
    )
    
    if page.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        page.published_at = datetime.now(timezone.utc)
        page.published_by = user.id
    
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


def get_page_by_id(
    db: Session,
    page_id: UUID
) -> Page:
    page = db.scalar(
        select(Page).where(
            Page.id == page_id,
            Page.is_deleted == False
        )
    )
    if not page:
        raise PageNotFoundError(f"Page with id '{page_id}' not found")
    return page


def get_page_by_slug(
    db: Session,
    slug: str
) -> Page:
    page = db.scalar(
        select(Page).where(
            Page.slug == slug,
            Page.is_deleted == False
        )
    )
    if not page:
        raise PageNotFoundError(f"Page with slug '{slug}' not found")
    return page


def list_pages(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContentStatus] = None
) -> List[Page]:
    query = select(Page).where(Page.is_deleted == False)
    
    if status:
        query = query.where(Page.status == status)
    
    query = query.order_by(Page.created_at.desc()).offset(skip).limit(limit)
    
    pages = db.scalars(query).all()
    return list(pages)


def update_page(
    db: Session,
    page_id: UUID,
    data: dict,
    user: User
) -> Page:
    page = get_page_by_id(db, page_id)
    
    if "slug" in data and data["slug"] != page.slug:
        existing = db.scalar(
            select(Page).where(
                Page.slug == data["slug"],
                Page.id != page_id
            )
        )
        if existing:
            raise PageSlugExistsError(f"Page with slug '{data['slug']}' already exists")
        page.slug = data["slug"]
    
    if "title" in data:
        page.title = data["title"]
    if "content" in data:
        page.content = data["content"]
    if "template" in data:
        page.template = data["template"]
    if "status" in data:
        old_status = page.status
        page.status = data["status"]
        if old_status != ContentStatus.PUBLISHED and data["status"] == ContentStatus.PUBLISHED:
            from datetime import datetime, timezone
            if not page.published_at:
                page.published_at = datetime.now(timezone.utc)
            page.published_by = user.id
    if "meta_title" in data:
        page.meta_title = data["meta_title"]
    if "meta_description" in data:
        page.meta_description = data["meta_description"]
    if "meta_keywords" in data:
        page.meta_keywords = data["meta_keywords"]
    if "og_image_url" in data:
        page.og_image_url = data["og_image_url"]
    
    page.updated_by = user.id
    
    db.commit()
    db.refresh(page)
    return page


def delete_page(
    db: Session,
    page_id: UUID
) -> None:
    page = get_page_by_id(db, page_id)
    page.is_deleted = True
    db.commit()
