from typing import Dict, Any
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.schemas.site_settings import SiteSettingsOut, SiteSettingsUpdate
from app.api.services.site_settings import (
    get_setting,
    get_setting_value,
    set_setting,
    get_header_config,
    save_header_config,
    get_footer_config,
    save_footer_config,
    get_theme_config,
    save_theme_config,
    get_ui_config,
    save_ui_config,
    get_services_ai_ml_section,
    save_services_ai_ml_section,
    get_about_page,
    save_about_page,
    get_contact_info,
    save_contact_info,
    SiteSettingsNotFoundError
)
from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/cms/site-settings", tags=["site-settings"])


@router.get("/header", response_model=Dict[str, Any])
async def get_header(
    db: Session = Depends(get_db)
):
    """Get header configuration (public endpoint)"""
    return get_header_config(db)


@router.put("/header", response_model=SiteSettingsOut)
async def update_header(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update header configuration (requires authentication)"""
    # Check if user has admin or editor role
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required"
        )
    
    setting = save_header_config(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )


@router.get("/footer", response_model=Dict[str, Any])
async def get_footer(
    db: Session = Depends(get_db)
):
    """Get footer configuration (public endpoint)"""
    return get_footer_config(db)


@router.put("/footer", response_model=SiteSettingsOut)
async def update_footer(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update footer configuration (requires authentication)"""
    # Check if user has admin or editor role
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required"
        )
    
    setting = save_footer_config(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )


@router.get("/theme", response_model=Dict[str, Any])
async def get_theme(
    db: Session = Depends(get_db)
):
    """Get theme configuration (public endpoint)"""
    return get_theme_config(db)


@router.put("/theme", response_model=SiteSettingsOut)
async def update_theme(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update theme configuration (requires authentication)"""
    # Check if user has admin or editor role
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required"
        )
    
    setting = save_theme_config(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )


@router.get("/ui", response_model=Dict[str, Any])
async def get_ui(
    db: Session = Depends(get_db)
):
    """Get UI settings configuration (public endpoint)"""
    return get_ui_config(db)


@router.put("/ui", response_model=SiteSettingsOut)
async def update_ui(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update UI settings configuration (requires authentication)"""
    # Check if user has admin or editor role
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required"
        )
    
    setting = save_ui_config(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )


@router.get("/services-ai-ml-section", response_model=Dict[str, Any])
async def get_services_ai_ml_section_route(db: Session = Depends(get_db)):
    """Get AI & ML solutions section config (public)."""
    return get_services_ai_ml_section(db)


@router.put("/services-ai-ml-section", response_model=SiteSettingsOut)
async def update_services_ai_ml_section(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update AI & ML solutions section (requires auth)."""
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required"
        )
    setting = save_services_ai_ml_section(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )


@router.get("/about-page", response_model=Dict[str, Any])
async def get_about_page_route(db: Session = Depends(get_db)):
    """Get About page content (public)."""
    return get_about_page(db)


@router.put("/about-page", response_model=SiteSettingsOut)
async def update_about_page(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required",
        )
    setting = save_about_page(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )


@router.get("/contact-info", response_model=Dict[str, Any])
async def get_contact_info_route(db: Session = Depends(get_db)):
    """Get contact info (public)."""
    return get_contact_info(db)


@router.put("/contact-info", response_model=SiteSettingsOut)
async def update_contact_info(
    config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_role_names = {ur.role.name for ur in current_user.user_roles}
    if "admin" not in user_role_names and "editor" not in user_role_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Editor role required",
        )
    setting = save_contact_info(db, config)
    return SiteSettingsOut(
        key=setting.key,
        value=setting.value,
        description=setting.description
    )
