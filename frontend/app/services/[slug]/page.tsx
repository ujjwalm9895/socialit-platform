"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../../components/PublicLayout";
import api from "../../api-client";

type Service = { id: string; title: string; slug: string; subtitle?: string; description?: string; status?: string };

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<Service[]>("/cms/services")
      .then((res) => {
        const found = (res.data || []).find((s) => s.slug === slug && s.status === "published");
        setService(found ?? null);
        setNotFound(!found);
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
      </main>
    </PublicLayout>
  );
}
