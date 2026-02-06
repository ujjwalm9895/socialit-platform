# Frontend build steps

We're building the frontend step by step against your existing backend (FastAPI CMS).

---

## Step 1: Foundation ✅
- Tailwind CSS, env, root layout, home page

## Step 2: API layer ✅
- `app/api-client.ts` – axios client, auth header, 401 redirect

## Step 3: Public layout ✅
- `components/Header.tsx` – logo, nav (Services, Blogs, Case Studies, Admin)
- `components/Footer.tsx` – copyright, links
- `components/PublicLayout.tsx` – wraps public pages with Header + Footer
- Home page wrapped in PublicLayout

## Step 4: Home page ✅
- Fetch `/cms/pages/slug/home`, section renderer (hero, text, image, features, cta)
- Admin homepage builder at `/admin/homepage`

## Step 5: Dynamic pages and lists ✅
- `/[slug]` – CMS pages by slug (e.g. /about, /contact); /home redirects to /
- `/services`, `/services/[slug]` – list and detail
- `/blogs`, `/blogs/[slug]` – list and detail (API: GET /cms/blogs/slug/:slug)
- `/case-studies`, `/case-studies/[slug]` – list and detail (API: GET /cms/case-studies/slug/:slug)

## Step 6: Admin ✅
- `/admin/login`, `/admin` layout (auth check), `/admin/homepage` builder

---

## Site settings from API ✅
- **Theme:** Fetched from `GET /cms/site-settings/theme`, applied as CSS variables (`--color-primary`, etc.) on `:root`.
- **Header:** Fetched from `GET /cms/site-settings/header`. Renders logo (text or image), menu items, CTA button, and styling (background, text color, sticky, padding). Falls back to default nav if API fails or returns empty.
- **Footer:** Fetched from `GET /cms/site-settings/footer`. Renders copyright (supports `{year}`), columns with links, and styling. Falls back to default links if API fails or returns empty.
- **`components/SiteSettingsProvider.tsx`** – `useSiteSettings()` hook fetches theme, header, footer on mount; `PublicLayout` uses it and passes config to Header/Footer.

## Next (optional)
- Admin UI to edit header, footer, theme (PUT `/cms/site-settings/header`, etc.) – backend already has the endpoints.
- Admin CRUD for services, blogs, case studies (currently only homepage builder).
- Dashboard stats on `/admin`.
