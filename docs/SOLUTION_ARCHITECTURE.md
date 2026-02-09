# Social IT — Enterprise Platform Solution Architecture

**Principal focus: how the site looks and feels first; then system design and implementation.**

This document describes the target architecture for Social IT: a public marketing site, AI chatbot, and headless CMS where **all content, UI text, section order, visibility, colors, spacing, typography, CTAs, navigation, chatbot behaviour, FAQs, and forms** are controlled from the Admin CMS. The frontend only renders data from APIs.

---

## 1. Core Goal

### Design principle: visual and UX first

- **Look and feel** — Typography, colour, spacing, and component styling are defined in the CMS (Design System) and applied consistently across the public site and admin.
- **Content and structure** — Every headline, paragraph, CTA label, and section order comes from the CMS; no hardcoded marketing copy.
- **Component visibility** — Sections and components can be toggled on/off and reordered per page or globally.
- **Single source of truth** — Backend/CMS own all content and design tokens; frontend fetches and renders.

### What the CMS controls

| Area | Controlled from CMS |
|------|---------------------|
| Website content | Pages, sections, blocks, services, industries, blogs, case studies, careers, contact |
| UI text | Labels, placeholders, button text, error messages, empty states |
| Section ordering | Drag-and-drop page builder; section sequence stored per page |
| Component visibility | Per-section or per-component flags (show/hide) |
| Colors, spacing, typography | Design tokens (colors, fonts, spacing scale, radius, shadows) |
| CTA labels & links | Stored per component (e.g. hero CTA, footer CTA) |
| Navigation | Header menus, submenus, footer columns and links |
| Chatbot | System prompt, knowledge sources, intents, tone, fallbacks, escalation |
| FAQs | FAQ content and ordering |
| Forms | Form definitions, fields, validation messages, submit behaviour |

---

## 2. Platform Architecture

### High-level architecture (textual)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js (App Router)     │  Admin CMS Panel (Next.js)  │  Chatbot Widget   │
│  - Public marketing site  │  - Page builder              │  - Embedded UI    │
│  - SSR/ISR where needed   │  - Content/design/nav        │  - RAG + config   │
│  - Design tokens from API │  - Media, chatbot config     │  - CMS-driven     │
└──────────────┬────────────┴──────────────┬───────────────┴────────┬─────────┘
               │                            │                        │
               │  REST / optional WS         │  REST (JWT)             │  REST
               ▼                            ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  FastAPI (or Node.js) Backend                                                 │
│  - Public routes: pages, theme, nav, content (services, blogs, etc.)          │
│  - Admin routes: CRUD for all CMS entities (auth required)                    │
│  - Chatbot API: chat, config, knowledge (admin + public chat endpoint)        │
│  - Auth: JWT, RBAC, optional API keys for server-side                          │
└──────────────┬───────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA & AI LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  PostgreSQL           │  Vector DB (Qdrant / Pinecone)  │  AI (OpenAI /       │
│  - Users, roles       │  - Embeddings of CMS content   │    OpenRouter /     │
│  - Pages, sections    │  - RAG retrieval for chatbot   │    local LLM)       │
│  - Content, media     │                                 │  - Chat completion  │
│  - Design tokens, nav │                                 │  - Intent handling  │
│  - Chatbot config     │                                 │                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data flow (summary)

1. **Public site**  
   Next.js requests page by slug (or ID) and optionally theme/nav. API returns page schema (sections + content). Frontend maps section types to components and applies design tokens. No business or copy logic in the frontend beyond rendering.

2. **Admin panel**  
   Authenticated users manage pages (drag-and-drop sections), content (services, blogs, etc.), design system (colors, fonts, spacing), navigation, media, and chatbot. All changes persist via REST; frontend stays a thin UI over APIs.

3. **Chatbot**  
   Config (prompt, intents, tone, knowledge sources) stored in DB and optionally in vector store. Chat request hits backend; backend runs RAG over CMS content and knowledge docs, then calls LLM. Response and optional escalation/lead capture use CMS-defined flows.

### Deployment model

- **Frontend**: Vercel / Netlify / static + server (Next.js); env points to backend API.
- **Backend**: FastAPI (or Node) on a container/VM (e.g. Render, Fly, AWS ECS); connects to PostgreSQL and (if used) vector DB and LLM provider.
- **Database**: Managed PostgreSQL (e.g. Render, Supabase, RDS); migrations applied from codebase.
- **Vector DB**: Qdrant Cloud / Pinecone (or self-hosted) for RAG; populated by backend from CMS content and uploaded docs.
- **Secrets**: API keys, DB URL, JWT secret in env; no secrets in repo.

