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

  const links = [
    { href: "/admin/homepage", label: "Homepage", description: "Edit homepage sections", icon: "🏠" },
    { href: "/admin/services", label: "Services", count: counts?.services, description: "Manage services", icon: "⚡" },
    { href: "/admin/blogs", label: "Blogs", count: counts?.blogs, description: "Manage blog posts", icon: "📝" },
    { href: "/admin/case-studies", label: "Case studies", count: counts?.caseStudies, description: "Manage case studies", icon: "📂" },
    { href: "/admin/header", label: "Header", description: "Site header & navigation", icon: "🔝" },
    { href: "/admin/footer", label: "Footer", description: "Site footer", icon: "🔻" },
    { href: "/admin/theme", label: "Theme", description: "Colors & branding", icon: "🎨" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back. Manage your site content and settings from the cards below.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label, count, description, icon }) => (
          <Link
            key={href}
            href={href}
            className="hover-lift block p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{icon}</span>
                <div>
                  <span className="font-semibold text-slate-900">{label}</span>
                  {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
                </div>
              </div>
              {count !== undefined && (
                <span className="shrink-0 text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {count} item{count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
