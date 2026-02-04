"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${apiUrl}/cms/pages/slug/${slug}`);
        setPage(response.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Page not found");
        } else {
          setError(err.response?.data?.detail || "Failed to load page");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, apiUrl]);

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

  const renderSection = (section: PageSection, index: number) => {
    switch (section.type) {
      case "hero":
        return (
          <section
            key={index}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              {section.data?.heading && (
                <h1 className="text-5xl font-bold mb-4">
                  {section.data.heading}
                </h1>
              )}
              {section.data?.subheading && (
                <p className="text-xl mb-8 opacity-90">
                  {section.data.subheading}
                </p>
              )}
              {section.data?.buttonText && section.data?.buttonLink && (
                <a
                  href={section.data.buttonLink}
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  {section.data.buttonText}
                </a>
              )}
            </div>
          </section>
        );

      case "text":
        return (
          <section key={index} className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html: section.data?.content
                    ? section.data.content.replace(/\n/g, "<br />")
                    : "",
                }}
              />
            </div>
          </section>
        );

      case "image":
        return (
          <section key={index} className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
              {section.data?.url && (
                <img
                  src={section.data.url}
                  alt={section.data?.alt || ""}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              )}
            </div>
          </section>
        );

      default:
        return (
          <section key={index} className="py-8 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600 text-sm">
                  Unknown section type: {section.type}
                </p>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        );
    }
  };

  useEffect(() => {
    if (loading) {
      document.title = "Loading...";
    } else if (error || !page) {
      document.title = "Page Not Found";
    }
  }, [loading, error, page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {error || "Page Not Found"}
          </h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {page.content && page.content.length > 0 ? (
        page.content.map((section, index) => renderSection(section, index))
      ) : (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            <p className="text-gray-600">This page has no content yet.</p>
          </div>
        </div>
      )}
    </main>
  );
}
