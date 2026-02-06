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

## Next (optional)
- Load header/footer/theme from `/cms/site-settings/*` and render in Header/Footer
- Admin CRUD for services, blogs, case studies (currently only homepage builder)
- Dashboard stats on `/admin`
