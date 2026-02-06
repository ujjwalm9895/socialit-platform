# Free Deployment Guide: Vercel + Render + Supabase

This guide walks you through deploying the Social IT CMS stack for **free** using:

- **Frontend (Next.js)** → [Vercel](https://vercel.com)
- **Backend (FastAPI)** → [Render](https://render.com)
- **Database (PostgreSQL)** → [Supabase](https://supabase.com)

---

## 1. Database: Supabase (PostgreSQL)

### 1.1 Create a project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Choose a region close to your Render region (e.g. same continent).
3. Set a strong database password and save it securely.

### 1.2 Get the connection string

1. In the Supabase dashboard: **Project Settings** → **Database**.
2. Under **Connection string**, select **URI**.
3. Copy the URI and replace the placeholder password with your actual database password:
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
4. Optional: use **Connection pooling** (Session mode) if you prefer; the direct URI works for this stack.

### 1.3 Tables and schema

- **Automatic table creation**: When the backend starts on Render, it runs a startup check and creates any **missing** tables (via SQLAlchemy `Base.metadata.create_all`). You do **not** need to run migrations manually for the initial deploy if you are happy with the code-defined schema.
- **Optional – run init locally against Supabase**: To create tables from your machine before the first deploy, set `DATABASE_URL` in `backend/.env` to your Supabase URI and run:
  ```bash
  cd backend
  python -c "from app.db.init_db import init_db; from app.core.config import settings; init_db(force=not settings.is_production)"
  ```
  Or start the backend once locally with `DATABASE_URL` pointing at Supabase; the startup logic will create tables.

### 1.4 Populate initial data (optional)

The script `populate_socialit_data.py` seeds services, case studies, blogs, homepage, header/footer, etc. It is **idempotent**: safe to run multiple times (it creates or updates by slug).

- **From your machine** (with `DATABASE_URL` in `backend/.env` set to your Supabase URI):
  ```bash
  cd backend
  python populate_socialit_data.py
  ```
- **One-off on Render**: You can run the same script in a Render **Shell** (if available) or via a one-off job, with the same `DATABASE_URL` and `SECRET_KEY` (and any other required env vars) set in the Render environment.

---

## 2. Backend: Render (FastAPI)

### 2.1 Create a Web Service

1. In [Render Dashboard](https://dashboard.render.com), click **New** → **Web Service**.
2. Connect your repository and select this repo.
3. Configure:
   - **Name**: e.g. `socialit-api`
   - **Region**: Choose one close to your Supabase project.
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: Leave empty to use the **Procfile** in `backend/`, or set explicitly: `python run.py` (or `uvicorn app.main:app --host 0.0.0.0 --port $PORT` if Render sets `PORT`).

Render will use the **Procfile** in the root of the service (i.e. inside `backend/`). The Procfile runs:

```bash
web: python run.py
```

`run.py` reads `PORT` from the environment (Render sets this) and starts the FastAPI app with uvicorn on `0.0.0.0:PORT`.

### 2.2 Environment variables (Render)

In the Render service → **Environment**, add at least:

| Variable           | Description |
|--------------------|-------------|
| `DATABASE_URL`     | Full Supabase PostgreSQL URI (see §1.2). |
| `SECRET_KEY`       | A long random string (min 32 characters). |
| `ENVIRONMENT`      | `production` |
| `CORS_ORIGINS`     | Your Vercel frontend URL(s), e.g. `https://your-app.vercel.app`, and optionally `http://localhost:3000` for local dev. Comma-separated. |

You can copy the rest from `backend/.env.example` and adjust (e.g. `DEBUG=false`, `LOG_LEVEL=INFO`). Do **not** commit real secrets; use Render’s environment (or secret files) only.

### 2.3 Deploy

- Push to your connected branch; Render will build and deploy.
- After deploy, the API will be at `https://<your-service-name>.onrender.com`. Use this URL as the frontend’s `NEXT_PUBLIC_API_URL`.

---

## 3. Frontend: Vercel (Next.js)

### 3.1 Create a project

1. Sign up at [vercel.com](https://vercel.com) and import your Git repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Next.js** (auto-detected).

### 3.2 Environment variables (Vercel)

In the Vercel project → **Settings** → **Environment Variables**, add:

| Variable                 | Value |
|--------------------------|--------|
| `NEXT_PUBLIC_API_URL`    | Your Render backend URL, e.g. `https://socialit-api.onrender.com` |

Use the same variable for Production, Preview, and Development if you want all to use the same API, or set different values per environment.

### 3.3 Deploy

- Push to the connected branch (or use Vercel’s deploy from CLI). Vercel will build and deploy.
- The frontend will call the backend at `NEXT_PUBLIC_API_URL`; ensure CORS on the backend (Render) includes this Vercel URL (see §2.2).

---

## 4. Summary checklist

- [ ] **Supabase**: Project created; `DATABASE_URL` (with real password) copied.
- [ ] **Backend**: Render Web Service created; root `backend`; build `pip install -r requirements.txt`; start from Procfile (`python run.py`); `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` (and optionally other vars from `.env.example`) set.
- [ ] **Frontend**: Vercel project created; root `frontend`; `NEXT_PUBLIC_API_URL` set to the Render API URL.
- [ ] **Tables**: Created automatically on first backend startup, or by running init locally against Supabase (see §1.3).
- [ ] **Seed data**: Optional; run `populate_socialit_data.py` once (or multiple times) with `DATABASE_URL` pointing at Supabase (§1.4).

---

## 5. Running init_db and populate scripts

- **init_db**: Table creation is handled on app startup via `Base.metadata.create_all`. To run `init_db()` explicitly (e.g. from a script), use the same `DATABASE_URL` and run from the `backend` directory so that `app` and config resolve (see §1.3).
- **populate_socialit_data.py**: Run from the `backend` directory with `DATABASE_URL` (and any other required env) set. Safe to run multiple times; it creates or updates content by slug.

For any issues, check Render and Vercel logs and ensure CORS and `NEXT_PUBLIC_API_URL` match your deployed URLs.
