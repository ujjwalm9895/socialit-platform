"use client";

import { useEffect, useState } from "react";
import SectionRenderer, { type Section } from "../components/SectionRenderer";
import api from "./api-client";

type PageData = { id: string; title: string; slug: string; content: Section[]; status: string };

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const res = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
    if (res?.status === 404) return "";
    if (res?.data?.detail) return res.data.detail;
  }
  if (err && typeof err === "object" && "message" in err)
    return (err as { message: string }).message;
  return "Could not load the page.";
}

export default function Home() {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHome = () => {
    setLoading(true);
    setError(null);
    api
      .get<PageData>("/cms/pages/slug/home")
      .then((res) => setPage(res.data))
      .catch((err) => {
        const msg = getErrorMessage(err);
        setError(msg || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHome();
  }, []);

  if (loading) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error) {
    const isProduction = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
    return (
      <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 text-center font-medium">{error}</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          {isProduction
            ? "The site could not reach the API. On Vercel, set NEXT_PUBLIC_API_URL to your backend URL (e.g. https://your-api.onrender.com) and add this site to your backend CORS_ORIGINS."
            : "Make sure the backend is running and NEXT_PUBLIC_API_URL in .env.local points to it (e.g. http://localhost:8000)."}
        </p>
        <button
          type="button"
          onClick={() => fetchHome()}
          className="text-indigo-600 hover:underline font-medium"
        >
          Retry
        </button>
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
