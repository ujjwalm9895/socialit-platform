"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import AIMLSolutionsSection, { type AIMLSectionData } from "../../components/AIMLSolutionsSection";
import api from "../api-client";

type Service = { id: string; title: string; slug: string; subtitle?: string; description?: string; status?: string };

export default function ServicesPage() {
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiMlSection, setAiMlSection] = useState<AIMLSectionData | null>(null);

  useEffect(() => {
    api
      .get<Service[]>("/cms/services")
      .then((res) => setList(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get<AIMLSectionData>("/cms/site-settings/services-ai-ml-section")
      .then((res) => setAiMlSection(res.data ?? null))
      .catch(() => setAiMlSection(null));
  }, []);

  const published = list.filter((s) => s.status === "published");

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Services</h1>

        <AIMLSolutionsSection data={aiMlSection} />

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-zensar-muted">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading services...</p>
          </div>
        ) : published.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zensar-surface border border-gray-200">
            <p className="text-zensar-muted">No services published yet. Check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {published.map((s, i) => (
              <li
                key={s.id}
                className="hover-lift border border-gray-200 rounded-xl p-5 bg-white shadow-sm"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <Link href={`/services/${s.slug}`} className="block group">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">{s.title}</h2>
                  {s.subtitle && <p className="text-gray-600 text-sm mt-1">{s.subtitle}</p>}
                  {s.description && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{s.description}</p>}
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
