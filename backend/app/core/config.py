"""
Production-grade configuration module using pydantic-settings.

This module handles all application configuration with:
- Environment variable loading from .env files
- Type validation and defaults
- Environment-specific settings
- Security best practices
"""

from typing import Annotated, List, Optional, Union
from functools import lru_cache

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings with validation and type safety.
    
    All settings can be overridden via environment variables.
    Environment variables are case-insensitive and can use underscores or double underscores.
    """

    # ============================================================================
    # Application Settings
    # ============================================================================
    
    APP_NAME: str = Field(
        default="Social IT CMS",
        description="Application name"
    )
    
    ENVIRONMENT: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )
    
    DEBUG: bool = Field(
        default=False,
        description="Enable debug mode (should be False in production)"
    )
    
    # ============================================================================
    # Security Settings
    # ============================================================================
    
    SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="Secret key for cryptographic operations (min 32 chars)"
    )
    
    ALGORITHM: str = Field(
        default="HS256",
        description="JWT algorithm"
    )
    
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        ge=1,
        description="Access token expiration time in minutes"
    )
    
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        ge=1,
        description="Refresh token expiration time in days"
    )
    
    # ============================================================================
    # Database Settings
    # ============================================================================
    
    DATABASE_URL: PostgresDsn = Field(
        ...,
        description="PostgreSQL database connection URL"
    )
    
    DATABASE_POOL_SIZE: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Database connection pool size"
    )
    
    DATABASE_MAX_OVERFLOW: int = Field(
        default=10,
        ge=0,
        description="Maximum overflow connections for database pool"
    )
    
    DATABASE_ECHO: bool = Field(
        default=False,
        description="Echo SQL queries (useful for debugging)"
    )
    
    # ============================================================================
    # CORS Settings
    # ============================================================================
    
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:3000,http://localhost:8000",
        description="Allowed CORS origins (comma-separated string or JSON array)"
    )
    
    CORS_CREDENTIALS: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    
    CORS_METHODS: Union[str, List[str]] = Field(
        default="GET,POST,PUT,PATCH,DELETE,OPTIONS",
        description="Allowed HTTP methods for CORS (comma-separated string or JSON array)"
    )
    
    CORS_HEADERS: Union[str, List[str]] = Field(
        default="*",
        description="Allowed headers for CORS (comma-separated string or JSON array)"
    )
    
    # ============================================================================
    # API Settings
    # ============================================================================
    
    API_V1_PREFIX: str = Field(
        default="/api/v1",
        description="API version 1 prefix"
    )
    
    API_TITLE: str = Field(
        default="Social IT CMS API",
        description="API documentation title"
    )
    
    API_VERSION: str = Field(
        default="1.0.0",
        description="API version"
    )
    
    # ============================================================================
    # Logging Settings
    # ============================================================================
    
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )
    
    LOG_FORMAT: str = Field(
        default="json",
        description="Log format (json, text)"
    )
    
    # ============================================================================
    # Validation & Configuration
    # ============================================================================
    
    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment value."""
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v.lower()
    
    @field_validator("CORS_ORIGINS", "CORS_METHODS", "CORS_HEADERS", mode="before")
    @classmethod
    def parse_list_field(cls, v) -> List[str]:
        """
        Parse list fields from string or list.
        
        Handles:
        - Comma-separated strings: "value1,value2,value3"
        - JSON arrays: '["value1","value2","value3"]'
        - Already parsed lists
        """
        if v is None:
            return []
        if isinstance(v, list):
            return [str(item).strip() for item in v if item]
        if isinstance(v, str):
            # Handle empty string
            if not v.strip():
                return []
            # Try to parse as JSON first (for JSON arrays in env)
            try:
                import json
                # Remove any surrounding quotes
                v_clean = v.strip().strip('"').strip("'")
                parsed = json.loads(v_clean)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if item]
            except (json.JSONDecodeError, ValueError, TypeError):
                # Not JSON, treat as comma-separated string
                pass
            # Fall back to comma-separated string
            return [item.strip() for item in v.split(",") if item.strip()]
        return []
    
    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Validate log level."""
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}")
        return v.upper()
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_staging(self) -> bool:
        """Check if running in staging environment."""
        return self.ENVIRONMENT == "staging"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra environment variables
        validate_default=True,
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses LRU cache to ensure settings are loaded only once,
    improving performance and ensuring consistency.
    
    Returns:
        Settings: Application settings instance
    """
    return Settings()


# Convenience alias
settings = get_settings()
