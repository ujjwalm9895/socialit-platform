"use client";

import { useState, useEffect } from "react";
import type { Section } from "../../../components/SectionRenderer";

function hexToInput(hex: string) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#ffffff";
  return hex;
}
function inputToHex(s: string) {
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return "#" + s;
  return s || "#ffffff";
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const hex = hexToInput(value || "#ffffff");
  const [text, setText] = useState(hex);
  useEffect(() => {
    setText(hex);
  }, [hex]);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onChange(v);
          }}
          className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer bg-white"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const v = inputToHex(text);
            setText(v);
            onChange(v);
          }}
          className="flex-1 font-mono text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "url";
  placeholder?: string;
  rows?: number;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  if (rows) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

export default function SectionEditorModal({
  section,
  onSave,
  onClose,
}: {
  section: Section;
  onSave: (data: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>({ ...(section.data || {}) });
  const type = section.type || "text";

  const set = (key: string, value: unknown) => setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Edit section: {type}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Change content and styling below.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {type === "hero" && (
              <>
                <Field label="Badge" value={(data.badge as string) || ""} onChange={(v) => set("badge", v)} placeholder="Optional badge text" />
                <Field label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} placeholder="Main headline" />
                <Field label="Subheading" value={(data.subheading as string) || ""} onChange={(v) => set("subheading", v)} rows={2} placeholder="Supporting text" />
                <Field label="Button text" value={(data.buttonText as string) || ""} onChange={(v) => set("buttonText", v)} placeholder="Get started" />
                <Field label="Button link" value={(data.buttonLink as string) || ""} onChange={(v) => set("buttonLink", v)} type="url" placeholder="/contact" />
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Styling</p>
                  <div className="space-y-3">
                    <Checkbox
                      label="Use gradient background"
                      checked={!!data.useGradient}
                      onChange={(v) => set("useGradient", v)}
                    />
                    <ColorField
                      label="Text color"
                      value={(data.textColor as string) || "#FFFFFF"}
                      onChange={(v) => set("textColor", v)}
                    />
                    <ColorField
                      label="Gradient end color"
                      value={(data.gradientTo as string) || "#2563eb"}
                      onChange={(v) => set("gradientTo", v)}
                    />
                  </div>
                </div>
              </>
            )}
            {type === "text" && (
              <>
                <Field label="Title (optional)" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Section title" />
                <Field label="Content" value={(data.content as string) || ""} onChange={(v) => set("content", v)} rows={5} placeholder="Your text..." />
              </>
            )}
            {type === "image" && (
              <>
                <Field label="Image URL" value={(data.url as string) || ""} onChange={(v) => set("url", v)} type="url" placeholder="https://..." />
                <Field label="Alt text" value={(data.alt as string) || ""} onChange={(v) => set("alt", v)} placeholder="Describe the image" />
                <Field label="Caption (optional)" value={(data.caption as string) || ""} onChange={(v) => set("caption", v)} placeholder="Caption below image" />
              </>
            )}
            {type === "features" && (
              <>
                <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Features" />
                <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional description" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Items (one per line)</label>
                  <textarea
                    value={((data.items as string[]) || []).join("\n")}
                    onChange={(e) => set("items", e.target.value.split("\n").filter(Boolean))}
                    rows={5}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Feature one&#10;Feature two&#10;Feature three"
                  />
                </div>
              </>
            )}
            {type === "stats" && (
              <>
                <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Let's talk numbers" />
                <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stats (value + label)</label>
                  <div className="space-y-3">
                    {((data.items as Array<{ value?: string; label?: string }>) || []).map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={item?.value ?? ""}
                          onChange={(e) => {
                            const items = [...((data.items as Array<{ value?: string; label?: string }>) || [])];
                            if (!items[i]) items[i] = {};
                            items[i] = { ...items[i], value: e.target.value };
                            set("items", items);
                          }}
                          placeholder="150+"
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                        <input
                          value={item?.label ?? ""}
                          onChange={(e) => {
                            const items = [...((data.items as Array<{ value?: string; label?: string }>) || [])];
                            if (!items[i]) items[i] = {};
                            items[i] = { ...items[i], label: e.target.value };
                            set("items", items);
                          }}
                          placeholder="Label"
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const items = ((data.items as Array<{ value?: string; label?: string }>) || []).filter((_, j) => j !== i);
                            set("items", items);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => set("items", [...((data.items as Array<{ value?: string; label?: string }>) || []), { value: "", label: "" }])}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      + Add stat
                    </button>
                  </div>
                </div>
              </>
            )}
            {type === "testimonials" && (
              <>
                <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="What Our Clients Say" />
                <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Testimonials</label>
                  <div className="space-y-4">
                    {((data.items as Array<{ quote?: string; author?: string; role?: string; company?: string; image_url?: string }>) || []).map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-200 space-y-2">
                        <textarea
                          value={item?.quote ?? ""}
                          onChange={(e) => {
                            const items = [...((data.items as Array<Record<string, string>>) || [])];
                            if (!items[i]) items[i] = {};
                            items[i] = { ...items[i], quote: e.target.value };
                            set("items", items);
                          }}
                          placeholder="Quote"
                          rows={2}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={item?.author ?? ""}
                            onChange={(e) => {
                              const items = [...((data.items as Array<Record<string, string>>) || [])];
                              if (!items[i]) items[i] = {};
                              items[i] = { ...items[i], author: e.target.value };
                              set("items", items);
                            }}
                            placeholder="Author"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                          />
                          <input
                            value={item?.role ?? ""}
                            onChange={(e) => {
                              const items = [...((data.items as Array<Record<string, string>>) || [])];
                              if (!items[i]) items[i] = {};
                              items[i] = { ...items[i], role: e.target.value };
                              set("items", items);
                            }}
                            placeholder="Role"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                          />
                          <input
                            value={item?.company ?? ""}
                            onChange={(e) => {
                              const items = [...((data.items as Array<Record<string, string>>) || [])];
                              if (!items[i]) items[i] = {};
                              items[i] = { ...items[i], company: e.target.value };
                              set("items", items);
                            }}
                            placeholder="Company"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:ring-2 focus:ring-primary"
                          />
                          <input
                            value={item?.image_url ?? ""}
                            onChange={(e) => {
                              const items = [...((data.items as Array<Record<string, string>>) || [])];
                              if (!items[i]) items[i] = {};
                              items[i] = { ...items[i], image_url: e.target.value };
                              set("items", items);
                            }}
                            placeholder="Avatar URL (optional)"
                            type="url"
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => set("items", ((data.items as unknown[]) || []).filter((_, j) => j !== i))}
                          className="text-sm text-slate-500 hover:text-red-600"
                        >
                          Remove testimonial
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        set("items", [
                          ...((data.items as Array<Record<string, string>>) || []),
                          { quote: "", author: "", role: "", company: "" },
                        ])
                      }
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      + Add testimonial
                    </button>
                  </div>
                </div>
              </>
            )}
            {type === "cta" && (
              <>
                <Field label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} placeholder="Get in touch" />
                <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} rows={2} placeholder="We'd love to hear from you." />
                <Field label="Button text" value={(data.buttonText as string) || ""} onChange={(v) => set("buttonText", v)} placeholder="Contact" />
                <Field label="Button link" value={(data.buttonLink as string) || ""} onChange={(v) => set("buttonLink", v)} type="url" placeholder="/contact" />
                <Field label="Secondary button text" value={(data.secondaryText as string) || ""} onChange={(v) => set("secondaryText", v)} placeholder="Optional" />
                <Field label="Secondary button link" value={(data.secondaryLink as string) || ""} onChange={(v) => set("secondaryLink", v)} type="url" placeholder="#" />
              </>
            )}
            {!["hero", "text", "image", "features", "stats", "testimonials", "cta"].includes(type) && (
              <p className="text-slate-500 text-sm">No form for section type &quot;{type}&quot;. Edit in code or add a form.</p>
            )}
          </div>
          <div className="p-5 border-t border-slate-200 flex gap-3">
            <button
              type="submit"
              className="btn-flashy bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark"
            >
              Apply
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
