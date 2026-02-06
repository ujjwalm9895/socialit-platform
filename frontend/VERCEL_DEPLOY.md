# Deploy Frontend on Vercel (Easy Steps)

Follow these steps in order. Your app lives in the **frontend** folder, so Vercel must use that as the root.

---

## Step 1: Open Vercel

1. Go to **https://vercel.com**
2. Sign in (use **GitHub** so you can import your repo in one click)

---

## Step 2: Import Your Project

1. Click **Add New…** → **Project**
2. Find your repository (e.g. `socialit-platform`) and click **Import**
3. **Do not click Deploy yet** — configure in Step 3 and 4 first

---

## Step 3: Set Root Directory (Required)

1. On the import page, find **Root Directory**
2. Click **Edit**
3. Type: **`frontend`**
4. Confirm (you should see `frontend` next to Root Directory)

If you skip this, the build will fail because Vercel will look for the app in the repo root instead of the `frontend` folder.

---

## Step 4: Add Environment Variables

1. On the same page, expand **Environment Variables**
2. Add **one** variable (required):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_API_URL` | Your backend URL, e.g. `https://socialit-api.onrender.com` |

   - Use your **real** Render backend URL (no `http://` unless it really is HTTP).
   - **No trailing slash** (wrong: `https://xxx.onrender.com/`).

3. (Optional) Add a second variable for admin preview links:

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, e.g. `https://your-project.vercel.app` |

   You can set this after the first deploy when you know your Vercel URL.

4. For each variable, choose **Production** (and **Preview** if you want). Then click **Add**.

---

## Step 5: Deploy

1. Click **Deploy**
2. Wait 1–3 minutes for the build
3. When it’s done, click **Visit** to open your site

---

## Step 6: Allow Your Site in Backend CORS

So the browser can call your API from the new site:

1. Open **Render** → your **backend** service → **Environment**
2. Find **CORS_ORIGINS**
3. Add your Vercel URL, e.g. `https://your-project.vercel.app`  
   - If there are already other URLs, add this one **comma-separated, no spaces**
4. Save — Render will redeploy the backend

---

## Checklist

- [ ] Signed in at vercel.com
- [ ] Imported repo and set **Root Directory** to **`frontend`**
- [ ] Added **`NEXT_PUBLIC_API_URL`** (your Render backend URL, no trailing slash)
- [ ] Clicked Deploy and build succeeded
- [ ] Added the Vercel URL to backend **CORS_ORIGINS** on Render

---

## If the Build Fails

- **“Module not found: @/lib/…” or “Cannot find module”**  
  1. Root Directory must be **`frontend`**. In Vercel → Project → Settings → General, set **Root Directory** to **`frontend`**, save, and redeploy.  
  2. Ensure these files exist and are committed in your repo: **`frontend/lib/api.ts`**, **`frontend/lib/env.ts`**, **`frontend/lib/swr.ts`**, **`frontend/lib/theme.ts`**. If any are missing, add them and push.

- **“NEXT_PUBLIC_API_URL is not defined” or API calls fail**  
  → Add `NEXT_PUBLIC_API_URL` in Vercel (Project → Settings → Environment Variables), then redeploy.

- **CORS errors in the browser**  
  → Add your Vercel URL to **CORS_ORIGINS** in the Render backend and redeploy the backend.
