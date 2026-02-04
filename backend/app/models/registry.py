import logging

from app.db.base import Base

from app.models.case_study import CaseStudy
from app.models.blog import Blog
from app.models.enums import ContentStatus, ContentStatusEnum
from app.models.page import Page
from app.models.permission import Permission
from app.models.rbac import RolePermission, UserRole
from app.models.role import Role
from app.models.service import Service
from app.models.user import User

logger = logging.getLogger(__name__)

_registered_tables = sorted(Base.metadata.tables.keys())
logger.info(f"Models registered successfully: {len(_registered_tables)} tables")
logger.debug(f"Registered tables: {', '.join(_registered_tables)}")
