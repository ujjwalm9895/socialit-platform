"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../../../api-client";
import SectionEditorContent from "../../components/SectionEditorContent";
import type { Section } from "../../../../components/SectionRenderer";

type PageRecord = {
  id: string;
  title: string;
  slug: string;
  content: Section[];
  status: string;
};

const SECTION_TYPES = ["text", "image", "features", "stats", "testimonials", "cta", "services", "service_list", "services-grid"] as const;

function normalizeToServicesData(sectionData: Record<string, unknown>): Record<string, unknown> {
  const cards = sectionData.cards as Array<Record<string, unknown>> | undefined;
  const services = sectionData.services as Array<Record<string, unknown>> | undefined;
  if (cards && !services) {
    return {
      layout: "cards",
      title: sectionData.title ?? "Our Services",
      subtitle: sectionData.subtitle ?? "",
      services: cards.map((c) => ({ enabled: true, title: c.title, icons: c.icons ?? [], button_text: c.button_text, button_link: c.button_link, link: c.link })),
      design: sectionData.design,
    };
  }
  if (services) {
    return {
      layout: sectionData.layout ?? "grid",
      title: sectionData.title ?? "Our Services",
      subtitle: sectionData.subtitle ?? "",
      services: services.map((s) => ({ ...s, enabled: (s.enabled as boolean) !== false })),
      design: sectionData.design,
    };
  }
  return sectionData;
}

const DEFAULT_DATA: Record<string, Record<string, unknown>> = {
  text: { title: "", content: "", design: { background_type: "color", background_color: "#ffffff", text_color: "#1e293b", padding_top: 48, padding_bottom: 48 } },
  image: { url: "", alt: "", caption: "", design: { background_type: "color", background_color: "#f8fafc", padding_top: 48, padding_bottom: 48 } },
  features: { title: "Features", subtext: "", items: [], design: { background_type: "color", background_color: "#f8fafc", padding_top: 48, padding_bottom: 48 } },
  stats: { title: "Stats", subtext: "", items: [], design: { background_type: "color", background_color: "#ffffff", padding_top: 48, padding_bottom: 48 } },
  testimonials: { title: "Testimonials", subtext: "", items: [], design: { background_type: "color", background_color: "#f8fafc", padding_top: 48, padding_bottom: 48 } },
  cta: { heading: "Get in touch", subtext: "", buttonText: "Contact", buttonLink: "/contact", secondaryText: "", secondaryLink: "", design: { background_type: "gradient", gradient_from: "#6366f1", gradient_to: "#8b5cf6", text_color: "#ffffff", padding_top: 48, padding_bottom: 48 } },
  services: {
    layout: "cards",
    title: "Our Services",
    subtitle: "",
    services: [{ enabled: true, title: "", icons: [] }],
    design: { background_type: "color", background_color: "#000000", text_color: "#ffffff", padding_top: 64, padding_bottom: 64, card_background_color: "rgba(255,255,255,0.06)", title_color: "#ffffff", icon_size: 32, columns: 3, button_gradient_from: "#9333ea", button_gradient_to: "#db2777", button_text_color: "#ffffff" },
  },
  service_list: {},
  "services-grid": {},
};

export default function HomepageSectionEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") ?? "";
  const indexStr = searchParams.get("index");
  const sectionIndex = indexStr !== null ? parseInt(indexStr, 10) : 0;

  // Hero has its own full-page editor; redirect there
  useEffect(() => {
    if (typeParam === "hero") {
      router.replace(`/admin/homepage/hero?index=${sectionIndex}`);
    }
  }, [typeParam, sectionIndex, router]);

  if (typeParam === "hero") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500">Redirecting to hero editor…</p>
      </div>
    );
  }

  const type = SECTION_TYPES.includes(typeParam as typeof SECTION_TYPES[number]) ? typeParam : "text";

  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Record<string, unknown>>(DEFAULT_DATA[type] ?? {});

  useEffect(() => {
    api
      .get<PageRecord>("/cms/pages/slug/home")
      .then((res) => {
        setPage(res.data);
        const content = res.data?.content ?? [];
        const section = content[sectionIndex];
        if (section?.type === type && section?.data) {
          const raw = section.data as Record<string, unknown>;
          const merged = type === "service_list" || type === "services-grid"
            ? normalizeToServicesData(raw)
            : { ...(DEFAULT_DATA[type] ?? {}), ...raw };
          setData(merged);
        } else if (section?.type === type) {
          setData(type === "service_list" || type === "services-grid" ? normalizeToServicesData({}) : (DEFAULT_DATA[type] ?? {}));
        }
      })
      .catch(() => setError("Failed to load homepage"))
      .finally(() => setLoading(false));
  }, [sectionIndex, type]);

  const save = () => {
    if (!page) return;
    setSaving(true);
    setError("");
    const content = [...(page.content ?? [])];
    while (content.length <= sectionIndex) {
      content.push({ type: "text", data: { content: "" }, id: `section-${Date.now()}-${content.length}` });
    }
    const existing = content[sectionIndex];
    content[sectionIndex] = {
      id: existing?.id ?? `section-${Date.now()}`,
      type,
      data,
    };
    api
      .put(`/cms/pages/${page.id}`, { content })
      .then(() => router.push("/admin/homepage"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to save");
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500">Loading section…</p>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/admin/homepage" className="text-primary font-medium hover:underline">← Back to Homepage</Link>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-slate-600 mb-4">Homepage not found. Create it from the Homepage builder first.</p>
        <Link href="/admin/homepage" className="text-primary font-medium hover:underline">← Back to Homepage</Link>
      </div>
    );
  }

  const section = page.content?.[sectionIndex];
  if (section && section.type !== type) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-slate-600 mb-4">This section is not a {type} section. Use the homepage builder to edit it.</p>
        <Link href="/admin/homepage" className="text-primary font-medium hover:underline">← Back to Homepage</Link>
      </div>
    );
  }

  const typeLabel = type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/homepage" className="hover:text-slate-700 transition">Homepage</Link>
        <span aria-hidden>/</span>
        <span className="text-slate-800 font-medium">Edit {typeLabel}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{typeLabel} section</h1>
          <p className="text-slate-500 text-sm mt-1">Edit content and design. Changes apply to this section on the homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/homepage" className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition">Cancel</Link>
          <button type="button" onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition">
            {saving ? "Saving…" : "Save and go back"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Content &amp; design</h2>
          <p className="text-sm text-slate-500 mt-0.5">Update all fields below. Use design for background, colors, and padding.</p>
        </div>
        <div className="p-6 sm:p-8">
          <SectionEditorContent type={type} data={data} setData={setData} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition">
          {saving ? "Saving…" : "Save and go back"}
        </button>
      </div>
    </div>
  );
}