---

## 3. CMS Modules Required

### A. Page builder

**Purpose:** Create and edit pages: add sections, choose component type, assign content, drag-and-drop order.

**Schema (conceptual):**

- **Page**: `id`, `slug`, `title`, `status` (draft | published), `content` (ordered list of sections), `meta` (SEO), `created_at`, `updated_at`.
- **Section (inline in content):** `id`, `type` (hero | cards | feature_grid | tabs | accordion | testimonials | logos | pricing | cta | faq | …), `data` (JSON per type), optional `visible` (boolean).

**Endpoints (REST):**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cms/pages` | List pages (admin: all; public: optional filtered). |
| GET | `/cms/pages/slug/:slug` | Get page by slug (public or admin). |
| GET | `/cms/pages/:id` | Get page by ID (admin). |
| POST | `/cms/pages` | Create page (admin). Body: `slug`, `title`, `content` (array), `status`. |
| PUT | `/cms/pages/:id` | Update page (admin). Body: partial page (e.g. `content`, `title`, `status`). |
| DELETE | `/cms/pages/:id` | Delete page (admin). |

**Behaviour:**  
Admin UI: list pages → new page → add sections (choose type, fill data) → drag to reorder → save. Frontend loads page by slug and renders `content[]` with a section renderer keyed by `type`.

---

### B. Component library

**Purpose:** Reusable section types; each has a fixed `type` and a JSON `data` shape. Frontend maps `type` → component and passes `data`.

**Canonical list (how the site looks — components drive layout and visuals):**

| Type | Purpose | Example data shape |
|------|---------|--------------------|
| **hero** | Top banner, headline, subhead, CTA | `heading`, `subheading`, `badge`, `buttonText`, `buttonLink`, `textColor`, `gradientTo`, `useGradient` |
| **text** | Rich text block | `title`, `content` |
| **image** | Single image + caption | `url`, `alt`, `caption` |
| **cards** | Card grid | `title`, `subtext`, `items[]` (title, description, image, link) |
| **feature_grid** | Feature list with icons/text | `title`, `subtext`, `items[]` (title, description, icon?) |
| **tabs** | Tabbed content | `title`, `tabs[]` (label, content) |
| **accordion** | Expandable FAQs | `title`, `items[]` (question, answer) |
| **testimonials** | Quotes and attributions | `title`, `subtext`, `items[]` (quote, author, role, company, image_url) |
| **logos** | Logo strip / trust bar | `title`, `logos[]` (url, alt, link?) |
| **pricing** | Pricing table/cards | `title`, `plans[]` (name, price, period, features[], ctaText, ctaLink) |
| **cta** | Call-to-action block | `heading`, `subtext`, `buttonText`, `buttonLink`, `secondaryText`, `secondaryLink` |
| **faq** | FAQ section | `title`, `items[]` (question, answer) |
| **stats** | Number highlights | `title`, `subtext`, `items[]` (value, label) |

All of these are **visual building blocks**; their look (colours, spacing, typography) comes from Design System (tokens), not from component data.

---

### C. Design system controls

**Purpose:** Site-wide look: colours, fonts, spacing, radius, shadows. Stored as key-value (design tokens); frontend applies them (CSS variables or theme context).

**Schema (key-value store, e.g. site_settings or design_tokens):**

- **Colors:** `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `textSecondary`, `border`, `success`, `warning`, `error`, `info`.
- **Typography:** `fontFamilyHeading`, `fontFamilyBody`, optional scale (e.g. `fontSizeBase`, multipliers).
- **Spacing:** `spacingUnit` (e.g. 4px), or named scale (e.g. `space.sm`, `space.md`, `space.lg`).
- **Border radius:** `radiusSm`, `radiusMd`, `radiusLg`.
- **Shadows:** `shadowSm`, `shadowMd`, `shadowLg` (CSS shadow values).

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cms/site-settings/theme` | Get theme (public). |
| PUT | `/cms/site-settings/theme` | Update theme (admin). Body: object of token keys/values. |

**Frontend:** On load, fetch theme and inject into CSS variables (e.g. `--color-primary`, `--font-heading`) or React context so every component uses the same look.

---

### D. Navigation manager

**Purpose:** Header menus, optional submenus, footer link columns. Stored as structured JSON; frontend renders from API.

**Schema (conceptual):**

- **Header:** `logo` (text | image, text, subtext, image_url, link), `menu_items[]` (id, label, href, open_in_new_tab?), `cta_button` (enabled, text, href, color?), `styling` (background_color, text_color, sticky, padding).
- **Footer:** `columns[]` (title, links[] (label, href)), `copyright_text` (e.g. use `{year}`), `styling` (background_color, text_color, link_color).

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cms/site-settings/header` | Get header config (public). |
| PUT | `/cms/site-settings/header` | Update header (admin). |
| GET | `/cms/site-settings/footer` | Get footer config (public). |
| PUT | `/cms/site-settings/footer` | Update footer (admin). |

