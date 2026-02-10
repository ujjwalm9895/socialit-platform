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
        "menu_items": [
            {"label": "Home", "href": "/"},
            {"label": "About Us", "href": "/about"},
            {"label": "Services", "href": "/services"},
            {"label": "Careers", "href": "/careers"},
            {"label": "Work", "href": "/case-studies"},
            {"label": "Blogs", "href": "/blogs"},
            {"label": "Contact", "href": "/contact"},
        ],
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
        },
        "mega_menu": False,
        "mega_menu_columns": [
            {"title": "What We Do", "links": [{"label": "Industries We Empower", "href": "/industries"}, {"label": "Our Perspectives", "href": "/blogs"}]},
            {"title": "Explore Our Services", "links": [{"label": "Application Services", "href": "/services"}, {"label": "Contact", "href": "/contact"}]},
        ],
        "mega_menu_featured": None,
    })


def save_header_config(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save header configuration"""
    return set_setting(db, "header", config, "Header configuration")


def get_hero_config(db: Session) -> Dict[str, Any]:
    """Get hero section configuration (homepage hero with two-column layout)"""
    return get_setting_value(db, "hero", {
        "enabled": True,
        "headline": "Weaving Your Brand's Digital Success Story",
        "description": "Maintain a winning reputation, engage digitally, and deliver an exceptional customer experience - all from one intuitive platform.",
        "tagline": "Web Development Company in Kota",
        "email_placeholder": "Enter your email",
        "cta_primary_text": "Get A Demo",
        "cta_primary_link": "/contact",
        "cta_secondary_text": "Explore Case Study",
        "cta_secondary_link": "/case-studies",
        "awards_headline": "Trusted & Awarded By Global Leaders",
        "award_logos": [
            {"image_url": "", "link_url": "", "alt": "JCI"},
            {"image_url": "", "link_url": "", "alt": "Indian Achievers"},
            {"image_url": "", "link_url": "", "alt": "Rotary"},
        ],
        "banner_image_url": "",
        "background_image_url": "",
        "chat_button_text": "Let's Chat",
        "chat_button_link": "/contact",
        "data_cards": [],
    })


def save_hero_config(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save hero section configuration"""
    return set_setting(db, "hero", config, "Hero section configuration")


def get_footer_config(db: Session) -> Dict[str, Any]:
    """Get footer configuration"""
    return get_setting_value(db, "footer", {
        "columns": [
            {"title": "Services", "links": [{"label": "Services", "href": "/services"}]},
            {"title": "Company", "links": [{"label": "About Us", "href": "/about"}, {"label": "Careers", "href": "/careers"}, {"label": "Contact", "href": "/contact"}]},
            {"title": "Work", "links": [{"label": "Case Studies", "href": "/case-studies"}, {"label": "Blogs", "href": "/blogs"}]},
        ],
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


# ---------------------------------------------------------------------------
# About page (CMS)
# ---------------------------------------------------------------------------

def get_about_page(db: Session) -> Dict[str, Any]:
    """Get About page content (public)."""
    return get_setting_value(db, "about_page", {
        "heading": "Get to Know Social IT",
        "intro": "Welcome to Social IT, one of the top global digital marketing solutions providers that transforms businesses with technology solutions and data-driven marketing expertise. To help brands with innovative digital solutions that help grow the business — attract users, and increase engagement and success whilst navigating in a rapidly changing online landscape.",
        "stats_heading": "Let's talk numbers",
        "stats_subtext": "These are the small wins we've garnered over our 8+ years of journey alongside our valued clients.",
        "stats": [
            {"value": "150+", "label": "Happy Clients"},
            {"value": "20K+", "label": "Unique Designs"},
            {"value": "8+", "label": "Years Experience"},
            {"value": "20+", "label": "States Served"},
        ],
        "journey_heading": "Discover Our Story",
        "journey_subheading": "Our Journey",
        "journey_text": "Social IT, founded in 2020, was a digital agency that set out to transform businesses online. Over the years we have evolved our knowledge, integrated with industry best practices and also facilitated many clients to do something digital phenomenally.",
        "vision_heading": "Driving Innovation & Growth",
        "vision_subheading": "Our Vision",
        "vision_text": "Social IT aspires to grow as a global market leader in high-quality marketing and IT solutions serving enterprise brands with mission-critical applications. Our vision is to close the technology and business success gap, bringing brands closer to their customers and helping scale.",
        "what_sets_apart_heading": "Passionate About Results",
        "what_sets_apart_subheading": "What Sets Us Apart",
        "what_sets_apart_items": [
            {"title": "Cutting Edge", "text": "We are always ahead of our clients in that our strategies are always one step ahead and the most up-to-date."},
            {"title": "Strategies Based On Data", "text": "Harnessing analytics & AI to amplify your ads/campaigns/solutions."},
            {"title": "Custom Solutions", "text": "We excel in business services which are designed for the unique needs of a company."},
            {"title": "We are the real thing", "text": "Story of brand success with insane ROIs and incomparable real success stories for whatever other product you are using."},
        ],
        "team_heading": "The Minds Behind Social IT",
        "team_subheading": "Meet Our Leadership Team",
        "team": [
            {"name": "Shubhra Mitra", "role": "Content & Strategy Lead"},
            {"name": "Kanak Pandey", "role": "Co-Founder/Key Team Member"},
            {"name": "Himanshu Porwal", "role": "Senior UI/UX Developer"},
            {"name": "Dushyant Singh", "role": "Graphic Designer"},
            {"name": "Ryan Rehan", "role": "Business Development Executive"},
        ],
        "cta_text": "Let's Chat",
        "cta_link": "/contact",
    })


def save_about_page(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save About page content."""
    return set_setting(db, "about_page", config, "About page content")


# ---------------------------------------------------------------------------
# Contact info (CMS) – used by Contact page
# ---------------------------------------------------------------------------

def get_contact_info(db: Session) -> Dict[str, Any]:
    """Get contact page / global contact info (public)."""
    return get_setting_value(db, "contact_info", {
        "heading": "Contact us",
        "subtext": "Got a project in mind? Share the details of your project. We'll respond as soon as we can.",
        "email": "info@socialit.in",
        "addresses": [
            "H-14(B), Electronic Complex, Road No.1, IPIA, Kota, Rajasthan 324009",
            "1751 2nd Ave, New York City, NY, 10128",
        ],
        "phones": [
            "+91-8824467277",
            "+91-8290534979",
            "+91-7737306090",
        ],
        "whatsapp_number": "+918824467277",
        "whatsapp_text": "Let's Chat",
        "show_contact_form": True,
        "form_heading": "Got a project in mind? Share the details of your project.",
    })


def save_contact_info(db: Session, config: Dict[str, Any]) -> SiteSettings:
    """Save contact info."""
    return set_setting(db, "contact_info", config, "Contact page / global contact info")
