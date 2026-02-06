"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import type { Section } from "../../../components/SectionRenderer";

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
  cta: { heading: "Get in touch", subtext: "We'd love to hear from you.", buttonText: "Contact", buttonLink: "#" },
};

const SECTION_TYPES = ["hero", "text", "image", "features", "cta"] as const;

export default function HomepageBuilderPage() {
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<string>("");

  const loadHome = () => {
    setLoading(true);
    setError("");
    api
      .get<PageRecord>("/cms/pages/slug/home")
      .then((res) => {
        setPage(res.data);
        setEditIndex(null);
      })
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
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      data: { ...SECTION_DEFAULTS[type] } || {},
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

  const moveSection = (index: number, dir: "up" | "down") => {
    if (!page?.content) return;
    const i = dir === "up" ? index - 1 : index + 1;
    if (i < 0 || i >= page.content.length) return;
    const content = [...page.content];
    [content[index], content[i]] = [content[i], content[index]];
    setPage({ ...page, content });
  };

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

  const openEdit = (index: number) => {
    const section = page?.content?.[index];
    setEditData(JSON.stringify(section?.data ?? {}, null, 2));
    setEditIndex(index);
  };

  const applyEdit = () => {
    if (editIndex === null || !page?.content) return;
    try {
      const data = JSON.parse(editData) as Record<string, unknown>;
      updateSection(editIndex, data);
    } catch {
      setError("Invalid JSON");
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading homepage...</p>;
  }

  if (!page && !creating) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No homepage yet. Create it to start building.</p>
        <button
          type="button"
          onClick={createHomePage}
          disabled={creating}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create home page"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const sections = page?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Homepage sections</h1>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        {SECTION_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addSection(type)}
            className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-300 capitalize"
          >
            + {type}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {sections.map((section, index) => (
          <li
            key={section.id ?? index}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <span className="font-medium capitalize text-gray-800">{section.type}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveSection(index, "up")}
                disabled={index === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-40 text-sm"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveSection(index, "down")}
                disabled={index === sections.length - 1}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-40 text-sm"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => openEdit(index)}
                className="text-indigo-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {sections.length === 0 && (
        <p className="text-gray-500">No sections yet. Add one using the buttons above.</p>
      )}

      {editIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Edit section data (JSON)</h2>
            <textarea
              value={editData}
              onChange={(e) => setEditData(e.target.value)}
              className="flex-1 min-h-[200px] font-mono text-sm border border-gray-300 rounded-lg p-3"
              spellCheck={false}
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={applyEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setEditIndex(null)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
