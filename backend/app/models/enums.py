import enum

from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM


class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


ContentStatusEnum = PG_ENUM(
    ContentStatus,
    name="content_status",
    create_type=True,
    native_enum=True,
)
