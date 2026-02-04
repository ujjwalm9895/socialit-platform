"""
FastAPI application factory.

Creates and configures the FastAPI application with:
- Settings from core.config
- Startup and shutdown events
- Health check router
- CORS middleware
- Structured logging
"""

import logging
import sys

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.events import register_lifecycle_events
from app.utils.health import router as health_router


# ============================================================================
# Logging Configuration
# ============================================================================

def setup_logging() -> None:
    """
    Configure structured logging for the application.
    
    Sets up logging based on configuration:
    - LOG_LEVEL: Controls verbosity
    - LOG_FORMAT: json or text format
    """
    # Determine log format
    if settings.LOG_FORMAT.lower() == "json":
        # JSON format for production (structured logging)
        import json
        import logging.config
        
        class JSONFormatter(logging.Formatter):
            """JSON formatter for structured logging."""
            
            def format(self, record: logging.LogRecord) -> str:
                log_data = {
                    "timestamp": self.formatTime(record, self.datefmt),
                    "level": record.levelname,
                    "logger": record.name,
                    "message": record.getMessage(),
                }
                
                # Add exception info if present
                if record.exc_info:
                    log_data["exception"] = self.formatException(record.exc_info)
                
                # Add extra fields if present
                if hasattr(record, "extra"):
                    log_data.update(record.extra)
                
                return json.dumps(log_data)
        
        formatter = JSONFormatter()
    else:
        # Text format for development (human-readable)
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    # Configure root logger
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    root_logger.addHandler(handler)
    
    # Set log levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DATABASE_ECHO else logging.WARNING
    )


# ============================================================================
# Application Factory
# ============================================================================

def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.
    
    This is the application factory pattern, allowing for:
    - Easy testing with different configurations
    - Clean separation of concerns
    - Flexible deployment options
    
    Returns:
        Configured FastAPI application instance
    """
    # Setup logging first
    setup_logging()
    logger = logging.getLogger(__name__)
    
    # Create FastAPI application
    app = FastAPI(
        title=settings.API_TITLE,
        version=settings.API_VERSION,
        description="Headless CMS API for Social IT digital services company",
        docs_url="/docs" if settings.DEBUG else None,  # Disable docs in production
        redoc_url="/redoc" if settings.DEBUG else None,  # Disable redoc in production
        openapi_url="/openapi.json" if settings.DEBUG else None,  # Disable OpenAPI schema in production
    )
    
    # ========================================================================
    # Middleware
    # ========================================================================
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_CREDENTIALS,
        allow_methods=settings.CORS_METHODS,
        allow_headers=settings.CORS_HEADERS,
    )
    
    logger.info("CORS middleware configured")
    
    # ========================================================================
    # Event Handlers
    # ========================================================================
    
    # Register startup and shutdown events
    register_lifecycle_events(app)
    logger.info("Lifecycle events registered")
    
    # ========================================================================
    # Routers
    # ========================================================================
    
    # Health check router (no authentication required)
    app.include_router(health_router)
    logger.info("Health check router registered")
    
    # TODO: Add API routers here when ready
    # Example:
    # from app.api.v1 import api_router
    # app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    
    # ========================================================================
    # Root Endpoint
    # ========================================================================
    
    @app.get("/", tags=["root"])
    async def root():
        """Root endpoint with API information."""
        return {
            "message": f"Welcome to {settings.APP_NAME} API",
            "version": settings.API_VERSION,
            "environment": settings.ENVIRONMENT,
            "docs_url": "/docs" if settings.DEBUG else "disabled",
        }
    
    logger.info("Application factory completed")
    return app


# ============================================================================
# Application Instance
# ============================================================================

# Create the application instance
app = create_app()


# ============================================================================
# Development Server
# ============================================================================

if __name__ == "__main__":
    """
    Run the development server.
    
    Usage:
        python -m app.main
    
    For production, use a proper ASGI server like:
        uvicorn app.main:app --host 0.0.0.0 --port 8000
    """
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,  # Auto-reload in debug mode
        log_level=settings.LOG_LEVEL.lower(),
    )
