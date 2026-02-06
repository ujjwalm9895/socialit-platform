# Social IT Platform – Project Guide

This document explains **how the project works**: architecture, data flow, main features, and where to find things in the codebase. For setup and run instructions, see [README.md](README.md).

---

## 1. What This Project Is

**Social IT Platform** is a **headless CMS** with:

- **Backend (FastAPI)**: REST API for content (pages, services, blogs, case studies), auth (JWT), and site settings (theme, header, footer).
- **Frontend (Next.js)**: Public marketing site (home, pages by slug, services, blogs, case studies) and an **admin panel** to manage all content.
- **Database (PostgreSQL)**: Stores users, roles, and all CMS content.

Editors use the admin panel; the public site reads content from the API and renders it with a shared theme and layout.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                          │
├─────────────────────────────────────────────────────────────────┤
│  Public site (localhost:3000)     │  Admin panel (/admin/*)       │
│  - Home, /about, /contact, etc.  │  - Login, Pages, Services,     │
│  - /services, /blogs,            │    Blogs, Header, Footer,       │
│    /case-studies                 │    Theme, Users                 │
└──────────────┬───────────────────┴────────────────┬──────────────┘
               │                                     │
               │  GET /cms/* (no auth for public)   │  GET/POST/PUT/DELETE
               │  POST /auth/login                  │  + Bearer token
               ▼                                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  Next.js (frontend)                                                │
│  - Fetches from API (SWR + axios)                                 │
│  - Theme + Header/Footer from /cms/site-settings/*                │
└──────────────────────────────────┬───────────────────────────────┘
                                   │
                    HTTP (NEXT_PUBLIC_API_URL, e.g. http://localhost:8000)
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│  FastAPI (backend)                                                │
│  - /auth/login, /cms/pages, /cms/services, /cms/blogs,          │
│    /cms/case-studies, /cms/site-settings/*, /cms/users, etc.     │
└──────────────────────────────────┬───────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│  PostgreSQL                                                       │
│  - users, roles, pages, services, blogs, case_studies,           │
│    site_settings (theme, header, footer)                          │
└──────────────────────────────────────────────────────────────────┘
```

- **Public site**: Calls the API with or without a token. For pages by slug, only **published** pages are returned to unauthenticated callers.
- **Admin**: All mutations require a valid JWT (login at `/admin/login`). Token is stored in `localStorage` and sent in the `Authorization` header.

---

## 3. Public Site – How It Works

### 3.1 Routes and data source

| URL | Source | Notes |
|-----|--------|--------|
| `/` | Page with slug `home` | Fetches `GET /cms/pages/slug/home`, renders sections. |
| `/[slug]` | Page with that slug | e.g. `/about`, `/contact`, `/careers`. Same section-based rendering. |
| `/services` | List from API | `GET /cms/services` (published). |
| `/services/[slug]` | One service | `GET /cms/services` then find by slug or dedicated endpoint. |
| `/blogs` | List from API | `GET /cms/blogs` (published). |
| `/blogs/[slug]` | One blog | From API by slug. |
| `/case-studies` | List from API | `GET /cms/case-studies` (published). |
| `/case-studies/[slug]` | One case study | From API by slug. |

- **Theme**: Loaded from `GET /cms/site-settings/theme` and applied as CSS variables (e.g. `--color-background`, `--color-primary`). See `frontend/components/ThemeProvider.tsx` and `frontend/lib/theme.ts`.
- **Header / Footer**: From `GET /cms/site-settings/header` and `GET /cms/site-settings/footer`. Rendered by `AnimatedHeader.tsx` and `Footer.tsx`.

### 3.2 How a page is rendered (home and slug pages)

1. Frontend fetches the page by slug, e.g. `GET /cms/pages/slug/home` or `GET /cms/pages/slug/about`.
2. Response includes `content`: an array of section objects, each with `type`, `data`, and optional `id`.
3. **SectionRenderer** (`frontend/components/SectionRenderer.tsx`) maps each `type` to a UI block (hero, services-grid, stats, testimonials, cta, about-hero, values-grid, contact-form, careers-list, etc.).
4. Section `data` drives that block (headings, links, colors, list items, etc.). Theme and section-level colors (from CMS or defaults) are applied so the site looks consistent.

So: **editing a page in the admin = changing the `content` array for that page**. The public site just re-fetches and re-renders that array.

---

## 4. Admin Panel – How It Works

### 4.1 Access and auth

- **Base URL**: `http://localhost:3000/admin`
- **Login**: `http://localhost:3000/admin/login` (email/password → JWT).
- **Protected routes**: `frontend/app/admin/layout.tsx` checks for a token; if missing, redirects to `/admin/login`. Session expiry (401) is handled so the modal does not close unexpectedly; a “session expired” banner is shown instead of an immediate redirect when editing.

### 4.2 Main admin sections

| Path | Purpose |
|------|--------|
| `/admin` | Dashboard. |
| `/admin/login` | Log in (no token required). |
| `/admin/pages` | List all pages; add/edit/delete. **Edit** opens a modal with the **page builder** (sections list: add, reorder, edit section data, remove). |
| `/admin/homepage` | Edit the **home** page content (same idea as page builder). |
| `/admin/header` | Configure logo, menu items (links + dropdowns), CTA button, colors. |
| `/admin/footer` | Configure columns, links, copyright, colors. |
| `/admin/theme` | Global theme (background, surface, text, primary, secondary, etc.). |
| `/admin/services` | CRUD for services (title, slug, subtitle, description, status). |
| `/admin/blogs` | CRUD for blog posts (title, slug, excerpt, content, author, etc.). |
| `/admin/case-studies` | CRUD for case studies. |
| `/admin/users` | User management. |
| `/admin/settings` | General settings. |

### 4.3 Page builder (edit page / edit section)

- **Pages list** → **Edit** opens a modal with: title, slug, status, and **sections**.
- Each section has a **type** (hero, services-grid, cta, about-hero, values-grid, contact-form, careers-list, etc.) and **data** (fields for that type).
- **Edit** on a section expands the section and shows type-specific fields (and optional “Import JSON”). Buttons like Edit, Remove, Move up/down are `type="button"` so they do not submit the form and close the modal.
- **Save** sends `PUT /cms/pages/:id` with normalized `content` (list of `{ type, data, id }`). Backend normalizes and stores it; public site then shows the updated page when it fetches by slug.

---

## 5. Backend API – Quick Reference

All under base URL (e.g. `http://localhost:8000`).

| Area | Methods | Path (examples) | Auth |
|------|---------|------------------|------|
| Auth | POST | `/auth/login` | No |
| Pages | GET | `/cms/pages`, `/cms/pages/slug/{slug}`, `/cms/pages/{id}` | Optional; public only sees published when no token. |
| Pages | POST, PUT, DELETE | `/cms/pages`, `/cms/pages/{id}` | Admin/Editor |
| Services | GET | `/cms/services` | Optional |
| Services | POST, PUT, DELETE | `/cms/services`, `/cms/services/{id}` | Admin/Editor |
| Blogs | GET | `/cms/blogs` | Optional |
| Blogs | POST, PUT, DELETE | `/cms/blogs`, … | Admin/Editor |
| Case studies | GET | `/cms/case-studies` | Optional |
| Case studies | POST, PUT, DELETE | … | Admin/Editor |
| Site settings | GET | `/cms/site-settings/theme`, `/header`, `/footer` | No (public) |
| Site settings | POST | Same | Admin/Editor |
| Users/Roles | Various | `/cms/users`, `/cms/roles` | Admin |

- **Optional auth**: If the request has a valid Bearer token, the backend may return more (e.g. draft pages for editors). Without token, only published content is returned where applicable.
- **OpenAPI**: When `DEBUG` is true, `http://localhost:8000/docs` lists all endpoints.

---

## 6. Important Frontend Paths

| What | Where |
|------|--------|
| Public layout, theme script | `frontend/app/layout.tsx` |
| Theme CSS variables | `frontend/app/globals.css`, `frontend/lib/theme.ts` |
| Home page (fetch home by slug) | `frontend/app/page.tsx` |
| Dynamic page by slug | `frontend/app/[slug]/page.tsx` |
| Section rendering (all section types) | `frontend/components/SectionRenderer.tsx` |
| Header (nav, dropdowns, mobile toggle) | `frontend/components/AnimatedHeader.tsx` |
| Footer | `frontend/components/Footer.tsx` |
| Theme provider (load theme from API) | `frontend/components/ThemeProvider.tsx` |
| API client (axios + auth header, 401 handling) | `frontend/lib/api.ts` |
| SWR fetcher and cache config | `frontend/lib/swr.ts` |
| Admin layout (auth check, sidebar) | `frontend/app/admin/layout.tsx` |
| Admin pages list + edit modal | `frontend/app/admin/pages/page.tsx` |
| Page builder (sections, add/edit/remove) | `frontend/app/admin/pages/draggable-page-builder.tsx` |
| Section type definitions (for builder) | `frontend/app/admin/pages/enhanced-builder.tsx` |

---

## 7. Important Backend Paths

| What | Where |
|------|--------|
| App creation, CORS, routers | `backend/app/main.py` |
| Page API (create, list, get by id/slug, update, delete) | `backend/app/api/routes/page.py` |
| Page schemas (content list normalized) | `backend/app/api/schemas/page.py` |
| Page service (DB logic) | `backend/app/api/services/page.py` |
| Services, blogs, case studies | `backend/app/api/routes/` and `services/` |
| Site settings (theme, header, footer) | `backend/app/api/routes/site_settings.py`, `services/site_settings.py` |
| Auth (login, JWT) | `backend/app/auth/` |
| DB session and init | `backend/app/db/session.py`, `init_db.py` |
| Models (Page, Service, Blog, etc.) | `backend/app/models/` |

---

## 8. Data Population and Default Content

- **Script**: `backend/populate_socialit_data.py`
- **Purpose**: Creates or updates default content: services, case studies, blogs, **home** page, **about**, **contact**, **careers** pages, theme, header, footer.
- **When to run**: After DB init and after creating an admin user (e.g. `admin@socialit.com`). Run from `backend` with the project’s Python/venv:
  - `python populate_socialit_data.py`
- **Idempotent**: Re-running updates existing records (e.g. same slugs); it does not duplicate content. Safe to run multiple times.

---

## 9. End-to-End Flows (summary)

- **View homepage**: Browser → Next.js `/` → `GET /cms/pages/slug/home` → response `content` → SectionRenderer → HTML. Theme and header/footer come from site-settings.
- **View /about**: Same with `GET /cms/pages/slug/about`.
- **Edit a page in admin**: Login → Admin → Pages → Edit → change sections/data → Save → `PUT /cms/pages/:id` with new `content` → DB updated. Next public load of that slug gets the new content.
- **Change theme**: Admin → Theme → save → `POST /cms/site-settings/theme`. ThemeProvider (or layout) fetches theme and applies CSS variables so the whole site (and admin) uses the new colors.

---

## 10. Troubleshooting

| Issue | Check |
|-------|--------|
| Public page blank or wrong | Slug in URL must match page slug in DB. Page must be **published**. Inspect `GET /cms/pages/slug/<slug>` and `content` shape. |
| Admin edit modal closes immediately | Fixed by: no redirect on 401 in admin (show banner instead), and section buttons use `type="button"` so they don’t submit the form. |
| Services dropdown / mobile menu not working | Header was updated so Services opens a dropdown (desktop) and the hamburger toggles the mobile menu. Ensure header config from API has dropdown type and children for Services. |
| Theme not updating | Hard refresh or clear `localStorage` (site may cache theme). Ensure backend theme endpoint returns the new values. |
| 401 when saving in admin | Token expired. Re-login; session-expired banner should appear instead of redirect if you’re already in admin. |

For **setup, env vars, and first run**, use [README.md](README.md). This guide is for understanding how the project works once it’s running.
