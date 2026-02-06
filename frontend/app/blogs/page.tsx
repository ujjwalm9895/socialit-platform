"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

type Blog = { id: string; title: string; slug: string; excerpt?: string; status?: string; published_at?: string };

export default function BlogsPage() {
  const [list, setList] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Blog[]>("/cms/blogs")
      .then((res) => setList(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const published = list.filter((b) => b.status === "published");

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blogs</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : published.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <ul className="space-y-6">
            {published.map((b) => (
              <li key={b.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition">
                <Link href={`/blogs/${b.slug}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">{b.title}</h2>
                  {b.excerpt && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{b.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PublicLayout>
  );
}
