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
from app.api.services.service import create_service, get_service_by_slug, update_service
from app.api.services.case_study import create_case_study
from app.api.services.blog import create_blog
from app.api.services.page import create_page, get_page_by_slug, update_page
from app.api.services.site_settings import (
    get_setting,
    set_setting,
    save_header_config,
    save_footer_config,
    save_theme_config,
    save_about_page,
    save_contact_info,
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


def update_app_development_service_content(db: Session, user: User):
    """Update App Development service with full content extracted from https://socialit.in/app-development.php"""
    try:
        service = get_service_by_slug(db, "app-development")
    except Exception:
        print("[SKIP] App Development service not found (run create_services first)")
        return
    description = (
        "We develop Native Apps and Cross-platform Apps so your app is available to a larger share of potential users "
        "and delivers a smooth experience anytime. We use an agile method to flexibly evolve our approach with feedback, "
        "iteration, and fast time-to-market. Building a mobile application implements the right level of the system "
        "for functionality, usability, and scalability.\n\n"
        "Our depth of experience includes high-performance native iOS app development for iPhones, iPads, and Apple Watch, "
        "so you get the most from the iOS ecosystem. We also create efficient, cost-effective hybrid apps that scale to "
        "iOS, Android, and web so you reach more people with the same development effort. We build with Google's Flutter "
        "framework to deliver ultra-appealing, powerful applications with optimal user experience and improved conversion rates."
    )
    content = {
        "services_offered": [
            {
                "title": "Native iOS App Development",
                "description": "High-performance native iOS apps for iPhones, iPads, and Apple Watch, leveraging the full iOS ecosystem.",
            },
            {
                "title": "Cross-Platform & Hybrid Apps",
                "description": "Efficient hybrid apps for iOS, Android, and web so you reach more users with the same development effort.",
            },
            {
                "title": "Flutter Development",
                "description": "We build with Google's Flutter framework to deliver ultra-appealing, powerful applications with optimal user experience and improved conversion rates.",
            },
            {
                "title": "UI/UX Design",
                "description": "Creating user-intuitive and engaging interfaces for an easy experience.",
            },
            {
                "title": "Development",
                "description": "Reliable backend and frontend solutions using Laravel, WordPress, PHP, React, Vue.js, and Node.js.",
            },
            {
                "title": "Testing & QA",
                "description": "Thorough testing to guarantee functionality, security, and performance.",
            },
            {
                "title": "Deployment & Launch",
                "description": "Put the website or application in launch-ready form.",
            },
            {
                "title": "Support and Maintenance",
                "description": "Future-proof updates, security patches, and ongoing support.",
            },
        ],
        "procedure": [
            {"title": "Brainstorming & Planning", "description": "App goals, who the app is for, and what it will include."},
            {"title": "UI/UX Design", "description": "Creating wireframes and basic designs that make the app simple to use."},
            {"title": "Development", "description": "Building the app with the best frameworks and technology."},
            {"title": "Testing", "description": "Run tests to verify functionality, performance, and security features."},
            {"title": "Deployment", "description": "Publish the app in App Stores and improve visibility."},
            {"title": "Support & Maintenance", "description": "Keeping the app updated with regular maintenance and support for performance and customer satisfaction."},
        ],
        "benefits": [
            "Larger share of potential users with cross-platform availability",
            "Smooth experience anytime, on any device",
            "Agile method with feedback, iteration, and fast time-to-market",
            "Functionality, usability, and scalability built in",
            "Native iOS and hybrid options for best performance and reach",
            "Flutter-powered apps for consistent, high-quality UX",
            "End-to-end support from planning to maintenance",
        ],
        "faqs": [
            {"question": "How do you approach app development?", "answer": "We follow a customer-centric approach, starting with in-depth requirements analysis. Our skilled team designs, develops, and tests applications for various platforms, ensuring high performance, security, and user satisfaction."},
            {"question": "Can you handle both iOS and Android app development?", "answer": "Absolutely. We specialize in cross-platform app development, creating seamless experiences for both iOS and Android users. This approach saves time and costs while ensuring broad market coverage."},
            {"question": "What about app maintenance and updates?", "answer": "We provide ongoing support, monitoring, and updates to keep your app relevant and bug-free. Our team ensures your app remains optimized, secure, and aligned with the latest technological trends."},
            {"question": "How do you ensure app security?", "answer": "Security is paramount. We implement encryption, secure authentication, and rigorous testing to protect user data. Regular security audits and updates safeguard your app from vulnerabilities."},
            {"question": "Can you assist in app monetization strategies?", "answer": "Certainly. We help you explore various monetization options, such as in-app purchases, ads, or subscription models, guiding you to choose the best strategy that aligns with your app's purpose and user base."},
        ],
        "related_services": [
            "Website Development",
            "Social Media Marketing",
            "Digital Marketing",
            "Logo Design",
            "Packaging Design",
            "Branding & Advertising",
            "UI/UX Design",
            "Graphic Design",
        ],
        "cta_text": "Contact Us",
        "cta_link": "/contact",
    }
    update_service(
        db=db,
        service_id=service.id,
        data={
            "title": "App Development",
            "subtitle": "Next-Gen App Solutions",
            "description": description,
            "content": content,
            "meta_title": "Hire the Best App Development Company in Kota | Social IT",
            "meta_description": "Native and cross-platform app development. iOS, Android, Flutter. Agile process, security, and ongoing support. Get a quote today.",
            "meta_keywords": ["app development", "mobile apps", "iOS development", "Android development", "Flutter", "cross-platform", "Kota"],
        },
        user=user,
    )
    print("[OK] Updated App Development service with content from socialit.in/app-development.php")


def create_case_studies(db: Session, user: User):
    """Create case studies/portfolio items – categories aligned with socialit.in/portfolio.php (Jewellers, Healthcare, Education, Websites, Logo Designs, etc.)."""
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
            "tags": ["healthcare", "Websites", "digital marketing"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
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
            "industry": "Lifestyle",
            "tags": ["Branding & Advertising", "Logo Designs", "Graphic Design"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
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
            "tags": ["mobile app", "healthcare", "App Development", "UI/UX Designs"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
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
            "industry": "Jewellers",
            "tags": ["Social Media Marketing", "Lifestyle", "content marketing"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
            "meta_title": "Gondilal Kiva Jewellers Case Study | Social IT",
            "meta_description": "Social media marketing success for Gondilal Kiva Jewellers.",
        },
        {
            "slug": "physics-wallah-education",
            "title": "Physics Wallah - EdTech Platform",
            "client_name": "Physics Wallah",
            "excerpt": "Enabling scalable online education with a robust digital platform.",
            "challenge": "Deliver a seamless learning experience to millions of students.",
            "solution": "We built a high-performance web platform with video, assessments, and live classes.",
            "results": "Improved engagement and platform reliability at scale.",
            "industry": "Education",
            "tags": ["Websites", "Education", "UI/UX Designs"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
            "meta_title": "Physics Wallah Case Study | Social IT",
            "meta_description": "EdTech platform development for Physics Wallah.",
        },
        {
            "slug": "restaurant-brand-website",
            "title": "Fine Dine - Restaurant Brand & Website",
            "client_name": "Fine Dine",
            "excerpt": "Full brand identity and website for a premium restaurant chain.",
            "challenge": "Stand out in a competitive market with a memorable brand and easy reservations.",
            "solution": "Logo design, brand guidelines, and a responsive website with online booking.",
            "results": "Higher table bookings and stronger brand recall.",
            "industry": "Restaurants and Hotels",
            "tags": ["Logo Designs", "Websites", "Branding & Advertising"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
            "meta_title": "Restaurant Brand Case Study | Social IT",
            "meta_description": "Restaurant branding and website by Social IT.",
        },
        {
            "slug": "fmcg-packaging-design",
            "title": "FMCG Brand - Packaging & Digital",
            "client_name": "FMCG Brand",
            "excerpt": "Packaging design and eCommerce presence for an FMCG launch.",
            "challenge": "Create shelf impact and drive online sales.",
            "solution": "Packaging design, product photography, and an eCommerce storefront.",
            "results": "Strong retail pickup and growing D2C sales.",
            "industry": "FMCG",
            "tags": ["Packaging Design", "eCommerce", "Websites"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
            "meta_title": "FMCG Case Study | Social IT",
            "meta_description": "FMCG packaging and eCommerce by Social IT.",
        },
        {
            "slug": "ecommerce-store-ui",
            "title": "Fashion Store - eCommerce & UI/UX",
            "client_name": "Fashion Store",
            "excerpt": "A modern eCommerce experience with intuitive UI/UX.",
            "challenge": "Increase conversion and reduce cart abandonment.",
            "solution": "Redesigned user flows, checkout, and mobile experience.",
            "results": "Higher conversion rate and lower bounce rate.",
            "industry": "Lifestyle",
            "tags": ["eCommerce", "UI/UX Designs", "Websites"],
            "status": ContentStatus.PUBLISHED,
            "featured_image_url": None,
            "meta_title": "eCommerce UI/UX Case Study | Social IT",
            "meta_description": "eCommerce and UI/UX design by Social IT.",
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
    """Create or update homepage with all sections. Hero aligned with Socialit.in reference."""
    # Hero section: block-based, Socialit.in content (headline, paragraph, tagline, CTAs, logo row, banner)
    hero_section = {
        "id": "section-hero-1",
        "type": "hero",
        "data": {
            "design": {
                "layout": "two_column",
                "left_width": "42%",
                "background_type": "color",
                "background_color": "#0f172a",
                "text_color": "#ffffff",
                "padding_top": 80,
                "padding_bottom": 80,
            },
            "left_blocks": [
                {"id": "hero-h", "type": "heading", "content": {"level": "h2", "text": "Weaving Your Brand's Digital Success Story"}},
                {"id": "hero-p", "type": "paragraph", "content": {"text": "Maintain a winning reputation, engage digitally, and deliver an exceptional customer experience - all from one intuitive platform."}},
                {"id": "hero-tag", "type": "tagline", "content": {"text": "Web Development Company in Kota"}},
                {"id": "hero-email", "type": "email_input", "content": {"placeholder": "Enter your email"}},
                {
                    "id": "hero-btns",
                    "type": "button_group",
                    "content": {
                        "buttons": [
                            {"text": "Get A Demo", "link": "/contact", "style": "primary"},
                            {"text": "Explore Case Study", "link": "/case-studies", "style": "outline"},
                        ],
                    },
                },
                {
                    "id": "hero-logos",
                    "type": "logo_row",
                    "content": {
                        "headline": "Trusted & Awarded By Global Leaders",
                        "logos": [
                            {"image_url": "https://socialit.in/logo_webp/JCI.png", "link_url": "", "alt": "JCI"},
                            {"image_url": "https://socialit.in/logo_webp/Indian.png", "link_url": "", "alt": "Indian Achievers"},
                            {"image_url": "https://socialit.in/logo_webp/Rotary.png", "link_url": "", "alt": "Rotary"},
                        ],
                    },
                },
            ],
            "right_blocks": [
                {"id": "hero-img", "type": "image", "content": {"url": "https://socialit.in/assets/img/homebanner.webp", "alt": "Hero banner", "link": ""}},
            ],
            "chat_button_text": "Let's Chat",
            "chat_button_link": "/contact",
        },
    }

    # Shared design defaults for full customization (background, colors, padding)
    design_dark = {
        "background_type": "gradient",
        "gradient_from": "#0d419d",
        "gradient_to": "#388bfd",
        "text_color": "#FFFFFF",
        "padding_top": 48,
        "padding_bottom": 48,
    }
    design_darker = {
        "background_type": "color",
        "background_color": "#161b22",
        "text_color": "#e6edf3",
        "padding_top": 48,
        "padding_bottom": 48,
    }

    # Our Services / What We Do – all 9 services from https://socialit.in/
    services_grid_section = {
        "id": "section-services-1",
        "type": "services-grid",
        "data": {
            "title": "Our Services",
            "subtitle": "What We Do",
            "services": [
                {"title": "App Development", "description": "Native and cross-platform mobile apps that users love.", "link": "/services/app-development"},
                {"title": "Website Development", "description": "Custom web solutions for your business. From landing pages to complex web applications.", "link": "/services/website-development"},
                {"title": "UI/UX Design", "description": "User-centered design that converts. Beautiful, intuitive interfaces.", "link": "/services/ui-ux-design"},
                {"title": "Social Media Marketing", "description": "Grow your brand on social platforms. Content that resonates.", "link": "/services/social-media-marketing"},
                {"title": "Graphic Design", "description": "Visual identity that stands out. Logos to marketing materials.", "link": "/services/graphic-design"},
                {"title": "Digital Marketing", "description": "Data-driven strategies. SEO, PPC, email marketing, and analytics.", "link": "/services/digital-marketing"},
                {"title": "Logo Design", "description": "Memorable brand identities. Unique logos that make a lasting impression.", "link": "/services/logo-design"},
                {"title": "Branding & Advertising", "description": "Complete brand solutions. From strategy to execution.", "link": "/services/branding-advertising"},
                {"title": "Packaging Design", "description": "Packaging that sells. Eye-catching designs that tell your brand story.", "link": "/services/packaging-design"},
            ],
            "columns": 3,
            "titleColor": "#e6edf3",
            "subtitleColor": "#8b949e",
            "linkColor": "#58a6ff",
            "backgroundColor": "#0d1117",
            "design": {"background_type": "color", "background_color": "#0d1117", "text_color": "#e6edf3", "padding_top": 48, "padding_bottom": 48},
        },
    }

    # Let's get insights from leaders globally – 6 leader quotes from Socialit.in
    leaders_section = {
        "id": "section-leaders-1",
        "type": "testimonials",
        "data": {
            "title": "Let's get insights from leaders globally",
            "subtitle": "Lead today, motivate tomorrow",
            "items": [
                {"quote": "At boAt, we are on a mission to bring Technologically superior products for the discerning Indian Consumers. BoAt was born online and our marketing primarily revolves around the same.", "author": "Aman Gupta", "role": "Chief Marketing officer", "company": "BoAt"},
                {"quote": "I am passionate about education. That's why it was exciting to discuss the future of education and how technology is changing the landscape for both students and teachers.", "author": "alakh pandey", "role": "Chief executive officer", "company": "Physics Wallah"},
                {"quote": "Technology played an instrumental role in helping us solve the existing market problem. Our best-in-class tech stack helps drive efficiency in operations, ultimately making 10-minute deliveries possible.", "author": "Aadit Palidha", "role": "Chief executive officer", "company": "Zepto"},
                {"quote": "In our fast-paced digital age, coding isn't reserved for techies alone. It's the global language of innovation, and it's time to embrace it.", "author": "Amit Jain", "role": "Chief executive officer", "company": "CarDekho"},
                {"quote": "Social Media is turning the media landscape on its head, and to see a company led by a very passionate team helping brands navigate these waters is very exciting.", "author": "Anupam Mittal", "role": "Founder", "company": "Shaadi.com"},
                {"quote": "Digital isn't only changing and reshaping our daily lives—it's driving the economy.", "author": "Shantanu Narayen", "role": "Chief executive officer", "company": "Adobe Systems"},
            ],
            "design": design_darker,
        },
    }

    # Everything you need to run a digital business – 10 features from Socialit.in
    features_section = {
        "id": "section-features-1",
        "type": "features",
        "data": {
            "title": "Everything you need to run a digital business",
            "subtext": "From reputation and listings to payments and AI-driven insights—all in one place.",
            "items": [
                "Reviews – Improve online reputation",
                "Listings – Get found online",
                "Messaging – Engage on digital channels",
                "Webchat – Engage website visitors",
                "Social – Post, engage, and report",
                "Appointments – Book and confirm digitally",
                "Payments – Get paid faster",
                "Surveys – Improve experience",
                "Referrals – Grow sales with referrals",
                "Insights – Actionable insights with AI",
            ],
            "design": {"background_type": "color", "background_color": "#f8fafc", "text_color": "#1e293b", "padding_top": 48, "padding_bottom": 48},
        },
    }

    # Stats: Clients, Projects, Creative Designs, Experience (from Socialit.in)
    stats_section = {
        "id": "section-stats-1",
        "type": "stats",
        "data": {
            "title": "Better Performance on the platforms That Matter",
            "subtext": "Trusted by brands across industries.",
            "items": [
                {"label": "Clients", "value": "150+"},
                {"label": "Projects", "value": "500+"},
                {"label": "Creative Designs", "value": "2000+"},
                {"label": "Years Experience", "value": "10+"},
            ],
            "design": design_dark,
        },
    }

    # What Our Client Says / We Work Across / All Industries – 5 client testimonials
    testimonials_section = {
        "id": "section-testimonials-1",
        "type": "testimonials",
        "data": {
            "title": "What Our Client Says",
            "subtitle": "We Work Across All Industries",
            "items": [
                {"quote": "Mr Vaibhav is very good at his profession and also very generous person. He is ready for any help anytime. The work quality is also very good. I recommend to get associated with him.", "author": "Dr. Palkesh Agarwal", "role": "Sudha Hospital", "company": ""},
                {"quote": "Thanks to the Social IT team for their hard work, creativity, and dedication to bringing my vision to life. Your graphic designing services have played a significant role in elevating my brand's visual presence and engaging my target audience effectively.", "author": "Vijay Gupta", "role": "Sahara Group", "company": ""},
                {"quote": "I am thrilled to provide my highest recommendation for the Social IT Marketing and Development Agency! They have created an exceptional mobile app for me that is not only visually stunning, but also incredibly responsive and user-friendly.", "author": "Dorian Priest Mascarenhas", "role": "RCTI Diagnostic", "company": ""},
                {"quote": "You tell them what you want, you tell them about your expectations and target audience and they prepare the entire marketing campaign for you. The entire process became very seamless for me including creatives and Social Media Marketing.", "author": "Avijit Goel", "role": "Gondilal Kiva Jewellers", "company": ""},
                {"quote": "Recently we got connected with social it and I must say they have very good services, if you want to promote your business go with Social It. Richard, you have done a great job", "author": "Rashmi", "role": "Event Manager", "company": ""},
            ],
            "design": design_darker,
        },
    }

    # Social It integrates with the apps you use
    integrations_section = {
        "id": "section-integrations-1",
        "type": "text",
        "data": {
            "title": "Social It integrates with the apps you use",
            "content": "Connect with the tools and platforms your business already uses. From CRM to analytics, we help you stay integrated and efficient.",
            "design": {"background_type": "color", "background_color": "#ffffff", "text_color": "#1e293b", "padding_top": 48, "padding_bottom": 48},
        },
    }

    cta_section = {
        "id": "section-cta-1",
        "type": "cta",
        "data": {
            "heading": "Ready to Transform Your Digital Presence?",
            "subtext": "Let's create something amazing together.",
            "buttonText": "Get In Touch",
            "buttonLink": "/contact",
            "secondaryText": "Let's Chat",
            "secondaryLink": "/contact",
            "design": {
                "background_type": "gradient",
                "gradient_from": "#1f6feb",
                "gradient_to": "#388bfd",
                "text_color": "#FFFFFF",
                "padding_top": 48,
                "padding_bottom": 48,
            },
        },
    }

    homepage_content = [
        hero_section,
        services_grid_section,
        leaders_section,
        features_section,
        stats_section,
        testimonials_section,
        integrations_section,
        cta_section,
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
    """Create or update the About page with hero, text, features (values), stats, and CTA (all renderable by SectionRenderer)."""
    design_dark = {"background_type": "gradient", "gradient_from": "#0d419d", "gradient_to": "#388bfd", "text_color": "#FFFFFF", "padding_top": 48, "padding_bottom": 48}
    design_darker = {"background_type": "color", "background_color": "#161b22", "text_color": "#e6edf3", "padding_top": 48, "padding_bottom": 48}
    about_content = [
        {
            "id": "about-hero-1",
            "type": "hero",
            "data": {
                "heading": "We're Building the Future of Digital",
                "subheading": "A passionate team dedicated to innovation, partnership, and delivering exceptional results for our clients.",
                "buttonText": "Get In Touch",
                "buttonLink": "/contact",
            },
        },
        {
            "id": "about-intro-1",
            "type": "text",
            "data": {
                "title": "About Us",
                "content": "With a deep understanding of the digital landscape, we are dedicated to helping businesses thrive and achieve their goals. Social IT is an AI-driven digital marketing and software development company, weaving your brand's digital success story. We deliver website development, app development, digital marketing, and design services that help brands maintain a winning reputation, engage digitally, and deliver an exceptional customer experience.",
                "design": {"background_type": "color", "background_color": "#ffffff", "text_color": "#1e293b", "padding_top": 48, "padding_bottom": 48},
            },
        },
        {
            "id": "about-values-1",
            "type": "features",
            "data": {
                "title": "Our Core Values",
                "subtext": "What drives us every day.",
                "items": [
                    "Innovation – We embrace cutting-edge solutions and stay ahead of technology trends to deliver future-ready products.",
                    "Partnership – We build lasting relationships with our clients, working as an extension of your team to achieve shared goals.",
                    "Excellence – Quality in everything we do, from strategy and design to development and support.",
                    "Results – We focus on measurable outcomes that drive growth, engagement, and ROI for your business.",
                ],
                "design": design_darker,
            },
        },
        {
            "id": "about-stats-1",
            "type": "stats",
            "data": {
                "title": "Better Performance on the Platforms That Matter",
                "subtext": "Numbers that speak for themselves.",
                "items": [
                    {"label": "Clients", "value": "150+"},
                    {"label": "Projects", "value": "500+"},
                    {"label": "Creative Designs", "value": "2000+"},
                    {"label": "Years Experience", "value": "10+"},
                ],
                "design": design_dark,
            },
        },
        {
            "id": "about-cta-1",
            "type": "cta",
            "data": {
                "heading": "Let's Build Something Great Together",
                "subtext": "Get in touch to discuss your next project.",
                "buttonText": "Contact Us",
                "buttonLink": "/contact",
                "design": design_dark,
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
    """Create or update Contact page – hero, text (details + form message), cta (all renderable by SectionRenderer)."""
    design_dark = {"background_type": "gradient", "gradient_from": "#0d419d", "gradient_to": "#388bfd", "text_color": "#FFFFFF", "padding_top": 48, "padding_bottom": 48}
    design_darker = {"background_type": "color", "background_color": "#161b22", "text_color": "#e6edf3", "padding_top": 48, "padding_bottom": 48}
    contact_content = [
        {
            "id": "contact-hero-1",
            "type": "hero",
            "data": {
                "heading": "Get In Touch",
                "subheading": "Have a project in mind? We'd love to hear from you. Share the details of your project and we'll get back to you as soon as we can.",
                "buttonText": "Send a Message",
                "buttonLink": "/contact",
            },
        },
        {
            "id": "contact-details-1",
            "type": "text",
            "data": {
                "title": "Contact Us",
                "content": "Got a project in mind? Share the details of your project.\n\nAddress: H-14(B), Electronic Complex, Road No.1, IPIA, Kota, Rajasthan 324009. We also have an office at 1751 2nd Ave, New York City, NY, 10128.\n\nPhone: +91-8824467277, +91-8290534979, +91-7737306090.\n\nEmail: info@socialit.in\n\nUse the form on this page to send us a message, or reach out via WhatsApp—we're here to help.",
                "design": design_darker,
            },
        },
        {
            "id": "contact-cta-1",
            "type": "cta",
            "data": {
                "heading": "Prefer to Talk?",
                "subtext": "Call us or drop an email – we're here to help.",
                "buttonText": "View Our Work",
                "buttonLink": "/case-studies",
                "secondaryText": "Let's Chat",
                "secondaryLink": "/contact",
                "design": design_dark,
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
    """Create or update Careers page – hero, text, features (roles), cta (all renderable by SectionRenderer)."""
    design_dark = {"background_type": "gradient", "gradient_from": "#0d419d", "gradient_to": "#388bfd", "text_color": "#FFFFFF", "padding_top": 48, "padding_bottom": 48}
    design_darker = {"background_type": "color", "background_color": "#161b22", "text_color": "#e6edf3", "padding_top": 48, "padding_bottom": 48}
    careers_content = [
        {
            "id": "careers-hero-1",
            "type": "hero",
            "data": {
                "heading": "Join Our Team",
                "subheading": "We're always looking for talented people. Explore open roles and grow with us.",
                "buttonText": "See Open Roles",
                "buttonLink": "#open-positions",
            },
        },
        {
            "id": "careers-intro-1",
            "type": "text",
            "data": {
                "title": "Open Positions",
                "content": "Find your next opportunity with Social IT. We're a digital marketing and software development company based in Kota with a presence in New York. We offer a collaborative, growth-oriented environment where you can build products that matter.",
                "design": {"background_type": "color", "background_color": "#f8fafc", "text_color": "#1e293b", "padding_top": 48, "padding_bottom": 48},
            },
        },
        {
            "id": "careers-list-1",
            "type": "features",
            "data": {
                "title": "Current Openings",
                "subtext": "Full-time and internship roles. Remote / Hybrid options available.",
                "items": [
                    "Senior Full Stack Developer – Build scalable web and mobile applications. 5+ years experience. Remote / Hybrid. Apply: careers@socialit.in",
                    "UI/UX Designer – Create beautiful, user-centered interfaces. Strong portfolio and Figma skills. 3+ years. Remote / Hybrid.",
                    "Digital Marketing Specialist – Drive growth through SEO, social media, and content. 2+ years. Remote / Hybrid.",
                    "Graphic Designer – Visual identity, branding, and marketing materials. Strong creative portfolio.",
                    "Business Development Executive – Help us grow our client base and partnerships. Excellent communication skills.",
                ],
                "design": design_darker,
            },
        },
        {
            "id": "careers-cta-1",
            "type": "cta",
            "data": {
                "heading": "Don't See the Right Role?",
                "subtext": "We're still growing. Send us your resume and we'll keep you in mind for future openings.",
                "buttonText": "Get In Touch",
                "buttonLink": "/contact",
                "design": design_dark,
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
                "content": "With a deep understanding of the digital landscape, we are dedicated to helping businesses thrive and achieve their goals.",
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
        "newsletter_title": "Subscribe to Our Newsletter for the Latest Updates",
        "newsletter_placeholder": "Your email",
        "newsletter_button_text": "Send",
        "legal_links": [
            {"id": "1", "label": "Terms of Use", "href": "/terms", "open_in_new_tab": False},
            {"id": "2", "label": "Privacy Policy", "href": "/privacy", "open_in_new_tab": False},
        ],
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


def update_about_page_site_setting(db: Session, user: User):
    """Fill About page site setting (used by /about) with full content."""
    about_config = {
        "heading": "About Us",
        "intro": "With a deep understanding of the digital landscape, we are dedicated to helping businesses thrive and achieve their goals. Social IT is an AI-driven digital marketing and software development company, weaving your brand's digital success story.",
        "stats_heading": "Better Performance on the platforms That Matter",
        "stats_subtext": "Numbers that speak for themselves.",
        "stats": [
            {"value": "150+", "label": "Clients"},
            {"value": "500+", "label": "Projects"},
            {"value": "2000+", "label": "Creative Designs"},
            {"value": "10+", "label": "Years Experience"},
        ],
        "journey_heading": "Our Journey",
        "journey_subheading": "Discover Our Story",
        "journey_text": "Social IT was born with a mission to bring technologically superior digital solutions to businesses. We have evolved our expertise in website development, app development, digital marketing, and design—helping brands navigate the rapidly changing online landscape and deliver exceptional customer experiences.",
        "vision_heading": "Our Vision",
        "vision_subheading": "Driving Innovation & Growth",
        "vision_text": "We aspire to be a global leader in high-quality marketing and IT solutions, serving brands with mission-critical applications. Our vision is to close the technology and business success gap, bringing brands closer to their customers and helping them scale.",
        "what_sets_apart_heading": "What Sets Us Apart",
        "what_sets_apart_subheading": "Passionate About Results",
        "what_sets_apart_items": [
            {"title": "Innovation", "text": "We embrace cutting-edge solutions and stay ahead of technology trends to deliver future-ready products."},
            {"title": "Partnership", "text": "We build lasting relationships with our clients, working as an extension of your team to achieve shared goals."},
            {"title": "Excellence", "text": "Quality in everything we do—from strategy and design to development and support."},
            {"title": "Results", "text": "We focus on measurable outcomes that drive growth, engagement, and ROI for your business."},
        ],
        "team_heading": "Meet Our Team",
        "team_subheading": "The Minds Behind Social IT",
        "team": [
            {"name": "Shubhra Mitra", "role": "Content & Strategy Lead", "image_url": ""},
            {"name": "Kanak Pandey", "role": "Co-Founder / Key Team Member", "image_url": ""},
            {"name": "Himanshu Porwal", "role": "Senior UI/UX Developer", "image_url": ""},
            {"name": "Dushyant Singh", "role": "Graphic Designer", "image_url": ""},
            {"name": "Ryan Rehan", "role": "Business Development Executive", "image_url": ""},
        ],
        "cta_text": "Get In Touch",
        "cta_link": "/contact",
    }
    try:
        save_about_page(db, about_config)
        print("[OK] Updated About page site setting")
    except Exception as e:
        print(f"[ERROR] Error updating About page site setting: {e}")


def update_contact_info_site_setting(db: Session, user: User):
    """Fill Contact info site setting (used by /contact) with Socialit.in details."""
    contact_config = {
        "heading": "Contact Us",
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
    }
    try:
        save_contact_info(db, contact_config)
        print("[OK] Updated Contact info site setting")
    except Exception as e:
        print(f"[ERROR] Error updating Contact info site setting: {e}")


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
        update_app_development_service_content(db, user)
        create_case_studies(db, user)
        create_blogs(db, user)
        create_homepage(db, user)
        create_about_page(db, user)
        create_contact_page(db, user)
        create_careers_page(db, user)
        update_theme_config(db, user)
        update_header_footer(db, user)
        update_about_page_site_setting(db, user)
        update_contact_info_site_setting(db, user)

        print("\n" + "=" * 60)
        print("[SUCCESS] Data population completed successfully!")
        print("=" * 60)
        print("\nYou can now:")
        print("  - Visit your frontend (e.g. / to see the homepage, /about, /contact, /careers)")
        print("  - Visit /admin to manage content")
        print("  - Check /services, /blogs, /case-studies pages")

    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()
