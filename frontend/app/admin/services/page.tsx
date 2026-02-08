"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type Service = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function AdminServicesPage() {
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Service[]>("/cms/services", { params: { limit: 500 } })
      .then((r) => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your services. Publish to show on the site.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="btn-flashy shrink-0 inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark"
        >
          New service
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Services page: AI & Machine Learning block</h2>
          <p className="text-slate-500 text-sm mt-0.5">Standalone section on the public Services page. Edit title, overview, services, products, benefits, and CTA.</p>
        </div>
        <Link
          href="/admin/services/ai-ml-section"
          className="shrink-0 text-primary text-sm font-medium hover:underline"
        >
          Edit →
        </Link>
      </div>

      <h2 className="text-lg font-semibold text-slate-900">Service listings</h2>
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-500">No services yet.</p>
          <Link href="/admin/services/new" className="inline-block mt-3 text-primary font-medium hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/services/${s.id}`}
                className="hover-lift flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{s.title}</span>
                  <span className="text-slate-400 text-sm ml-2">/{s.slug}</span>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${s.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {s.status}
                  </span>
                </div>
                <span className="text-primary text-sm font-medium shrink-0">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
