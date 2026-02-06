# Frontend build steps

We're building the frontend step by step against your existing backend (FastAPI CMS).

---

## Step 1: Foundation ✅
- Tailwind CSS
- `NEXT_PUBLIC_API_URL` env (see `.env.example`)
- `app/lib/env.ts` – `getApiUrl()`
- Root layout with max-width container and Tailwind
- Home page with basic styles

**Run:** `npm install` then `npm run dev`. Copy `.env.example` to `.env.local` and set your API URL.

---

## Step 2: API layer (next)
- Axios (or fetch) API client with base URL from `getApiUrl()`
- Optional: SWR for data fetching and caching

---

## Step 3: Public layout
- Header component (nav, logo placeholder)
- Footer component
- Optional: load theme/header/footer from `/cms/site-settings/*` and apply

---

## Step 4: Home page (real data)
- Fetch home page by slug (`/cms/pages/slug/home`) from API
- Simple section renderer for page content (hero, text, etc.)

---

## Step 5: Dynamic pages and lists
- `/[slug]` – CMS pages by slug (about, contact, etc.)
- `/services`, `/services/[slug]` – list and detail
- `/blogs`, `/blogs/[slug]` – list and detail
- `/case-studies`, `/case-studies/[slug]` – list and detail

---

## Step 6: Admin
- `/admin/login` – login (POST `/auth/login`), store JWT
- `/admin` layout – auth check, redirect to login if no token
- Dashboard and CRUD for pages, services, blogs, case studies, theme, header, footer

---

Say when to continue with **Step 2** (API layer).
