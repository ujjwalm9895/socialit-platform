"""
Seed the AI & Machine Learning service so it appears like other services.

Run after you have at least one admin user:
  python -m app.db.seed_ai_ml_service

Idempotent: skips creation if a service with slug already exists.
"""

import logging
import sys

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.db.session import SessionLocal
from app.models.enums import ContentStatus
from app.models.rbac import UserRole
from app.models.role import Role
from app.models.service import Service
from app.models.user import User

logger = logging.getLogger(__name__)

AI_ML_SLUG = "artificial-intelligence-machine-learning"

AI_ML_SERVICE = {
    "slug": AI_ML_SLUG,
    "title": "Artificial Intelligence & Machine Learning Solutions",
    "subtitle": None,
    "description": (
        "We help enterprises harness the power of AI and machine learning to automate processes, "
        "gain insights from data, and deliver smarter products. Our team designs, builds, and deploys "
        "solutions tailored to your industry and goals."
    ),
    "status": ContentStatus.PUBLISHED,
    "content": {
        "services_offered": [
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
    },
}


def get_first_admin_user(db):
    q = (
        select(User)
        .join(UserRole, User.id == UserRole.user_id)
        .join(Role, UserRole.role_id == Role.id)
        .where(Role.name == "admin", User.is_active == True)
        .options(joinedload(User.user_roles).joinedload(UserRole.role))
        .limit(1)
    )
    return db.scalar(q)


def seed_ai_ml_service():
    db = SessionLocal()
    try:
        existing = db.scalar(select(Service).where(Service.slug == AI_ML_SLUG, Service.is_deleted == False))
        if existing:
            logger.info("AI/ML service already exists (slug=%s), skipping.", AI_ML_SLUG)
            return

        user = get_first_admin_user(db)
        if not user:
            logger.error("No admin user found. Create an admin user first, then run this script.")
            sys.exit(1)

        from datetime import datetime, timezone

        service = Service(
            slug=AI_ML_SERVICE["slug"],
            title=AI_ML_SERVICE["title"],
            subtitle=AI_ML_SERVICE["subtitle"],
            description=AI_ML_SERVICE["description"],
            content=AI_ML_SERVICE["content"],
            status=AI_ML_SERVICE["status"],
            created_by=user.id,
            is_deleted=False,
        )
        service.published_at = datetime.now(timezone.utc)
        service.published_by = user.id

        db.add(service)
        db.commit()
        logger.info("Created AI/ML service: %s (slug=%s)", service.title, service.slug)
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_ai_ml_service()
