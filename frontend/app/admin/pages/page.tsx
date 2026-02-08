"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type PageRecord = { id: string; slug: string; title: string; status: string; created_at: string };

export default function AdminPagesListPage() {
  const [list, setList] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PageRecord[]>("/cms/pages", { params: { limit: 100 } })
      .then((r) => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500">Loading pages…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
          <p className="text-slate-500 mt-1">Create and edit pages with drag-and-drop sections. Publish to show on the site.</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="btn-flashy shrink-0 inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark"
        >
          New page
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-500 mb-4">No pages yet. Create your first page or set up the homepage from the Homepage link.</p>
          <Link href="/admin/pages/new" className="btn-flashy inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark">
            Create page
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={"/admin/pages/" + p.id}
                className="group flex items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-slate-900">{p.title}</span>
                  <span className="text-slate-400 text-sm ml-2">/{p.slug}</span>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {p.status}
                  </span>
                </div>
                <span className="text-primary text-sm font-medium shrink-0 group-hover:underline">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-slate-500">
        Tip: The <Link href="/admin/homepage" className="text-primary hover:underline">Homepage</Link> link edits the page with slug <code className="bg-slate-100 px-1 rounded">home</code>. You can also edit it from the list above.
      </p>
    </div>
  );
}
