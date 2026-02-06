from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ContentStatus
from app.models.blog import Blog
from app.models.user import User


class BlogNotFoundError(Exception):
    pass


class BlogSlugExistsError(Exception):
    pass


def create_blog(
    db: Session,
    data: dict,
    user: User
) -> Blog:
    existing = db.scalar(
        select(Blog).where(Blog.slug == data["slug"])
    )
    if existing:
        raise BlogSlugExistsError(f"Blog with slug '{data['slug']}' already exists")
    
    blog = Blog(
        slug=data["slug"],
        title=data["title"],
        excerpt=data.get("excerpt"),
        content=data.get("content"),
        featured_image_url=data.get("featured_image_url"),
        author_id=data["author_id"],
        category=data.get("category"),
        tags=data.get("tags"),
        status=data.get("status", ContentStatus.DRAFT),
        meta_title=data.get("meta_title"),
        meta_description=data.get("meta_description"),
        meta_keywords=data.get("meta_keywords"),
        og_image_url=data.get("og_image_url"),
        created_by=user.id,
        is_deleted=False
    )
    
    if blog.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        blog.published_at = datetime.now(timezone.utc)
        blog.published_by = user.id
    
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog


def get_blog_by_id(db: Session, blog_id: UUID) -> Blog:
    blog = db.scalar(
        select(Blog).where(Blog.id == blog_id, Blog.is_deleted == False)
    )
    if not blog:
        raise BlogNotFoundError(f"Blog with id '{blog_id}' not found")
    return blog


def get_blog_by_slug(db: Session, slug: str) -> Blog:
    blog = db.scalar(
        select(Blog).where(Blog.slug == slug, Blog.is_deleted == False)
    )
    if not blog:
        raise BlogNotFoundError(f"Blog with slug '{slug}' not found")
    return blog


def list_blogs(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[ContentStatus] = None
) -> List[Blog]:
    query = select(Blog).where(Blog.is_deleted == False)
    
    if status:
        query = query.where(Blog.status == status)
    
    query = query.offset(skip).limit(limit).order_by(Blog.created_at.desc())
    
    return list(db.scalars(query).all())


def update_blog(
    db: Session,
    blog_id: UUID,
    data: dict,
    user: User
) -> Blog:
    blog = get_blog_by_id(db, blog_id)
    
    old_status = blog.status
    
    if "slug" in data and data["slug"] != blog.slug:
        existing = db.scalar(
            select(Blog).where(Blog.slug == data["slug"], Blog.id != blog_id)
        )
        if existing:
            raise BlogSlugExistsError(f"Blog with slug '{data['slug']}' already exists")
        blog.slug = data["slug"]
    
    if "title" in data:
        blog.title = data["title"]
    if "excerpt" in data:
        blog.excerpt = data.get("excerpt")
    if "content" in data:
        blog.content = data.get("content")
    if "featured_image_url" in data:
        blog.featured_image_url = data.get("featured_image_url")
    if "author_id" in data:
        blog.author_id = data["author_id"]
    if "category" in data:
        blog.category = data.get("category")
    if "tags" in data:
        blog.tags = data.get("tags")
    if "status" in data:
        blog.status = data["status"]
    if "meta_title" in data:
        blog.meta_title = data.get("meta_title")
    if "meta_description" in data:
        blog.meta_description = data.get("meta_description")
    if "meta_keywords" in data:
        blog.meta_keywords = data.get("meta_keywords")
    if "og_image_url" in data:
        blog.og_image_url = data.get("og_image_url")
    
    blog.updated_by = user.id
    
    if old_status != ContentStatus.PUBLISHED and blog.status == ContentStatus.PUBLISHED:
        from datetime import datetime, timezone
        blog.published_at = datetime.now(timezone.utc)
        blog.published_by = user.id
    elif blog.status != ContentStatus.PUBLISHED:
        blog.published_at = None
        blog.published_by = None
    
    db.commit()
    db.refresh(blog)
    return blog


def delete_blog(db: Session, blog_id: UUID) -> None:
    blog = get_blog_by_id(db, blog_id)
    blog.is_deleted = True
    db.commit()
