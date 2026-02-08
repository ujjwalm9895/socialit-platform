"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import api from "../../../api-client";
import type { Section } from "../../../../components/SectionRenderer";
import SectionEditorModal from "../../components/SectionEditorModal";

type PageRecord = {
  id: string;
  title: string;
  slug: string;
  content: Section[];
  status: string;
};

const SECTION_DEFAULTS: Record<string, Record<string, unknown>> = {
  hero: { heading: "Welcome", subheading: "Your tagline here", buttonText: "Get started", buttonLink: "#" },
  text: { content: "Add your text content here." },
  image: { url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800", alt: "Image" },
  features: { title: "Features", items: ["Feature one", "Feature two", "Feature three"] },
  stats: { title: "Let's talk numbers", subtext: "Our journey so far.", items: [{ value: "150+", label: "Happy Clients" }, { value: "20K+", label: "Unique Designs" }, { value: "8+", label: "Years Experience" }, { value: "20+", label: "States Served" }] },
  testimonials: { title: "What Our Clients Say", items: [{ quote: "Great partnership.", author: "Client Name", role: "CEO", company: "Company" }] },
  cta: { heading: "Get in touch", subtext: "We'd love to hear from you.", buttonText: "Contact", buttonLink: "#" },
};

const SECTION_TYPES = ["hero", "text", "image", "features", "stats", "testimonials", "cta"] as const;

function SectionCard({
  id,
  section,
  onEdit,
  onRemove,
}: {
  id: string;
  section: Section;
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
        <span className="font-medium text-slate-800 capitalize">{section.type}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Edit
        </button>
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

export default function AdminPageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [metaSaving, setMetaSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    api
      .get<PageRecord>(`/cms/pages/${id}`)
      .then((res) => {
        setPage(res.data);
        setTitle(res.data.title ?? "");
        setSlug(res.data.slug ?? "");
        setStatus((res.data.status as "draft" | "published") ?? "draft");
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setPage(null);
        } else {
          setError(err.response?.data?.detail || "Failed to load");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const saveContent = () => {
    if (!page) return;
    setSaving(true);
    api
      .put<PageRecord>(`/cms/pages/${page.id}`, { content: page.content })
      .then((res) => {
        setPage(res.data);
        setSaving(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to save");
        setSaving(false);
      });
  };

  const saveMeta = () => {
    if (!page) return;
    setMetaSaving(true);
    api
      .put<PageRecord>(`/cms/pages/${page.id}`, { title: title.trim(), slug: slug.trim(), status })
      .then((res) => {
        setPage(res.data);
        setMetaSaving(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to save");
        setMetaSaving(false);
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

  const openEdit = (index: number) => setEditIndex(index);

  const applyEdit = (data: Record<string, unknown>) => {
    if (editIndex === null || !page?.content) return;
    updateSection(editIndex, data);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500">Loading page…</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <Link href="/admin/pages" className="text-slate-600 hover:text-slate-900 text-sm font-medium">← Pages</Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-600 mb-4">Page not found.</p>
          <Link href="/admin/pages" className="text-primary font-medium hover:underline">Back to Pages</Link>
        </div>
      </div>
    );
  }

  const sections = page.content ?? [];
  const sectionIds = sections.map((s, i) => s.id ?? `section-${i}`);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/pages" className="text-slate-600 hover:text-slate-900 text-sm font-medium">← Pages</Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit page</h1>
      </div>

      {/* Page meta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Page details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug (URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="about-us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={saveMeta}
          disabled={metaSaving}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {metaSaving ? "Saving…" : "Save details"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-slate-600 text-sm">Sections: drag to reorder, then save.</p>
        <button
          type="button"
          onClick={saveContent}
          disabled={saving}
          className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 disabled:transform-none transition-colors"
        >
          {saving ? "Saving…" : "Save sections"}
        </button>
      </div>

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
