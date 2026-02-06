"""
Script to verify and fix admin user authentication.
Run this to check if admin user exists and can log in.
"""
import sys
from uuid import uuid4

import bcrypt
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.registry import User
from app.auth.security import verify_password

def verify_admin():
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.scalar(
            select(User).where(User.email == "admin@socialit.com")
        )
        
        if not user:
            print("❌ Admin user does not exist!")
            print("Run: python create_admin_user.py")
            return False
        
        print(f"✅ Admin user exists: {user.email}")
        print(f"   User ID: {user.id}")
        print(f"   Active: {user.is_active}")
        print(f"   Email Verified: {user.is_email_verified}")
        
        # Test password
        test_password = "admin123"
        if verify_password(test_password, user.password_hash):
            print(f"✅ Password verification successful!")
            print(f"   Login credentials:")
            print(f"   Email: {user.email}")
            print(f"   Password: {test_password}")
            return True
        else:
            print(f"❌ Password verification failed!")
            print(f"   The stored password hash doesn't match 'admin123'")
            print(f"   You may need to reset the password")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = verify_admin()
    sys.exit(0 if success else 1)
