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
    { href: "/admin/homepage", label: "Homepage", description: "Edit homepage sections" },
    { href: "/admin/services", label: "Services", count: counts?.services, description: "Manage services" },
    { href: "/admin/blogs", label: "Blogs", count: counts?.blogs, description: "Manage blog posts" },
    { href: "/admin/case-studies", label: "Case studies", count: counts?.caseStudies, description: "Manage case studies" },
    { href: "/admin/header", label: "Header", description: "Site header & navigation" },
    { href: "/admin/footer", label: "Footer", description: "Site footer" },
    { href: "/admin/theme", label: "Theme", description: "Colors & branding" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your site content and settings.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, label, count, description }) => (
          <Link
            key={href}
            href={href}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-200 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{label}</span>
              {count !== undefined && (
                <span className="text-sm text-gray-500">{count} item{count !== 1 ? "s" : ""}</span>
              )}
            </div>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
