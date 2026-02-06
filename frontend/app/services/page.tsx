"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Header from "../../components/AnimatedHeader";
import Footer from "../../components/Footer";
import { apiUrl } from "../../lib/api";

interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  featured_image_url?: string;
  icon_url?: string;
  status: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${apiUrl}/cms/services`);
        setServices(response.data.filter((s: Service) => s.status === "published"));
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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
            Our Services
          </h1>
          <p 
            className="text-lg"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Comprehensive digital solutions to help your business grow
          </p>
        </div>
      </div>

      <section className="py-16" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: "var(--color-primary)" }}></div>
              <p style={{ color: "var(--color-text-secondary)" }}>Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: "var(--color-text-secondary)" }}>No services available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
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
                  {service.featured_image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={service.featured_image_url}
                        alt={service.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      ></div>
                    </div>
                  )}
                  <div className="p-6">
                    {service.icon_url && (
                      <img
                        src={service.icon_url}
                        alt=""
                        className="w-12 h-12 mb-4"
                      />
                    )}
                    <h2 
                      className="text-2xl font-semibold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      {service.title}
                    </h2>
                    {service.subtitle && (
                      <p 
                        className="mb-3 font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {service.subtitle}
                      </p>
                    )}
                    {service.description && (
                      <p 
                        className="text-sm line-clamp-3 mb-4"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {service.description}
                      </p>
                    )}
                    <span 
                      className="text-sm font-medium mt-4 inline-flex items-center gap-2 transition-all group-hover:gap-3"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Learn more →
                    </span>
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
