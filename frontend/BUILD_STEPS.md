# Frontend build steps

This document describes how the frontend was built against the FastAPI CMS backend.

---

## Step 1: Foundation ✅
- Tailwind CSS, env, root layout, home page

## Step 2: API layer ✅
- `app/api-client.ts` – axios client, auth header, 401 → redirect to `/admin/login`
- `getCurrentUserId()` – reads user id from JWT for blog author

## Step 3: Public layout ✅
- `components/Header.tsx` – logo, nav, CTA (from API or defaults)
- `components/Footer.tsx` – copyright, columns (from API or defaults)
- `components/PublicLayout.tsx` – wraps public pages with Header + Footer
- Home page wrapped in PublicLayout

## Step 4: Home page ✅
- Fetch `GET /cms/pages/slug/home`, section renderer (hero, text, image, features, cta)
- Admin homepage builder at `/admin/homepage`

## Step 5: Dynamic pages and lists ✅
- `/[slug]` – CMS pages by slug (e.g. /about); `/home` redirects to `/`
- `/contact` – static contact placeholder (header CTA points here)
- `/services`, `/services/[slug]` – list and detail
- `/blogs`, `/blogs/[slug]` – list and detail
- `/case-studies`, `/case-studies/[slug]` – list and detail

## Step 6: Admin ✅
- `/admin/login` – POST `/auth/login`, store token, redirect to `/admin`
- `/admin` – dashboard with links and content counts
- `/admin/layout` – auth check, nav: Homepage, Services, Blogs, Case studies, Header, Footer, Theme
- `/admin/homepage` – edit homepage sections (add/reorder/edit/remove, PUT page)
- `/admin/header`, `/admin/footer`, `/admin/theme` – JSON editors, PUT to `/cms/site-settings/*`
- `/admin/services` – list, new, edit, delete (CRUD)
- `/admin/blogs` – list, new, edit, delete (CRUD; author from JWT)
- `/admin/case-studies` – list, new, edit, delete (CRUD)

## Site settings from API ✅
- **Theme:** `GET /cms/site-settings/theme` → CSS variables on `:root`
- **Header:** `GET /cms/site-settings/header` → logo, menu, CTA, styling
- **Footer:** `GET /cms/site-settings/footer` → columns, copyright (`{year}`), styling
- **`components/SiteSettingsProvider.tsx`** – `useSiteSettings()`; PublicLayout uses it for Header/Footer/theme

## Other ✅
- `app/not-found.tsx` – global 404 with link back to home
- All API usage via `app/api-client.ts` (no `app/lib` dependency)

## Deployment (Vercel)
- Set **Root Directory** to `frontend`
- Env: `NEXT_PUBLIC_API_URL` = backend URL (no trailing slash)
- Backend must allow frontend origin in `CORS_ORIGINS`
