"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Header from "../../../components/AnimatedHeader";
import Footer from "../../../components/Footer";

interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  content?: any;
  featured_image_url?: string;
  icon_url?: string;
  meta_title?: string;
  meta_description?: string;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!slug) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/cms/services`);
        const found = response.data.find((s: Service) => s.slug === slug && s.status === "published");
        if (found) {
          setService(found);
        } else {
          setError("Service not found");
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug, apiUrl]);

  useEffect(() => {
    if (service) {
      document.title = service.meta_title || service.title;
      const metaDescription = service.meta_description || service.description;
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
  }, [service]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading service...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Service Not Found"}
            </h1>
            <a href="/services" className="text-blue-600 hover:text-blue-700">
              ← Back to Services
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {service.featured_image_url && (
        <div className="h-96 w-full overflow-hidden">
          <img
            src={service.featured_image_url}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          {service.icon_url && (
            <img src={service.icon_url} alt="" className="w-16 h-16 mb-6" />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{service.title}</h1>
          {service.subtitle && (
            <p className="text-xl text-gray-600 mb-6">{service.subtitle}</p>
          )}
          {service.description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          )}
          {service.content && (
            <div className="prose prose-lg max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700">
                {JSON.stringify(service.content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
}
