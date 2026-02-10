"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Section, SectionDesign } from "../../../components/SectionRenderer";

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

/** Reusable design panel: background, colors, padding. */
function DesignFields({
  design,
  onChange,
}: {
  design: SectionDesign | undefined;
  onChange: (d: SectionDesign) => void;
}) {
  const d = design ?? {};
  const set = (key: keyof SectionDesign, value: unknown) => onChange({ ...d, [key]: value });
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">Design (background &amp; layout)</h4>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Background</label>
        <select
          value={(d.background_type as string) ?? "color"}
          onChange={(e) => set("background_type", e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="color">Solid color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {(d.background_type ?? "color") === "color" && (
        <ColorField label="Background color" value={(d.background_color as string) ?? "#ffffff"} onChange={(v) => set("background_color", v)} />
      )}
      {(d.background_type ?? "color") === "gradient" && (
        <>
          <ColorField label="Gradient from" value={(d.gradient_from as string) ?? "#0f172a"} onChange={(v) => set("gradient_from", v)} />
          <ColorField label="Gradient to" value={(d.gradient_to as string) ?? "#1e293b"} onChange={(v) => set("gradient_to", v)} />
        </>
      )}
      {(d.background_type ?? "color") === "image" && (
        <>
          <Field label="Background image URL" value={(d.background_image_url as string) ?? ""} onChange={(v) => set("background_image_url", v)} placeholder="https://..." />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Overlay opacity (0–1)</label>
            <input type="number" min={0} max={1} step={0.1} value={(d.overlay_opacity as number) ?? 0.3} onChange={(e) => set("overlay_opacity", parseFloat(e.target.value) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </>
      )}
      <ColorField label="Text color" value={(d.text_color as string) ?? "#1e293b"} onChange={(v) => set("text_color", v)} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Padding top (px)</label>
          <input type="number" value={(d.padding_top as number) ?? 48} onChange={(e) => set("padding_top", parseInt(e.target.value, 10) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Padding bottom (px)</label>
          <input type="number" value={(d.padding_bottom as number) ?? 48} onChange={(e) => set("padding_bottom", parseInt(e.target.value, 10) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
    </div>
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
  const type = section.type || "text";

  function normalizeToServicesForm(sectionData: Record<string, unknown>): Record<string, unknown> {
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

  const [data, setData] = useState<Record<string, unknown>>(() => {
    const raw = { ...(section.data || {}) };
    if (type === "service_list" || type === "services-grid") return normalizeToServicesForm(raw);
    return raw;
  });

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
              <div className="py-6 text-center">
                <p className="text-slate-600 mb-4">Hero sections are edited on a dedicated page for full design control and a better experience.</p>
                <Link href="/admin/homepage/hero?index=0" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition">
                  Open hero editor →
                </Link>
              </div>
            )}
            {type === "text" && (
              <>
                <Field label="Title (optional)" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Section title" />
                <Field label="Content" value={(data.content as string) || ""} onChange={(v) => set("content", v)} rows={5} placeholder="Your text..." />
                <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
              </>
            )}
            {type === "image" && (
              <>
                <Field label="Image URL" value={(data.url as string) || ""} onChange={(v) => set("url", v)} type="url" placeholder="https://..." />
                <Field label="Alt text" value={(data.alt as string) || ""} onChange={(v) => set("alt", v)} placeholder="Describe the image" />
                <Field label="Caption (optional)" value={(data.caption as string) || ""} onChange={(v) => set("caption", v)} placeholder="Caption below image" />
                <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
              </>
            )}
            {type === "features" && (
              <>
                <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Features" />
                <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional description" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Items (drag to reorder in list)</label>
                  {((data.items as string[]) || []).map((item, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2">
                      <input
                        value={item}
                        onChange={(e) => {
                          const items = [...((data.items as string[]) || [])];
                          if (!items[i]) items[i] = "";
                          items[i] = e.target.value;
                          set("items", items);
                        }}
                        placeholder="Feature text"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <button type="button" onClick={() => { const items = ((data.items as string[]) || []).filter((_, j) => j !== i); set("items", items); }} className="text-slate-400 hover:text-red-600 p-1" aria-label="Remove">×</button>
                      <button type="button" onClick={() => { if (i === 0) return; const items = [...((data.items as string[]) || [])]; [items[i - 1], items[i]] = [items[i], items[i - 1]]; set("items", items); }} className="text-slate-500 px-1" aria-label="Move up">↑</button>
                      <button type="button" onClick={() => { const items = [...((data.items as string[]) || [])]; if (i >= items.length - 1) return; [items[i], items[i + 1]] = [items[i + 1], items[i]]; set("items", items); }} className="text-slate-500 px-1" aria-label="Move down">↓</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set("items", [...((data.items as string[]) || []), ""])} className="text-sm font-medium text-primary hover:underline">+ Add item</button>
                </div>
                <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
              </>
            )}
            {type === "stats" && (
              <>
                <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Let's talk numbers" />
                <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stats (value + label, reorder with ↑↓)</label>
                  <div className="space-y-3">
                    {((data.items as Array<{ value?: string; label?: string }>) || []).map((item, i) => (
                      <div key={i} className="flex gap-2 items-center flex-wrap">
                        <input value={item?.value ?? ""} onChange={(e) => { const items = [...((data.items as Array<{ value?: string; label?: string }>) || [])]; if (!items[i]) items[i] = {}; items[i] = { ...items[i], value: e.target.value }; set("items", items); }} placeholder="150+" className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input value={item?.label ?? ""} onChange={(e) => { const items = [...((data.items as Array<{ value?: string; label?: string }>) || [])]; if (!items[i]) items[i] = {}; items[i] = { ...items[i], label: e.target.value }; set("items", items); }} placeholder="Label" className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <button type="button" onClick={() => { const items = ((data.items as Array<{ value?: string; label?: string }>) || []).filter((_, j) => j !== i); set("items", items); }} className="text-slate-400 hover:text-red-600 p-1" aria-label="Remove">×</button>
                        <button type="button" onClick={() => { if (i === 0) return; const items = [...((data.items as Array<{ value?: string; label?: string }>) || [])]; [items[i - 1], items[i]] = [items[i], items[i - 1]]; set("items", items); }} className="text-slate-500 px-1" aria-label="Move up">↑</button>
                        <button type="button" onClick={() => { const items = [...((data.items as Array<{ value?: string; label?: string }>) || [])]; if (i >= items.length - 1) return; [items[i], items[i + 1]] = [items[i + 1], items[i]]; set("items", items); }} className="text-slate-500 px-1" aria-label="Move down">↓</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => set("items", [...((data.items as Array<{ value?: string; label?: string }>) || []), { value: "", label: "" }])} className="text-sm font-medium text-primary hover:underline">+ Add stat</button>
                  </div>
                </div>
                <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
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
                        <div className="flex items-center gap-1 flex-wrap">
                          <button type="button" onClick={() => set("items", ((data.items as unknown[]) || []).filter((_, j) => j !== i))} className="text-sm text-slate-500 hover:text-red-600">Remove</button>
                          <button type="button" onClick={() => { if (i === 0) return; const items = [...((data.items as Array<Record<string, string>>) || [])]; [items[i - 1], items[i]] = [items[i], items[i - 1]]; set("items", items); }} className="text-slate-500 px-1">↑</button>
                          <button type="button" onClick={() => { const items = [...((data.items as Array<Record<string, string>>) || [])]; if (i >= items.length - 1) return; [items[i], items[i + 1]] = [items[i + 1], items[i]]; set("items", items); }} className="text-slate-500 px-1">↓</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => set("items", [...((data.items as Array<Record<string, string>>) || []), { quote: "", author: "", role: "", company: "" }])} className="text-sm font-medium text-primary hover:underline">+ Add testimonial</button>
                  </div>
                </div>
                <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
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
                <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
              </>
            )}
            {(type === "services" || type === "service_list" || type === "services-grid") && (() => {
              const services = (data.services as Array<Record<string, unknown>>) || [];
              const design = (data.design as SectionDesign & { card_background_color?: string; title_color?: string; icon_size?: number; columns?: number; button_gradient_from?: string; button_gradient_to?: string }) || {};
              return (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Layout</label>
                    <select value={(data.layout as string) ?? "cards"} onChange={(e) => set("layout", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                      <option value="cards">Cards</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>
                  <Field label="Section title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Our Services" />
                  <Field label="Subtitle" value={(data.subtitle as string) || ""} onChange={(v) => set("subtitle", v)} placeholder="Optional" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Services — check Show to display</label>
                    {services.map((svc, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 mb-2 space-y-2">
                        <div className="flex gap-2 items-center flex-wrap">
                          <label className="flex items-center gap-1.5 shrink-0">
                            <input type="checkbox" checked={(svc.enabled as boolean) !== false} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], enabled: e.target.checked }; set("services", next); }} className="rounded border-slate-300 text-primary" />
                            <span className="text-sm">Show</span>
                          </label>
                          <input value={(svc.title as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], title: e.target.value }; set("services", next); }} placeholder="Title" className="flex-1 min-w-[100px] border border-slate-200 rounded px-2 py-1.5 text-sm" />
                          <button type="button" onClick={() => set("services", services.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600 p-1">×</button>
                          <button type="button" onClick={() => { if (i === 0) return; const next = [...services]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; set("services", next); }} className="text-slate-500 px-1">↑</button>
                          <button type="button" onClick={() => { if (i >= services.length - 1) return; const next = [...services]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; set("services", next); }} className="text-slate-500 px-1">↓</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={(svc.description as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], description: e.target.value }; set("services", next); }} placeholder="Description" className="border border-slate-200 rounded px-2 py-1.5 text-sm" />
                          <input value={(svc.link as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], link: e.target.value }; set("services", next); }} placeholder="Link" className="border border-slate-200 rounded px-2 py-1.5 text-sm" />
                          <input value={(svc.button_text as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], button_text: e.target.value }; set("services", next); }} placeholder="Button text" className="border border-slate-200 rounded px-2 py-1.5 text-sm" />
                          <input value={(svc.button_link as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], button_link: e.target.value }; set("services", next); }} placeholder="Button link" className="border border-slate-200 rounded px-2 py-1.5 text-sm" />
                        </div>
                        {((svc.icons as Array<{ url?: string }>) ?? []).map((icon, j) => (
                          <div key={j} className="flex gap-2 items-center">
                            <input value={icon?.url ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; const icons = [...((next[i].icons as Array<Record<string, string>>) ?? [])]; if (!icons[j]) icons[j] = {}; icons[j] = { ...icons[j], url: e.target.value }; next[i] = { ...next[i], icons }; set("services", next); }} placeholder="Icon URL" className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm" />
                            <button type="button" onClick={() => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], icons: ((next[i].icons as unknown[]) ?? []).filter((_, k) => k !== j) }; set("services", next); }} className="p-1 text-slate-400 hover:text-red-600">×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], icons: [...((next[i].icons as Array<Record<string, string>>) ?? []), { url: "", alt: "" }] }; set("services", next); }} className="text-xs text-primary hover:underline">+ Icon</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => set("services", [...services, { enabled: true, title: "", icons: [] }])} className="text-sm font-medium text-primary hover:underline">+ Add service</button>
                  </div>
                  <DesignFields design={design} onChange={(d) => set("design", { ...design, ...d })} />
                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700">Styling</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <ColorField label="Card bg" value={design.card_background_color ?? "rgba(255,255,255,0.06)"} onChange={(v) => set("design", { ...design, card_background_color: v })} />
                      <ColorField label="Title color" value={design.title_color ?? "#ffffff"} onChange={(v) => set("design", { ...design, title_color: v })} />
                      <div>
                        <label className="block text-xs text-slate-600 mb-0.5">Icon size</label>
                        <input type="number" min={16} max={64} value={design.icon_size ?? 32} onChange={(e) => set("design", { ...design, icon_size: parseInt(e.target.value, 10) || 32 })} className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-0.5">Columns</label>
                        <input type="number" min={1} max={4} value={design.columns ?? 3} onChange={(e) => set("design", { ...design, columns: parseInt(e.target.value, 10) || 3 })} className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm" />
                      </div>
                      <ColorField label="Btn from" value={design.button_gradient_from ?? "#9333ea"} onChange={(v) => set("design", { ...design, button_gradient_from: v })} />
                      <ColorField label="Btn to" value={design.button_gradient_to ?? "#db2777"} onChange={(v) => set("design", { ...design, button_gradient_to: v })} />
                    </div>
                  </div>
                </>
              );
            })()}
            {!["hero", "text", "image", "features", "stats", "testimonials", "cta", "services", "service_list", "services-grid"].includes(type) && (
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
