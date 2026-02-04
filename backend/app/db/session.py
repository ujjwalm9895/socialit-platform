"""
SQLAlchemy database connection and session management.

Provides:
- Engine creation with connection pooling
- SessionLocal factory
- FastAPI dependency for database sessions
- Production-safe defaults
"""

from typing import Generator

from sqlalchemy import create_engine, event, pool
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.db.base import Base


# ============================================================================
# Engine Configuration
# ============================================================================

def create_db_engine() -> Engine:
    """
    Create SQLAlchemy engine with production-safe defaults.
    
    Connection pool settings:
    - pool_size: Number of connections to maintain
    - max_overflow: Additional connections beyond pool_size
    - pool_pre_ping: Verify connections before using (prevents stale connections)
    - pool_recycle: Recycle connections after this many seconds (prevents stale connections)
    - echo: Log SQL queries (only in debug mode)
    
    Returns:
        Configured SQLAlchemy engine
    """
    engine = create_engine(
        str(settings.DATABASE_URL),
        # Connection pool settings
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,   # Recycle connections after 1 hour
        # Connection timeout
        connect_args={
            "connect_timeout": 10,  # 10 second connection timeout
            "options": "-c timezone=utc"  # Ensure UTC timezone
        },
        # Query logging (only in debug mode)
        echo=settings.DATABASE_ECHO,
        # Future-proof for SQLAlchemy 2.0
        future=True,
    )
    
    # Add connection pool event listeners for monitoring
    @event.listens_for(engine, "connect")
    def set_postgres_settings(dbapi_conn, connection_record):
        """Set PostgreSQL-specific connection settings."""
        # Ensure UUID extension is available (if not already created)
        # Note: Extension creation requires superuser privileges
        # In production, extensions should be created via migrations
        pass
    
    return engine


# Create the engine instance
engine = create_db_engine()


# ============================================================================
# Session Factory
# ============================================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
    expire_on_commit=False,  # Prevent lazy loading issues after commit
)


# ============================================================================
# FastAPI Dependency
# ============================================================================

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency to get database session.
    
    Creates a new session for each request and ensures it's closed
    after the request completes, even if an error occurs.
    
    Usage in FastAPI:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# Database Initialization
# ============================================================================

def init_db() -> None:
    """
    Initialize database by creating all tables.
    
    This should be called once during application startup.
    In production, prefer using Alembic migrations instead.
    """
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """
    Drop all database tables.
    
    WARNING: This will delete all data!
    Only use in development or testing.
    """
    Base.metadata.drop_all(bind=engine)


# ============================================================================
# Health Check Utilities
# ============================================================================

def check_db_connection() -> bool:
    """
    Check if database connection is healthy.
    
    Returns:
        True if connection is successful, False otherwise
    """
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def get_db_stats() -> dict:
    """
    Get database connection pool statistics.
    
    Returns:
        Dictionary with pool statistics
    """
    pool_instance = engine.pool
    return {
        "pool_size": pool_instance.size(),
        "checked_in": pool_instance.checkedin(),
        "checked_out": pool_instance.checkedout(),
        "overflow": pool_instance.overflow(),
        "invalid": pool_instance.invalid(),
    }
