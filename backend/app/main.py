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

from app.api.routes.page import router as page_router
from app.api.routes.service import router as service_router
from app.auth.routes import router as auth_router
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
    
    Provides specific loggers for different modules:
    - app.*: Application-specific modules
    - uvicorn: Server logs
    - sqlalchemy: Database queries
    """
    import json
    
    # Determine log format
    if settings.LOG_FORMAT.lower() == "json":
        # JSON format for production (structured logging)
        class JSONFormatter(logging.Formatter):
            """JSON formatter for structured logging."""
            
            def format(self, record: logging.LogRecord) -> str:
                log_data = {
                    "timestamp": self.formatTime(record, self.datefmt),
                    "level": record.levelname,
                    "logger": record.name,
                    "module": record.module,
                    "function": record.funcName,
                    "line": record.lineno,
                    "message": record.getMessage(),
                }
                
                # Add exception info if present
                if record.exc_info:
                    log_data["exception"] = self.formatException(record.exc_info)
                    log_data["exception_type"] = record.exc_info[0].__name__ if record.exc_info else None
                
                # Add extra fields if present
                if hasattr(record, "extra"):
                    log_data.update(record.extra)
                
                # Add request context if available
                if hasattr(record, "request_id"):
                    log_data["request_id"] = record.request_id
                if hasattr(record, "user_id"):
                    log_data["user_id"] = record.user_id
                
                return json.dumps(log_data)
        
        formatter = JSONFormatter()
    else:
        # Colorful text format for development (human-readable)
        try:
            from colorama import Fore, Back, Style, init
            init(autoreset=True)
            
            class ColoredFormatter(logging.Formatter):
                """Colorful formatter for terminal output."""
                
                COLORS = {
                    "DEBUG": Fore.CYAN,
                    "INFO": Fore.GREEN,
                    "WARNING": Fore.YELLOW,
                    "ERROR": Fore.RED,
                    "CRITICAL": Fore.RED + Back.WHITE + Style.BRIGHT,
                }
                
                def format(self, record: logging.LogRecord) -> str:
                    level_color = self.COLORS.get(record.levelname, "")
                    reset = Style.RESET_ALL
                    
                    # Format timestamp
                    timestamp = self.formatTime(record, self.datefmt)
                    
                    # Format level with color and padding
                    level = f"{level_color}{record.levelname:8}{reset}"
                    
                    # Format logger name (truncate if too long)
                    logger_name = record.name
                    if len(logger_name) > 35:
                        logger_name = "..." + logger_name[-32:]
                    
                    # Format module path
                    module_path = f"{record.module}.{record.funcName}"
                    if len(module_path) > 40:
                        module_path = "..." + module_path[-37:]
                    
                    # Format location
                    location = f"{module_path}:{record.lineno}"
                    
                    # Format message
                    message = record.getMessage()
                    
                    # Build formatted string
                    formatted = (
                        f"{Fore.WHITE}{Style.DIM}{timestamp}{reset} | "
                        f"{level} | "
                        f"{Fore.BLUE}{Style.DIM}{logger_name:35}{reset} | "
                        f"{Fore.MAGENTA}{location:45}{reset} | "
                        f"{message}"
                    )
                    
                    # Add exception info if present
                    if record.exc_info:
                        formatted += f"\n{Fore.RED}{self.formatException(record.exc_info)}{reset}"
                    
                    return formatted
            
            formatter = ColoredFormatter(
                datefmt="%Y-%m-%d %H:%M:%S.%f"[:-3]
            )
        except ImportError:
            # Fallback to detailed text format without colors
            formatter = logging.Formatter(
                fmt="%(asctime)s.%(msecs)03d | %(levelname)-8s | %(name)-35s | %(module)s.%(funcName)s:%(lineno)-4d | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
    
    # Configure root logger
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    
    # Application-specific loggers with specific levels
    app_logger = logging.getLogger("app")
    app_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Auth module logger
    logging.getLogger("app.auth").setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # API module logger
    logging.getLogger("app.api").setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Database module logger
    logging.getLogger("app.db").setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Models logger
    logging.getLogger("app.models").setLevel(logging.INFO)
    
    # Core module logger
    logging.getLogger("app.core").setLevel(logging.INFO)
    
    # Set log levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(
        logging.DEBUG if settings.DEBUG else logging.WARNING
    )
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    
    # SQLAlchemy logging
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.DATABASE_ECHO else logging.WARNING
    )
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.dialects").setLevel(logging.WARNING)
    
    # Suppress noisy loggers
    logging.getLogger("passlib").setLevel(logging.WARNING)
    logging.getLogger("bcrypt").setLevel(logging.WARNING)


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

    # Cache-Control for public GET requests (faster repeat loads)
    @app.middleware("http")
    async def add_cache_control(request, call_next):
        response = await call_next(request)
        if request.method == "GET" and request.url.path.startswith("/cms/"):
            response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=120"
        return response

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
    
    # Authentication router
    app.include_router(auth_router)
    logger.info("Authentication router registered")
    
    # CMS routers
    app.include_router(service_router)
    logger.info("CMS service router registered")
    
    app.include_router(page_router)
    logger.info("CMS page router registered")
    
    from app.api.routes.blog import router as blog_router
    app.include_router(blog_router)
    logger.info("CMS blog router registered")
    
    from app.api.routes.case_study import router as case_study_router
    app.include_router(case_study_router)
    logger.info("CMS case study router registered")
    
    from app.api.routes.user import router as user_router
    app.include_router(user_router)
    logger.info("CMS user router registered")
    
    from app.api.routes.role import router as role_router
    from app.api.routes.site_settings import router as site_settings_router
    app.include_router(role_router)
    logger.info("CMS role router registered")
    
    app.include_router(site_settings_router)
    logger.info("CMS site settings router registered")
    
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
    Reads PORT from env (default 10000) for production; dev typically uses 8000 via .env.
    Usage:
        python -m app.main
    For production (e.g. Render): use run.py or set PORT=10000 and run uvicorn.
    """
    import os
    # Default port 8000 for local dev (no .env), 10000 for production (Render sets PORT).
    port = int(os.environ.get("PORT", "8000" if (settings.DEBUG or settings.is_development) else "10000"))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG,  # Auto-reload in debug mode
        log_level=settings.LOG_LEVEL.lower(),
    )
