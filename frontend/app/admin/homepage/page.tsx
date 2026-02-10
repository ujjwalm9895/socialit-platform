"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../api-client";
import type { Section } from "../../../components/SectionRenderer";
import SectionEditorModal from "../components/SectionEditorModal";

type PageRecord = {
  id: string;
  title: string;
  slug: string;
  content: Section[];
  status: string;
};

const SECTION_DEFAULTS: Record<string, Record<string, unknown>> = {
  hero: {
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
      {
        id: "hero-btns",
        type: "button_group",
        content: {
          buttons: [
            { text: "Get A Demo", link: "/contact", style: "primary" },
            { text: "Explore Case Study", link: "/case-studies", style: "outline" },
          ],
        },
      },
      {
        id: "hero-logos",
        type: "logo_row",
        content: {
          headline: "Trusted & Awarded By Global Leaders",
          logos: [
            { image_url: "https://socialit.in/logo_webp/JCI.png", link_url: "", alt: "JCI" },
            { image_url: "https://socialit.in/logo_webp/Indian.png", link_url: "", alt: "Indian Achievers" },
            { image_url: "https://socialit.in/logo_webp/Rotary.png", link_url: "", alt: "Rotary" },
          ],
        },
      },
    ],
    right_blocks: [
      { id: "hero-img", type: "image", content: { url: "https://socialit.in/assets/img/homebanner.webp", alt: "Hero banner", link: "" } },
    ],
    chat_button_text: "Let's Chat",
    chat_button_link: "/contact",
  },
  text: {
    title: "Why Choose Us",
    content: "We combine strategy, design, and technology to deliver digital experiences that build trust and drive growth. From concept to launch and beyond, we partner with you every step of the way.",
    design: { background_type: "color", background_color: "#f8fafc", text_color: "#1e293b", padding_top: 64, padding_bottom: 64 },
  },
  image: {
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200",
    alt: "Team collaboration",
    caption: "Building digital products that matter",
    design: { background_type: "color", background_color: "#ffffff", padding_top: 48, padding_bottom: 48 },
  },
  features: {
    title: "What We Offer",
    subtext: "End-to-end solutions tailored to your business goals.",
    items: [
      "Custom web and mobile development",
      "UI/UX design and branding",
      "Digital marketing and SEO",
      "Ongoing support and maintenance",
    ],
    design: { background_type: "color", background_color: "#ffffff", text_color: "#1e293b", padding_top: 64, padding_bottom: 64 },
  },
  stats: {
    title: "Our Impact",
    subtext: "Numbers that reflect our commitment to excellence.",
    items: [
      { value: "150+", label: "Happy Clients" },
      { value: "20K+", label: "Projects Delivered" },
      { value: "8+", label: "Years Experience" },
      { value: "20+", label: "States Served" },
    ],
    design: { background_type: "gradient", gradient_from: "#0f172a", gradient_to: "#1e293b", text_color: "#ffffff", padding_top: 64, padding_bottom: 64 },
  },
  testimonials: {
    title: "What Our Clients Say",
    subtext: "Real feedback from the teams we work with.",
    items: [
      { quote: "Professional, responsive, and delivered beyond our expectations. Our new site has driven real growth.", author: "Priya Sharma", role: "Marketing Head", company: "TechStart India" },
      { quote: "From strategy to design to development — one team, one vision. Highly recommend.", author: "Rahul Verma", role: "Founder", company: "ScaleUp" },
    ],
    design: { background_type: "color", background_color: "#0f172a", text_color: "#ffffff", padding_top: 64, padding_bottom: 64 },
  },
  cta: {
    heading: "Ready to start your project?",
    subtext: "Tell us your goals and we'll help you get there. No commitment, just a friendly conversation.",
    buttonText: "Get in touch",
    buttonLink: "/contact",
    secondaryText: "View our work",
    secondaryLink: "/work",
    design: { background_type: "gradient", gradient_from: "#9333ea", gradient_to: "#db2777", text_color: "#ffffff", padding_top: 64, padding_bottom: 64 },
  },
  services: {
    layout: "cards",
    title: "Our Services",
    subtitle: "End-to-end digital solutions that drive growth and engagement.",
    services: [
      { enabled: true, title: "App Development", description: "Native and cross-platform apps", link: "/services/app-development", icons: [] },
      { enabled: true, title: "Website Development", description: "Custom web solutions", link: "/services/website-development", icons: [] },
      { enabled: true, title: "UI/UX Design", description: "User-centred design", link: "/services/ui-ux", icons: [] },
      { enabled: true, title: "Social Media Marketing", description: "Engage and grow", link: "/services/social-media", icons: [] },
      { enabled: true, title: "Graphic Design", description: "Brand and visual identity", link: "/services/graphic-design", icons: [] },
      { enabled: true, title: "Digital Marketing", description: "SEO and growth", link: "/services/digital-marketing", icons: [] },
      { enabled: true, title: "Logo Design", description: "Memorable brand marks", link: "/services/logo-design", icons: [] },
      { enabled: true, title: "Branding & Advertising", description: "Strategy and campaigns", link: "/services/branding", icons: [] },
      { enabled: true, title: "Packaging Design", description: "Stand out on the shelf", button_text: "Let's Chat", button_link: "/contact", icons: [] },
    ],
    design: {
      background_type: "color",
      background_color: "#000000",
      text_color: "#ffffff",
      padding_top: 64,
      padding_bottom: 64,
      card_background_color: "rgba(255,255,255,0.06)",
      title_color: "#ffffff",
      icon_size: 32,
      columns: 3,
      button_gradient_from: "#9333ea",
      button_gradient_to: "#db2777",
      button_text_color: "#ffffff",
    },
  },
};

