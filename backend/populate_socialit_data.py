"""
Script to populate the CMS with data from the existing Social IT website (https://socialit.in/)
This script creates services, case studies, blogs, homepage, and updates header/footer.
"""

import sys
from datetime import datetime, timezone
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.enums import ContentStatus
from app.api.services.service import create_service
from app.api.services.case_study import create_case_study
from app.api.services.blog import create_blog
from app.api.services.page import create_page, get_page_by_slug, update_page
from app.api.services.site_settings import (
    get_setting,
    set_setting,
    save_header_config,
    save_footer_config,
    save_theme_config,
)
from sqlalchemy import select


def get_admin_user(db: Session) -> User:
    """Get or create admin user"""
    user = db.scalar(select(User).where(User.email == "admin@socialit.com"))
    if not user:
        raise Exception("Admin user not found. Please run setup_roles.py first.")
    return user


def create_services(db: Session, user: User):
    """Create all services from the existing website"""
    services = [
        {
            "slug": "website-development",
            "title": "Website Development",
            "subtitle": "Custom web solutions for your business",
            "description": "We create stunning, responsive websites that drive results. From simple landing pages to complex web applications, we deliver solutions that work.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Website Development Services | Social IT",
            "meta_description": "Professional website development services. Custom web solutions, responsive design, and modern web applications.",
            "meta_keywords": ["website development", "web design", "responsive websites", "custom web solutions"],
        },
        {
            "slug": "app-development",
            "title": "App Development",
            "subtitle": "Native and cross-platform mobile apps",
            "description": "Transform your ideas into powerful mobile applications. We develop iOS, Android, and cross-platform apps that users love.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Mobile App Development Services | Social IT",
            "meta_description": "Expert mobile app development for iOS and Android. Native and cross-platform solutions.",
            "meta_keywords": ["app development", "mobile apps", "iOS development", "Android development"],
        },
        {
            "slug": "ui-ux-design",
            "title": "UI/UX Design",
            "subtitle": "User-centered design that converts",
            "description": "Beautiful, intuitive interfaces that users love. We design experiences that are both visually stunning and highly functional.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "UI/UX Design Services | Social IT",
            "meta_description": "Professional UI/UX design services. User-centered design that drives engagement and conversions.",
            "meta_keywords": ["UI design", "UX design", "user experience", "interface design"],
        },
        {
            "slug": "social-media-marketing",
            "title": "Social Media Marketing",
            "subtitle": "Grow your brand on social platforms",
            "description": "Build your brand presence and engage with your audience across all major social media platforms. We create content that resonates.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Social Media Marketing Services | Social IT",
            "meta_description": "Expert social media marketing services. Grow your brand, engage audiences, and drive results.",
            "meta_keywords": ["social media marketing", "SMM", "social media management", "content marketing"],
        },
        {
            "slug": "graphic-design",
            "title": "Graphic Design",
            "subtitle": "Visual identity that stands out",
            "description": "From logos to marketing materials, we create compelling visual designs that communicate your brand message effectively.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Graphic Design Services | Social IT",
            "meta_description": "Professional graphic design services. Logos, branding, marketing materials, and more.",
            "meta_keywords": ["graphic design", "logo design", "branding", "visual design"],
        },
        {
            "slug": "digital-marketing",
            "title": "Digital Marketing",
            "subtitle": "Data-driven marketing strategies",
            "description": "Comprehensive digital marketing solutions including SEO, PPC, email marketing, and analytics. We help you reach and convert your target audience.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Digital Marketing Services | Social IT",
            "meta_description": "Full-service digital marketing agency. SEO, PPC, email marketing, and analytics.",
            "meta_keywords": ["digital marketing", "SEO", "PPC", "email marketing", "online marketing"],
        },
        {
            "slug": "logo-design",
            "title": "Logo Design",
            "subtitle": "Memorable brand identities",
            "description": "Create a logo that represents your brand perfectly. We design unique, memorable logos that make a lasting impression.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Logo Design Services | Social IT",
            "meta_description": "Professional logo design services. Create a memorable brand identity.",
            "meta_keywords": ["logo design", "brand identity", "logo creation", "branding"],
        },
        {
            "slug": "branding-advertising",
            "title": "Branding & Advertising",
            "subtitle": "Complete brand solutions",
            "description": "End-to-end branding and advertising services. From brand strategy to execution, we help you build a strong brand presence.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Branding & Advertising Services | Social IT",
            "meta_description": "Complete branding and advertising solutions. Build a strong brand presence.",
            "meta_keywords": ["branding", "advertising", "brand strategy", "brand identity"],
        },
        {
            "slug": "packaging-design",
            "title": "Packaging Design",
            "subtitle": "Packaging that sells",
            "description": "Eye-catching packaging designs that grab attention on shelves. We create packaging that tells your brand story and drives sales.",
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Packaging Design Services | Social IT",
            "meta_description": "Professional packaging design services. Create packaging that stands out and sells.",
            "meta_keywords": ["packaging design", "product packaging", "package design"],
        },
    ]

    print("Creating services...")
    for service_data in services:
        try:
            create_service(db=db, data=service_data, user=user)
            print(f"[OK] Created service: {service_data['title']}")
        except Exception as e:
            print(f"[ERROR] Error creating service {service_data['title']}: {e}")


