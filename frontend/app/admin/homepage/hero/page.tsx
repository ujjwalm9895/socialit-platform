"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "../../../api-client";
import HeroSectionEditor from "../../components/HeroSectionEditor";
import type { Section } from "../../../../components/SectionRenderer";
import type { HeroSectionData } from "../../../../components/HeroSection";

type PageRecord = {
  id: string;
  title: string;
  slug: string;
  content: Section[];
  status: string;
};

// Default hero content aligned with Socialit.in reference (socialit.in)
const SOCIALIT_HERO_BANNER = "https://socialit.in/assets/img/homebanner.webp";
const SOCIALIT_LOGO = (path: string) => `https://socialit.in/${path}`;

const DEFAULT_HERO: HeroSectionData = {
  design: {
    layout: "two_column",
    left_width: "42%",
    background_type: "color",
    background_color: "#0f172a",
    text_color: "#ffffff",
    padding_top: 80,
    padding_bottom: 80,
  },
  left_blocks: [
    { id: "hero-h", type: "heading", content: { level: "h2", text: "Weaving Your Brand's Digital Success Story" } },
    { id: "hero-p", type: "paragraph", content: { text: "Maintain a winning reputation, engage digitally, and deliver an exceptional customer experience - all from one intuitive platform." } },
    { id: "hero-tag", type: "tagline", content: { text: "Web Development Company in Kota" } },
    { id: "hero-email", type: "email_input", content: { placeholder: "Enter your email" } },
    { id: "hero-btns", type: "button_group", content: { buttons: [{ text: "Get A Demo", link: "/contact", style: "primary" }, { text: "Explore Case Study", link: "/case-studies", style: "outline" }] } },
    {
      id: "hero-logos",
      type: "logo_row",
      content: {
        headline: "Trusted & Awarded By Global Leaders",
        logos: [
          { image_url: SOCIALIT_LOGO("logo_webp/JCI.png"), link_url: "", alt: "JCI" },
          { image_url: SOCIALIT_LOGO("logo_webp/Indian.png"), link_url: "", alt: "Indian Achievers" },
          { image_url: SOCIALIT_LOGO("logo_webp/Rotary.png"), link_url: "", alt: "Rotary" },
        ],
      },
    },
  ],
  right_blocks: [{ id: "hero-img", type: "image", content: { url: SOCIALIT_HERO_BANNER, alt: "Hero banner", link: "" } }],
  chat_button_text: "Let's Chat",
  chat_button_link: "/contact",
};

export default function HeroEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const indexStr = searchParams.get("index");
  const sectionIndex = indexStr !== null ? parseInt(indexStr, 10) : 0;

  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [heroData, setHeroData] = useState<HeroSectionData>(DEFAULT_HERO);

  useEffect(() => {
    api
      .get<PageRecord>("/cms/pages/slug/home")
      .then((res) => {
        setPage(res.data);
        const content = res.data?.content ?? [];
        const section = content[sectionIndex];
        const typeStr = typeof section?.type === "string" ? (section.type as string).toLowerCase() : "";
        const isHero =
          typeStr === "hero" ||
          (section?.data &&
            (section.data.headline !== undefined ||
              (section.data as Record<string, unknown>).left_blocks !== undefined ||
              (section.data as Record<string, unknown>).design !== undefined));
        if (isHero && section?.data) {
          setHeroData({ ...DEFAULT_HERO, ...(section.data as HeroSectionData) });
        } else if (isHero) {
          setHeroData(DEFAULT_HERO);
        }
        // If no section or not hero, keep DEFAULT_HERO so we can create/convert on save
      })
      .catch(() => setError("Failed to load homepage"))
      .finally(() => setLoading(false));
  }, [sectionIndex]);

  const save = () => {
    if (!page) return;
    setSaving(true);
    setError("");
    const content = [...(page.content ?? [])];
    // Ensure we have a slot at sectionIndex (pad with placeholders if needed)
    while (content.length <= sectionIndex) {
      content.push({ type: "text", data: { content: "" }, id: `section-${Date.now()}-${content.length}` });
    }
    const existing = content[sectionIndex];
    content[sectionIndex] = {
      id: existing?.id ?? `section-${Date.now()}`,
      type: "hero",
      data: heroData,
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
        <p className="text-slate-500">Loading hero section…</p>
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
  const sectionTypeStr = typeof section?.type === "string" ? (section.type as string).toLowerCase() : "";
  const isHeroSection =
    sectionTypeStr === "hero" ||
    (section?.data &&
      (section.data.headline !== undefined ||
        (section.data as Record<string, unknown>).left_blocks !== undefined ||
        (section.data as Record<string, unknown>).design !== undefined));

  // Show hero editor for hero type, hero-shaped data, or empty slot. Only redirect when section is clearly another type (e.g. text, features).
  if (section && !isHeroSection && section.type) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <p className="text-slate-600 mb-4">This section is not a hero. Use the homepage builder to edit it.</p>
        <Link href="/admin/homepage" className="text-primary font-medium hover:underline">← Back to Homepage</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Breadcrumb & header */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/homepage" className="hover:text-slate-700 transition">Homepage</Link>
        <span aria-hidden>/</span>
        <span className="text-slate-800 font-medium">Edit Hero</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hero section</h1>
          <p className="text-slate-500 text-sm mt-1">Design, content, and layout. Changes apply to this section on the homepage.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/homepage"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition"
          >
            {saving ? "Saving…" : "Save and go back"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Main editor in a card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Content & design</h2>
          <p className="text-sm text-slate-500 mt-0.5">Update layout, background, and blocks. Use the blocks in the order you want them to appear.</p>
        </div>
        <div className="p-6 sm:p-8">
          <HeroSectionEditor data={heroData} setData={setHeroData} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save and go back"}
        </button>
      </div>
    </div>
  );
}