const SECTION_TYPES = ["hero", "text", "image", "features", "stats", "testimonials", "cta", "services"] as const;

/** Initial content when creating the homepage: hero + services + decorated sections. */
const DEFAULT_HOMEPAGE_CONTENT: Section[] = [
  { id: "section-hero-1", type: "hero", data: SECTION_DEFAULTS.hero as Record<string, unknown> },
  { id: "section-services-1", type: "services", data: SECTION_DEFAULTS.services as Record<string, unknown> },
  { id: "section-text-1", type: "text", data: SECTION_DEFAULTS.text as Record<string, unknown> },
  { id: "section-features-1", type: "features", data: SECTION_DEFAULTS.features as Record<string, unknown> },
  { id: "section-stats-1", type: "stats", data: SECTION_DEFAULTS.stats as Record<string, unknown> },
  { id: "section-testimonials-1", type: "testimonials", data: SECTION_DEFAULTS.testimonials as Record<string, unknown> },
  { id: "section-cta-1", type: "cta", data: SECTION_DEFAULTS.cta as Record<string, unknown> },
];

function SectionCard({
  id,
  section,
  sectionIndex,
  onEdit,
  onRemove,
}: {
  id: string;
  section: Section;
  sectionIndex: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border-2 transition-shadow flex items-center gap-4 p-4 ${
        isDragging ? "border-primary shadow-lg z-10" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-slate-800 capitalize">{section.type.replace(/_/g, " ")}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {section.type === "hero" ? (
          <Link href={`/admin/homepage/hero?index=${sectionIndex}`} className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Edit
          </Link>
        ) : (
          <Link href={`/admin/homepage/edit?type=${encodeURIComponent(section.type)}&index=${sectionIndex}`} className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Edit
          </Link>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function HomepageBuilderPage() {
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadHome = () => {
    setLoading(true);
    setError("");
    api
      .get<PageRecord>("/cms/pages/slug/home")
      .then((res) => {
        setPage(res.data);
        setError("");
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setPage(null);
          setError("");
        } else if (err.response?.status === 401) {
          setError("Session expired or not logged in. Try logging in again.");
        } else {
          const detail = err.response?.data?.detail;
          const msg = Array.isArray(detail) ? detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join("; ") : (typeof detail === "string" ? detail : "Failed to load homepage");
          setError(msg || "Failed to load. Check that the API is reachable and you are logged in.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHome();
  }, []);

  const createHomePage = () => {
    setCreating(true);
    setError("");
    api
      .post<PageRecord>("/cms/pages", {
        slug: "home",
        title: "Home",
        content: DEFAULT_HOMEPAGE_CONTENT,
        status: "published",
      })
      .then((res) => {
        setPage(res.data);
        setError("");
        setCreating(false);
      })
      .catch((err) => {
        const detail = err.response?.data?.detail;
        const msg = Array.isArray(detail) ? detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join("; ") : (typeof detail === "string" ? detail : "Failed to create");
        setError(msg || "Failed to create homepage. Ensure you have Admin or Editor role.");
        setCreating(false);
      });
  };

  const addSection = (type: string) => {
    if (!page) return;
    const defaults = SECTION_DEFAULTS[type] ?? {};
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      data: { ...defaults },
    };
    const content = [...(page.content || []), newSection];
    setPage({ ...page, content });
  };

  const updateSection = (index: number, data: Record<string, unknown>) => {
    if (!page?.content) return;
    const content = page.content.map((s, i) => (i === index ? { ...s, data } : s));
    setPage({ ...page, content });
    setEditIndex(null);
  };

  const removeSection = (index: number) => {
    if (!page?.content) return;
    const content = page.content.filter((_, i) => i !== index);
    setPage({ ...page, content });
    setEditIndex(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !page?.content || active.id === over.id) return;
    const oldIndex = page.content.findIndex((s, i) => (s.id ?? `section-${i}`) === active.id);
    const newIndex = page.content.findIndex((s, i) => (s.id ?? `section-${i}`) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const content = arrayMove(page.content, oldIndex, newIndex);
    setPage({ ...page, content });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const save = () => {
    if (!page) return;
    setSaving(true);
    setError("");
    setSaveSuccess(false);
    api
      .put<PageRecord>(`/cms/pages/${page.id}`, { content: page.content })
      .then((res) => {
        setPage(res.data);
        setError("");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setSaving(false);
      })
      .catch((err) => {
        const detail = err.response?.data?.detail;
        const msg = Array.isArray(detail) ? detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join("; ") : (typeof detail === "string" ? detail : "Failed to save");
        setError(msg || "Failed to save. Ensure you have Admin or Editor role.");
        setSaving(false);
      });
  };

  const openEdit = (index: number) => setEditIndex(index);

  const applyEdit = (data: Record<string, unknown>) => {
    if (editIndex === null || !page?.content) return;
    updateSection(editIndex, data);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-slate-500">Loading homepage…</div>
      </div>
    );
  }

  if (error && !page && !creating) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md mx-auto">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => { setError(""); loadHome(); }}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!page && !creating) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-slate-600 mb-6">No homepage yet. Create it to start building.</p>
        <button
          type="button"
          onClick={createHomePage}
          disabled={creating}
          className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {creating ? "Creating..." : "Create home page"}
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const sections = page?.content ?? [];
  const sectionIds = sections.map((s, i) => s.id ?? `section-${i}`);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage sections</h1>
          <p className="text-slate-500 text-sm mt-1">Drag to reorder, then save.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 disabled:transform-none transition-colors"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          Homepage saved successfully.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <p className="text-sm font-medium text-slate-700 mb-3">Add section</p>
        <div className="flex flex-wrap gap-2">
          {SECTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addSection(type)}
              className="px-4 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors text-sm font-medium capitalize"
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Sections ({sections.length})</p>
        {sections.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500">
            No sections yet. Add one above.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-3">
                {sections.map((section, index) => (
                  <li key={section.id ?? `section-${index}`}>
                    <SectionCard
                      id={section.id ?? `section-${index}`}
                      section={section}
                      sectionIndex={index}
                      onEdit={() => openEdit(index)}
                      onRemove={() => removeSection(index)}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {editIndex !== null && page?.content?.[editIndex] && (
        <SectionEditorModal
          section={page.content[editIndex]}
          onSave={applyEdit}
          onClose={() => setEditIndex(null)}
        />
      )}
    </div>
  );
}
