"""
Health check router for monitoring application status.

Provides:
- Basic health check endpoint
- Application status and metadata
- No authentication required
"""

from datetime import datetime, timezone
from typing import Dict, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.session import check_db_connection as _check_db_connection

router = APIRouter(
    prefix="/health",
    tags=["health"],
)


# ============================================================================
# Response Models
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response model."""
    
    status: Literal["healthy", "unhealthy"] = Field(
        ...,
        description="Application health status"
    )
    timestamp: datetime = Field(
        ...,
        description="Current server timestamp (UTC)"
    )
    environment: str = Field(
        ...,
        description="Application environment"
    )
    app_name: str = Field(
        ...,
        description="Application name"
    )
    version: str = Field(
        ...,
        description="API version"
    )


class DetailedHealthResponse(HealthResponse):
    """Detailed health check response with additional checks."""
    
    database: Dict[str, bool] = Field(
        ...,
        description="Database connectivity status"
    )


# ============================================================================
# Health Check Endpoints
# ============================================================================

@router.get(
    "",
    response_model=HealthResponse,
    summary="Basic health check",
    description="Returns basic application health status without detailed checks"
)
async def health_check() -> HealthResponse:
    """
    Basic health check endpoint.
    
    Returns application status, timestamp, and environment.
    No authentication required.
    
    Returns:
        HealthResponse with application status
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        environment=settings.ENVIRONMENT,
        app_name=settings.APP_NAME,
        version=settings.API_VERSION,
    )


@router.get(
    "/detailed",
    response_model=DetailedHealthResponse,
    summary="Detailed health check",
    description="Returns detailed health status including database connectivity"
)
async def detailed_health_check() -> DetailedHealthResponse:
    """
    Detailed health check endpoint.
    
    Includes database connectivity check.
    No authentication required.
    
    Returns:
        DetailedHealthResponse with application and service status
    """
    # Check database connectivity
    db_healthy, _ = _check_db_connection()
    
    # Determine overall status
    overall_status = "healthy" if db_healthy else "unhealthy"
    
    return DetailedHealthResponse(
        status=overall_status,
        timestamp=datetime.now(timezone.utc),
        environment=settings.ENVIRONMENT,
        app_name=settings.APP_NAME,
        version=settings.API_VERSION,
        database={
            "connected": db_healthy
        }
    )
