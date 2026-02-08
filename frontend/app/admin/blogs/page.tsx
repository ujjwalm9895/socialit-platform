"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function AdminBlogsPage() {
  const [list, setList] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Blog[]>("/cms/blogs", { params: { limit: 500 } })
      .then((r) => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blogs</h1>
          <p className="text-slate-500 text-sm mt-1">Manage blog posts. Publish to show on the site.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="shrink-0 inline-flex items-center justify-center bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          New blog
        </Link>
      </div>
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-500">No blogs yet.</p>
          <Link href="/admin/blogs/new" className="inline-block mt-3 text-indigo-600 font-medium hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/blogs/${b.id}`}
                className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{b.title}</span>
                  <span className="text-slate-400 text-sm ml-2">/{b.slug}</span>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${b.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {b.status}
                  </span>
                </div>
                <span className="text-indigo-600 text-sm font-medium shrink-0">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
