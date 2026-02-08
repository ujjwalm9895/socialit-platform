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
          <p className="text-gray-500">Loading...</p>
        ) : published.length === 0 ? (
          <p className="text-gray-500">No services yet.</p>
        ) : (
          <ul className="space-y-6">
            {published.map((s) => (
              <li key={s.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary/40 transition">
                <Link href={`/services/${s.slug}`} className="block">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-primary">{s.title}</h2>
                  {s.subtitle && <p className="text-gray-600 text-sm mt-1">{s.subtitle}</p>}
                  {s.description && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{s.description}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PublicLayout>
  );
}
