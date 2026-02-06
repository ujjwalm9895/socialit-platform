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

  if (loading) return <p className="text-gray-500">Loading blogs...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
        <Link href="/admin/blogs/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          New blog
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="text-gray-500">No blogs. <Link href="/admin/blogs/new" className="text-indigo-600 hover:underline">Create one</Link>.</p>
      ) : (
        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white">
          {list.map((b) => (
            <li key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium text-gray-900">{b.title}</span>
                <span className="text-gray-500 text-sm ml-2">/{b.slug}</span>
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${b.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {b.status}
                </span>
              </div>
              <Link href={`/admin/blogs/${b.id}`} className="text-sm text-indigo-600 hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
