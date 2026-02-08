"use client";

import { useEffect, useState } from "react";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

type ContactInfo = {
  heading?: string;
  subtext?: string;
  email?: string;
  addresses?: string[];
  phones?: string[];
  whatsapp_number?: string;
  whatsapp_text?: string;
  show_contact_form?: boolean;
  form_heading?: string;
};

export default function ContactPage() {
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ContactInfo>("/cms/site-settings/contact-info").then((r) => setInfo(r.data ?? null)).catch(() => setInfo(null)).finally(() => setLoading(false));
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

  const heading = info?.heading ?? "Contact us";
  const subtext = info?.subtext ?? "Get in touch for projects, partnerships, or questions.";
  const addresses = Array.isArray(info?.addresses) ? info.addresses : [];
  const phones = Array.isArray(info?.phones) ? info.phones : [];
  const showForm = info?.show_contact_form !== false;

  return (
    <PublicLayout>
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-zensar-dark mb-2">{heading}</h1>
        <p className="text-zensar-muted mb-8">{subtext}</p>

        <div className="hover-lift rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-10">
          <div className="space-y-4 text-gray-700">
            {info?.email && (
              <p>
                <strong className="text-zensar-dark">Email:</strong>{" "}
                <a href={"mailto:" + info.email} className="link-underline text-primary font-medium">{info.email}</a>
              </p>
            )}
            {addresses.length > 0 && (
              <p>
                <strong className="text-zensar-dark">Address{addresses.length > 1 ? "es" : ""}:</strong>
                <span className="block mt-1 text-gray-600">{addresses.join("; ")}</span>
              </p>
            )}
            {phones.length > 0 && (
              <p>
                <strong className="text-zensar-dark">Phone{phones.length > 1 ? "s" : ""}:</strong>{" "}
                {phones.map((ph, i) => (
                  <a key={i} href={"tel:" + ph.replace(/\D/g, "")} className="link-underline text-primary font-medium">{ph}</a>
                ))}
              </p>
            )}
            {info?.whatsapp_number && (
              <p>
                <a href={"https://wa.me/" + info.whatsapp_number.replace(/\D/g, "")} target="_blank" rel="noopener noreferrer" className="btn-flashy inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
                  {info?.whatsapp_text || "Let's Chat"} (WhatsApp)
                </a>
              </p>
            )}
          </div>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-gray-200 bg-zensar-surface p-6">
            <h2 className="text-lg font-semibold text-zensar-dark mb-4">{info?.form_heading || "Send a message"}</h2>
            <p className="text-sm text-zensar-muted">Use the contact details above or reach out via your preferred channel.</p>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
