"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../../components/PublicLayout";
import api from "../../api-client";

type ContentItem = { title: string; description?: string };
type ServiceContent = {
  services_offered?: ContentItem[];
  products?: ContentItem[];
  benefits?: string[];
  cta_text?: string;
  cta_link?: string;
};

type Service = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  content?: ServiceContent;
  status?: string;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<Service>(`/cms/services/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        setService(res.data ?? null);
        setNotFound(!res.data);
      })
      .catch(() => {
        setService(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </PublicLayout>
    );
  }

  if (notFound || !service) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Service not found</h1>
          <Link href="/services" className="text-primary hover:underline">Back to services</Link>
        </main>
      </PublicLayout>
    );
  }

  const content = service.content;
  const servicesOffered = Array.isArray(content?.services_offered) ? content.services_offered : [];
  const products = Array.isArray(content?.products) ? content.products : [];
  const benefits = Array.isArray(content?.benefits) ? content.benefits : [];
  const ctaText = content?.cta_text || "Contact us";
  const ctaLink = content?.cta_link || "/contact";

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/services" className="text-sm text-primary hover:underline mb-4 inline-block">← Services</Link>
        <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
        {service.subtitle && <p className="text-gray-600 mt-2">{service.subtitle}</p>}
        {service.description && (
          <div className="mt-6 prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{service.description}</p>
          </div>
        )}

        {servicesOffered.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Services Offered</h2>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
              {servicesOffered.map((s, i) => (
                <li key={i}>
                  {s.title && <strong className="text-gray-800">{s.title}</strong>}
                  {s.description && <> — {s.description}</>}
                </li>
              ))}
            </ul>
          </>
        )}

        {products.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">AI Products</h2>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
              {products.map((p, i) => (
                <li key={i}>
                  {p.title && <strong className="text-gray-800">{p.title}</strong>}
                  {p.description && <> — {p.description}</>}
                </li>
              ))}
            </ul>
          </>
        )}

        {benefits.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Business Benefits</h2>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
              {benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </>
        )}

        {(content?.cta_text || content?.cta_link) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              href={ctaLink}
              className="btn-flashy inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark shadow-glow"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
