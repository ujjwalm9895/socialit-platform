"use client";

import { useEffect, useState } from "react";
import SectionRenderer, { type Section } from "../components/SectionRenderer";
import PublicLayout from "../components/PublicLayout";
import api, { apiUrl } from "./api-client";

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

  let content: React.ReactNode;
  if (loading) {
    content = (
      <main className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-zensar-muted font-medium">Loading your experience...</p>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
      </main>
    );
  } else if (error) {
    const isProduction = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
    content = (
      <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600 text-center font-medium">{error}</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          {isProduction
            ? "The site could not reach the API. Do the two steps below, then redeploy and Retry."
            : "Make sure the backend is running and NEXT_PUBLIC_API_URL in .env.local points to it (e.g. http://localhost:8000)."}
        </p>
        {typeof window !== "undefined" && (
          <p className="text-xs text-gray-400 text-center max-w-lg break-all">
            API URL this build is using: <strong>{apiUrl || "(not set)"}</strong>
          </p>
        )}
        <ol className="text-sm text-left text-gray-600 list-decimal list-inside space-y-1 max-w-md">
          <li>Vercel → Project → Settings → Environment Variables → add <code className="bg-gray-100 px-1">NEXT_PUBLIC_API_URL</code> = your backend URL (no trailing slash), then Redeploy.</li>
          <li>Backend (e.g. Render) → Environment → add <code className="bg-gray-100 px-1">https://socialit-platform.vercel.app</code> to CORS_ORIGINS, save.</li>
        </ol>
        <button
          type="button"
          onClick={() => fetchHome()}
          className="btn-flashy rounded-xl bg-primary px-5 py-2.5 text-white font-medium hover:bg-primary-dark"
        >
          Retry
        </button>
      </main>
    );
  } else if (!page || !page.content?.length) {
    content = (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-8 px-4 bg-zensar-surface">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-zensar-dark mb-3">Welcome to your site</h1>
          <p className="text-zensar-muted text-lg leading-relaxed mb-8">
            Your homepage is empty. Add sections from the admin to build a beautiful landing experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/admin/login" className="btn-flashy inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-white font-semibold shadow-glow hover:bg-primary-dark">
              Go to Admin →
            </a>
            <a href="/services" className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-8 py-4 text-gray-700 font-medium hover:border-primary hover:text-primary transition-colors">
              View Services
            </a>
          </div>
        </div>
      </main>
    );
  } else {
    content = (
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

  return <PublicLayout>{content}</PublicLayout>;
}
