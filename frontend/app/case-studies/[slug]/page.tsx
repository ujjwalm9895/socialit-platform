"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/AnimatedHeader";
import Footer from "../../../components/Footer";
import { apiUrl } from "../../../lib/api";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name?: string;
  client_logo_url?: string;
  excerpt?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  content?: any;
  featured_image_url?: string;
  gallery_images?: string[];
  industry?: string;
  tags?: string[];
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  status: string;
}

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchCaseStudy = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/cms/case-studies`);
        const found = response.data.find(
          (cs: CaseStudy) => cs.slug === slug && cs.status === "published"
        );
        if (found) {
          setCaseStudy(found);
        } else {
          setError("Case study not found");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Case study not found");
        } else {
          setError(err.response?.data?.detail || "Failed to load case study");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudy();
  }, [slug, apiUrl]);

  useEffect(() => {
    if (caseStudy) {
      document.title = caseStudy.meta_title || caseStudy.title;
      const metaDescription = caseStudy.meta_description || caseStudy.excerpt;
      if (metaDescription) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", metaDescription);
      }
    }
  }, [caseStudy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading case study...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Case Study Not Found"}
            </h1>
            <Link href="/case-studies" className="text-blue-600 hover:text-blue-700">
              ← Back to Case Studies
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {caseStudy.featured_image_url && (
        <div className="h-96 w-full overflow-hidden">
          <img
            src={caseStudy.featured_image_url}
            alt={caseStudy.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            {caseStudy.industry && (
              <span className="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded mb-4">
                {caseStudy.industry}
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{caseStudy.title}</h1>
            {caseStudy.client_name && (
              <div className="flex items-center gap-4 mb-6">
                {caseStudy.client_logo_url && (
                  <img
                    src={caseStudy.client_logo_url}
                    alt={caseStudy.client_name}
                    className="h-12"
                  />
                )}
                <p className="text-lg text-gray-600">
                  Client: <span className="font-semibold">{caseStudy.client_name}</span>
                </p>
              </div>
            )}
            {caseStudy.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{caseStudy.excerpt}</p>
            )}
            {caseStudy.tags && caseStudy.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {caseStudy.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            {caseStudy.challenge && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Challenge</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {caseStudy.challenge}
                </p>
              </div>
            )}

            {caseStudy.solution && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Solution</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {caseStudy.solution}
                </p>
              </div>
            )}

            {caseStudy.results && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Results</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {caseStudy.results}
                </p>
              </div>
            )}

            {caseStudy.gallery_images && caseStudy.gallery_images.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseStudy.gallery_images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Gallery image ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {caseStudy.content && (
              <div>
                <pre className="whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(caseStudy.content, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/case-studies"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to All Case Studies
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
