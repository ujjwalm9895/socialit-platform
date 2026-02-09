"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SectionRenderer, { type Section } from "../../components/SectionRenderer";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

type PageData = { id: string; title: string; slug: string; content: Section[]; status: string };

export default function SlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (slug === "home") {
      router.replace("/");
      return;
    }
    setLoading(true);
    setNotFound(false);
    api
      .get<PageData>(`/cms/pages/slug/${slug}`)
      .then((res) => setPage(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (!slug || slug === "home") return null;

  if (loading) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </PublicLayout>
    );
  }

  if (notFound || !page) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">Page not found</h1>
          <a href="/" className="text-primary hover:underline min-h-[44px] flex items-center">Back to home</a>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="min-h-screen">
        {page.content?.length
          ? page.content.map((section, i) => (
              <SectionRenderer
                key={section.id ?? `s-${i}`}
                section={{ type: section.type, data: section.data || {}, id: section.id }}
              />
            ))
          : (
              <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
                <p className="text-gray-500 mt-2">No content yet.</p>
              </div>
            )}
      </main>
    </PublicLayout>
  );
}
