# Social IT Platform - Headless CMS

A production-grade headless CMS built with FastAPI (backend) and Next.js (frontend).

## 🏗️ Architecture

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT tokens
- **CMS Features**: Services, Pages (Page Builder), Blogs, Case Studies

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

## 🚀 Quick Start

**Local dev without .env:** You can start backend and frontend without creating a `.env` file. The backend uses safe dev defaults (`SECRET_KEY`, `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/socialit_cms`) and will start even if PostgreSQL is not running (it will log a warning; API calls will fail until the DB is up). The frontend uses `http://localhost:8000` and `http://localhost:3000` by default. For full functionality (auth, CMS, DB), create the database and optionally copy `backend/.env.example` to `backend/.env` and set values as below.

### 1. Clone Repository

```bash
git clone <repository-url>
cd socialit-platform
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE socialit_cms;

# Exit psql
\q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (if not exists)
# Copy the example below and update with your values
```

**Backend `.env` file** (`backend/.env`):

```env
APP_NAME=Social IT CMS
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
DATABASE_URL=postgresql://postgres:password@localhost:5432/socialit_cms
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
DATABASE_ECHO=false
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=*
API_V1_PREFIX=/api/v1
API_TITLE=Social IT CMS API
API_VERSION=1.0.0
LOG_LEVEL=INFO
LOG_FORMAT=text
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Initialize database schema:**

```bash
# Run database initialization (creates tables)
python -m app.db.init_db init
```

**Create admin user:**

```bash
# Create admin user script
python -c "
from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.rbac import UserRole
from app.auth.security import hash_password
from uuid import uuid4
from datetime import datetime

db = SessionLocal()
try:
    # Check if admin exists
    admin = db.query(User).filter(User.email == 'admin@socialit.com').first()
    if admin:
        print('Admin user already exists')
    else:
        # Create admin user
        admin = User(
            id=uuid4(),
            email='admin@socialit.com',
            username='admin',
            password_hash=hash_password('admin123'),
            first_name='Admin',
            last_name='User',
            is_active=True,
            is_email_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(admin)
        db.commit()
        print('Admin user created successfully')
        print('Email: admin@socialit.com')
        print('Password: admin123')
finally:
    db.close()
"
```

**Start backend server:**

```bash
# Run FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
```

**Frontend `.env.local` file** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Start frontend development server:**

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin`
- Admin Login: `http://localhost:3000/admin/login`

## 🧪 End-to-End Testing

### Step 1: Verify Backend Health

```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","timestamp":"...","environment":"development"}
```

### Step 2: Login to Admin Panel

1. Open browser: `http://localhost:3000/admin/login`
2. Enter credentials:
   - **Email**: `admin@socialit.com`
   - **Password**: `admin123`
3. Click "Login"
4. You should be redirected to `/admin` dashboard

### Step 3: Create a Service

1. Navigate to: `http://localhost:3000/admin/services`
2. Click "Add Service"
3. Fill in the form:
   - **Title**: "Web Development"
   - **Slug**: "web-development" (auto-generated)
   - **Subtitle**: "Custom web solutions"
   - **Description**: "We build modern web applications"
   - **Status**: "Published"
4. Click "Save"
5. Verify the service appears in the list

### Step 4: Create a Page with Page Builder

1. Navigate to: `http://localhost:3000/admin/pages`
2. Click "Add Page"
3. Fill in basic info:
   - **Title**: "Home"
   - **Slug**: "home"
   - **Status**: "Published"
4. Add sections:
   - Click **"+ Hero"** button
   - In JSON Data textarea, enter:
     ```json
     {
       "heading": "Welcome to Social IT",
       "subheading": "We build amazing digital solutions",
       "buttonText": "Get Started",
       "buttonLink": "/contact"
     }
     ```
   - Click **"+ Text"** button
   - In JSON Data textarea, enter:
     ```json
     {
       "content": "We are a leading digital services company specializing in web development, mobile apps, and cloud solutions."
     }
     ```
   - Click **"+ Image"** button
   - In JSON Data textarea, enter:
     ```json
     {
       "url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
       "alt": "Team collaboration"
     }
     ```
5. Click "Save"
6. Verify the page appears in the list

### Step 5: View Public Page

1. Open browser: `http://localhost:3000/home`
2. You should see:
   - Hero section with heading, subheading, and button
   - Text section with paragraph
   - Image section with the image
3. Check page source to verify SEO meta tags are present

### Step 6: Test API Endpoints

**Login via API:**

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@socialit.com","password":"admin123"}'

# Save the access_token from response
```

**Create Service via API:**

```bash
# Replace YOUR_TOKEN with the access_token from login
curl -X POST http://localhost:8000/cms/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Mobile App Development",
    "slug": "mobile-app-development",
    "subtitle": "Native and cross-platform apps",
    "description": "We develop iOS and Android applications",
    "status": "published"
  }'
```

**Get Published Services (Public):**

```bash
curl http://localhost:8000/cms/services
```

**Get Page by Slug (Public):**

```bash
curl http://localhost:8000/cms/pages/slug/home
```

### Step 7: Test Edit and Delete

1. Go to `http://localhost:3000/admin/services`
2. Click **"Edit"** on any service
3. Modify the title or description
4. Click "Save"
5. Verify changes are reflected
6. Click **"Delete"** on a service
7. Confirm deletion
8. Verify service is removed from list

## 📁 Project Structure

```
socialit-platform/
├── backend/
│   ├── app/
│   │   ├── api/          # CMS API routes
│   │   ├── auth/          # Authentication
│   │   ├── core/          # Config, events
│   │   ├── db/            # Database setup
│   │   ├── models/        # SQLAlchemy models
│   │   └── utils/         # Utilities
│   ├── db/
│   │   └── schema.sql     # PostgreSQL schema
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── admin/         # Admin dashboard
│   │   └── [slug]/        # Dynamic public pages
│   ├── package.json
│   └── .env.local
└── README.md
```

## 🔑 Default Credentials

- **Email**: `admin@socialit.com`
- **Password**: `admin123`

⚠️ **Change these in production!**

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env` matches your database credentials
- Ensure database `socialit_cms` exists

**Import errors:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Port already in use:**
- Change port: `uvicorn app.main:app --port 8001`

### Frontend Issues

**API connection error:**
- Verify backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**Build errors:**
- Clear `.next` folder: `rm -rf .next` (Linux/Mac) or `rmdir /s .next` (Windows)
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Issues

**Tables not created:**
- Run: `python -m app.db.init_db init`
- Check logs for errors

**Admin user not created:**
- Run the admin user creation script again
- Check database for existing user: `SELECT * FROM users WHERE email = 'admin@socialit.com';`

## 📚 API Documentation

Once backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🎯 Next Steps

- [ ] Add Blog CMS module
- [ ] Add Case Studies CMS module
- [ ] Implement image upload
- [ ] Add rich text editor for content
- [ ] Add page preview functionality
- [ ] Implement role management UI
- [ ] Add user management UI

## 📝 Notes

- Backend runs on port `8000`
- Frontend runs on port `3000`
- Database initialization only runs in `development` mode
- JWT tokens expire after 30 minutes (configurable)
- All content tables support soft delete (`is_deleted`)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]
