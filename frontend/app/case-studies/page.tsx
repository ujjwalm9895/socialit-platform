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
          <p className="text-gray-500">Loading...</p>
        ) : published.length === 0 ? (
          <p className="text-gray-500">No case studies yet.</p>
        ) : (
          <ul className="space-y-6">
            {published.map((c) => (
              <li key={c.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary/40 transition">
                <Link href={`/case-studies/${c.slug}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-primary">{c.title}</h2>
                  {c.client_name && <p className="text-gray-500 text-sm mt-1">Client: {c.client_name}</p>}
                  {c.excerpt && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{c.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PublicLayout>
  );
}
