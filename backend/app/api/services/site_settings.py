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
    """Get theme configuration (Zensar-style defaults)"""
    return get_setting_value(db, "theme", {
        "primary": "#0066B3",
        "secondary": "#004C8A",
        "accent": "#0066B3",
        "background": "#FFFFFF",
        "surface": "#F5F7FA",
        "text": "#1A1A2E",
        "textSecondary": "#5A6178",
        "border": "#E2E8F0",
        "success": "#0D9488",
        "warning": "#D97706",
        "error": "#DC2626",
        "info": "#0066B3",
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


def get_services_ai_ml_section(db: Session) -> Dict[str, Any]:
    """Get AI & ML solutions section config (for services page)."""
    return get_setting_value(db, "services_ai_ml_section", {
        "enabled": True,
        "title": "Artificial Intelligence & Machine Learning Solutions",
        "overview": "We help enterprises harness the power of AI and machine learning to automate processes, gain insights from data, and deliver smarter products. Our team designs, builds, and deploys solutions tailored to your industry and goals.",
        "services": [
            {"title": "Custom Machine Learning Model Development", "description": "Bespoke models trained on your data for classification, regression, or clustering."},
            {"title": "AI Chatbot & Virtual Assistant Development", "description": "Conversational agents for support, sales, and internal workflows."},
            {"title": "Computer Vision Solutions", "description": "Image and video analysis, object detection, and quality inspection systems."},
            {"title": "Predictive Analytics & Forecasting", "description": "Demand, risk, and performance forecasting using historical and real-time data."},
            {"title": "Recommendation Engine Development", "description": "Personalised product, content, and next-best-action recommendations."},
            {"title": "MLOps & Model Deployment Services", "description": "Pipelines, monitoring, and scalable deployment of models in production."},
        ],
        "products": [
            {"title": "AI Business Analytics Dashboard", "description": "Unified view of KPIs with natural-language queries and automated insights."},
            {"title": "No-Code AI Model Builder", "description": "Train and deploy simple models without writing code."},
            {"title": "AI Image Analyzer Tool", "description": "Tagging, moderation, and extraction of metadata from images."},
            {"title": "Website Chatbot Plugin", "description": "Drop-in chat widget with custom knowledge base and routing."},
            {"title": "Resume Screening AI Tool", "description": "Shortlist candidates by skills, experience, and fit."},
        ],
        "benefits": [
            "Higher efficiency through automation of repetitive and rule-based tasks.",
            "Data-driven decisions with accurate forecasting and real-time analytics.",
            "Improved customer experience via chatbots and personalised recommendations.",
            "Faster time-to-market for AI features with MLOps and reusable components.",
            "Scalable, secure deployment aligned with your infrastructure and compliance needs.",
        ],
        "cta_text": "Talk to Our AI Experts",
        "cta_link": "/contact",
    })


def save_services_ai_ml_section(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save AI & ML solutions section config."""
    return set_setting(db, "services_ai_ml_section", config, "Services page: AI & ML solutions section")
