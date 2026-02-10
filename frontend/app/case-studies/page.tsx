"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

const PORTFOLIO_CATEGORIES = [
  "All",
  "Jewellers",
  "Healthcare",
  "Education",
  "Restaurants and Hotels",
  "Lifestyle",
  "FMCG",
  "Other",
  "Websites",
  "Logo Designs",
  "eCommerce",
  "UI/UX Designs",
];

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  client_name?: string;
  industry?: string;
  tags?: string[];
  featured_image_url?: string;
  status?: string;
};

export default function CaseStudiesPage() {
  const [list, setList] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    const params: { limit: number; category?: string } = { limit: 200 };
    if (categoryFilter !== "All") params.category = categoryFilter;
    api
      .get<CaseStudy[]>("/cms/case-studies", { params })
      .then((res) => setList(res.data || []))
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  const published = list.filter((c) => c.status === "published");
  const filtered = published;

  return (
    <PublicLayout>
      <main className="min-h-screen">
        {/* Portfolio hero – aligned with socialit.in/portfolio.php */}
        <section className="relative overflow-hidden bg-[#0f172a] px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/10 pointer-events-none" aria-hidden />
          <div className="relative max-w-5xl mx-auto w-full text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Our Portfolio
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/85 max-w-2xl mx-auto">
              Some recent work
            </p>
          </div>
        </section>

        {/* Filters + grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
            {PORTFOLIO_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition ${
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p>Loading portfolio...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-gray-50 border border-gray-200">
              <p className="text-gray-600">
                {published.length === 0
                  ? "No portfolio items yet. Add case studies in Admin → Case Studies."
                  : "No items in this category."}
              </p>
              <Link
                href="/admin/case-studies"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                Go to Admin →
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <li key={c.id} className="group">
                  <Link
                    href={`/case-studies/${c.slug}`}
                    className="block rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {c.featured_image_url ? (
                        <img
                          src={c.featured_image_url}
                          alt={c.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-4xl text-gray-300 font-bold">
                            {(c.client_name || c.title).charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 sm:p-5">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                        {c.title}
                      </h2>
                      {c.client_name && (
                        <p className="text-gray-500 text-sm mt-1">{c.client_name}</p>
                      )}
                      {(c.industry || (c.tags && c.tags.length > 0)) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.industry && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                              {c.industry}
                            </span>
                          )}
                          {c.tags?.slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
