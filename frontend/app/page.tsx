"use client";

import { useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import Header from "../components/AnimatedHeader";
import Footer from "../components/Footer";
import { fetcher, PAGE_SWR_CONFIG } from "../lib/swr";

const SectionRenderer = dynamic(() => import("../components/SectionRenderer"), {
  loading: () => <div className="min-h-screen" />,
  ssr: false,
});

interface HomepageSection {
  type: string;
  data: any;
  id?: string;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom, var(--color-background), var(--color-surface))` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="h-16 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" style={{ backgroundColor: "var(--color-surface)" }} />
          <div className="h-8 rounded-lg w-1/2 mx-auto mb-8 animate-pulse" style={{ backgroundColor: "var(--color-surface)" }} />
          <div className="flex gap-4 justify-center">
            <div className="h-12 rounded-lg w-32 animate-pulse" style={{ backgroundColor: "var(--color-surface)" }} />
            <div className="h-12 rounded-lg w-32 animate-pulse" style={{ backgroundColor: "var(--color-surface)" }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-surface)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: page, error, isLoading } = useSWR<{ content?: HomepageSection[] }>(
    "/cms/pages/slug/home",
    fetcher,
    { ...PAGE_SWR_CONFIG, shouldRetryOnError: (err) => err?.response?.status !== 404 }
  );

  const homepageSections = useMemo(() => {
    if (!page?.content || !Array.isArray(page.content)) return [];
    return page.content.map((s: any, idx: number) => ({
      ...s,
      id: s.id || `section-${idx}`,
    }));
  }, [page]);

  const is404 = error && (error as any)?.response?.status === 404;
  const loading = isLoading;
  const hasError = error && !is404;

  // SEO
  useEffect(() => {
    document.title = "Social IT - Digital Solutions & Marketing Agency";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Weaving your brand's digital success story. Website development, app development, digital marketing, and more."
      );
    }
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {loading ? (
          <LoadingSkeleton />
        ) : hasError ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
                Failed to load homepage
              </h1>
              <p style={{ color: "var(--color-text-secondary)" }}>Please try refreshing the page.</p>
            </div>
          </div>
        ) : homepageSections.length > 0 ? (
          <>
            {homepageSections.map((section, index) => (
              <SectionRenderer key={section.id || `section-${index}`} section={section} index={index} />
            ))}
          </>
        ) : (
          <div 
            className="min-h-screen flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom, var(--color-background), var(--color-surface))`,
            }}
          >
            <div className="text-center max-w-2xl px-4">
              <h1 
                className="text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                Welcome to Social IT
              </h1>
              <p 
                className="text-xl mb-8"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Your digital transformation partner. We're building something amazing.
              </p>
              <a
                href="/admin/homepage"
                className="inline-block text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                style={{
                  background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                }}
              >
                Create Your Homepage
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
