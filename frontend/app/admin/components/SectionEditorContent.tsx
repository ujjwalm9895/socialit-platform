"use client";

import { useState, useEffect } from "react";
import type { SectionDesign } from "../../../components/SectionRenderer";

function hexToInput(hex: string) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return "#ffffff";
  return hex;
}
function inputToHex(s: string) {
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return "#" + s;
  return s || "#ffffff";
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = hexToInput(value || "#ffffff");
  const [text, setText] = useState(hex);
  useEffect(() => setText(hex), [hex]);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={hex} onChange={(e) => { const v = e.target.value; setText(v); onChange(v); }} className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer bg-white" />
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => { const v = inputToHex(text); setText(v); onChange(v); }} className="flex-1 font-mono text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary" placeholder="#ffffff" />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; type?: "text" | "url"; placeholder?: string; rows?: number }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  if (rows) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
      </div>
    );
  }
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
    </div>
  );
}

function DesignFields({ design, onChange }: { design: SectionDesign | undefined; onChange: (d: SectionDesign) => void }) {
  const d = design ?? {};
  const set = (key: keyof SectionDesign, value: unknown) => onChange({ ...d, [key]: value });
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">Design (background &amp; layout)</h4>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Background</label>
        <select value={(d.background_type as string) ?? "color"} onChange={(e) => set("background_type", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
          <option value="color">Solid color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
      {(d.background_type ?? "color") === "color" && <ColorField label="Background color" value={(d.background_color as string) ?? "#ffffff"} onChange={(v) => set("background_color", v)} />}
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

export default function SectionEditorContent({
  type,
  data,
  setData,
}: {
  type: string;
  data: Record<string, unknown>;
  setData: (d: Record<string, unknown>) => void;
}) {
  const set = (key: string, value: unknown) => setData({ ...data, [key]: value });

  if (type === "hero") {
    return (
      <p className="text-slate-500 py-4">Hero sections use the dedicated hero editor. Use the link from the homepage to edit the hero.</p>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-6">
        <Field label="Title (optional)" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Section title" />
        <Field label="Content" value={(data.content as string) || ""} onChange={(v) => set("content", v)} rows={8} placeholder="Your text..." />
        <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="space-y-6">
        <Field label="Image URL" value={(data.url as string) || ""} onChange={(v) => set("url", v)} type="url" placeholder="https://..." />
        <Field label="Alt text" value={(data.alt as string) || ""} onChange={(v) => set("alt", v)} placeholder="Describe the image" />
        <Field label="Caption (optional)" value={(data.caption as string) || ""} onChange={(v) => set("caption", v)} placeholder="Caption below image" />
        <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
      </div>
    );
  }

  if (type === "features") {
    const items = (data.items as string[]) || [];
    return (
      <div className="space-y-6">
        <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Features" />
        <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional description" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Items (reorder with ↑↓)</label>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <input value={item} onChange={(e) => { const next = [...items]; next[i] = e.target.value; set("items", next); }} placeholder="Feature text" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <button type="button" onClick={() => set("items", items.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600 p-1" aria-label="Remove">×</button>
              <button type="button" onClick={() => { if (i === 0) return; const next = [...items]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; set("items", next); }} className="text-slate-500 px-1" aria-label="Move up">↑</button>
              <button type="button" onClick={() => { if (i >= items.length - 1) return; const next = [...items]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; set("items", next); }} className="text-slate-500 px-1" aria-label="Move down">↓</button>
            </div>
          ))}
          <button type="button" onClick={() => set("items", [...items, ""])} className="text-sm font-medium text-primary hover:underline">+ Add item</button>
        </div>
        <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
      </div>
    );
  }

  if (type === "stats") {
    const items = (data.items as Array<{ value?: string; label?: string }>) || [];
    return (
      <div className="space-y-6">
        <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Let's talk numbers" />
        <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Stats (value + label, reorder with ↑↓)</label>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <input value={item?.value ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], value: e.target.value }; set("items", next); }} placeholder="150+" className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <input value={item?.label ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], label: e.target.value }; set("items", next); }} placeholder="Label" className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <button type="button" onClick={() => set("items", items.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600 p-1" aria-label="Remove">×</button>
                <button type="button" onClick={() => { if (i === 0) return; const next = [...items]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; set("items", next); }} className="text-slate-500 px-1">↑</button>
                <button type="button" onClick={() => { if (i >= items.length - 1) return; const next = [...items]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; set("items", next); }} className="text-slate-500 px-1">↓</button>
              </div>
            ))}
            <button type="button" onClick={() => set("items", [...items, { value: "", label: "" }])} className="text-sm font-medium text-primary hover:underline">+ Add stat</button>
          </div>
        </div>
        <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
      </div>
    );
  }

  if (type === "testimonials") {
    const items = (data.items as Array<Record<string, string>>) || [];
    return (
      <div className="space-y-6">
        <Field label="Title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="What Our Clients Say" />
        <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} placeholder="Optional" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Testimonials</label>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <textarea value={item?.quote ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], quote: e.target.value }; set("items", next); }} placeholder="Quote" rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={item?.author ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], author: e.target.value }; set("items", next); }} placeholder="Author" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  <input value={item?.role ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], role: e.target.value }; set("items", next); }} placeholder="Role" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  <input value={item?.company ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], company: e.target.value }; set("items", next); }} placeholder="Company" className="border border-slate-200 rounded-lg px-3 py-2 text-sm col-span-2" />
                  <input value={item?.image_url ?? ""} onChange={(e) => { const next = [...items]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], image_url: e.target.value }; set("items", next); }} placeholder="Avatar URL (optional)" type="url" className="border border-slate-200 rounded-lg px-3 py-2 text-sm col-span-2" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" onClick={() => set("items", items.filter((_, j) => j !== i))} className="text-sm text-slate-500 hover:text-red-600">Remove</button>
                  <button type="button" onClick={() => { if (i === 0) return; const next = [...items]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; set("items", next); }} className="text-slate-500 px-1">↑</button>
                  <button type="button" onClick={() => { if (i >= items.length - 1) return; const next = [...items]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; set("items", next); }} className="text-slate-500 px-1">↓</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => set("items", [...items, { quote: "", author: "", role: "", company: "" }])} className="text-sm font-medium text-primary hover:underline">+ Add testimonial</button>
          </div>
        </div>
        <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
      </div>
    );
  }

  if (type === "cta") {
    return (
      <div className="space-y-6">
        <Field label="Heading" value={(data.heading as string) || ""} onChange={(v) => set("heading", v)} placeholder="Get in touch" />
        <Field label="Subtext" value={(data.subtext as string) || ""} onChange={(v) => set("subtext", v)} rows={3} placeholder="We'd love to hear from you." />
        <Field label="Button text" value={(data.buttonText as string) || ""} onChange={(v) => set("buttonText", v)} placeholder="Contact" />
        <Field label="Button link" value={(data.buttonLink as string) || ""} onChange={(v) => set("buttonLink", v)} type="url" placeholder="/contact" />
        <Field label="Secondary button text" value={(data.secondaryText as string) || ""} onChange={(v) => set("secondaryText", v)} placeholder="Optional" />
        <Field label="Secondary button link" value={(data.secondaryLink as string) || ""} onChange={(v) => set("secondaryLink", v)} type="url" placeholder="#" />
        <DesignFields design={data.design as SectionDesign} onChange={(d) => set("design", d)} />
      </div>
    );
  }

  if (type === "services" || type === "service_list" || type === "services-grid") {
    const services = (data.services as Array<Record<string, unknown>>) || [];
    const design = (data.design as SectionDesign & { card_background_color?: string; title_color?: string; subtitle_color?: string; link_color?: string; icon_size?: number; columns?: number; button_gradient_from?: string; button_gradient_to?: string; button_text_color?: string }) || {};
    const setDesign = (d: typeof design) => set("design", d);
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Layout</label>
          <select value={(data.layout as string) ?? "cards"} onChange={(e) => set("layout", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option value="cards">Cards (title + icons + optional button)</option>
            <option value="grid">Grid (title + description + link)</option>
          </select>
        </div>
        <Field label="Section title" value={(data.title as string) || ""} onChange={(v) => set("title", v)} placeholder="Our Services" />
        <Field label="Subtitle" value={(data.subtitle as string) || ""} onChange={(v) => set("subtitle", v)} placeholder="Optional" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Services — check “Show” to display on homepage (reorder with ↑↓)</label>
          <div className="space-y-4">
            {services.map((svc, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex gap-2 items-center flex-wrap">
                  <label className="flex items-center gap-1.5 shrink-0">
                    <input type="checkbox" checked={(svc.enabled as boolean) !== false} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], enabled: e.target.checked }; set("services", next); }} className="rounded border-slate-300 text-primary" />
                    <span className="text-sm font-medium text-slate-700">Show</span>
                  </label>
                  <input value={(svc.title as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], title: e.target.value }; set("services", next); }} placeholder="Service title" className="flex-1 min-w-[140px] border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  <button type="button" onClick={() => set("services", services.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600 p-1" aria-label="Remove">×</button>
                  <button type="button" onClick={() => { if (i === 0) return; const next = [...services]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; set("services", next); }} className="text-slate-500 px-1" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => { if (i >= services.length - 1) return; const next = [...services]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; set("services", next); }} className="text-slate-500 px-1" aria-label="Move down">↓</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input value={(svc.description as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], description: e.target.value }; set("services", next); }} placeholder="Description (for grid layout)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  <input value={(svc.link as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], link: e.target.value }; set("services", next); }} placeholder="Link" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="pl-2 border-l-2 border-slate-100 space-y-2">
                  <span className="text-xs font-medium text-slate-500">Icons (for cards layout)</span>
                  {((svc.icons as Array<{ url?: string; alt?: string }>) ?? []).map((icon, j) => (
                    <div key={j} className="flex gap-2 items-center">
                      <input value={icon?.url ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; const icons = [...((next[i].icons as Array<Record<string, string>>) ?? [])]; if (!icons[j]) icons[j] = {}; icons[j] = { ...icons[j], url: e.target.value }; next[i] = { ...next[i], icons }; set("services", next); }} placeholder="Icon URL" className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" />
                      <input value={icon?.alt ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; const icons = [...((next[i].icons as Array<Record<string, string>>) ?? [])]; if (!icons[j]) icons[j] = {}; icons[j] = { ...icons[j], alt: e.target.value }; next[i] = { ...next[i], icons }; set("services", next); }} placeholder="Alt" className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                      <button type="button" onClick={() => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], icons: ((next[i].icons as unknown[]) ?? []).filter((_, k) => k !== j) }; set("services", next); }} className="text-slate-400 hover:text-red-600 p-1">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], icons: [...((next[i].icons as Array<Record<string, string>>) ?? []), { url: "", alt: "" }] }; set("services", next); }} className="text-xs font-medium text-primary hover:underline">+ Add icon</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={(svc.button_text as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], button_text: e.target.value }; set("services", next); }} placeholder="Button text (e.g. Let's Chat)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  <input value={(svc.button_link as string) ?? ""} onChange={(e) => { const next = [...services]; if (!next[i]) next[i] = {}; next[i] = { ...next[i], button_link: e.target.value }; set("services", next); }} placeholder="Button link" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => set("services", [...services, { enabled: true, title: "", icons: [] }])} className="text-sm font-medium text-primary hover:underline">+ Add service</button>
          </div>
        </div>
        <DesignFields design={design} onChange={(d) => set("design", { ...design, ...d })} />
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-800">Services section styling</h4>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Card background" value={design.card_background_color ?? "rgba(255,255,255,0.06)"} onChange={(v) => setDesign({ ...design, card_background_color: v })} />
            <ColorField label="Title color" value={design.title_color ?? "#ffffff"} onChange={(v) => setDesign({ ...design, title_color: v })} />
            <ColorField label="Subtitle color" value={design.subtitle_color ?? ""} onChange={(v) => setDesign({ ...design, subtitle_color: v || undefined })} />
            <ColorField label="Link color" value={design.link_color ?? "#58a6ff"} onChange={(v) => setDesign({ ...design, link_color: v })} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Icon size (px)</label>
              <input type="number" min={16} max={64} value={design.icon_size ?? 32} onChange={(e) => setDesign({ ...design, icon_size: parseInt(e.target.value, 10) || 32 })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Columns (1–4)</label>
              <input type="number" min={1} max={4} value={design.columns ?? 3} onChange={(e) => setDesign({ ...design, columns: parseInt(e.target.value, 10) || 3 })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <ColorField label="Button gradient from" value={design.button_gradient_from ?? "#9333ea"} onChange={(v) => setDesign({ ...design, button_gradient_from: v })} />
            <ColorField label="Button gradient to" value={design.button_gradient_to ?? "#db2777"} onChange={(v) => setDesign({ ...design, button_gradient_to: v })} />
            <ColorField label="Button text color" value={design.button_text_color ?? "#ffffff"} onChange={(v) => setDesign({ ...design, button_text_color: v })} />
          </div>
        </div>
      </div>
    );
  }

  return <p className="text-slate-500 py-4">No editor for section type &quot;{type}&quot;.</p>;
}
