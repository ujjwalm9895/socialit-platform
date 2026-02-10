"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../../components/PublicLayout";
import api from "../../api-client";

type ContentItem = { title: string; description?: string };
type FaqItem = { question: string; answer: string };
type ServiceContent = {
  services_offered?: ContentItem[];
  procedure?: ContentItem[];
  products?: ContentItem[];
  benefits?: string[];
  faqs?: FaqItem[];
  related_services?: string[];
  cta_text?: string;
  cta_link?: string;
};

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*\/\s*/g, "-")
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

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
  const procedure = Array.isArray(content?.procedure) ? content.procedure : [];
  const products = Array.isArray(content?.products) ? content.products : [];
  const benefits = Array.isArray(content?.benefits) ? content.benefits : [];
  const faqs = Array.isArray(content?.faqs) ? content.faqs : [];
  const relatedServices = Array.isArray(content?.related_services) ? content.related_services : [];
  const ctaText = content?.cta_text || "Contact us";
  const ctaLink = content?.cta_link || "/contact";

  return (
    <PublicLayout>
      <main className="min-h-screen">
        {/* Service hero – specialized header like socialit.in */}
        <section className="relative overflow-hidden bg-[#0f172a] min-h-[42vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-amber-500/10 pointer-events-none" aria-hidden />
          <div className="relative max-w-5xl mx-auto w-full">
            <Link href="/services" className="text-sm text-white/70 hover:text-white mb-6 inline-block transition-colors">← All Services</Link>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white uppercase" style={{ textShadow: "0 0 40px rgba(255,255,255,0.08)" }}>
              <span className="bg-gradient-to-r from-white via-white to-amber-200/90 bg-clip-text text-transparent">{service.title}</span>
            </h1>
            {service.subtitle && (
              <p className="mt-4 text-lg sm:text-xl text-white/85 max-w-2xl">{service.subtitle}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={ctaLink}
                className="btn-flashy inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark shadow-glow transition-colors"
              >
                {ctaText}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 rounded-xl font-medium border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                Let&apos;s Chat
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {service.description && (
          <div className="mt-6 prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-700">{service.description}</p>
          </div>
        )}

        {servicesOffered.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">What We Offer</h2>
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

        {procedure.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Our Process</h2>
            <ol className="list-decimal list-inside text-gray-600 text-sm space-y-2 mb-6">
              {procedure.map((p, i) => (
                <li key={i}>
                  {p.title && <strong className="text-gray-800">{p.title}</strong>}
                  {p.description && <> — {p.description}</>}
                </li>
              ))}
            </ol>
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
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Benefits</h2>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 mb-6">
              {benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </>
        )}

        {faqs.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">FAQ&apos;s</h2>
            <p className="text-sm text-gray-500 mb-4">Some common questions and answers.</p>
            <dl className="space-y-4 mb-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <dt className="font-medium text-gray-900 text-sm mb-1">{faq.question}</dt>
                  <dd className="text-gray-600 text-sm pl-0">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {relatedServices.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Our main design-related services</h2>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 mb-6 text-sm">
              {relatedServices.map((name, i) => (
                <li key={i}>
                  <Link href={"/services/" + titleToSlug(name)} className="text-primary hover:underline font-medium">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {(content?.cta_text || content?.cta_link) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href={ctaLink}
              className="btn-flashy inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark shadow-glow"
            >
              {ctaText}
            </Link>
          </div>
        )}
        </div>
      </main>
    </PublicLayout>
  );
}
