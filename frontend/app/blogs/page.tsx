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
          <div className="flex flex-col items-center gap-3 py-12 text-zensar-muted">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading posts...</p>
          </div>
        ) : published.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zensar-surface border border-gray-200">
            <p className="text-zensar-muted">No blog posts yet. Check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {published.map((b) => (
              <li key={b.id} className="hover-lift border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <Link href={`/blogs/${b.slug}`} className="block group">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">{b.title}</h2>
                  {b.excerpt && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{b.excerpt}</p>}
                  <span className="inline-block mt-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Read more →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PublicLayout>
  );
}
