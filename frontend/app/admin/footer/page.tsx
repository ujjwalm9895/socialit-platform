"use client";

import { useEffect, useState } from "react";
import api from "../../api-client";
import ColorField from "../components/ColorField";
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

type FooterLink = { id?: string; label: string; href: string; open_in_new_tab?: boolean };
type FooterColumn = { id?: string; title?: string; content?: string; links?: FooterLink[] };
type FooterConfig = {
  columns?: FooterColumn[];
  copyright_text?: string;
  newsletter_title?: string;
  newsletter_placeholder?: string;
  newsletter_button_text?: string;
  legal_links?: FooterLink[];
  styling?: { background_color?: string; text_color?: string; link_color?: string };
};

const defaultConfig: FooterConfig = {
  columns: [
    { title: "Links", links: [{ label: "Services", href: "/services" }, { label: "Blogs", href: "/blogs" }, { label: "Case Studies", href: "/case-studies" }] },
  ],
  copyright_text: "© {year} Social IT. All rights reserved.",
  styling: { background_color: "#f3f4f6", text_color: "#6b7280", link_color: "#6366f1" },
};

function ColumnCard({
  column,
  index,
  onUpdate,
  onRemove,
}: {
  column: FooterColumn;
  index: number;
  onUpdate: (col: FooterColumn) => void;
  onRemove: () => void;
}) {
  const links = column.links ?? [];
  const setLinks = (newLinks: FooterLink[]) => onUpdate({ ...column, links: newLinks });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `footer-col-${index}` });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border-2 bg-white overflow-hidden ${isDragging ? "border-primary shadow-lg z-10" : "border-slate-200"}`}
    >
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
        <button
          type="button"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag column"
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <input
          value={column.title ?? ""}
          onChange={(e) => onUpdate({ ...column, title: e.target.value })}
          placeholder="Column title"
          className="flex-1 font-medium border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
          aria-label="Remove column"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="p-4 pb-0">
        <label className="block text-xs font-medium text-slate-500 mb-1">Column description (optional)</label>
        <textarea
          value={column.content ?? ""}
          onChange={(e) => onUpdate({ ...column, content: e.target.value })}
          placeholder="Short text or leave empty"
          rows={2}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="p-4 space-y-2">
        {links.map((link, j) => (
          <div key={link.id ?? j} className="flex gap-2">
            <input
              value={link.label}
              onChange={(e) => {
                const next = [...links];
                next[j] = { ...next[j], label: e.target.value };
                setLinks(next);
              }}
              placeholder="Label"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            />
            <input
              value={link.href}
              onChange={(e) => {
                const next = [...links];
                next[j] = { ...next[j], href: e.target.value };
                setLinks(next);
              }}
              placeholder="/path"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setLinks(links.filter((_, k) => k !== j))}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
              aria-label="Remove link"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLinks([...links, { label: "", href: "#" }])}
          className="text-sm font-medium text-primary hover:underline"
        >
          + Add link
        </button>
      </div>
    </div>
  );
}

export default function AdminFooterPage() {
  const [config, setConfig] = useState<FooterConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<FooterConfig>("/cms/site-settings/footer")
      .then((r) => setConfig({ ...defaultConfig, ...(r.data ?? {}) }))
      .catch(() => setConfig(defaultConfig))
      .finally(() => setLoading(false));
  }, []);

  const columns = config.columns ?? [];
  const setColumns = (cols: FooterColumn[]) => setConfig((prev) => ({ ...prev, columns: cols }));
  const setStyling = (key: string, value: string) =>
    setConfig((prev) => ({ ...prev, styling: { ...(prev.styling ?? {}), [key]: value } }));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = columns.map((_, i) => `footer-col-${i}`);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setColumns(arrayMove(columns, oldIndex, newIndex));
  };

  const save = () => {
    setError("");
    setSaving(true);
    api
      .put("/cms/site-settings/footer", config)
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch((err) => setError(err.response?.data?.detail ?? "Failed to save"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500">Loading footer…</p>
      </div>
    );
  }

  const styling = config.styling ?? {};

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Footer</h1>
          <p className="text-slate-500 text-sm mt-1">Columns and links. Drag columns to reorder. Use {"{year}"} in copyright for current year.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save footer"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">Saved.</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Copyright</h2>
        <input
          value={config.copyright_text ?? ""}
          onChange={(e) => setConfig((prev) => ({ ...prev, copyright_text: e.target.value }))}
          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="© {year} Your Company."
        />
        <p className="text-xs text-slate-500 mt-1">Use {"{year}"} to insert current year.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Newsletter</h2>
        <div className="space-y-3">
          <input
            value={config.newsletter_title ?? ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, newsletter_title: e.target.value }))}
            placeholder="Subscribe to Our Newsletter for the Latest Updates"
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={config.newsletter_placeholder ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, newsletter_placeholder: e.target.value }))}
              placeholder="Placeholder (e.g. Your email)"
              className="border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
            />
            <input
              value={config.newsletter_button_text ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, newsletter_button_text: e.target.value }))}
              placeholder="Button text (e.g. Send)"
              className="border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Legal links (Terms, Privacy)</h2>
        <ul className="space-y-2">
          {(config.legal_links ?? []).map((link, j) => (
            <li key={link.id ?? j} className="flex gap-2">
              <input
                value={link.label}
                onChange={(e) => {
                  const next = [...(config.legal_links ?? [])];
                  next[j] = { ...next[j], label: e.target.value };
                  setConfig((prev) => ({ ...prev, legal_links: next }));
                }}
                placeholder="Label"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={link.href}
                onChange={(e) => {
                  const next = [...(config.legal_links ?? [])];
                  next[j] = { ...next[j], href: e.target.value };
                  setConfig((prev) => ({ ...prev, legal_links: next }));
                }}
                placeholder="/terms"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, legal_links: (prev.legal_links ?? []).filter((_, k) => k !== j) }))}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setConfig((prev) => ({ ...prev, legal_links: [...(prev.legal_links ?? []), { label: "", href: "/terms" }] }))}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          + Add legal link
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Columns (drag to reorder)</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={columns.map((_, i) => `footer-col-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-4">
              {columns.map((col, i) => (
                <li key={`footer-col-${i}`}>
                  <ColumnCard
                    column={col}
                    index={i}
                    onUpdate={(updated) => setColumns(columns.map((c, j) => (j === i ? updated : c)))}
                    onRemove={() => setColumns(columns.filter((_, j) => j !== i))}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <button
          type="button"
          onClick={() => setColumns([...columns, { title: "New column", links: [] }])}
          className="mt-4 px-4 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 hover:border-primary hover:text-primary text-sm font-medium"
        >
          + Add column
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Footer styling</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField
            label="Background"
            value={styling.background_color ?? "#f3f4f6"}
            onChange={(v) => setStyling("background_color", v)}
          />
          <ColorField
            label="Text color"
            value={styling.text_color ?? "#6b7280"}
            onChange={(v) => setStyling("text_color", v)}
          />
          <ColorField
            label="Link color"
            value={styling.link_color ?? "#6366f1"}
            onChange={(v) => setStyling("link_color", v)}
          />
        </div>
      </div>
    </div>
  );
}
