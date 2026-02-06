"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import useSWR from "swr";
import Header from "../../components/AnimatedHeader";
import Footer from "../../components/Footer";
import { fetcher, PAGE_SWR_CONFIG } from "@/lib/swr";

const SectionRenderer = dynamic(() => import("../../components/SectionRenderer"), {
  loading: () => <div className="min-h-screen" />,
  ssr: false,
});

interface PageSection {
  type: string;
  data: any;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: PageSection[];
  template?: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_image_url?: string;
  published_at?: string;
}

export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: page, error, isLoading } = useSWR<Page>(
    slug ? `/cms/pages/slug/${slug}` : null,
    fetcher,
    { ...PAGE_SWR_CONFIG, shouldRetryOnError: (err) => err?.response?.status !== 404 }
  );

  const loading = isLoading;
  const is404 = error && (error as any)?.response?.status === 404;
  const errorMessage = is404 ? "Page not found" : (error && (error as any)?.response?.data?.detail) || "Failed to load page";

  useEffect(() => {
    if (!page) return;

    const metaTitle = page.meta_title || page.title;
    const metaDescription = page.meta_description || "";
    const metaKeywords = page.meta_keywords?.join(", ") || "";

    document.title = metaTitle;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    if (metaDescription) {
      updateMetaTag("description", metaDescription);
      updateMetaTag("og:description", metaDescription, true);
      updateMetaTag("twitter:description", metaDescription);
    }

    if (metaKeywords) {
      updateMetaTag("keywords", metaKeywords);
    }

    updateMetaTag("og:title", metaTitle, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", metaTitle);

    if (page.og_image_url) {
      updateMetaTag("og:image", page.og_image_url, true);
      updateMetaTag("twitter:image", page.og_image_url);
    }
  }, [page]);


  useEffect(() => {
    if (loading && !page) document.title = "Loading...";
    else if (error || !page) document.title = "Page Not Found";
  }, [loading, error, page]);

  if (loading && !page) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--color-primary)" }} />
            <p style={{ color: "var(--color-text-secondary)" }}>Loading page...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if ((error || !page) && !loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="text-center">
            <h1
              className="text-4xl font-bold mb-4"
              style={{ color: "var(--color-text)" }}
            >
              {errorMessage}
            </h1>
            <p 
              className="mb-8"
              style={{ color: "var(--color-text-secondary)" }}
            >
              The page you're looking for doesn't exist.
            </p>
            <a
              href="/"
              className="inline-block text-white px-6 py-3 rounded-lg transition hover:opacity-90"
              style={{
                background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
              }}
            >
              Go Home
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!page) return null;

  // Normalize content to always be an array (backend may return list or legacy shape)
  const sections = Array.isArray(page.content)
    ? page.content
    : page.content && typeof page.content === "object"
      ? [page.content]
      : [];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {sections.length > 0 ? (
          <Suspense fallback={<div className="min-h-screen" />}>
            {sections.map((section: PageSection, index: number) => (
              <SectionRenderer
                key={(section as any).id || `section-${index}`}
                section={{
                  type: (section as any).type || "raw",
                  data: (section as any).data ?? (section as any),
                  id: (section as any).id || `section-${index}`,
                }}
                index={index}
              />
            ))}
          </Suspense>
        ) : (
          <div 
            className="min-h-screen flex items-center justify-center px-4"
            style={{
              background: `linear-gradient(to bottom, var(--color-background), var(--color-surface))`,
            }}
          >
            <div className="text-center max-w-2xl">
              <h1 
                className="text-5xl font-bold mb-6"
                style={{ color: "var(--color-text)" }}
              >
                {page.title}
              </h1>
              <p 
                className="text-xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                This page has no content yet.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
