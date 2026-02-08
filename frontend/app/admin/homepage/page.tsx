"use client";

import { useEffect, useState } from "react";
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

export default function HomepageBuilderPage() {
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const loadHome = () => {
    setLoading(true);
    setError("");
    api
      .get<PageRecord>("/cms/pages/slug/home")
      .then((res) => setPage(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setPage(null);
        else setError(err.response?.data?.detail || "Failed to load");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHome();
  }, []);

  const createHomePage = () => {
    setCreating(true);
    api
      .post<PageRecord>("/cms/pages", {
        slug: "home",
        title: "Home",
        content: [],
        status: "published",
      })
      .then((res) => {
        setPage(res.data);
        setCreating(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to create");
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

  const openEdit = (index: number) => setEditIndex(index);

  const applyEdit = (data: Record<string, unknown>) => {
    if (editIndex === null || !page?.content) return;
    updateSection(editIndex, data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading homepage...</div>
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
