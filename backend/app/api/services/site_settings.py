from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.site_settings import SiteSettings


class SiteSettingsNotFoundError(Exception):
    pass


def get_setting(db: Session, key: str) -> Optional[SiteSettings]:
    """Get a site setting by key"""
    return db.scalar(select(SiteSettings).where(SiteSettings.key == key))


def get_setting_value(db: Session, key: str, default: Any = None) -> Any:
    """Get a site setting value by key, returns default if not found"""
    setting = get_setting(db, key)
    if setting:
        return setting.value
    return default


def set_setting(db: Session, key: str, value: Dict[str, Any], description: Optional[str] = None) -> SiteSettings:
    """Set or update a site setting"""
    setting = get_setting(db, key)
    
    if setting:
        setting.value = value
        if description:
            setting.description = description
    else:
        setting = SiteSettings(
            key=key,
            value=value,
            description=description
        )
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    return setting


def get_header_config(db: Session) -> Dict[str, Any]:
    """Get header configuration"""
    return get_setting_value(db, "header", {
        "logo": {
            "type": "text",
            "text": "Social IT",
            "subtext": "Digital Transformation Partner",
            "image_url": "",
            "position": "left",
            "link": "/"
        },
        "menu_items": [],
        "cta_button": {
            "enabled": True,
            "text": "Contact Us",
            "href": "/contact",
            "style": "gradient",
            "color": "#ff00ff",
            "gradient_from": "#ff00ff",
            "gradient_to": "#8b00ff"
        },
        "styling": {
            "background_color": "#000000",
            "text_color": "#ffffff",
            "sticky": True,
            "padding_top": 16,
            "padding_bottom": 16
        }
    })


def save_header_config(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save header configuration"""
    return set_setting(db, "header", config, "Header configuration")


def get_footer_config(db: Session) -> Dict[str, Any]:
    """Get footer configuration"""
    return get_setting_value(db, "footer", {
        "columns": [],
        "copyright_text": "© {year} Social IT. All rights reserved.",
        "styling": {
            "background_color": "#1f2937",
            "text_color": "#ffffff",
            "link_color": "#9ca3af"
        }
    })


def save_footer_config(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save footer configuration"""
    return set_setting(db, "footer", config, "Footer configuration")


def get_theme_config(db: Session) -> Dict[str, Any]:
    """Get theme configuration"""
    return get_setting_value(db, "theme", {
        "primary": "#9333EA",
        "secondary": "#EC4899",
        "accent": "#8B5CF6",
        "background": "#FFFFFF",
        "surface": "#F9FAFB",
        "text": "#111827",
        "textSecondary": "#6B7280",
        "border": "#E5E7EB",
        "success": "#10B981",
        "warning": "#F59E0B",
        "error": "#EF4444",
        "info": "#3B82F6",
    })


def save_theme_config(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save theme configuration"""
    return set_setting(db, "theme", config, "Global theme configuration")


def get_ui_config(db: Session) -> Dict[str, Any]:
    """Get UI settings configuration"""
    return get_setting_value(db, "ui", {
        "fontFamily": "Inter, system-ui, sans-serif",
        "headingFontFamily": "Inter, system-ui, sans-serif",
        "baseFontSize": 16,
        "heading1Size": 48,
        "heading2Size": 36,
        "heading3Size": 24,
        "lineHeight": 1.6,
        "letterSpacing": 0,
        "sectionPaddingTop": 80,
        "sectionPaddingBottom": 80,
        "containerPadding": 24,
        "cardPadding": 24,
        "buttonPaddingX": 24,
        "buttonPaddingY": 12,
        "borderRadiusSmall": 4,
        "borderRadiusMedium": 8,
        "borderRadiusLarge": 12,
        "buttonBorderRadius": 8,
        "cardBorderRadius": 12,
        "shadowSmall": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "shadowMedium": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "shadowLarge": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "cardShadow": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "buttonShadow": "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        "transitionDuration": 300,
        "hoverScale": 1.05,
        "hoverLift": 4,
        "containerMaxWidth": 1280,
        "gridGap": 24,
        "sectionGap": 80,
    })


def save_ui_config(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save UI settings configuration"""
    return set_setting(db, "ui", config, "UI settings configuration")
