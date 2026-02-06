from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ContentStatus
from app.models.service import Service
from app.models.user import User


class ServiceNotFoundError(Exception):
    pass


class ServiceSlugExistsError(Exception):
    pass


def create_service(
    db: Session,
    data: dict,
    user: User
) -> Service:
    existing = db.scalar(
        select(Service).where(Service.slug == data["slug"])
    )
    if existing:
        raise ServiceSlugExistsError(f"Service with slug '{data['slug']}' already exists")
    
    service = Service(
        slug=data["slug"],
        title=data["title"],
        subtitle=data.get("subtitle"),
        description=data.get("description"),
        content=data.get("content"),
        featured_image_url=data.get("featured_image_url"),
        icon_url=data.get("icon_url"),
        status=data.get("status", ContentStatus.DRAFT),
        meta_title=data.get("meta_title"),
        meta_description=data.get("meta_description"),
        meta_keywords=data.get("meta_keywords"),
        og_image_url=data.get("og_image_url"),
        created_by=user.id,
        is_deleted=False
    )
    
    if service.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        service.published_at = datetime.now(timezone.utc)
        service.published_by = user.id
    
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def get_service_by_id(
    db: Session,
    service_id: UUID
) -> Service:
    service = db.scalar(
        select(Service).where(
            Service.id == service_id,
            Service.is_deleted == False
        )
    )
    if not service:
        raise ServiceNotFoundError(f"Service with id '{service_id}' not found")
    return service


def get_service_by_slug(
    db: Session,
    slug: str
) -> Service:
    service = db.scalar(
        select(Service).where(
            Service.slug == slug,
            Service.is_deleted == False
        )
    )
    if not service:
        raise ServiceNotFoundError(f"Service with slug '{slug}' not found")
    return service


def list_services(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContentStatus] = None
) -> List[Service]:
    query = select(Service).where(Service.is_deleted == False)
    
    if status:
        query = query.where(Service.status == status)
    
    query = query.order_by(Service.created_at.desc()).offset(skip).limit(limit)
    
    services = db.scalars(query).all()
    return list(services)


def update_service(
    db: Session,
    service_id: UUID,
    data: dict,
    user: User
) -> Service:
    service = get_service_by_id(db, service_id)
    
    if "slug" in data and data["slug"] != service.slug:
        existing = db.scalar(
            select(Service).where(
                Service.slug == data["slug"],
                Service.id != service_id
            )
        )
        if existing:
            raise ServiceSlugExistsError(f"Service with slug '{data['slug']}' already exists")
        service.slug = data["slug"]
    
    if "title" in data:
        service.title = data["title"]
    if "subtitle" in data:
        service.subtitle = data["subtitle"]
    if "description" in data:
        service.description = data["description"]
    if "content" in data:
        service.content = data["content"]
    if "featured_image_url" in data:
        service.featured_image_url = data["featured_image_url"]
    if "icon_url" in data:
        service.icon_url = data["icon_url"]
    if "status" in data:
        old_status = service.status
        service.status = data["status"]
        if old_status != ContentStatus.PUBLISHED and data["status"] == ContentStatus.PUBLISHED:
            from datetime import datetime, timezone
            if not service.published_at:
                service.published_at = datetime.now(timezone.utc)
            service.published_by = user.id
    if "meta_title" in data:
        service.meta_title = data["meta_title"]
    if "meta_description" in data:
        service.meta_description = data["meta_description"]
    if "meta_keywords" in data:
        service.meta_keywords = data["meta_keywords"]
    if "og_image_url" in data:
        service.og_image_url = data["og_image_url"]
    
    service.updated_by = user.id
    
    db.commit()
    db.refresh(service)
    return service


def delete_service(
    db: Session,
    service_id: UUID
) -> None:
    service = get_service_by_id(db, service_id)
    service.is_deleted = True
    db.commit()
