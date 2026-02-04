"""
FastAPI startup and shutdown event handlers.

Handles:
- Database connectivity checks on startup
- Application lifecycle logging
- Fail-fast behavior if critical services are unavailable
"""

import logging
import sys

from fastapi import FastAPI

from app.core.config import settings
from app.db.session import check_db_connection, engine, get_db_stats

logger = logging.getLogger(__name__)


# ============================================================================
# Startup Events
# ============================================================================

def startup_db_check() -> None:
    """
    Check database connectivity on startup.
    
    Raises:
        RuntimeError: If database is unavailable
    """
    logger.info("Checking database connectivity...")
    
    try:
        if not check_db_connection():
            error_msg = "Database connection check failed"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        
        # Get connection pool stats
        pool_stats = get_db_stats()
        logger.info(
            f"Database connection successful. Pool stats: {pool_stats}"
        )
        
        # Verify we can execute a simple query
        from sqlalchemy import text
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.scalar()
            logger.info(f"PostgreSQL version: {version}")
            
    except Exception as e:
        error_msg = f"Failed to connect to database: {str(e)}"
        logger.critical(error_msg, exc_info=True)
        raise RuntimeError(error_msg) from e


def startup_log_info() -> None:
    """Log application startup information."""
    logger.info("=" * 60)
    logger.info(f"Starting {settings.APP_NAME}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"API version: {settings.API_VERSION}")
    logger.info("=" * 60)


def register_startup_events(app: FastAPI) -> None:
    """
    Register all startup event handlers.
    
    Events are executed in the order they are registered.
    
    Args:
        app: FastAPI application instance
    """
    @app.on_event("startup")
    async def startup_handler() -> None:
        """Main startup event handler."""
        try:
            # Log startup information
            startup_log_info()
            
            # Check database connectivity (fail fast if unavailable)
            startup_db_check()
            
            logger.info("Application startup completed successfully")
            
        except Exception as e:
            logger.critical(
                f"Application startup failed: {str(e)}",
                exc_info=True
            )
            # Exit with error code to signal failure
            sys.exit(1)


# ============================================================================
# Shutdown Events
# ============================================================================

def shutdown_cleanup() -> None:
    """Perform cleanup operations on shutdown."""
    logger.info("Performing cleanup operations...")
    
    try:
        # Close database connections
        logger.info("Closing database connections...")
        engine.dispose()
        logger.info("Database connections closed")
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}", exc_info=True)


def shutdown_log_info() -> None:
    """Log application shutdown information."""
    logger.info("=" * 60)
    logger.info(f"Shutting down {settings.APP_NAME}")
    logger.info("=" * 60)


def register_shutdown_events(app: FastAPI) -> None:
    """
    Register all shutdown event handlers.
    
    Events are executed in reverse order of registration.
    
    Args:
        app: FastAPI application instance
    """
    @app.on_event("shutdown")
    async def shutdown_handler() -> None:
        """Main shutdown event handler."""
        try:
            # Log shutdown information
            shutdown_log_info()
            
            # Perform cleanup
            shutdown_cleanup()
            
            logger.info("Application shutdown completed")
            
        except Exception as e:
            logger.error(
                f"Error during application shutdown: {str(e)}",
                exc_info=True
            )


# ============================================================================
# Convenience Function
# ============================================================================

def register_lifecycle_events(app: FastAPI) -> None:
    """
    Register all application lifecycle events.
    
    This is a convenience function that registers both startup
    and shutdown events. Use this in your main.py file.
    
    Args:
        app: FastAPI application instance
    
    Example:
        from fastapi import FastAPI
        from app.core.events import register_lifecycle_events
        
        app = FastAPI()
        register_lifecycle_events(app)
    """
    register_startup_events(app)
    register_shutdown_events(app)
    logger.debug("Lifecycle events registered")
