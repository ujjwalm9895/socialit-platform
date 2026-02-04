"""
Database initialization logic.

This module handles:
- Importing all SQLAlchemy models
- Creating database tables (development only)
- Preparing structure for Alembic migrations

IMPORTANT: In production, use Alembic migrations instead of create_all().
This module is primarily for development convenience.
"""

import logging
from typing import List, Optional

from sqlalchemy import inspect

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

logger = logging.getLogger(__name__)


# ============================================================================
# Model Imports
# ============================================================================
# Import all models here so SQLAlchemy can discover them
# This ensures all table definitions are registered with Base.metadata

# TODO: Import models once they are created
# Example:
# from app.models.user import User
# from app.models.role import Role
# from app.models.permission import Permission
# from app.models.service import Service
# from app.models.blog import Blog
# from app.models.page import Page
# from app.models.case_study import CaseStudy

# For now, this is a placeholder - no models exist yet
# When models are created, uncomment and add the imports above


# ============================================================================
# Database Initialization
# ============================================================================

def init_db(force: bool = False) -> None:
    """
    Initialize database by creating all tables.
    
    This function:
    - Imports all models to register them with Base.metadata
    - Creates all tables in the database
    - Only runs in development mode (unless force=True)
    
    Args:
        force: If True, create tables even in production (not recommended)
    
    WARNING:
        - This will NOT run migrations or handle schema changes
        - Use Alembic migrations in production
        - This is only for development convenience
    """
    # Only create tables in development mode
    if not settings.is_development and not force:
        logger.warning(
            "init_db() called in non-development environment. "
            "Use Alembic migrations instead. Set force=True to override."
        )
        return
    
    if force and settings.is_production:
        logger.error(
            "init_db() with force=True called in production! "
            "This is dangerous and should not be done."
        )
        raise RuntimeError(
            "Cannot force database initialization in production. "
            "Use Alembic migrations instead."
        )
    
    logger.info("Initializing database tables...")
    
    try:
        # Create all tables defined in models
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def drop_db(force: bool = False) -> None:
    """
    Drop all database tables.
    
    WARNING: This will delete all data!
    Only use in development or testing.
    
    Args:
        force: If True, drop tables even in production (dangerous!)
    
    WARNING:
        This is a destructive operation. Use with extreme caution.
    """
    if not settings.is_development and not force:
        logger.warning(
            "drop_db() called in non-development environment. "
            "Set force=True to override."
        )
        return
    
    if force and settings.is_production:
        logger.error("drop_db() with force=True called in production!")
        raise RuntimeError("Cannot drop database in production")
    
    logger.warning("Dropping all database tables...")
    
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("All database tables dropped")
    except Exception as e:
        logger.error(f"Failed to drop database tables: {e}")
        raise


def reset_db(force: bool = False) -> None:
    """
    Reset database by dropping and recreating all tables.
    
    This is useful for development/testing when you want a fresh start.
    
    Args:
        force: If True, reset even in production (dangerous!)
    
    WARNING:
        This will delete all data! Only use in development.
    """
    if not settings.is_development and not force:
        logger.warning(
            "reset_db() called in non-development environment. "
            "Set force=True to override."
        )
        return
    
    logger.warning("Resetting database (dropping and recreating all tables)...")
    drop_db(force=force)
    init_db(force=force)
    logger.info("Database reset complete")


# ============================================================================
# Database Inspection Utilities
# ============================================================================

def check_tables_exist() -> bool:
    """
    Check if any tables exist in the database.
    
    Returns:
        True if tables exist, False otherwise
    """
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    return len(tables) > 0


def get_table_names() -> List[str]:
    """
    Get list of all table names in the database.
    
    Returns:
        List of table names
    """
    inspector = inspect(engine)
    return inspector.get_table_names()


def table_exists(table_name: str) -> bool:
    """
    Check if a specific table exists.
    
    Args:
        table_name: Name of the table to check
    
    Returns:
        True if table exists, False otherwise
    """
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


# ============================================================================
# Alembic Migration Preparation
# ============================================================================

def prepare_alembic() -> None:
    """
    Prepare database for Alembic migrations.
    
    This function can be used to:
    - Verify database connection
    - Check if tables exist
    - Provide migration guidance
    
    NOTE: This is a placeholder. Actual Alembic setup should be done via:
    1. Run: alembic init alembic
    2. Configure alembic.ini with database URL
    3. Update env.py to use Base.metadata
    4. Create initial migration: alembic revision --autogenerate -m "Initial migration"
    5. Apply migration: alembic upgrade head
    """
    logger.info("Preparing for Alembic migrations...")
    
    if not check_tables_exist():
        logger.info("No tables found. Ready for initial Alembic migration.")
    else:
        logger.info(f"Found {len(get_table_names())} existing tables.")
        logger.info(
            "If using Alembic for the first time, you may need to: "
            "1. Create initial migration with --autogenerate, "
            "2. Or stamp the database with: alembic stamp head"
        )


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    """
    Direct execution for development/testing.
    
    Usage:
        python -m app.db.init_db
    """
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "init":
            init_db()
        elif command == "drop":
            drop_db()
        elif command == "reset":
            reset_db()
        elif command == "check":
            print(f"Tables exist: {check_tables_exist()}")
            print(f"Table names: {get_table_names()}")
        elif command == "prepare-alembic":
            prepare_alembic()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: init, drop, reset, check, prepare-alembic")
    else:
        print("Usage: python -m app.db.init_db <command>")
        print("Commands: init, drop, reset, check, prepare-alembic")
