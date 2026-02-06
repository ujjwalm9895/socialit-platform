# Deploy Frontend on Vercel (Backend Already Deployed)

This guide deploys only the **Next.js frontend** to Vercel. Your **backend is already deployed** (e.g. on Render or elsewhere). The frontend will talk to it using the API URL you set in Vercel.

---

## What You Need Before Starting

- Your **backend URL** (e.g. `https://your-api.onrender.com`) — no trailing slash.
- A **Vercel account** (sign in with GitHub is easiest).
- This repo pushed to **GitHub** (or another Git provider Vercel supports).

---

## Step 1: Open Vercel and Add the Project

1. Go to **https://vercel.com** and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project**.
3. Import your **Git repository** (e.g. `socialit-platform`).
4. **Do not click Deploy yet** — you must set the root directory and env vars first.

---

## Step 2: Set Root Directory to `frontend`

The app code lives in the **`frontend`** folder. Vercel must use that as the project root.

1. On the import/configure page, find **Root Directory**.
2. Click **Edit**.
3. Enter: **`frontend`**.
4. Confirm. You should see **Root Directory: frontend**.

If you skip this, the build will fail (Vercel would look for the app in the repo root).

---

## Step 3: Add Environment Variables

The frontend needs your **backend URL** so it can call the API.

1. Expand **Environment Variables** on the same page.
2. Add:

   | Name                     | Value                          |
   |--------------------------|---------------------------------|
   | `NEXT_PUBLIC_API_URL`    | Your backend URL (no trailing slash), e.g. `https://your-api.onrender.com` |

3. Optional (for preview links in admin):

   | Name                     | Value                          |
   |--------------------------|---------------------------------|
   | `NEXT_PUBLIC_SITE_URL`   | Your Vercel URL, e.g. `https://your-project.vercel.app` |

4. For each variable, select **Production** (and **Preview** if you want). Click **Add**.

---

## Step 4: Deploy

1. Click **Deploy**.
2. Wait for the build to finish (usually 1–3 minutes).
3. When it’s done, click **Visit** to open your site.

Your frontend is now live. It will call your existing backend using `NEXT_PUBLIC_API_URL`.

---

## Step 5: Allow the Vercel URL in Backend CORS

The browser will block API requests unless your backend allows your Vercel domain.

1. Open your **backend** hosting (e.g. Render dashboard).
2. Go to your backend service → **Environment** (or **Environment Variables**).
3. Find **CORS_ORIGINS** (or equivalent).
4. Add your Vercel URL, e.g. **`https://your-project.vercel.app`**.
   - If there are already other origins, add this one **comma-separated, no spaces**.
5. Save. The backend may redeploy automatically.

After this, the frontend can talk to the API without CORS errors.

---

## Checklist

- [ ] Signed in at vercel.com and imported the repo.
- [ ] **Root Directory** set to **`frontend`**.
- [ ] **`NEXT_PUBLIC_API_URL`** set to your backend URL (no trailing slash).
- [ ] Deploy completed successfully.
- [ ] Backend **CORS_ORIGINS** includes your Vercel URL.

---

## Build and Project Details (Reference)

- **Framework:** Next.js 16 (App Router).
- **Build command:** `npm run build` (runs `next build --webpack`).
- **Output:** Standard Next.js standalone/server output; Vercel runs `next start`.
- **Path alias:** `@/` points to the `frontend` folder (via `tsconfig.json` and `next.config.ts`). All imports use `@/lib/...`, `@/components/...`, etc., so the root directory **must** be `frontend`.

---

## Dynamic Routes (Already Configured)

Some pages are **dynamic**: they depend on the URL (e.g. `/[slug]`, `/blogs/my-post`, `/services/web-dev`) and fetch content from your API at **request time**, not at build time.

| Route | Purpose |
|-------|--------|
| `/[slug]` | CMS pages by slug (e.g. `/about`, `/contact`, `/home`). |
| `/blogs/[slug]` | Single blog post. |
| `/services/[slug]` | Single service. |
| `/case-studies/[slug]` | Single case study. |

**How it’s set up**

- Each of these segments has a **layout** that exports `dynamic = "force-dynamic"`, so Next.js does **not** try to pre-render them at build time.
- The actual page components are **client-side** (`"use client"`): they read the slug from the URL and fetch data from your backend. No list of slugs is needed at build time.
- **Vercel** serves the route shell and the client loads the right content from your API. New pages, blogs, or services you add in the CMS work as soon as you open their URL — no redeploy needed.

You don’t need to configure anything extra on Vercel for these; the project is already set up for dynamic rendering.

---

## If the Build Fails

**“Module not found: Can't resolve '@/lib/api'” or “Can't resolve '@/lib/env'”**

This happens when the **`frontend/lib`** folder is missing from the code Vercel builds. The app imports `@/lib/api`, `@/lib/env`, `@/lib/swr`, and `@/lib/theme`; those files must exist under `frontend/lib/`.

1. **Root Directory must be `frontend`**  
   Vercel → Project → **Settings** → **General** → **Root Directory** → set to **`frontend`** → save. If the root is wrong, `@` points to the repo root and there is no `lib` there.

2. **Commit and push the `lib` folder**  
   The repo Vercel builds from must contain:
   - `frontend/lib/api.ts`
   - `frontend/lib/env.ts`
   - `frontend/lib/swr.ts`
   - `frontend/lib/theme.ts`  
   If these were added only on your machine, run `git add frontend/lib` and `git commit` and `git push`, then redeploy on Vercel.

**“NEXT_PUBLIC_API_URL is not defined” or API calls fail in the browser**

- Add **`NEXT_PUBLIC_API_URL`** in Vercel (**Settings** → **Environment Variables**), then **Redeploy** (Production).

**CORS errors in the browser console**

- Add your **Vercel URL** (e.g. `https://your-project.vercel.app`) to **CORS_ORIGINS** in your backend environment and redeploy the backend.

---

## Changing the Backend URL Later

1. Vercel → your project → **Settings** → **Environment Variables**.
2. Edit **`NEXT_PUBLIC_API_URL`** to the new backend URL (no trailing slash).
3. **Redeploy** the project (Deployments → … → Redeploy) so the new value is baked into the build.
