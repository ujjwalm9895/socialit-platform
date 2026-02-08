"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

type CaseStudy = { id: string; title: string; slug: string; excerpt?: string; client_name?: string; status?: string };

export default function CaseStudiesPage() {
  const [list, setList] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CaseStudy[]>("/cms/case-studies")
      .then((res) => setList(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const published = list.filter((c) => c.status === "published");

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Case Studies</h1>
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-zensar-muted">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading case studies...</p>
          </div>
        ) : published.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zensar-surface border border-gray-200">
            <p className="text-zensar-muted">No case studies yet. Check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {published.map((c, i) => (
              <li key={c.id} className="hover-lift border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <Link href={`/case-studies/${c.slug}`} className="block group">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">{c.title}</h2>
                  {c.client_name && <p className="text-gray-500 text-sm mt-1">Client: {c.client_name}</p>}
                  {c.excerpt && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{c.excerpt}</p>}
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
