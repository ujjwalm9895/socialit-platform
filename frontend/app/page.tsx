"use client";

import { useEffect, useState } from "react";
import SectionRenderer, { type Section } from "../components/SectionRenderer";
import api from "./api-client";

type PageData = { id: string; title: string; slug: string; content: Section[]; status: string };

export default function Home() {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PageData>("/cms/pages/slug/home")
      .then((res) => setPage(res.data))
      .catch((err) => setError(err.response?.status === 404 ? null : "Failed to load page"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!page || !page.content?.length) {
    return (
      <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
        <p className="text-gray-600">No content yet. Build your homepage in the admin.</p>
        <a href="/admin/login" className="text-indigo-600 hover:underline font-medium">
          Go to Admin →
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {page.content.map((section, i) => (
        <SectionRenderer
          key={section.id ?? `s-${i}`}
          section={{ type: section.type, data: section.data || {}, id: section.id }}
        />
      ))}
    </main>
  );
}
