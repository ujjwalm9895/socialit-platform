from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MenuItem(BaseModel):
    """Single menu item configuration"""
    id: str
    label: str
    href: str
    type: str = Field(default="link", description="link or dropdown")
    children: Optional[List["MenuItem"]] = None
    open_in_new_tab: bool = False


class HeaderConfig(BaseModel):
    """Header configuration"""
    logo: Dict[str, Any] = Field(
        default_factory=lambda: {
            "type": "text",  # "text" or "image"
            "text": "Social IT",
            "subtext": "Digital Transformation Partner",
            "image_url": "",
            "position": "left",  # "left", "center", "right"
            "link": "/"
        }
    )
    menu_items: List[MenuItem] = Field(default_factory=list)
    cta_button: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "enabled": True,
            "text": "Contact Us",
            "href": "/contact",
            "style": "gradient",  # "solid", "outline", "gradient"
            "color": "#ff00ff",
            "gradient_from": "#ff00ff",
            "gradient_to": "#8b00ff"
        }
    )
    styling: Dict[str, Any] = Field(
        default_factory=lambda: {
            "background_color": "#000000",
            "text_color": "#ffffff",
            "sticky": True,
            "padding_top": 16,
            "padding_bottom": 16
        }
    )


class FooterConfig(BaseModel):
    """Footer configuration"""
    columns: List[Dict[str, Any]] = Field(default_factory=list)
    copyright_text: str = Field(default="© {year} Social IT. All rights reserved.")
    styling: Dict[str, Any] = Field(
        default_factory=lambda: {
            "background_color": "#1f2937",
            "text_color": "#ffffff",
            "link_color": "#9ca3af"
        }
    )


class SiteSettingsOut(BaseModel):
    """Site settings response"""
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    
    class Config:
        from_attributes = True


class SiteSettingsUpdate(BaseModel):
    """Update site settings"""
    value: Dict[str, Any]
