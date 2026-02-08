"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../api-client";

type Counts = {
  services: number;
  blogs: number;
  caseStudies: number;
} | null;

export default function AdminPage() {
  const [counts, setCounts] = useState<Counts>(null);

  useEffect(() => {
    Promise.all([
      api.get<unknown[]>("/cms/services", { params: { limit: 500 } }).then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
      api.get<unknown[]>("/cms/blogs", { params: { limit: 500 } }).then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
      api.get<unknown[]>("/cms/case-studies", { params: { limit: 500 } }).then((r) => (Array.isArray(r.data) ? r.data.length : 0)),
    ])
      .then(([services, blogs, caseStudies]) => setCounts({ services, blogs, caseStudies }))
      .catch(() => setCounts({ services: 0, blogs: 0, caseStudies: 0 }));
  }, []);

  const [jobsCount, setJobsCount] = useState<number | null>(null);
  useEffect(() => {
    api.get<unknown[]>("/cms/jobs", { params: { limit: 500 } }).then((r) => setJobsCount(Array.isArray(r.data) ? r.data.length : 0)).catch(() => setJobsCount(0));
  }, []);

  const [pagesCount, setPagesCount] = useState<number | null>(null);
  useEffect(() => {
    api.get<unknown[]>("/cms/pages", { params: { limit: 500 } }).then((r) => setPagesCount(Array.isArray(r.data) ? r.data.length : 0)).catch(() => setPagesCount(0));
  }, []);

  const contentLinks = [
    { href: "/admin/homepage", label: "Homepage", description: "Edit sections and layout", count: undefined, icon: "🏠" },
    { href: "/admin/pages", label: "Pages", description: "Create and edit pages (drag-and-drop)", count: pagesCount ?? undefined, icon: "📄" },
    { href: "/admin/services", label: "Services", description: "Manage service offerings", count: counts?.services, icon: "⚡" },
    { href: "/admin/blogs", label: "Blogs", description: "Blog posts", count: counts?.blogs, icon: "📝" },
    { href: "/admin/case-studies", label: "Case studies", description: "Work & portfolio", count: counts?.caseStudies, icon: "📂" },
    { href: "/admin/careers", label: "Careers", description: "Job listings", count: jobsCount ?? undefined, icon: "💼" },
  ];
  const pageLinks = [
    { href: "/admin/about", label: "About page", description: "Company story and team", icon: "ℹ️" },
    { href: "/admin/contact", label: "Contact info", description: "Email, phone, address", icon: "✉️" },
  ];
  const siteLinks = [
    { href: "/admin/header", label: "Header", description: "Logo and navigation", icon: "🔝" },
    { href: "/admin/footer", label: "Footer", description: "Links and copyright", icon: "🔻" },
    { href: "/admin/theme", label: "Theme", description: "Colors and branding", icon: "🎨" },
  ];

  type CardLink = { href: string; label: string; description: string; count?: number; icon: string };
  function CardGrid({ links }: { links: CardLink[] }) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map(({ href, label, description, count, icon }) => (
          <Link key={href} href={href} className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-xl group-hover:bg-primary/10 transition-colors" aria-hidden>{icon}</span>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{label}</span>
              {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
            </div>
            {count !== undefined && <span className="shrink-0 text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">{count}</span>}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your site content and settings. Choose a section below.</p>
      </div>
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Content</h2>
        <CardGrid links={contentLinks} />
      </section>
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Pages</h2>
        <CardGrid links={pageLinks} />
      </section>
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Site</h2>
        <CardGrid links={siteLinks} />
      </section>
    </div>
  );
}