---

### E. Content manager

**Purpose:** Services, industries, blogs, case studies, careers/jobs, and form definitions. Each entity has its own model and CRUD.

**Entities and typical endpoints:**

- **Services:** `GET/POST /cms/services`, `GET/PUT/DELETE /cms/services/:id`. Fields: title, slug, description, image, order, etc.
- **Industries:** Same pattern (e.g. `/cms/industries`). Used for industry-focused pages or filters.
- **Blogs:** `GET/POST /cms/blogs`, `GET/PUT/DELETE /cms/blogs/:id`, `GET /cms/blogs/slug/:slug`. Fields: title, slug, excerpt, body, author, published_at, image.
- **Case studies:** Same idea; optional link to industry/service.
- **Careers / Jobs:** `GET/POST /cms/jobs`, `GET/PUT/DELETE /cms/jobs/:id`. Fields: title, location, type, description, apply_link, open/close.
- **Forms:** Form definitions (name, fields[], submit action, success message). Submissions → Leads (see Database).

---

### F. Media manager

**Purpose:** Upload and serve images, videos, documents; reference by URL or ID in content.

**Schema:** `id`, `file_name`, `mime_type`, `url` (or path), `alt`, `size`, `created_at`, optional `folder`/tags.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cms/media` | List media (admin), with pagination/filters. |
| POST | `/cms/media` | Upload file (admin); multipart. |
| GET | `/cms/media/:id` | Get one (admin or public URL). |
| DELETE | `/cms/media/:id` | Delete (admin). |

---

### G. Chatbot manager

**Purpose:** Configure behaviour, knowledge, and escalation from the CMS.

**Stored config:**

- **System prompt** — Editable text; sent to LLM as system message.
- **Knowledge sources** — References to CMS content (e.g. services, FAQs) and/or uploaded documents; embedded into vector DB for RAG.
- **Intents** — Services inquiry, pricing, careers, contact sales, book meeting, technical questions; each can be enabled/disabled and have optional canned replies or flows.
- **Response tone** — Short instruction (e.g. “professional, concise”) in prompt or config.
- **Fallback messages** — When no intent matches or RAG returns nothing.
- **Escalation rules** — e.g. “if intent = contact_sales, create lead and show human contact option”.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cms/chatbot/config` | Get public config (prompt summary, intents on/off). |
| GET | `/cms/chatbot/config/full` | Full config (admin). |
| PUT | `/cms/chatbot/config` | Update config (admin). |
| POST | `/cms/chatbot/knowledge` | Ingest document or CMS slice into vector DB (admin). |
| POST | `/cms/chatbot/chat` | Send user message; return assistant reply (and optional escalation). |

---

## 4. AI chatbot requirements

- **Answers from CMS:** RAG over site content (services, FAQs, blogs, etc.) and any uploaded knowledge docs.
- **Intents:** Services inquiry, pricing inquiry, careers, contact sales, book meeting, technical questions; configurable on/off and behaviour from CMS.
- **Configurable from CMS:** System prompt, knowledge sources, intent toggles, tone, fallbacks, escalation rules.
- **Admin capabilities:** Edit system prompt, add/remove knowledge documents, enable/disable intents, set response tone, define escalation (e.g. create lead, show contact form).

**Flow (conceptual):** User message → optional intent detection → RAG retrieval from vector store → build prompt with context + system prompt → LLM call → response (and optional lead/escalation). All config and content come from DB/CMS.

---

## 5. Database schema (conceptual)

