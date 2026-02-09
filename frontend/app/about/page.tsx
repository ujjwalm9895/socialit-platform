"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

type AboutData = {
  heading?: string;
  intro?: string;
  stats_heading?: string;
  stats_subtext?: string;
  stats?: Array<{ value?: string; label?: string }>;
  journey_heading?: string;
  journey_subheading?: string;
  journey_text?: string;
  vision_heading?: string;
  vision_subheading?: string;
  vision_text?: string;
  what_sets_apart_heading?: string;
  what_sets_apart_subheading?: string;
  what_sets_apart_items?: Array<{ title?: string; text?: string }>;
  team_heading?: string;
  team_subheading?: string;
  team?: Array<{ name?: string; role?: string; image_url?: string }>;
  cta_text?: string;
  cta_link?: string;
};

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AboutData>("/cms/site-settings/about-page")
      .then((r) => setData(r.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </PublicLayout>
    );
  }

  const stats = Array.isArray(data?.stats) ? data.stats : [];
  const items = Array.isArray(data?.what_sets_apart_items) ? data.what_sets_apart_items : [];
  const team = Array.isArray(data?.team) ? data.team : [];

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zensar-dark mb-6 break-words">
          {data?.heading || "About Us"}
        </h1>
        {data?.intro && (
          <p className="text-gray-700 text-lg leading-relaxed mb-12">
            {data.intro}
          </p>
        )}

        {stats.length > 0 && (
          <section className="py-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-zensar-dark mb-2">
              {data?.stats_heading || "Let's talk numbers"}
            </h2>
            {data?.stats_subtext && (
              <p className="text-zensar-muted mb-8">{data.stats_subtext}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="hover-lift bg-zensar-surface rounded-xl p-5 border border-gray-100">
                  <div className="text-2xl font-bold text-primary">{s.value ?? ""}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.label ?? ""}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data?.journey_text && (
          <section className="py-12 border-t border-gray-200">
            {data.journey_subheading && (
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                {data.journey_subheading}
              </p>
            )}
            <h2 className="text-2xl font-bold text-zensar-dark mb-4">
              {data.journey_heading || "Our Journey"}
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.journey_text}</p>
          </section>
        )}

        {data?.vision_text && (
          <section className="py-12 border-t border-gray-200">
            {data.vision_subheading && (
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                {data.vision_subheading}
              </p>
            )}
            <h2 className="text-2xl font-bold text-zensar-dark mb-4">
              {data.vision_heading || "Our Vision"}
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.vision_text}</p>
          </section>
        )}

        {items.length > 0 && (
          <section className="py-12 border-t border-gray-200">
            {data?.what_sets_apart_subheading && (
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                {data.what_sets_apart_subheading}
              </p>
            )}
            <h2 className="text-2xl font-bold text-zensar-dark mb-6">
              {data?.what_sets_apart_heading || "What Sets Us Apart"}
            </h2>
            <ul className="space-y-4">
              {items.map((item, i) => (
                <li key={i} className="hover-lift bg-zensar-surface rounded-xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-zensar-dark mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {team.length > 0 && (
          <section className="py-12 border-t border-gray-200">
            {data?.team_subheading && (
              <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                {data.team_subheading}
              </p>
            )}
            <h2 className="text-2xl font-bold text-zensar-dark mb-6">
              {data?.team_heading || "Our Team"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, i) => (
                <div key={i} className="hover-lift bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt={member.name ?? ""}
                      className="w-16 h-16 rounded-full object-cover mb-3"
                    />
                  )}
                  <p className="font-semibold text-zensar-dark">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(data?.cta_text || data?.cta_link) && (
          <section className="py-12 border-t border-gray-200 text-center">
            <Link
              href={data?.cta_link || "/contact"}
              className="btn-flashy inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold shadow-glow hover:bg-primary-dark"
            >
              {data?.cta_text || "Contact Us"}
            </Link>
          </section>
        )}
      </main>
    </PublicLayout>
  );
}