def create_case_studies(db: Session, user: User):
    """Create case studies/testimonials"""
    case_studies = [
        {
            "slug": "sudha-hospital",
            "title": "Sudha Hospital - Healthcare Digital Transformation",
            "client_name": "Sudha Hospital",
            "excerpt": "Dr. Palkesh Agarwal shares how Social IT helped transform their digital presence.",
            "challenge": "Sudha Hospital needed to modernize their digital presence and improve patient engagement.",
            "solution": "We developed a comprehensive website and implemented digital marketing strategies to reach more patients.",
            "results": "Increased online visibility by 300% and improved patient inquiries significantly.",
            "industry": "Healthcare",
            "tags": ["healthcare", "website", "digital marketing"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Sudha Hospital Case Study | Social IT",
            "meta_description": "How Social IT helped Sudha Hospital transform their digital presence.",
        },
        {
            "slug": "sahara-group",
            "title": "Sahara Group - Branding Excellence",
            "client_name": "Sahara Group",
            "excerpt": "Vijay Gupta praises Social IT's graphic design services and brand elevation.",
            "challenge": "Sahara Group needed a complete visual identity refresh and consistent branding across all touchpoints.",
            "solution": "We created a comprehensive branding package including logo, color palette, typography, and marketing materials.",
            "results": "Enhanced brand recognition and visual consistency across all platforms.",
            "industry": "Business",
            "tags": ["branding", "graphic design", "visual identity"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Sahara Group Case Study | Social IT",
            "meta_description": "Complete branding solution for Sahara Group.",
        },
        {
            "slug": "rcti-diagnostic",
            "title": "RCTI Diagnostic - Mobile App Success",
            "client_name": "RCTI Diagnostic",
            "excerpt": "Dorian Priest Mascarenhas highlights the exceptional mobile app created by Social IT.",
            "challenge": "RCTI Diagnostic needed a mobile app to improve patient access to diagnostic services.",
            "solution": "We developed a responsive, user-friendly mobile application with booking and results features.",
            "results": "Improved patient engagement and streamlined service delivery.",
            "industry": "Healthcare",
            "tags": ["mobile app", "healthcare", "app development"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "RCTI Diagnostic Case Study | Social IT",
            "meta_description": "Mobile app development for RCTI Diagnostic.",
        },
        {
            "slug": "gondilal-kiva-jewellers",
            "title": "Gondilal Kiva Jewellers - Social Media Marketing",
            "client_name": "Gondilal Kiva Jewellers",
            "excerpt": "Avijit Goel commends Social IT's seamless social media marketing campaign.",
            "challenge": "Gondilal Kiva Jewellers needed to expand their reach and engage with younger audiences.",
            "solution": "We created and executed a comprehensive social media marketing strategy with engaging creatives.",
            "results": "Significant increase in brand awareness and customer engagement.",
            "industry": "Retail",
            "tags": ["social media marketing", "retail", "content marketing"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Gondilal Kiva Jewellers Case Study | Social IT",
            "meta_description": "Social media marketing success for Gondilal Kiva Jewellers.",
        },
    ]

    print("\nCreating case studies...")
    for case_data in case_studies:
        try:
            create_case_study(db=db, data=case_data, user=user)
            print(f"[OK] Created case study: {case_data['title']}")
        except Exception as e:
            print(f"[ERROR] Error creating case study {case_data['title']}: {e}")


def create_blogs(db: Session, user: User):
    """Create blog posts"""
    blogs = [
        {
            "slug": "5-digital-marketing-trends-2023",
            "title": "5 Digital Marketing Trends to Watch Out for in 2023",
            "excerpt": "Stay ahead of the curve with these emerging digital marketing trends that will shape 2023.",
            "content": [
                {
                    "type": "text",
                    "data": {
                        "text": "The digital marketing landscape is constantly evolving. Here are 5 key trends to watch in 2023..."
                    }
                }
            ],
            "category": "Digital Marketing",
            "tags": ["digital marketing", "trends", "2023"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "5 Digital Marketing Trends 2023 | Social IT Blog",
            "meta_description": "Discover the top 5 digital marketing trends that will shape 2023.",
        },
        {
            "slug": "traditional-vs-digital-marketing",
            "title": "Traditional Marketing V/S Digital Marketing, Which is Best?",
            "excerpt": "A comprehensive comparison between traditional and digital marketing strategies.",
            "content": [
                {
                    "type": "text",
                    "data": {
                        "text": "Both traditional and digital marketing have their place. Let's explore which works best for your business..."
                    }
                }
            ],
            "category": "Marketing",
            "tags": ["marketing", "comparison", "strategy"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Traditional vs Digital Marketing | Social IT Blog",
            "meta_description": "Compare traditional and digital marketing to find the best strategy for your business.",
        },
        {
            "slug": "role-of-hashtags-social-media",
            "title": "Role of Hashtags on Social Media Platforms",
            "excerpt": "Understanding how hashtags can amplify your social media reach and engagement.",
            "content": [
                {
                    "type": "text",
                    "data": {
                        "text": "Hashtags are powerful tools for increasing visibility and engagement on social media platforms..."
                    }
                }
            ],
            "category": "Social Media",
            "tags": ["hashtags", "social media", "engagement"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Role of Hashtags on Social Media | Social IT Blog",
            "meta_description": "Learn how to use hashtags effectively to boost your social media presence.",
        },
        {
            "slug": "instagram-influencers-boost-business",
            "title": "How to Use Instagram Influencers to Boost Your Business",
            "excerpt": "Leverage Instagram influencers to expand your reach and drive business growth.",
            "content": [
                {
                    "type": "text",
                    "data": {
                        "text": "Instagram influencer marketing can be a game-changer for your business. Here's how to get started..."
                    }
                }
            ],
            "category": "Social Media",
            "tags": ["instagram", "influencers", "marketing"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Instagram Influencer Marketing Guide | Social IT Blog",
            "meta_description": "Complete guide to using Instagram influencers to grow your business.",
        },
        {
            "slug": "evolution-social-media-2010-vs-2025",
            "title": "The Evolution of Social Media: 2010 vs. 2025",
            "excerpt": "A look at how social media has transformed over the past 15 years.",
            "content": [
                {
                    "type": "text",
                    "data": {
                        "text": "Social media has undergone dramatic changes from 2010 to 2025. Let's explore the evolution..."
                    }
                }
            ],
            "category": "Social Media",
            "tags": ["social media", "evolution", "history"],
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Social Media Evolution 2010 vs 2025 | Social IT Blog",
            "meta_description": "Explore how social media has evolved from 2010 to 2025.",
        },
    ]

    print("\nCreating blog posts...")
    for blog_data in blogs:
        try:
            # Add author_id to blog data
            blog_data["author_id"] = user.id
            create_blog(db=db, data=blog_data, user=user)
            print(f"[OK] Created blog: {blog_data['title']}")
        except Exception as e:
            print(f"[ERROR] Error creating blog {blog_data['title']}: {e}")


def create_homepage(db: Session, user: User):
    """Create or update homepage with all sections - impressive modern UI"""
    homepage_content = [
        {
            "type": "hero",
            "data": {
                "heading": "Weaving Your Brand's Digital Success Story",
                "subheading": "Maintain a winning reputation, engage digitally, and deliver an exceptional customer experience — all from one intuitive platform.",
                "cta_text": "Get Started",
                "cta_link": "/contact",
                "secondary_cta_text": "Explore Our Work",
                "secondary_cta_link": "/case-studies",
                "background_image": None,
                "useGradient": True,
                "gradientFrom": "#0d419d",
                "gradientTo": "#388bfd",
                "gradientDirection": "135deg",
                "textColor": "#FFFFFF",
            }
        },
        {
            "type": "services-grid",
            "data": {
                "title": "Our Services",
                "subtitle": "End-to-end digital solutions that drive growth and engagement",
                "services": [],
                "columns": 3,
                "titleColor": "#e6edf3",
                "subtitleColor": "#8b949e",
                "cardUseGradient": True,
                "cardGradientFrom": "#161b22",
                "cardGradientTo": "#0d1117",
                "cardBorderColor": "#30363d",
                "hoverOverlayColor": "#58a6ff",
                "linkColor": "#58a6ff",
                "cardShadowColor": "#58a6ff",
                "shadowOpacity": 0.2,
                "backgroundColor": "#0d1117",
            }
        },
        {
            "type": "stats",
            "data": {
                "title": "Our Achievements",
                "stats": [
                    {"label": "Happy Clients", "value": "500+", "icon": ""},
                    {"label": "Projects Delivered", "value": "1000+", "icon": ""},
                    {"label": "Creative Designs", "value": "2000+", "icon": ""},
                    {"label": "Years of Excellence", "value": "10+", "icon": ""},
                ],
                "useGradient": True,
                "gradientFrom": "#0d419d",
                "gradientTo": "#388bfd",
                "gradientDirection": "135deg",
                "textColor": "#FFFFFF",
            }
        },
        {
            "type": "testimonials",
            "data": {
                "title": "What Our Clients Say",
                "subtitle": "Trusted by brands across industries",
                "testimonials": [
                    {
                        "name": "Dr. Palkesh Agarwal",
                        "role": "Sudha Hospital",
                        "text": "Mr Vaibhav is very good at his profession and also very generous person. He is ready for any help anytime. The work quality is also very good. I recommend to get associated with him.",
                        "avatar": None,
                    },
                    {
                        "name": "Vijay Gupta",
                        "role": "Sahara Group",
                        "text": "Thanks to the Social IT team for their hard work, creativity, and dedication to bringing my vision to life. Your graphic designing services have played a significant role in elevating my brand's visual presence.",
                        "avatar": None,
                    },
                    {
                        "name": "Dorian Priest Mascarenhas",
                        "role": "RCTI Diagnostic",
                        "text": "I am thrilled to provide my highest recommendation for the Social IT Marketing and Development Agency! They have created an exceptional mobile app for me that is not only visually stunning, but also incredibly responsive and user-friendly.",
                        "avatar": None,
                    },
                ],
                "backgroundColor": "#161b22",
                "textColor": "#e6edf3",
            }
        },
        {
            "type": "cta",
            "data": {
                "title": "Ready to Transform Your Digital Presence?",
                "subtitle": "Let's create something amazing together.",
                "cta_text": "Get In Touch",
                "cta_link": "/contact",
                "icon": "",
                "useGradient": True,
                "gradientFrom": "#1f6feb",
                "gradientTo": "#388bfd",
                "gradientDirection": "to right",
                "textColor": "#FFFFFF",
            }
        },
    ]

    print("\nCreating/updating homepage...")
    try:
        existing_page = get_page_by_slug(db, "home")
        if existing_page:
            # Update existing homepage
            update_page(
                db=db,
                page_id=existing_page.id,
                data={
                    "title": "Home",
                    "slug": "home",
                    "content": homepage_content,
                    "status": ContentStatus.PUBLISHED,
                    "meta_title": "Social IT - Digital Solutions & Marketing Agency",
                    "meta_description": "Weaving your brand's digital success story. Website development, app development, digital marketing, and more.",
                },
                user=user
            )
            print("[OK] Updated homepage")
        else:
            # Create new homepage
            create_page(
                db=db,
                data={
                    "title": "Home",
                    "slug": "home",
                    "content": homepage_content,
                    "status": ContentStatus.PUBLISHED,
                    "meta_title": "Social IT - Digital Solutions & Marketing Agency",
                    "meta_description": "Weaving your brand's digital success story. Website development, app development, digital marketing, and more.",
                },
                user=user
            )
            print("[OK] Created homepage")
    except Exception as e:
        print(f"[ERROR] Error creating/updating homepage: {e}")


def create_about_page(db: Session, user: User):
    """Create or update the About page with hero, values, and CTA sections."""
    about_content = [
        {
            "id": "about-hero-1",
            "type": "about-hero",
            "data": {
                "heading": "We're Building the Future of Digital",
                "subheading": "A passionate team dedicated to innovation, partnership, and delivering exceptional results for our clients.",
                "icon": "",
                "useGradient": True,
                "gradientFrom": "#0d419d",
                "gradientTo": "#388bfd",
                "gradientDirection": "135deg",
                "textColor": "#FFFFFF",
            },
        },
        {
            "id": "about-values-1",
            "type": "values-grid",
            "data": {
                "title": "Our Core Values",
                "backgroundColor": "#161b22",
                "textColor": "#e6edf3",
                "values": [
                    {"icon": "", "title": "Innovation", "description": "We embrace cutting-edge solutions and stay ahead of technology trends to deliver future-ready products."},
                    {"icon": "", "title": "Partnership", "description": "We build lasting relationships with our clients, working as an extension of your team to achieve shared goals."},
                    {"icon": "", "title": "Excellence", "description": "Quality in everything we do—from strategy and design to development and support."},
                    {"icon": "", "title": "Results", "description": "We focus on measurable outcomes that drive growth, engagement, and ROI for your business."},
                ],
            },
        },
        {
            "id": "about-cta-1",
            "type": "cta",
            "data": {
                "title": "Let's Build Something Great Together",
                "subtitle": "Get in touch to discuss your next project.",
                "cta_text": "Contact Us",
                "cta_link": "/contact",
                "icon": "",
                "useGradient": True,
                "gradientFrom": "#1f6feb",
                "gradientTo": "#388bfd",
                "gradientDirection": "to right",
                "textColor": "#FFFFFF",
            },
        },
    ]

    print("\nCreating/updating About page...")
    try:
        existing = get_page_by_slug(db, "about")
        if existing:
            update_page(
                db=db,
                page_id=existing.id,
                data={
                    "title": "About Us",
                    "slug": "about",
                    "content": about_content,
                    "status": ContentStatus.PUBLISHED,
                    "meta_title": "About Us | Social IT - Digital Solutions & Marketing Agency",
                    "meta_description": "Learn about Social IT: our values, our team, and our commitment to innovation and excellence in digital solutions.",
                },
                user=user,
            )
            print("[OK] Updated About page")
        else:
            create_page(
                db=db,
                data={
                    "title": "About Us",
                    "slug": "about",
                    "content": about_content,
                    "status": ContentStatus.PUBLISHED,
                    "meta_title": "About Us | Social IT - Digital Solutions & Marketing Agency",
                    "meta_description": "Learn about Social IT: our values, our team, and our commitment to innovation and excellence in digital solutions.",
                },
                user=user,
            )
            print("[OK] Created About page")
    except Exception as e:
        print(f"[ERROR] Error creating/updating About page: {e}")


def create_contact_page(db: Session, user: User):
    """Create or update Contact page – same look as homepage (hero + contact-form + cta)."""
    contact_content = [
        {
            "id": "contact-hero-1",
            "type": "hero",
            "data": {
                "heading": "Get In Touch",
                "subheading": "Have a project in mind? We'd love to hear from you. Reach out and let's create something great together.",
                "cta_text": "Send a Message",
                "cta_link": "#contact-form",
                "secondary_cta_text": None,
                "secondary_cta_link": None,
                "background_image": None,
                "useGradient": True,
                "gradientFrom": "#0d419d",
                "gradientTo": "#388bfd",
                "gradientDirection": "135deg",
                "textColor": "#FFFFFF",
            },
        },
        {
            "id": "contact-form-1",
            "type": "contact-form",
            "data": {
                "title": "Send Us a Message",
                "subtitle": "Fill out the form below and we'll get back to you within 24 hours.",
                "fields": ["name", "email", "phone", "message"],
                "buttonText": "Send Message",
                "successMessage": "Thank you! We'll be in touch soon.",
                "backgroundColor": "#161b22",
                "textColor": "#e6edf3",
            },
        },
        {
            "id": "contact-cta-1",
            "type": "cta",
            "data": {
                "title": "Prefer to Talk?",
                "subtitle": "Call us or drop an email – we're here to help.",
                "cta_text": "View Our Work",
                "cta_link": "/case-studies",
                "icon": "",
                "useGradient": True,
                "gradientFrom": "#1f6feb",
                "gradientTo": "#388bfd",
                "gradientDirection": "to right",
                "textColor": "#FFFFFF",
            },
        },
    ]

    print("\nCreating/updating Contact page...")
    try:
        existing = get_page_by_slug(db, "contact")
        payload = {
            "title": "Contact Us",
            "slug": "contact",
            "content": contact_content,
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Contact Us | Social IT - Digital Solutions & Marketing Agency",
            "meta_description": "Get in touch with Social IT. We'd love to hear about your project.",
        }
        if existing:
            update_page(db=db, page_id=existing.id, data=payload, user=user)
            print("[OK] Updated Contact page")
        else:
            create_page(db=db, data=payload, user=user)
            print("[OK] Created Contact page")
    except Exception as e:
        print(f"[ERROR] Error creating/updating Contact page: {e}")


def create_careers_page(db: Session, user: User):
    """Create or update Careers page – same look as homepage (hero + careers-list + cta)."""
    careers_content = [
        {
            "id": "careers-hero-1",
            "type": "hero",
            "data": {
                "heading": "Join Our Team",
                "subheading": "We're always looking for talented people. Explore open roles and grow with us.",
                "cta_text": "See Open Roles",
                "cta_link": "#open-positions",
                "secondary_cta_text": None,
                "secondary_cta_link": None,
                "background_image": None,
                "useGradient": True,
                "gradientFrom": "#0d419d",
                "gradientTo": "#388bfd",
                "gradientDirection": "135deg",
                "textColor": "#FFFFFF",
            },
        },
        {
            "id": "careers-list-1",
            "type": "careers-list",
            "data": {
                "title": "Open Positions",
                "subtitle": "Find your next opportunity with Social IT.",
                "backgroundColor": "#161b22",
                "textColor": "#e6edf3",
                "jobs": [
                    {
                        "icon": "",
                        "title": "Senior Full Stack Developer",
                        "type": "Full-time",
                        "description": "Build scalable web and mobile applications using modern stacks. You'll work on client projects and internal products.",
                        "location": "Remote / Hybrid",
                        "salary": "Competitive",
                        "experience": "5+ years",
                        "applyLink": "mailto:careers@socialit.in?subject=Application: Senior Full Stack Developer",
                    },
                    {
                        "icon": "",
                        "title": "UI/UX Designer",
                        "type": "Full-time",
                        "description": "Create beautiful, user-centered interfaces for websites and apps. Strong portfolio and Figma skills required.",
                        "location": "Remote / Hybrid",
                        "salary": "Competitive",
                        "experience": "3+ years",
                        "applyLink": "mailto:careers@socialit.in?subject=Application: UI/UX Designer",
                    },
                    {
                        "icon": "",
                        "title": "Digital Marketing Specialist",
                        "type": "Full-time",
                        "description": "Drive growth through SEO, social media, and content marketing. Experience with analytics and campaigns preferred.",
                        "location": "Remote / Hybrid",
                        "salary": "Competitive",
                        "experience": "2+ years",
                        "applyLink": "mailto:careers@socialit.in?subject=Application: Digital Marketing Specialist",
                    },
                ],
            },
        },
        {
            "id": "careers-cta-1",
            "type": "cta",
            "data": {
                "title": "Don't See the Right Role?",
                "subtitle": "We're still growing. Send us your resume and we'll keep you in mind.",
                "cta_text": "Get In Touch",
                "cta_link": "/contact",
                "icon": "",
                "useGradient": True,
                "gradientFrom": "#1f6feb",
                "gradientTo": "#388bfd",
                "gradientDirection": "to right",
                "textColor": "#FFFFFF",
            },
        },
    ]

    print("\nCreating/updating Careers page...")
    try:
        existing = get_page_by_slug(db, "careers")
        payload = {
            "title": "Careers",
            "slug": "careers",
            "content": careers_content,
            "status": ContentStatus.PUBLISHED,
            "meta_title": "Careers | Social IT - Join Our Team",
            "meta_description": "Explore open positions at Social IT. Join our team and build the future of digital.",
        }
        if existing:
            update_page(db=db, page_id=existing.id, data=payload, user=user)
            print("[OK] Updated Careers page")
        else:
            create_page(db=db, data=payload, user=user)
            print("[OK] Created Careers page")
    except Exception as e:
        print(f"[ERROR] Error creating/updating Careers page: {e}")


def update_theme_config(db: Session, user: User):
    """Update theme configuration – dark theme (indigo + violet + amber on dark)"""
    print("\nUpdating theme configuration...")
    
    theme_config = {
        "primary": "#58a6ff",
        "secondary": "#388bfd",
        "accent": "#58a6ff",
        "background": "#0d1117",
        "surface": "#161b22",
        "text": "#e6edf3",
        "textSecondary": "#8b949e",
        "border": "#30363d",
        "success": "#3fb950",
        "warning": "#d29922",
        "error": "#f85149",
        "info": "#58a6ff",
    }
    
    try:
        save_theme_config(db, theme_config)
        print("[OK] Updated theme configuration with dark theme")
    except Exception as e:
        print(f"[ERROR] Error updating theme configuration: {e}")


def update_header_footer(db: Session, user: User):
    """Update header and footer configurations"""
    print("\nUpdating header configuration...")
    
    header_config = {
        "logo": {
            "type": "text",
            "text": "Social IT",
            "subtext": "Digital Transformation Partner",
            "image_url": None,
            "position": "left",
            "link": "/",
        },
        "menu_items": [
            {"id": "1", "label": "Home", "href": "/", "type": "link", "open_in_new_tab": False},
            {"id": "2", "label": "About Us", "href": "/about", "type": "link", "open_in_new_tab": False},
            {
                "id": "3",
                "label": "Services",
                "href": "/services",
                "type": "dropdown",
                "open_in_new_tab": False,
                "children": [
                    {"id": "3-1", "label": "Website Development", "href": "/services/website-development", "type": "link", "open_in_new_tab": False},
                    {"id": "3-2", "label": "App Development", "href": "/services/app-development", "type": "link", "open_in_new_tab": False},
                    {"id": "3-3", "label": "Social Media Marketing", "href": "/services/social-media-marketing", "type": "link", "open_in_new_tab": False},
                    {"id": "3-4", "label": "Digital Marketing", "href": "/services/digital-marketing", "type": "link", "open_in_new_tab": False},
                    {"id": "3-5", "label": "Logo Design", "href": "/services/logo-design", "type": "link", "open_in_new_tab": False},
                    {"id": "3-6", "label": "Packaging Design", "href": "/services/packaging-design", "type": "link", "open_in_new_tab": False},
                    {"id": "3-7", "label": "Branding & Advertising", "href": "/services/branding-advertising", "type": "link", "open_in_new_tab": False},
                    {"id": "3-8", "label": "UI/UX Design", "href": "/services/ui-ux-design", "type": "link", "open_in_new_tab": False},
                    {"id": "3-9", "label": "Graphic Design", "href": "/services/graphic-design", "type": "link", "open_in_new_tab": False},
                ]
            },
            {"id": "4", "label": "Careers", "href": "/careers", "type": "link", "open_in_new_tab": False},
            {"id": "5", "label": "Work", "href": "/case-studies", "type": "link", "open_in_new_tab": False},
            {"id": "6", "label": "Blogs", "href": "/blogs", "type": "link", "open_in_new_tab": False},
            {"id": "7", "label": "Contact Us", "href": "/contact", "type": "link", "open_in_new_tab": False},
        ],
        "cta_button": {
            "enabled": True,
            "text": "Get A Demo",
            "href": "/contact",
            "style": "gradient",
            "color": "#58a6ff",
            "gradient_from": "#1f6feb",
            "gradient_to": "#388bfd",
        },
        "styling": {
            "background_color": "#0d1117",
            "text_color": "#e6edf3",
            "sticky": True,
            "padding_top": 16,
            "padding_bottom": 16,
        },
    }

    footer_config = {
        "columns": [
            {
                "id": "1",
                "title": "Social IT",
                "content": "With a deep understanding of the digital landscape, we are dedicated to helping businesses thrive and achieve their goals",
                "links": [],
            },
            {
                "id": "2",
                "title": "Services",
                "links": [
                    {"id": "1", "label": "Website Development", "href": "/services/website-development", "open_in_new_tab": False},
                    {"id": "2", "label": "App Development", "href": "/services/app-development", "open_in_new_tab": False},
                    {"id": "3", "label": "Social Media Marketing", "href": "/services/social-media-marketing", "open_in_new_tab": False},
                    {"id": "4", "label": "Digital Marketing", "href": "/services/digital-marketing", "open_in_new_tab": False},
                    {"id": "5", "label": "Logo Design", "href": "/services/logo-design", "open_in_new_tab": False},
                    {"id": "6", "label": "Packaging Design", "href": "/services/packaging-design", "open_in_new_tab": False},
                    {"id": "7", "label": "Branding & Advertising", "href": "/services/branding-advertising", "open_in_new_tab": False},
                    {"id": "8", "label": "UI/UX Design", "href": "/services/ui-ux-design", "open_in_new_tab": False},
                    {"id": "9", "label": "Graphic Design", "href": "/services/graphic-design", "open_in_new_tab": False},
                ],
            },
            {
                "id": "3",
                "title": "Contact Us",
                "links": [
                    {"id": "1", "label": "H-14(B), Electronic Complex, Road No.1, IPIA, Kota, Rajasthan 324009", "href": "#", "open_in_new_tab": False},
                    {"id": "2", "label": "1751 2nd Ave, New York City, NY, 10128", "href": "#", "open_in_new_tab": False},
                    {"id": "3", "label": "+91-8824467277", "href": "tel:+918824467277", "open_in_new_tab": False},
                    {"id": "4", "label": "+91-8290534979", "href": "tel:+918290534979", "open_in_new_tab": False},
                    {"id": "5", "label": "+91-7737306090", "href": "tel:+917737306090", "open_in_new_tab": False},
                    {"id": "6", "label": "info@socialit.in", "href": "mailto:info@socialit.in", "open_in_new_tab": False},
                ],
            },
            {
                "id": "4",
                "title": "Quick Links",
                "links": [
                    {"id": "1", "label": "Clients", "href": "/clients", "open_in_new_tab": False},
                    {"id": "2", "label": "Career", "href": "/careers", "open_in_new_tab": False},
                    {"id": "3", "label": "Home", "href": "/", "open_in_new_tab": False},
                    {"id": "4", "label": "About", "href": "/about", "open_in_new_tab": False},
                    {"id": "5", "label": "Contact", "href": "/contact", "open_in_new_tab": False},
                ],
            },
        ],
        "copyright_text": "Copyright © {year} Social IT. All rights reserved.",
        "styling": {
            "background_color": "#0d1117",
            "text_color": "#e6edf3",
            "link_color": "#58a6ff",
        },
    }

    try:
        # Update header
        save_header_config(db, header_config)
        print("[OK] Updated header configuration")

        # Update footer
        save_footer_config(db, footer_config)
        print("[OK] Updated footer configuration")
    except Exception as e:
        print(f"[ERROR] Error updating header/footer: {e}")


def main():
    """Main function to populate all data"""
    db: Session = SessionLocal()
    try:
        print("=" * 60)
        print("Populating Social IT CMS with data from existing website")
        print("=" * 60)

        user = get_admin_user(db)
        print(f"\nUsing admin user: {user.email}")

        # Create all content
        create_services(db, user)
        create_case_studies(db, user)
        create_blogs(db, user)
        create_homepage(db, user)
        create_about_page(db, user)
        create_contact_page(db, user)
        create_careers_page(db, user)
        update_theme_config(db, user)
        update_header_footer(db, user)

        print("\n" + "=" * 60)
        print("[SUCCESS] Data population completed successfully!")
        print("=" * 60)
        print("\nYou can now:")
        print("  - Visit http://localhost:3000/ to see the homepage")
        print("  - Visit http://localhost:3000/about to see the About page")
        print("  - Visit http://localhost:3000/contact to see the Contact page")
        print("  - Visit http://localhost:3000/careers to see the Careers page")
        print("  - Visit http://localhost:3000/admin to manage content")
        print("  - Check /services, /blogs, /case-studies pages")

    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
