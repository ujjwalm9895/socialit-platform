"""
Script to create roles and assign admin role to admin user.
Run this after creating the admin user.
"""

# Import registry first to ensure all models are loaded
from app.models import registry

from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.rbac import UserRole
from uuid import uuid4
from datetime import datetime

def setup_roles():
    db = SessionLocal()
    try:
        # Create roles if they don't exist
        roles_to_create = [
            {"name": "admin", "description": "Administrator with full access", "is_system_role": True},
            {"name": "editor", "description": "Editor with content management access", "is_system_role": True},
            {"name": "viewer", "description": "Viewer with read-only access", "is_system_role": True},
        ]
        
        created_roles = {}
        for role_data in roles_to_create:
            role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not role:
                role = Role(
                    id=uuid4(),
                    name=role_data["name"],
                    description=role_data["description"],
                    is_system_role=role_data["is_system_role"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(role)
                print(f"Created role: {role_data['name']}")
            else:
                print(f"Role already exists: {role_data['name']}")
            created_roles[role_data["name"]] = role
        
        db.commit()
        
        # Find admin user
        admin_user = db.query(User).filter(User.email == "admin@socialit.com").first()
        if not admin_user:
            print("Admin user not found. Please create the admin user first.")
            return
        
        # Assign admin role to admin user
        admin_role = created_roles["admin"]
        existing_user_role = db.query(UserRole).filter(
            UserRole.user_id == admin_user.id,
            UserRole.role_id == admin_role.id
        ).first()
        
        if not existing_user_role:
            user_role = UserRole(
                user_id=admin_user.id,
                role_id=admin_role.id,
                assigned_at=datetime.utcnow(),
                assigned_by=admin_user.id
            )
            db.add(user_role)
            db.commit()
            print(f"Assigned 'admin' role to user: {admin_user.email}")
        else:
            print(f"User {admin_user.email} already has 'admin' role")
        
        # Verify roles
        user_roles = db.query(UserRole).filter(UserRole.user_id == admin_user.id).all()
        print(f"\nUser {admin_user.email} has {len(user_roles)} role(s):")
        for ur in user_roles:
            print(f"  - {ur.role.name}")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    setup_roles()
