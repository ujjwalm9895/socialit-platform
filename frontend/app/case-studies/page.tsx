"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Header from "../../components/AnimatedHeader";
import Footer from "../../components/Footer";
import { apiUrl } from "@/lib/api";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name?: string;
  excerpt?: string;
  featured_image_url?: string;
  industry?: string;
  tags?: string[];
  published_at?: string;
  status: string;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const response = await axios.get(`${apiUrl}/cms/case-studies`);
        setCaseStudies(response.data.filter((cs: CaseStudy) => cs.status === "published"));
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error("Failed to fetch case studies:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCaseStudies();
  }, [apiUrl]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <Header />

      <div 
        className="py-16"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, transparent), color-mix(in srgb, var(--color-secondary) 8%, transparent))`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Case Studies
          </h1>
          <p 
            className="text-lg"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Real results from real clients
          </p>
        </div>
      </div>

      <section className="py-16" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: "var(--color-primary)" }}></div>
              <p style={{ color: "var(--color-text-secondary)" }}>Loading case studies...</p>
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: "var(--color-text-secondary)" }}>No case studies available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {caseStudies.map((caseStudy) => (
                <Link
                  key={caseStudy.id}
                  href={`/case-studies/${caseStudy.slug}`}
                  className="group rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 20px 25px -5px color-mix(in srgb, var(--color-primary) 20%, transparent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  {caseStudy.featured_image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={caseStudy.featured_image_url}
                        alt={caseStudy.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      ></div>
                    </div>
                  )}
                  <div className="p-6">
                    {caseStudy.industry && (
                      <span 
                        className="inline-block text-xs font-semibold px-2 py-1 rounded mb-3"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-accent) 15%, white)`,
                          color: "var(--color-accent)",
                        }}
                      >
                        {caseStudy.industry}
                      </span>
                    )}
                    <h2 
                      className="text-2xl font-semibold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      {caseStudy.title}
                    </h2>
                    {caseStudy.client_name && (
                      <p 
                        className="text-sm mb-3"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Client: <span className="font-medium">{caseStudy.client_name}</span>
                      </p>
                    )}
                    {caseStudy.excerpt && (
                      <p 
                        className="text-sm line-clamp-3 mb-4"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {caseStudy.excerpt}
                      </p>
                    )}
                    {caseStudy.tags && caseStudy.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {caseStudy.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: `color-mix(in srgb, var(--color-surface) 80%, var(--color-primary) 20%)`,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {caseStudy.published_at && (
                      <p 
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {new Date(caseStudy.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