Tables below are additive and conceptual; existing tables (users, pages, services, blogs, etc.) stay as-is. New ones can be introduced without breaking current behaviour.

- **users** — id, email, hashed_password, role_id, created_at, etc.
- **roles** — id, name, description.
- **permissions** — id, name, resource, action.
- **role_permissions** — role_id, permission_id.
- **pages** — id, slug, title, status, content (JSONB), meta (JSONB), created_at, updated_at.
- **sections** — (optional; or sections live inside pages.content as JSON).
- **components** — (optional; or component types are fixed in code, data in section.data).
- **content_blocks** — (optional; for reusable blocks referenced by sections).
- **design_tokens** — id, key, value, group (e.g. color, spacing); or single theme JSON in site_settings.
- **navigation** — id, name (e.g. header, footer), config (JSONB).
- **media** — id, file_name, mime_type, url, alt, size, created_at.
- **chatbot_knowledge** — id, source_type (cms_page | upload), reference (url or file_id), embedding_id?, updated_at.
- **chatbot_prompts** — id, name (e.g. system), content, is_active, updated_at.
- **chatbot_config** — id, key-value or JSON (intents, tone, fallbacks, escalation).
- **leads** — id, form_id, payload (JSONB), created_at, source (e.g. contact, chatbot).
- **conversations** — id, user_id or session_id, messages (JSONB), created_at, updated_at.
- **audit_logs** — id, user_id, action, resource, resource_id, payload, created_at.

Version history and draft/publish can be implemented with a `versions` table or status + published_at on pages/content.

---

## 6. API design (summary)

- **Public:** REST, read-only for pages, theme, nav, services, blogs, case studies, jobs, contact info. No auth.
- **Admin:** Same base URL; JWT in `Authorization: Bearer <token>`. All write operations (create/update/delete) require auth and appropriate role.
- **Auth middleware:** Validate JWT; load user and permissions; allow or deny by resource/action (RBAC).

**Example — get page by slug (public):**

```http
GET /cms/pages/slug/home
```

Response:

```json
{
  "id": "uuid",
  "slug": "home",
  "title": "Home",
  "status": "published",
  "content": [
    { "id": "s1", "type": "hero", "data": { "heading": "...", "subheading": "...", "buttonText": "Get started", "buttonLink": "/contact" } },
    { "id": "s2", "type": "features", "data": { "title": "Features", "items": [] } }
  ]
}
```

**Example — update theme (admin):**

```http
PUT /cms/site-settings/theme
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "primary": "#0066B3",
  "text": "#1A1A2E"
}
```

---

## 7. Frontend rendering logic

- **Page fetch:** For a given route (e.g. `/`, `/about`, `/services/[slug]`), frontend calls `GET /cms/pages/slug/:slug` (or equivalent). Response includes `content[]` (ordered sections).
- **Component mapping:** A single `SectionRenderer` (or similar) receives each section; it switches on `section.type` and renders the matching component (Hero, Text, Cards, CTA, FAQ, etc.) with `section.data`. No copy or structure hardcoded in the component beyond layout and fallbacks.
- **Design tokens:** On app load (or layout), frontend fetches `GET /cms/site-settings/theme` and applies values to CSS variables or theme context (e.g. `--color-primary`, `--font-heading`). All components use these variables so the site look is fully driven by CMS theme.
- **Chatbot config:** Widget or chat page loads `GET /cms/chatbot/config` (and optionally full config if needed). It uses this for behaviour (e.g. which intents to show, placeholder text) and sends messages to `POST /cms/chatbot/chat`.

---

## 8. Security

- **Role-based access:** Admin routes require JWT and a role that has permission for the resource (e.g. pages:edit, theme:edit). Public routes have no auth.
- **Audit logs:** Log admin actions (who changed what, when) in `audit_logs` for compliance and debugging.
- **Version history:** Keep draft and published versions of pages (or revisions) so changes can be reverted; publish only when intended.
- **Draft/publish workflow:** Pages (and optionally other content) have `status`: draft vs published. Public API returns only published content unless an admin override is explicitly allowed.

---

## 9. Implementation note

This document is the **target architecture and spec**. Implement in phases: keep existing APIs and behaviour unchanged; add new endpoints and tables alongside; then switch frontend to consume new APIs and design tokens so that **how the site looks** is fully driven by the CMS, without affecting existing performance or demographics.
